import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OptionalAuthGuard } from 'src/guards/auth.guard';
import { ProfileResponse } from './profile.types';
import { User } from 'src/user/user.decorator';
import { ProfileService } from './profile.service';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
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
