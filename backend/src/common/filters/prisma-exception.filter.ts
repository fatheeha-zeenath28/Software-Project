import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(e: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database error';

    if (e.code === 'P2002') {
      status = HttpStatus.CONFLICT;
      message = `A record with the same ${(e.meta?.target as string[] | undefined)?.join(', ') ?? 'value'} already exists`;
    } else if (e.code === 'P2003') {
      status = HttpStatus.CONFLICT;
      message = 'This record is linked to other records and cannot be changed or deleted';
    } else if (e.code === 'P2025') {
      status = HttpStatus.NOT_FOUND;
      message = 'Record not found';
    }

    res.status(status).json({ statusCode: status, message, error: e.code });
  }
}