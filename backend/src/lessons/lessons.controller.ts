import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/auth/roles.decorator';
import { AuthUser, CurrentUser } from '../common/auth/current-user.decorator';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@ApiTags('Lessons')
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessons: LessonsService) {}

  @Roles(Role.TEACHER, Role.ADMIN)
  @Post()
  create(@Body() dto: CreateLessonDto, @CurrentUser() user: AuthUser) {
    return this.lessons.create(dto, user);
  }

  @ApiQuery({ name: 'topicId', required: false, type: Number })
  @ApiQuery({ name: 'subjectId', required: false, type: Number })
  @ApiQuery({ name: 'mine', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false })
  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Query('topicId') topicId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('mine') mine?: string,
    @Query('search') search?: string,
  ) {
    return this.lessons.findAll({
      topicId: topicId ? Number(topicId) : undefined,
      subjectId: subjectId ? Number(subjectId) : undefined,
      teacherId: mine === 'true' && user.role === Role.TEACHER ? user.id : undefined,
      publishedOnly: user.role === Role.STUDENT,
      search,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.lessons.findOne(id, user);
  }

  @Roles(Role.TEACHER, Role.ADMIN)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLessonDto, @CurrentUser() user: AuthUser) {
    return this.lessons.update(id, dto, user);
  }

  @Roles(Role.TEACHER, Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.lessons.remove(id, user);
  }
}