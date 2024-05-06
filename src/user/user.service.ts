import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async list() {
    const userList = await this.userRepo.find({
      select: {
        id: true,
        joinDt: true,
        position: true,
      },
    });
    return userList;
  }

  async create(createUserDto: CreateUserDto) {
    const res = await this.userRepo.insert(createUserDto);
    return res;
  }
}
