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
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@ApiTags('Topics')
@Controller('topics')
export class TopicsController {
  constructor(private readonly topics: TopicsService) {}

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateTopicDto) {
    return this.topics.create(dto);
  }

  @ApiQuery({ name: 'subjectId', required: true, type: Number })
  @ApiQuery({ name: 'includeLessons', required: false, type: Boolean })
  @Get('tree')
  findTree(
    @Query('subjectId', ParseIntPipe) subjectId: number,
    @Query('includeLessons') includeLessons?: string,
  ) {
    return this.topics.findTree(
      subjectId,
      includeLessons === 'true',
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.topics.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTopicDto,
  ) {
    return this.topics.update(id, dto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.topics.remove(id);
  }
}