import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/auth/roles.decorator';
import { TeachersService } from './teachers.service';

@ApiTags('Teachers')
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachers: TeachersService) {}

  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.teachers.findAll();
  }
}