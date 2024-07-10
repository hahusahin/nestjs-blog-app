import { IUser } from 'src/user/user.types';

export interface ProfileResponse {
  profile: IProfile;
}

export interface IProfile extends IUser {
  following: boolean;
}
