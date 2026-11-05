import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional,
  IsString, Max, MaxLength, Min,
} from 'class-validator';
import { Medium } from '@prisma/client';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateCourseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  subjectId!: number;

  @ApiProperty({ example: '2027 A/L ICT Theory' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title!: string;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ enum: Medium })
  @IsOptional()
  @IsEnum(Medium)
  medium?: Medium;

  @ApiProperty({ example: 2027 })
  @IsInt()
  @Min(2000)
  @Max(2100)
  examYear!: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}