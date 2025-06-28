import React from 'react';
import { Calendar, ExternalLink, Trash2, Heart, MessageCircle, Shield, ShieldCheck } from 'lucide-react';
import { Article } from '../types';

interface ArticleCardProps {
  article: Article;
  onRead: (article: Article) => void;
  onDelete: (id: string) => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onRead, onDelete }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-500 transition-all duration-200 hover:shadow-lg group">
      {article.image && (
        <div className="aspect-video w-full overflow-hidden rounded-t-xl">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onClick={() => onRead(article)}
            style={{cursor:'pointer'}}
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1" onClick={() => onRead(article)} style={{cursor:'pointer'}}> 
            {article.title}
          </h3>
          <button
            onClick={() => onDelete(article.id)}
            className="ml-2 p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200"
            title="Remove from history"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {article.excerpt}
        </p>
        
        {/* Author Information */}
        <div className="flex items-center mb-4">
          {article.authorAvatar && (
            <img
              src={article.authorAvatar}
              alt={article.author}
              className="w-8 h-8 rounded-full mr-3"
            />
          )}
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900 dark:text-white text-sm">
                {article.author}
              </span>
              {article.authorHandle && (
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  @{article.authorHandle}
                </span>
              )}
            </div>
            {article.read && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {article.read}
              </div>
            )}
          </div>
        </div>
        
        {/* Article Metadata */}
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-4 mb-4">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(article.publishedAt)}</span>
          </div>
          {article.updatedAt && article.updatedAt !== article.publishedAt && (
            <div className="flex items-center space-x-1">
              <span>(Updated: {formatDate(article.updatedAt)})</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            {article.isPaid ? (
              <>
                <Shield className="h-3 w-3 text-red-500" />
                <span className="text-red-600 dark:text-red-400">Free: No</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-3 w-3 text-green-500" />
                <span className="text-green-600 dark:text-green-400">Free: Yes</span>
              </>
            )}
          </div>
        </div>
        
        {/* Engagement Metrics */}
        {(article.claps || article.responses) && (
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-4 mb-4">
            {article.claps && article.claps > 0 && (
              <div className="flex items-center space-x-1">
                <Heart className="h-3 w-3" />
                <span>{article.claps}</span>
              </div>
            )}
            {article.responses && article.responses > 0 && (
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-3 w-3" />
                <span>{article.responses}</span>
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {article.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
            {article.tags.length > 3 && (
              <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 text-xs rounded-full">
                +{article.tags.length - 3}
              </span>
            )}
          </div>
          
          <button
            onClick={() => onRead(article)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors duration-200"
          >
            <span>Read</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;