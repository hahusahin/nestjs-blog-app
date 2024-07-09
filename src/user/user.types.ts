import { Request } from 'express';
import { UserEntity } from './user.entity';

export interface UserResponse {
  user: Omit<
    UserEntity,
    'hashPasswordBeforeInsert' | 'hashPasswordBeforeUpdate'
  > & { token: string };
}

export interface ExpressRequest extends Request {
  user?: UserEntity;
}

export interface UserJWTPayload {
  id: number;
  username: string;
  email: string;
}
