import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Job } from "src/entities/job.entity";
import { Repository } from "typeorm";

@Injectable()
export class JobRepository {
    constructor(
        @InjectRepository(Job)
        private readonly jobRepository: Repository<Job>
    ) { }

    public async findAll(): Promise<Job[]> {
        return this.jobRepository.find({
            order: {
                id: 'ASC'
            }
        });
    }

    public async findOne(id: number): Promise<Job | null> {
        return this.jobRepository.findOneBy({
            id
        })
    }
}