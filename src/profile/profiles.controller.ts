import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { ProfileResponse } from './profile.types';
import { User } from 'src/user/user.decorator';
import { ProfileService } from './profile.service';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':id')
  async getProfile(
    @User('id') currentUserId: number,
    @Param('id') profileUserId: string,
  ): Promise<ProfileResponse> {
    return await this.profileService.getProfileById(
      currentUserId,
      +profileUserId,
    );
  }

  @Post(':id/follow')
  @UseGuards(AuthGuard)
  async followProfile(
    @User('id') currentUserId: number,
    @Param('id') profileUserId: string,
  ): Promise<ProfileResponse> {
    return await this.profileService.followProfile(
      currentUserId,
      +profileUserId,
    );
  }

  @Delete(':id/follow')
  @UseGuards(AuthGuard)
  async unFollowProfile(
    @User('id') currentUserId: number,
    @Param('id') profileUserId: string,
  ): Promise<ProfileResponse> {
    return await this.profileService.unFollowProfile(
      currentUserId,
      +profileUserId,
    );
  }
}
