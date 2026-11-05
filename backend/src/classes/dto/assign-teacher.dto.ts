import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class AssignTeacherDto {
  @ApiProperty({
    example: 2,
    description: 'ID of the teacher to assign',
  })
  @IsInt()
  @Min(1)
  teacherId!: number;
}