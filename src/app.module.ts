import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TagModule } from './tag/tag.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import dataSourceOptions from './ormdatasource';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { ArticleModule } from './article/article.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(dataSourceOptions),
    TagModule,
    UserModule,
    ArticleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'users/(.*)', method: RequestMethod.ALL },
        { path: 'tags', method: RequestMethod.ALL },
        { path: 'articles', method: RequestMethod.GET },
        { path: 'articles/:slug', method: RequestMethod.GET },
        { path: 'articles/:slug/comments', method: RequestMethod.GET },
        { path: 'profiles/:username', method: RequestMethod.GET },
      )
      .forRoutes('*');
  }
}
