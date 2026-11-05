import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Injectable()
export class TopicsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTopicDto) {
    const subject = await this.prisma.subject.findUnique({
      where: { id: dto.subjectId },
    });

    if (!subject) {
      throw new NotFoundException(
        `Subject ${dto.subjectId} not found`,
      );
    }

    if (dto.parentId != null) {
      await this.validateParent(dto.parentId, dto.subjectId);
    }

    return this.prisma.topic.create({
      data: {
        subjectId: dto.subjectId,
        parentId: dto.parentId ?? null,
        title: dto.title,
        description: dto.description,
        sortOrder: dto.sortOrder,
      },
    });
  }

  async findTree(subjectId: number, includeLessons = false) {
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      throw new NotFoundException(`Subject ${subjectId} not found`);
    }

    const topics = await this.prisma.topic.findMany({
      where: { subjectId },
      include: {
        ...(includeLessons ? { lessons: true } : {}),
      },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });

    const topicMap = new Map<number, any>();

    topics.forEach((topic) => {
      topicMap.set(topic.id, {
        ...topic,
        children: [],
      });
    });

    const roots: any[] = [];

    topicMap.forEach((topic) => {
      if (topic.parentId === null) {
        roots.push(topic);
      } else {
        const parent = topicMap.get(topic.parentId);

        if (parent) {
          parent.children.push(topic);
        }
      }
    });

    return roots;
  }

  async findOne(id: number) {
    const topic = await this.prisma.topic.findUnique({
      where: { id },
      include: {
        children: true,
        lessons: true,
      },
    });

    if (!topic) {
      throw new NotFoundException(`Topic ${id} not found`);
    }

    return topic;
  }

  async update(id: number, dto: UpdateTopicDto) {
    const existing = await this.prisma.topic.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Topic ${id} not found`);
    }

    const subjectId = dto.subjectId ?? existing.subjectId;
    const parentId =
      dto.parentId !== undefined ? dto.parentId : existing.parentId;

    if (dto.subjectId !== undefined) {
      const subject = await this.prisma.subject.findUnique({
        where: { id: subjectId },
      });

      if (!subject) {
        throw new NotFoundException(`Subject ${subjectId} not found`);
      }
    }

    if (parentId !== null) {
      if (parentId === id) {
        throw new BadRequestException(
          'A topic cannot be its own parent',
        );
      }

      await this.validateParent(parentId, subjectId);
      await this.validateNoCycle(id, parentId);
    }

    return this.prisma.topic.update({
      where: { id },
      data: {
        subjectId,
        parentId,
        title: dto.title,
        description: dto.description,
        sortOrder: dto.sortOrder,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const childrenCount = await this.prisma.topic.count({
      where: { parentId: id },
    });

    if (childrenCount > 0) {
      throw new BadRequestException(
        'Cannot delete a topic that has subtopics',
      );
    }

    await this.prisma.topic.delete({
      where: { id },
    });

    return { deleted: true, id };
  }

  private async validateParent(
    parentId: number,
    subjectId: number,
  ) {
    const parent = await this.prisma.topic.findUnique({
      where: { id: parentId },
    });

    if (!parent) {
      throw new NotFoundException(`Parent topic ${parentId} not found`);
    }

    if (parent.subjectId !== subjectId) {
      throw new BadRequestException(
        'Parent topic must belong to the same subject',
      );
    }
  }

  private async validateNoCycle(id: number, parentId: number) {
    let currentId: number | null = parentId;

    while (currentId !== null) {
      if (currentId === id) {
        throw new BadRequestException(
          'Circular topic relationships are not allowed',
        );
      }

      const current = await this.prisma.topic.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      });

      currentId = current?.parentId ?? null;
    }
  }
}