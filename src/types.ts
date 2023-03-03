export type Source = 'dou' | 'blind';

export interface Comment {
  text: string;
  articleLink: string;
  articleTitle: string;
  publicationDate: Date;
  source: Source;
}
