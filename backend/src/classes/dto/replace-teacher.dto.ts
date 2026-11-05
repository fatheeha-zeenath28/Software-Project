import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class ReplaceTeacherDto {
  @ApiProperty({
    example: 2,
    description: 'ID of the currently assigned teacher',
  })
  @IsInt()
  @Min(1)
  oldTeacherId!: number;

  @ApiProperty({
    example: 3,
    description: 'ID of the new teacher',
  })
  @IsInt()
  @Min(1)
  newTeacherId!: number;
}