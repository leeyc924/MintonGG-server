import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDetailResponse } from './dto/read-user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async list() {
    const userList = await this.userRepo
      .createQueryBuilder('user')
      .select(['user.id', 'user.joinDt', 'user.position', 'user.address', 'user.age', 'user.gender', 'user.name'])
      .getRawMany();
    return userList;
  }

  async detail(id: number) {
    const userInfo = await this.userRepo
      .createQueryBuilder('user')
      .select(['user.id', 'user.joinDt', 'user.position', 'user.address', 'user.age', 'user.gender', 'user.name'])
      .where('user.id = :id', { id })
      .getOne();

    return plainToInstance(UserDetailResponse, userInfo);
  }

  async create(createUserDto: CreateUserDto) {
    const res = await this.userRepo.insert(createUserDto);
    return res;
  }
}
