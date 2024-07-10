import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { ProfileResponse } from './profile.types';
import { FollowEntity } from './follow.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
  ) {}

  async getProfileById(
    currentUserId: number,
    profileUserId: number,
  ): Promise<ProfileResponse> {
    const profile = await this.userRepository.findOne({
      where: { id: profileUserId },
    });

    if (!profile)
      throw new HttpException('Profile Not Exists', HttpStatus.NOT_FOUND);

    let following = false;
    if (currentUserId) {
      following = !!(await this.followRepository.findOne({
        where: { followerId: currentUserId, followingId: profileUserId },
      }));
    }
    delete profile.email;

    return {
      profile: {
        ...profile,
        following,
      },
    };
  }

  async followProfile(
    currentUserId: number,
    profileUserId: number,
  ): Promise<ProfileResponse> {
    const profile = await this.userRepository.findOne({
      where: { id: profileUserId },
    });

    if (!profile)
      throw new HttpException('Profile Not Exists', HttpStatus.NOT_FOUND);

    if (currentUserId === profileUserId)
      throw new HttpException(
        'Follower and following can not be equal',
        HttpStatus.BAD_REQUEST,
      );

    const follow = await this.followRepository.findOne({
      where: { followerId: currentUserId, followingId: profileUserId },
    });

    if (!follow) {
      const newFollow = new FollowEntity();
      newFollow.followerId = currentUserId;
      newFollow.followingId = profileUserId;
      await this.followRepository.save(newFollow);
    }

    return {
      profile: {
        ...profile,
        following: true,
      },
    };
  }

  async unFollowProfile(
    currentUserId: number,
    profileUserId: number,
  ): Promise<ProfileResponse> {
    const profile = await this.userRepository.findOne({
      where: { id: profileUserId },
    });

    if (!profile)
      throw new HttpException('Profile Not Exists', HttpStatus.NOT_FOUND);

    if (currentUserId === profileUserId)
      throw new HttpException(
        'Follower and following can not be equal',
        HttpStatus.BAD_REQUEST,
      );

    await this.followRepository.delete({
      followerId: currentUserId,
      followingId: profileUserId,
    });

    return {
      profile: {
        ...profile,
        following: false,
      },
    };
  }
}
