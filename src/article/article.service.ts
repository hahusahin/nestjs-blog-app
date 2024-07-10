import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';
import { DataSource, DeleteResult, Repository } from 'typeorm';

import { ArticleEntity } from './article.entity';
import { UserEntity } from 'src/user/user.entity';
import { CreateArticleDto } from './article.dto';
import { ArticleResponse, IArticlesResponse } from './article.types';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private dataSource: DataSource,
  ) {}

  async findAllArticles(
    currentUserId: number,
    query: any,
  ): Promise<IArticlesResponse> {
    const queryBuilder = this.dataSource
      .getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    if (query.tag)
      queryBuilder.andWhere('articles.tagList LIKE :tag', {
        tag: `%${query.tag}%`,
      });

    if (query.author) {
      const author = await this.userRepository.findOne({
        where: { username: query.author },
      });
      if (author)
        queryBuilder.andWhere('articles.authorId = :id', {
          id: author.id,
        });
    }

    if (query.favorited) {
      const author = await this.userRepository.findOne({
        where: { username: query.favorited },
        relations: ['favorites'],
      });

      const ids = author.favorites.map((el) => el.id);
      if (ids.length > 0) {
        queryBuilder.andWhere('articles.id IN (:...ids)', { ids });
      } else {
        queryBuilder.andWhere('0=1');
      }
    }

    queryBuilder.orderBy('articles.createdAt', 'DESC');

    const articlesCount = await queryBuilder.getCount();

    if (query.limit) queryBuilder.limit(query.limit);
    if (query.offset) queryBuilder.offset(query.offset);

    let favoritedIdsByCurrentUser: number[] = [];

    if (currentUserId) {
      const currentUser = await this.userRepository.findOne({
        where: { id: currentUserId },
        relations: ['favorites'],
      });
      favoritedIdsByCurrentUser = currentUser.favorites.map((el) => el.id);
    }

    const articles = await queryBuilder.getMany();
    const articlesWithFavorited = articles.map((article) => ({
      ...article,
      favorited: favoritedIdsByCurrentUser.includes(article.id),
    }));

    return { articles: articlesWithFavorited, articlesCount };
  }

  async createArticle(
    user: UserEntity,
    createDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article = new ArticleEntity();
    Object.assign(article, createDto);

    if (!article.tagList) article.tagList = [];

    article.author = user;

    article.slug = this.getSlug(createDto.title);

    return await this.articleRepository.save(article);
  }

  async getArticle(slug: string): Promise<ArticleEntity> {
    const article = await this.articleRepository.findOne({
      where: { slug },
      // relations: ['author'],
    });

    if (!article)
      throw new HttpException('Article Not Found', HttpStatus.NOT_FOUND);

    return article;
  }

  async deleteArticle(
    slug: string,
    currentUserId: number,
  ): Promise<DeleteResult> {
    const article = await this.articleRepository.findOne({ where: { slug } });

    if (!article)
      throw new HttpException('Article Not Found', HttpStatus.NOT_FOUND);

    if (article.author.id !== currentUserId)
      throw new HttpException('You are not author', HttpStatus.FORBIDDEN);

    return await this.articleRepository.delete({ slug });
  }

  async updateArticle(
    slug: string,
    currentUserId: number,
    updateDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article = await this.articleRepository.findOne({ where: { slug } });

    if (!article)
      throw new HttpException('Article Not Found', HttpStatus.NOT_FOUND);

    if (article.author.id !== currentUserId)
      throw new HttpException('You are not author', HttpStatus.FORBIDDEN);

    Object.assign(article, updateDto);

    article.slug = this.getSlug(updateDto.title);

    return await this.articleRepository.save(article);
  }

  async addArticleToFavorites(
    slug: string,
    currentUserId: number,
  ): Promise<ArticleEntity> {
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: ['favorites'],
    });
    const article = await this.articleRepository.findOne({ where: { slug } });

    const isInFavorites = !!user.favorites.find(
      (articleInFavorites) => articleInFavorites.id === article.id,
    );

    if (!isInFavorites && user.id !== article.author.id) {
      user.favorites.push(article);
      article.favoritesCount++;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }

  async removeArticleFromFavorites(
    slug: string,
    currentUserId: number,
  ): Promise<ArticleEntity> {
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: ['favorites'],
    });
    const article = await this.articleRepository.findOne({ where: { slug } });

    const articleIndex = user.favorites.findIndex(
      (articleInFavorites) => articleInFavorites.id === article.id,
    );

    if (articleIndex >= 0) {
      user.favorites.splice(articleIndex, 1);
      article.favoritesCount--;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }

  buildArticleResponse(article: ArticleEntity): ArticleResponse {
    return { article };
  }

  private getSlug(title: string): string {
    return (
      slugify(title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }
}
