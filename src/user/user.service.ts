import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoginDto, RegisterDto, UpdateDto } from './user.dto';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { sign } from 'jsonwebtoken';
import { compare, hash } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: {
        email: registerDto.email,
      },
    });

    if (existingUser) {
      throw new HttpException(
        { errors: { email: 'User Already Exists' } },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const newUserEntity = new UserEntity();
    Object.assign(newUserEntity, registerDto);

    const newUser = await this.userRepository.save(newUserEntity);
    return this.generateUserResponse(newUser);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: loginDto.email,
      },
      select: ['id', 'username', 'email', 'password', 'bio', 'imageUrl'],
    });

    if (!user || !user.password)
      throw new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED);

    const isPasswordCorrect = await compare(loginDto.password, user.password);
    if (!isPasswordCorrect)
      throw new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED);

    return this.generateUserResponse(user);
  }

  async updateUser(updateDto: UpdateDto, userId: number) {
    const user = await this.findUserById(userId);

    if (!user) throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);

    if (updateDto.password) {
      user.password = updateDto.password;
    }

    Object.assign(user, updateDto);
    return await this.userRepository.save(user);
  }

  generateUserResponse(user: UserEntity) {
    const token = sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET,
    );
    delete user.password;
    return {
      user: {
        ...user,
        token,
      },
    };
  }

  async findUserById(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }
}
