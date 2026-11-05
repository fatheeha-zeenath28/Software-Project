import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClassDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });

    if (!course) {
      throw new BadRequestException(
        `Course ${dto.courseId} does not exist`,
      );
    }

    const existing = await this.prisma.classGroup.findUnique({
      where: {
        courseId_name: {
          courseId: dto.courseId,
          name: dto.name,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        'A class with this name already exists for this course',
      );
    }

    return this.prisma.classGroup.create({
      data: dto,
      include: { course: true },
    });
  }

  findAll(courseId?: number, activeOnly = false) {
    return this.prisma.classGroup.findMany({
      where: {
        ...(courseId ? { courseId } : {}),
        ...(activeOnly ? { isActive: true } : {}),
      },
      include: {
        course: true,
        teachers: {
          include: {
            teacher: {
              select: { id: true, fullName: true, email: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const classGroup = await this.prisma.classGroup.findUnique({
      where: { id },
      include: {
        course: true,
        teachers: {
          include: { teacher: true },
        },
      },
    });

    if (!classGroup) {
      throw new NotFoundException(`Class ${id} not found`);
    }

    return classGroup;
  }

  async update(id: number, dto: UpdateClassDto) {
    await this.findOne(id);

    if (dto.courseId) {
      const course = await this.prisma.course.findUnique({
        where: { id: dto.courseId },
      });

      if (!course) {
        throw new BadRequestException(
          `Course ${dto.courseId} does not exist`,
        );
      }
    }

    return this.prisma.classGroup.update({
      where: { id },
      data: dto,
      include: { course: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.classGroup.delete({ where: { id } });
    return { deleted: true, id };
  }

  async assignTeacher(classId: number, teacherId: number) {
    await this.findOne(classId);

    const teacher = await this.prisma.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher || teacher.role !== Role.TEACHER) {
      throw new BadRequestException(
        `Teacher ${teacherId} does not exist`,
      );
    }

    const existing = await this.prisma.teacherClass.findUnique({
      where: {
        teacherId_classId: { teacherId, classId },
      },
    });

    if (existing) {
      throw new BadRequestException(
        'This teacher is already assigned to this class',
      );
    }

    return this.prisma.teacherClass.create({
      data: { teacherId, classId },
      include: { teacher: true, classGroup: true },
    });
  }

  async findTeacherClasses(teacherId: number) {
    const teacher = await this.prisma.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher || teacher.role !== Role.TEACHER) {
      throw new NotFoundException(`Teacher ${teacherId} not found`);
    }

    return this.prisma.teacherClass.findMany({
      where: { teacherId },
      include: {
        classGroup: { include: { course: true } },
      },
      orderBy: { assignedAt: 'desc' },
    });
  }

  async replaceTeacher(classId: number, oldTeacherId: number, newTeacherId: number) {
    await this.findOne(classId);

    const newTeacher = await this.prisma.user.findUnique({
      where: { id: newTeacherId },
    });

    if (!newTeacher || newTeacher.role !== Role.TEACHER) {
      throw new BadRequestException(
        `Teacher ${newTeacherId} does not exist`,
      );
    }

    const assignment = await this.prisma.teacherClass.findUnique({
      where: {
        teacherId_classId: {
          teacherId: oldTeacherId,
          classId,
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Existing teacher assignment not found');
    }

    return this.prisma.$transaction([
      this.prisma.teacherClass.delete({
        where: {
          teacherId_classId: {
            teacherId: oldTeacherId,
            classId,
          },
        },
      }),
      this.prisma.teacherClass.create({
        data: { teacherId: newTeacherId, classId },
        include: { teacher: true, classGroup: true },
      }),
    ]);
  }
}