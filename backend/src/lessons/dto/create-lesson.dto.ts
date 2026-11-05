import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class CreateLessonDto {
  @ApiProperty({ example: 2, description: 'Syllabus topic. The subject is taken from the topic.' })
  @IsInt() @Min(1)
  topicId!: number;

  @ApiProperty({ example: 'Introduction to SQL SELECT' })
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(200)
  title!: string;

  @ApiPropertyOptional()
  @Transform(trim) @IsOptional() @IsString() @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional() @IsInt() @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional() @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'Admin only: owner teacher' })
  @IsOptional() @IsInt() @Min(1)
  teacherId?: number;
}