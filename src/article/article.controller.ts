import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { User } from 'src/user/user.decorator';
import { UserEntity } from 'src/user/user.entity';
import { CreateArticleDto } from './article.dto';
import { ArticleResponse, IArticlesResponse } from './article.types';
import { OptionalAuthGuard } from 'src/guards/auth.guard';
import { BackendValidationPipe } from 'src/pipes/backendValidation.pipe';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  async findAllArticles(
    @User('id') currentUserId: number,
    @Query() query: any,
  ): Promise<IArticlesResponse> {
    return await this.articleService.findAllArticles(currentUserId, query);
  }

  @Get('feed')
  async getFeed(
    @User('id') currentUserId: number,
    @Query() query: any,
  ): Promise<IArticlesResponse> {
    return await this.articleService.getFeed(currentUserId, query);
  }

  @Post()
  @UsePipes(new BackendValidationPipe())
  async createArticle(
    @User() user: UserEntity,
    @Body('article') createDto: CreateArticleDto,
  ): Promise<ArticleResponse> {
    const article = await this.articleService.createArticle(user, createDto);
    return this.articleService.buildArticleResponse(article);
  }

  @Get(':slug')
  async getArticle(@Param('slug') slug: string): Promise<ArticleResponse> {
    const article = await this.articleService.getArticle(slug);
    return this.articleService.buildArticleResponse(article);
  }

  @Delete(':slug')
  async deleteArticle(
    @Param('slug') slug: string,
    @User('id') currentUserId: number,
  ) {
    return await this.articleService.deleteArticle(slug, currentUserId);
  }

  @Put(':slug')
  @UsePipes(new BackendValidationPipe())
  async updateArticle(
    @Param('slug') slug: string,
    @User('id') currentUserId: number,
    @Body('article') updateDto: CreateArticleDto,
  ) {
    const article = await this.articleService.updateArticle(
      slug,
      currentUserId,
      updateDto,
    );
    return this.articleService.buildArticleResponse(article);
  }

  @Post(':slug/favorite')
  async addArticleToFavorites(
    @Param('slug') slug: string,
    @User('id') currentUserId: number,
  ): Promise<ArticleResponse> {
    const article = await this.articleService.addArticleToFavorites(
      slug,
      currentUserId,
    );
    return this.articleService.buildArticleResponse(article);
  }

  @Delete(':slug/favorite')
  async removeArticleFromFavorites(
    @Param('slug') slug: string,
    @User('id') currentUserId: number,
  ): Promise<ArticleResponse> {
    const article = await this.articleService.removeArticleFromFavorites(
      slug,
      currentUserId,
    );
    return this.articleService.buildArticleResponse(article);
  }
}
