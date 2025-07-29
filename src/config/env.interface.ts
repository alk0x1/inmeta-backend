export interface Environment {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: number;
    DATABASE_URL: string;
  }