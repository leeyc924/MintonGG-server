import { ApiProperty } from '@nestjs/swagger';

export class UserDetailResponse {
  @ApiProperty({ description: '이름', example: '홍길동' })
  name!: string;
  @ApiProperty({ description: '성별', example: 'M' })
  gender!: string;
  @ApiProperty({ description: '주소', example: '영등포' })
  address!: string;
  @ApiProperty({ description: '나이', example: '1997' })
  age!: string;
  @ApiProperty({ description: '가입일', example: '2024-01-01' })
  joinDt!: string;
  @ApiProperty({ description: '전체이름', example: '홍길동/97/영등포/남' })
  fullName!: string;
  @ApiProperty({ description: '직위', example: '2' })
  position!: number;
}
