import { DataSource } from "typeorm";
import { Seeder } from "typeorm-extension";
import { Job } from "../../entities/job.entity";

export default class JobSeeder implements Seeder {
    async run(dataSource: DataSource): Promise<any> {
        const repository = dataSource.getRepository(Job)

        const jobs = [
            { name: 'Software Engineer' },
            { name: 'Digital Marketing' },
            { name: 'Data Engineer' },
            { name: 'Data Analysis' },
            { name: 'Accountant' },
            { name: 'Project Manager' },
            { name: 'Grapich Designer' },
            { name: 'HR Specialist' },
        ]

        await repository.upsert(jobs, ['name'])
    }
}