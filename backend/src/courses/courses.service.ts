import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertSubject(subjectId: number) {
    if (!(await this.prisma.subject.count({ where: { id: subjectId } }))) {
      throw new BadRequestException(
        `Subject ${subjectId} does not exist`,
      );
    }
  }

  async create(dto: CreateCourseDto) {
    await this.assertSubject(dto.subjectId);
    return this.prisma.course.create({
      data: dto,
      include: { subject: true },
    });
  }

  findAll(subjectId?: number, activeOnly = false) {
    return this.prisma.course.findMany({
      where: {
        ...(subjectId ? { subjectId } : {}),
        ...(activeOnly ? { isActive: true } : {}),
      },
      include: {
        subject: { select: { id: true, code: true, name: true } },
        _count: { select: { classes: true } },
      },
      orderBy: [{ examYear: 'desc' }, { title: 'asc' }],
    });
  }

  async findOne(id: number) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: { subject: true, classes: true },
    });
    if (!course) throw new NotFoundException(`Course ${id} not found`);
    return course;
  }

  async update(id: number, dto: UpdateCourseDto) {
    await this.findOne(id);
    if (dto.subjectId) await this.assertSubject(dto.subjectId);

    return this.prisma.course.update({
      where: { id },
      data: dto,
      include: { subject: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.course.delete({ where: { id } });
    return { deleted: true, id };
  }
}