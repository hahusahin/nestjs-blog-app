import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { ExpressRequest, UserJWTPayload } from '../user/user.types';
import { UserService } from '../user/user.service';
import { verify } from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: ExpressRequest, _: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      req.user = null;
      return next();
    }

    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = verify(token, process.env.JWT_SECRET) as UserJWTPayload;
      req.user = await this.userService.findUserById(decoded.id);
      next();
    } catch (error) {
      throw new HttpException(
        'Invalid Authorization Credentials',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
