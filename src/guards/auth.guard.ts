import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { Observable } from 'rxjs';
import { UserService } from 'src/user/user.service';
import { ExpressRequest, UserJWTPayload } from 'src/user/user.types';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<ExpressRequest>();

    if (request.user) return true;

    throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED);
  }
}

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = verify(token, process.env.JWT_SECRET) as UserJWTPayload;
        request.user = await this.userService.findUserById(decoded.id);
      } catch (error) {
        console.error('Invalid authorization credentials', error);
        request.user = null;
      }
    }

    return true;
  }
}
