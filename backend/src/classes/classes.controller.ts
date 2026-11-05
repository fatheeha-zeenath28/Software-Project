
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/auth/roles.decorator';
import {
  AuthUser,
  CurrentUser,
} from '../common/auth/current-user.decorator';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { AssignTeacherDto } from './dto/assign-teacher.dto';
import { ReplaceTeacherDto } from './dto/replace-teacher.dto';

@ApiTags('Classes')
@Controller('classes')
export class ClassesController {
  constructor(private readonly classes: ClassesService) {}

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateClassDto) {
    return this.classes.create(dto);
  }

  @Get('teacher/me')
  findTeacherClasses(@CurrentUser() user: AuthUser) {
    return this.classes.findTeacherClasses(user.id);
  }

  @ApiQuery({ name: 'courseId', required: false, type: Number })
  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Query('courseId') courseId?: string,
  ) {
    return this.classes.findAll(
      courseId ? Number(courseId) : undefined,
      user.role !== Role.ADMIN,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.classes.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClassDto,
  ) {
    return this.classes.update(id, dto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.classes.remove(id);
  }

  @Roles(Role.ADMIN)
  @Post(':id/teachers')
  assignTeacher(
    @Param('id', ParseIntPipe) classId: number,
    @Body() dto: AssignTeacherDto,
  ) {
    return this.classes.assignTeacher(classId, dto.teacherId);
  }

  @Roles(Role.ADMIN)
  @Patch(':id/teachers/replace')
  replaceTeacher(
    @Param('id', ParseIntPipe) classId: number,
    @Body() dto: ReplaceTeacherDto,
  ) {
    return this.classes.replaceTeacher(
      classId,
      dto.oldTeacherId,
      dto.newTeacherId,
    );
  }
}
