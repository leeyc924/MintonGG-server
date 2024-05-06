import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: '이름', example: '홍길동' })
  @IsNotEmpty()
  @IsString()
  name!: string;
  @ApiProperty({ description: '성별', example: 'M' })
  @IsNotEmpty()
  @IsString()
  gender!: string;
  @ApiProperty({ description: '주소', example: '영등포' })
  @IsNotEmpty()
  @IsString()
  address!: string;
  @ApiProperty({ description: '나이', example: '1997' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(4)
  @MinLength(4)
  age!: string;
  @ApiProperty({ description: '가입일', example: '2024-01-01' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  @MinLength(10)
  joinDt!: string;
}
