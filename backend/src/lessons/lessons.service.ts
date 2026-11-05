import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../common/auth/current-user.decorator';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

const include = {
  subject: { select: { id: true, code: true, name: true } },
  topic: { select: { id: true, title: true, parentId: true } },
  teacher: { select: { id: true, fullName: true } },
} satisfies Prisma.LessonInclude;

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  private async topicOrFail(topicId: number) {
    const topic = await this.prisma.topic.findUnique({ where: { id: topicId } });
    if (!topic) throw new BadRequestException(`Topic ${topicId} does not exist`);
    return topic;
  }

  // Teachers may only change their own lessons; admins may change any
  private async ownedOrFail(id: number, user: AuthUser) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) throw new NotFoundException(`Lesson ${id} not found`);
    if (user.role === Role.TEACHER && lesson.teacherId !== user.id) {
      throw new ForbiddenException('You can only change your own lessons');
    }
    return lesson;
  }

  async create(dto: CreateLessonDto, user: AuthUser) {
    const topic = await this.topicOrFail(dto.topicId);
    let teacherId = user.id;
    if (user.role === Role.ADMIN) {
      if (!dto.teacherId) throw new BadRequestException('teacherId is required when an admin creates a lesson');
      const teacher = await this.prisma.user.findFirst({ where: { id: dto.teacherId, role: Role.TEACHER } });
      if (!teacher) throw new BadRequestException(`User ${dto.teacherId} is not a teacher`);
      teacherId = teacher.id;
    }
    const { teacherId: _ignored, ...data } = dto;
    // Subject is taken from the topic so they can never mismatch
    return this.prisma.lesson.create({ data: { ...data, subjectId: topic.subjectId, teacherId }, include });
  }

  findAll(f: { topicId?: number; subjectId?: number; teacherId?: number; publishedOnly: boolean; search?: string }) {
    return this.prisma.lesson.findMany({
      where: {
        ...(f.topicId ? { topicId: f.topicId } : {}),
        ...(f.subjectId ? { subjectId: f.subjectId } : {}),
        ...(f.teacherId ? { teacherId: f.teacherId } : {}),
        ...(f.publishedOnly ? { isPublished: true } : {}),
        ...(f.search ? { title: { contains: f.search, mode: 'insensitive' as const } } : {}),
      },
      include,
      orderBy: [{ topicId: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: number, user: AuthUser) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id }, include });
    if (!lesson || (user.role === Role.STUDENT && !lesson.isPublished)) {
      throw new NotFoundException(`Lesson ${id} not found`);
    }
    return lesson;
  }

  async update(id: number, dto: UpdateLessonDto, user: AuthUser) {
    await this.ownedOrFail(id, user);
    const data: Prisma.LessonUncheckedUpdateInput = { ...dto };
    if (dto.topicId) data.subjectId = (await this.topicOrFail(dto.topicId)).subjectId;
    return this.prisma.lesson.update({ where: { id }, data, include });
  }

  async remove(id: number, user: AuthUser) {
    await this.ownedOrFail(id, user);
    await this.prisma.lesson.delete({ where: { id } });
    return { deleted: true, id };
  }
}