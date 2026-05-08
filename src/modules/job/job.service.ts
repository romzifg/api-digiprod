import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'src/entities/job.entity';
import { JobRepository } from 'src/repositories/job.reporitory';

@Injectable()
export class JobService {
    private logger: Logger = new Logger(JobService.name)

    constructor(private readonly jobRepo: JobRepository) { }

    public async getAll(): Promise<Job[]> {
        try {
            return await this.jobRepo.findAll();
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }

    public async getOne(id: number): Promise<Job | null> {
        try {
            return await this.jobRepo.findOne(id);
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }
}
