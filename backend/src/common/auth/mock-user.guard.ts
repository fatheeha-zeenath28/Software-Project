import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { IS_PUBLIC_KEY, ROLES_KEY } from './roles.decorator';

@Injectable()
export class MockUserGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];

    if (
      this.reflector.getAllAndOverride<boolean>(
        IS_PUBLIC_KEY,
        targets,
      )
    ) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const userId = Number(req.headers['x-user-id']);

    if (!Number.isInteger(userId) || userId <= 0) {
      throw new UnauthorizedException(
        'Missing or invalid x-user-id header',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Unknown user');
    }

    req.user = {
      id: user.id,
      role: user.role,
      fullName: user.fullName,
    };

    const roles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      targets,
    );

    if (roles?.length && !roles.includes(user.role)) {
      throw new ForbiddenException(
        `Requires role: ${roles.join(' or ')}`,
      );
    }

    return true;
  }
}