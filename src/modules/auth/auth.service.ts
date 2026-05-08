import { BadRequestException, HttpException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { authConstant } from 'src/constants/auth.contstant';
import { generalConstant } from 'src/constants/general.constant';
import { User } from 'src/entities/user.entity';
import { IAuthUserPayload } from 'src/interfaces/auth.interface';
import { JobRepository } from 'src/repositories/job.reporitory';
import { UserRepository } from 'src/repositories/user.repository';
import { AwsUtil } from 'src/utils/aws.util';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from 'src/dto/login.dto';
import { RegisterCreatorDto, RegisterUserDto } from 'src/dto/register.dto';
import { Job } from 'src/entities/job.entity';
import { randomUUID } from 'crypto';
import { UpdateCreatorProfileDto, UpdateUserProfileDto } from 'src/dto/update-profile.dto';
import { UpdateBankAccountDto } from 'src/dto/update-bank-account.dto';
import { roleConstant } from 'src/constants/role.constant';

type BaseProfile = {
    uuid: string,
    email: string,
    name: string,
    photo?: string | null,
    phone_number?: string | null,
    bio?: string | null
}

type CreateProfile = BaseProfile & {
    job_id: number | null,
    identity_number: string,
    birth_date: Date | null,
    address: string | null,
    bank: string | null,
    bank_account_number: string | null,
    bank_account_name: string | null
}

@Injectable()
export class AuthService {
    private readonly logger: Logger = new Logger(AuthService.name);

    constructor(
        private readonly userRepo: UserRepository,
        private readonly jobRepo: JobRepository,
        private readonly jwt: JwtService,
        private readonly awsUtil: AwsUtil
    ) { }

    // Memfilter nilai undefined
    private pickDefined<T extends object>(obj: T): Partial<T> {
        return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != undefined)) as Partial<T>
    }

    private async getMeOrThrow(meUuid: string): Promise<User> {
        const me = await this.userRepo.findByUuid(meUuid)
        if (!me) throw new BadRequestException(generalConstant.USER_NOT_FOUND)
        return me
    }

    private async signToken(user: IAuthUserPayload): Promise<void> {
        this.jwt.signAsync({
            sub: user.uuid, data: user
        })
    }

    private handleError(error: any): never {
        this.logger.error(error);
        if (error instanceof HttpException) throw error;

        throw new BadRequestException(generalConstant.SOMETHING_WENT_WRONG ?? 'An error occured')
    }

    private async uploadPhoto(meUuid: string, file: Express.Multer.File): Promise<String | null> {
        if (!file) return null
        const key = this.awsUtil.makeUserPhotoKey(meUuid, file.originalname)
        return await this.awsUtil.uploadFileToS3({
            key,
            body: file.buffer,
            contentType: file.mimetype
        })
    }

    private async assertUniqueEmailAndPhoneNumber(meUuid?: string, email?: string, phone_number?: string): Promise<void> {
        if (email) {
            const emailUsed = meUuid ?
                await this.userRepo.existEmailFromOtherUser(email, meUuid) :
                await this.userRepo.findByEmail(email)

            if (emailUsed) throw new BadRequestException(authConstant.EMAIL_ALREADY_EXIST)
        }

        if (phone_number && ![null, undefined, '-', ''].includes(phone_number)) {
            const phone_numberUsed = meUuid ?
                await this.userRepo.existPhoneFromOtherUser(phone_number, meUuid) :
                await this.userRepo.findByPhoneNumber(phone_number)

            if (phone_numberUsed) throw new BadRequestException(authConstant.PHONE_ALREADY_EXIST)
        }
    }

    private buildAuthPayload(user: Partial<User>): IAuthUserPayload {
        return {
            uuid: user.uuid!,
            role: user.role!,
            name: user.name!,
            email: user.email!,
            phone_number: user.phone_number!,
            photo: user.photo
        }
    }

    private async composePatch(
        base: Record<string, any>,
        plainPassword?: string | null,
        meUuid?: string | null,
        file?: Express.Multer.File | null
    ): Promise<any> {
        const patch: Record<string, any> = this.pickDefined(base)

        if (plainPassword) {
            patch.plainPassword = await bcrypt.hash(plainPassword, 10)
        }

        if (file && meUuid) {
            const photo = await this.uploadPhoto(meUuid, file)
            if (photo) patch.photo = photo
        }
        return patch
    }

    public async login(data: LoginDto): Promise<{
        access_token: string; user: IAuthUserPayload
    }> {
        try {
            const user = await this.userRepo.findByEmail(data.email)

            if (!user) throw new BadRequestException(generalConstant.USER_NOT_FOUND)
            const match = await bcrypt.compare(data.password, user.password)
            if (!match) throw new BadRequestException(authConstant.INVALID_CREDENTIAL)

            const payload = this.buildAuthPayload(user)
            const access_token = this.jwt.sign(payload)

            return {
                access_token,
                user: payload
            }
        } catch (error) {
            this.handleError(error)
        }
    }

    public async register(
        data: RegisterCreatorDto | RegisterUserDto,
        isCreator = false
    ): Promise<IAuthUserPayload> {
        try {
            await this.assertUniqueEmailAndPhoneNumber(undefined, data.email, data.phone_number)
            let job: Job | null = null

            if (isCreator) {
                job = await this.jobRepo.findOne(data.job_id)
            }
            const result: User = await this.userRepo.create({
                uuid: randomUUID(),
                email: data.email,
                name: data.name,
                phone_number: data.phone_number,
                password: await bcrypt.hash(data.password, 10),
                job: job ?? undefined,
                role: isCreator ? 'creator' : 'user',
                photo: data.photo ?? undefined
            })

            return this.buildAuthPayload(result)
        } catch (error) {
            this.handleError(error)
        }
    }

    public async updateProfileUser(meUuid: string, data: UpdateUserProfileDto, file?: Express.Multer.File | null): Promise<any> {
        try {
            const me: User = await this.getMeOrThrow(meUuid)
            await this.assertUniqueEmailAndPhoneNumber(
                meUuid,
                data?.email !== me.email ? data?.email : undefined,
                data?.phone_number !== me.phone_number ? data?.phone_number : undefined
            )

            const patch = await this.composePatch(
                {
                    name: data.name,
                    email: data.email,
                    phone_number: data.phone_number,
                    bio: data.bio
                },
                data.password,
                meUuid,
                file
            )

            const updated = await this.userRepo.update(meUuid, patch)

            return {
                uuid: updated?.uuid,
                email: updated?.email,
                name: updated?.name,
                phone_number: updated?.phone_number,
                bio: updated?.bio,
                photo: updated?.photo,
                role: updated?.role
            }
        } catch (error) {
            this.handleError(error)
        }
    }

    public async updateProfileCreator(meUuid: string, data: UpdateCreatorProfileDto, file?: Express.Multer.File | null): Promise<any> {
        try {
            const me: User = await this.getMeOrThrow(meUuid)
            const job = await this.jobRepo.findOne(data.job_id)
            await this.assertUniqueEmailAndPhoneNumber(
                meUuid,
                data?.email !== me.email ? data?.email : undefined,
                data?.phone_number !== me.phone_number ? data?.phone_number : undefined
            )

            const patch = await this.composePatch(
                {
                    name: data.name,
                    email: data.email,
                    phone_number: data.phone_number,
                    bio: data.bio,
                    job: job,
                    identity_number: data.identity_number,
                    birth_date: data.birth_date ? new Date(data.birth_date) : null,
                    address: data.address,
                },
                null,
                meUuid,
                file
            )

            const updated = await this.userRepo.update(meUuid, patch)

            return {
                uuid: updated?.uuid,
                email: updated?.email,
                name: updated?.name,
                phone_number: updated?.phone_number,
                bio: updated?.bio,
                photo: updated?.photo,
                role: updated?.role,
                job: job?.id,
                identity_number: updated?.identity_number,
                birth_date: updated?.birth_date,
                address: updated?.address,
            }
        } catch (error) {
            this.handleError(error)
        }
    }

    public async updateBankAccount(uuid: string, data: UpdateBankAccountDto): Promise<any> {
        try {
            const patch: any = await this.composePatch({
                bank: data.bank,
                bank_account_name: data.bank_account_name,
                bank_account_number: data.bank_account_number
            }, null, null, null)

            const updated = await this.userRepo.update(uuid, patch)

            return {
                uuid: uuid,
                bank: updated?.bank || null,
                bank_account_name: updated?.bank_account_name || null,
                bank_account_number: updated?.bank_account_number || null
            }
        } catch (error) {
            this.handleError(error)
        }
    }

    public async updatePasswordCreator(uuid: string, data: UpdateCreatorProfileDto): Promise<any> {
        try {
            const patch: any = await this.composePatch({
                password: data.password
            }, data.password, null, null)

            await this.userRepo.update(uuid, { password: patch.plainPassword })
            return true
        } catch (error) {
            this.handleError(error)
        }
    }

    public async getProfile(me: Pick<IAuthUserPayload, 'uuid' | 'role'>): Promise<any> {
        try {
            const user = await this.userRepo.findByUuid(me.uuid)
            if (!user) {
                throw new NotFoundException(generalConstant.USER_NOT_FOUND)
            }

            const base: BaseProfile = {
                uuid: user.uuid,
                name: user.name,
                email: user.email,
                phone_number: user.phone_number,
                bio: user.bio,
                photo: user.photo
            }

            switch (me.role) {
                case roleConstant.CREATOR:
                    const creator: CreateProfile = {
                        ...base,
                        job_id: user.job ? user.job.id : null,
                        identity_number: user.identity_number,
                        birth_date: user.birth_date,
                        address: user.address,
                        bank: user.bank,
                        bank_account_name: user.bank_account_name,
                        bank_account_number: user.bank_account_number
                    }

                    return creator
                case roleConstant.USER:
                    return base
                default:
                    return base
            }
        } catch (error) {
            this.handleError(error)
        }
    }
}
