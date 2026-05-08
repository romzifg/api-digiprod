import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { IAuthUserPayload } from "src/interfaces/auth.interface";

type JwtPayload = {
    uuid: string,
    email: string,
    name: string,
    phone_number: string,
    photo: string,
    role: 'admin' | 'creator' | 'user'
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') as string,
        });
    }

    async validate(payload: JwtPayload) {
        return {
            uuid: payload.uuid,
            email: payload.email,
            name: payload.name,
            phone_number: payload.phone_number,
            photo: payload.photo,
            role: payload.role,
        };
    }
}