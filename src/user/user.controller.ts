import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { LoginDto, RegisterDto, UpdateDto } from './dto';
import { ExpressRequest, UserResponse } from './types';
import { User } from './user.decorator';
import { UserEntity } from './user.entity';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('users/register')
  @UsePipes(new ValidationPipe())
  async register(
    @Body('user') registerDto: RegisterDto,
  ): Promise<UserResponse> {
    return await this.userService.register(registerDto);
  }

  @Post('users/login')
  @UsePipes(new ValidationPipe())
  async login(@Body('user') loginDto: LoginDto): Promise<UserResponse> {
    return await this.userService.login(loginDto);
  }

  @Get('user')
  @UseGuards(AuthGuard)
  async currentUser(@User() user: UserEntity) {
    return this.userService.generateUserResponse(user);
  }

  @Put('user')
  async updateUser(
    @Body('user') updateDto: UpdateDto,
    @User('id') userId: number,
  ): Promise<UserResponse> {
    const updatedUser = await this.userService.updateUser(updateDto, userId);
    return this.userService.generateUserResponse(updatedUser);
  }
}
