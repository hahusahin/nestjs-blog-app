import { Module } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { ProfileService } from './profile.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { FollowEntity } from './follow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, FollowEntity])],
  controllers: [ProfilesController],
  providers: [ProfileService, UserService],
})
export class ProfileModule {}
