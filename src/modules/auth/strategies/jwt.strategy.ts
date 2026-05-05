import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { IAuthUserPayload } from "src/interfaces/auth.interface";

type JwtPayload = {
    sub: string,
    email: string,
    name: string,
    data: IAuthUserPayload,
    role?: 'admin' | 'creator' | 'user'
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'secretKey'
        })
    }

    async validate(payload: JwtPayload) {
        return {
            uuid: payload.sub,
            email: payload?.data?.email,
            name: payload.data?.name,
            phone_number: payload?.data?.phone_number,
            photo: payload?.data?.photo,
            role: payload?.data?.role,
        }
    }
}