import { Injectable } from "@nestjs/common";
import { DataSource, QueryRunner } from "typeorm";

@Injectable()
export class TransactionUtil {
    constructor(private readonly datasource: DataSource) { }

    public async execetueTransaction(callback: (queryRunner: QueryRunner) => Promise<any>): Promise<any> {
        const queryRunner: QueryRunner = this.datasource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const result = await callback(queryRunner);
            await queryRunner.commitTransaction();
            return result;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}