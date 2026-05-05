import { DataSource } from "typeorm";
import { Seeder } from "typeorm-extension";
import { User } from "../../entities/user.entity";
import { randomUUID } from "crypto";
import * as bcrypt from 'bcryptjs'
import { roleConstant } from "src/constants/role.constant";

export default class UserSeeder implements Seeder {
    async run(dataSource: DataSource): Promise<any> {
        const repository = dataSource.getRepository(User)

        const data = {
            uuid: randomUUID(),
            name: 'Administrator',
            email: 'admin@gmail.com',
            phone_number: '081234123123',
            password: bcrypt.hashSync('admin123', 10),
            role: roleConstant.ADMIN,
            photo: 'https://images.unsplash.com/photo-1776267091706-d9036c1c4fbe?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        }

        await repository.upsert(data, ['email'])
    }
}