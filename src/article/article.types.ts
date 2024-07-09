import { ArticleEntity } from './article.entity';

export interface ArticleResponse {
  article: ArticleEntity;
}

export interface IArticlesResponse {
  articles: Omit<ArticleEntity, 'updateTimestamp'>[];
  articlesCount: number;
}
