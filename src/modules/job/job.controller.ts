import { Controller, Get, Param } from '@nestjs/common';
import { JobService } from './job.service';

@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) { }

  @Get()
  async getAll() {
    return this.jobService.getAll()
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    return this.jobService.getOne(id)
  }
}
