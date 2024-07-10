import { Request } from 'express';
import { UserEntity } from './user.entity';

export type IUser = Omit<
  UserEntity,
  'hashPasswordBeforeInsert' | 'hashPasswordBeforeUpdate'
>;

export interface UserResponse {
  user: IUser & { token: string };
}

export interface ExpressRequest extends Request {
  user?: UserEntity;
}

export interface UserJWTPayload {
  id: number;
  username: string;
  email: string;
}
