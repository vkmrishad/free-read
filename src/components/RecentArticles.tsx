import React, { useState } from 'react';
import { Search, History, FileText } from 'lucide-react';
import { Article } from '../types';
import ArticleCard from './ArticleCard';

interface RecentArticlesProps {
  articles: Article[];
  onReadArticle: (article: Article) => void;
  onDeleteArticle: (id: string) => void;
}

const RecentArticles: React.FC<RecentArticlesProps> = ({
  articles,
  onReadArticle,
  onDeleteArticle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No articles yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Enter a Medium URL above to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <History className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recent Articles
          </h2>
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-full">
            {articles.length}
          </span>
        </div>
      </div>

      {articles.length > 3 && (
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
          />
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredArticles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            onRead={onReadArticle}
            onDelete={onDeleteArticle}
          />
        ))}
      </div>

      {filteredArticles.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No articles found matching "{searchTerm}"
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentArticles;