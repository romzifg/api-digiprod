import 'reflect-metadata'
import * as dotenv from 'dotenv'
import { environtmentConstant } from 'src/constants/environtment.constant';
import { IAwsEnvironment } from 'src/interfaces/aws.interface';
import { AwsUtil } from 'src/utils/aws.util';
import * as fs from 'fs'
import { DataSource } from 'typeorm';
import * as path from 'path';
import { SeederExecutor } from 'typeorm-extension';
dotenv.config()

export async function runSeederLambda() {
    let jsonValue: any = {}

    try {
        if (process.env.NODE_ENV !== environtmentConstant.env.LOCAL) {
            const ssm: AwsUtil = new AwsUtil();
            jsonValue = await ssm.getParameterStoreValue();
        } else {
            const config: string = fs.readFileSync("config.json", "utf-8");
            jsonValue = JSON.parse(config) as IAwsEnvironment
        }

        const dataSource = new DataSource({
            type: jsonValue.db_dialect as any,
            host: jsonValue.db_host as string,
            port: jsonValue.db_port,
            username: jsonValue.db_username as string,
            password: jsonValue.db_password as string,
            database: jsonValue.db_name as string,
            entities: [path.join(__dirname, '../../entities/*.entity{.ts, .js}')],
            ssl: {
                rejectUnauthorized: false
            },
            synchronize: true,
            migrationsRun: true,
            connectionTimeout: jsonValue.db_connection_timeout,
            acquireTimeout: jsonValue.db_acquire_timeout,
            timeout: jsonValue.db_pool_size,
        })

        await dataSource.initialize()

        const executor = new SeederExecutor(dataSource)
        await executor.execute({
            seeds: ['src/database/seeds/*.seed{.ts, .js}'],
        })

        console.log("seed complete")
        await dataSource.destroy()
    } catch (error) {
        console.log(error)
    }
}