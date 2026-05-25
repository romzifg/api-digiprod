import * as dotenv from 'dotenv'
dotenv.config()

import serverlessExpress from '@codegenie/serverless-express'
import { Callback, Context, Handler } from 'aws-lambda'
import { runSeederLambda } from './database/seeds/run-seeder-lambda'
import { NestFactory, Reflector } from '@nestjs/core'
import { AppModule } from './app.module'
import { CustomValidationPipe } from './common/pipes/custom-validation.pipe'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { HttpStatus, Logger, RequestMethod } from '@nestjs/common'
import { environtmentConstant } from './constants/environtment.constant'
import { statusConstant } from './constants/status.constant'
import { generalConstant } from './constants/general.constant'

let server: Handler
async function bootstrap(): Promise<Handler> {
    await runSeederLambda()

    const app = await NestFactory.create(AppModule)
    const reflector = app.get(Reflector);
    app.useGlobalPipes(new CustomValidationPipe());
    app.useGlobalInterceptors(new ResponseInterceptor(reflector));
    app.useGlobalFilters(new HttpExceptionFilter());
    app.setGlobalPrefix('api/v1', {
        exclude: [{ path: '/', method: RequestMethod.GET }]
    });
    app.enableCors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeader: [
            'Content-type',
            'Authorization',
            'authorization',
            'x-api-Key',
            'X-Api-Key',
            'x-amz-date',
            'x-amz-security-token',
        ]
    });

    const logger = new Logger('Bootstrap')
    logger.log('Application is running on: 3000')

    await app.init()
    const expressApp = app.getHttpAdapter().getInstance()
    return serverlessExpress({ app: expressApp })
}

export const handler: Handler = async (event: any, context: Context, callback: Callback) => {
    const logger = new Logger('Lambda Handler')

    try {
        server = server ?? (await bootstrap())
        if (process.env.NODE_ENV !== environtmentConstant.env.PRODUCTION) {
            logger.debug('Incoming header', event.headers)
        }

        return await server(event, context, callback)
    } catch (error) {
        logger.error('Error in lambda handler', error)
        return {
            code: HttpStatus.INTERNAL_SERVER_ERROR,
            status: statusConstant.ERROR,
            message: generalConstant.SOMETHING_WENT_WRONG,
            error: error instanceof Error ? error.message : String(error),
        }
    }
}