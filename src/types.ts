export type Source = 'dou' | 'blind';

export interface Comment {
  text: string;
  articleLink: string;
  articleTitle: string;
  publicationDate: Date;
  source: Source;
}

export interface GetCommentsReturnType {
  result: Comment[];
  loadMoreActive: boolean;
  total?: number;
  perPage?: number;
}
