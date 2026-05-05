import { Injectable, Logger } from "@nestjs/common";
import { CopyObjectCommand, DeleteObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { awsContant } from "src/constants/aws.contant";
import path from "path";
import { randomUUID } from "crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { IAwsEnvironment } from "src/interfaces/aws.interface";

@Injectable()
export class AwsUtil {
    private logger: Logger = new Logger(AwsUtil.name);
    private readonly s3Client: S3Client;
    private readonly ssmClient: SSMClient;

    constructor() {
        const params: any = {
            region: awsContant.REGION_AWS,
            credentials: {
                accessKeyId: awsContant.ACCESS_KEY_AWS,
                secretAccessKey: awsContant.SECRET_ACCESS_KEY_AWS,
            }
        }

        this.s3Client = new S3Client(params);
        this.ssmClient = new SSMClient(params);
    }

    public async uploadFileToS3(params: {
        key: string,
        body: Buffer | Uint8Array | Blob | string,
        contentType: string
    }): Promise<string> {
        try {
            await this.s3Client.send(new PutObjectCommand({
                Bucket: awsContant.BUCKET_NAME_AWS,
                Key: params.key,
                Body: params.body,
                ContentType: params.contentType,
            }));

            return this.getUrlS3(params.key);
        } catch (error) {
            this.logger.error(`Error uploading file to S3: ${(error as Error)?.stack}`);
            throw error;
        }
    }

    private getUrlS3(key: string): string {
        return `https://s3.${awsContant.REGION_AWS}.amazonaws.com/${awsContant.BUCKET_NAME_AWS}/${encodeURIComponent(key)}`;
    }

    public makeTempKey(userUuid: string, originalName: string) {
        const ext = path.extname(originalName || '') || '.bin';
        const dafeBase = (path.basename(originalName, ext) || 'file')
            .toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 50);

        return `temp/${userUuid}/${randomUUID()}/${dafeBase}${ext}`;
    }

    public async createPresignedPutUrl(key: string, contentType: string) {
        const cmd = new PutObjectCommand({
            Bucket: awsContant.BUCKET_NAME_AWS,
            Key: key,
            ContentType: contentType,
            Tagging: 'stage=temp',
            ACL: 'private',
        });

        const url = await getSignedUrl(this.s3Client, cmd, { expiresIn: 60 * 5 });
        return { url, key };
    }

    public async finalizeObjectFromTemp(tempKey: string, finalKey: string) {
        await this.s3Client.send(new HeadObjectCommand({
            Bucket: awsContant.BUCKET_NAME_AWS,
            Key: tempKey,
        }))

        await this.s3Client.send(new CopyObjectCommand({
            Bucket: awsContant.BUCKET_NAME_AWS,
            CopySource: `/${awsContant.BUCKET_NAME_AWS}/${encodeURIComponent(tempKey)}`,
            Key: finalKey,
            MetadataDirective: 'REPLACE',
            TaggingDirective: 'REPLACE',
            Tagging: 'stage=permanent',
            ACL: 'private',
        }))

        try {
            await this.s3Client.send(new DeleteObjectCommand({
                Bucket: awsContant.BUCKET_NAME_AWS,
                Key: tempKey,
            }));
        } catch (error) {
            this.logger.warn(`Failed to delete temp object ${tempKey}: ${(error as Error)?.stack}`);
        }

        return this.getUrlS3(finalKey);
    }

    public makeUserPhotoKey(userUuid: string, originalName: string) {
        const ext = path.extname(originalName || '') || '.bin';
        const dafeBase = (path.basename(originalName, ext) || 'file')
            .toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 50);

        return `temp/${userUuid}/${randomUUID()}/${dafeBase}${ext}`;
    }

    public async getParameterStoreValue(): Promise<IAwsEnvironment> {
        try {
            const parameterName = awsContant.PARAMETER_STORE_NAMES;
            let splitParameters: string[] = [];
            if (parameterName) {
                if (parameterName.includes(',')) {
                    splitParameters = parameterName.split(',').map(param => param.trim()).filter(Boolean);
                } else {
                    splitParameters = [parameterName.trim()];
                }
            } else {
                splitParameters = [];
            }

            let result: IAwsEnvironment = {} as IAwsEnvironment;
            for (const paramName of splitParameters) {
                const response = await this.ssmClient.send(
                    new GetParameterCommand({
                        Name: paramName,
                        WithDecryption: true,
                    })
                )

                const dataName: any = JSON.parse(response.Parameter?.Value || '{}');
                result = { ...result, ...dataName };
            }

            return result;
        } catch (error) {
            this.logger.error(`Error getting parameter store value: ${(error as Error)?.stack}`);
            throw error;
        }
    }
}