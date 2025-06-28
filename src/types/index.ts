export interface Article {
  id: string;
  url: string;
  title: string;
  author: string;
  authorHandle?: string;
  authorAvatar?: string;
  publishedAt: string;
  updatedAt?: string;
  readingTime: number;
  content: string;
  excerpt: string;
  tags: string[];
  addedAt: string;
  image?: string;
  isPaid?: boolean;
  read?: string;
  claps?: number;
  responses?: number;
}

export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}