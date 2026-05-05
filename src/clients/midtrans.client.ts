import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MidtransDto } from "src/dto/midtrans.dto";
import * as Client from 'midtrans-client'
import { getSecretValue } from "src/config/environment.config";
import { generalConstant } from "src/constants/general.constant";
import { IMidtransResponse } from "src/interfaces/midtrans.interface";

@Injectable()
export class MidtransClient {
    constructor() { }

    public async sendToMidtrans(data: MidtransDto, configService: ConfigService): Promise<IMidtransResponse | any> {
        try {
            const config = await getSecretValue(configService)
            const snap = new Client.Snap({
                isProduction: config.midtrans_is_production as any,
                serverKey: config.midtrans_server_key as any,
                clientKey: config.midtrans_client_key as any,
            })

            const response = await snap.createTransaction(data);
            if (!response) {
                return {
                    message: generalConstant.MIDTRANS_ERROR
                }
            }

            return {
                token: response.token,
                redirect_url: response.redirect_url
            }
        } catch (error) {
            return error
        }
    }
}