import React, { useEffect } from 'react';
import {
  Calendar,
  ExternalLink,
  Edit,
  Shield,
  ShieldCheck,
} from 'lucide-react';
import { Article } from '../types';

interface ArticleViewerProps {
  article: Article;
  onBack: () => void;
}

const ArticleViewer: React.FC<ArticleViewerProps> = ({ article }) => {
  // Add "Copy" button behavior for rendered code blocks
  useEffect(() => {
    const buttons = document.querySelectorAll('.copy-btn');

    buttons.forEach(button => {
      const clickHandler = () => {
        const pre = button.closest('.group')?.querySelector('pre code');
        if (pre) {
          const text = pre.textContent || '';
          navigator.clipboard.writeText(text).then(() => {
            const original = button.innerHTML;
            button.innerHTML = `<span>Copied!</span>`;
            setTimeout(() => {
              button.innerHTML = original;
            }, 2000);
          });
        }
      };

      button.addEventListener('click', clickHandler);

      // Cleanup function
      return () => {
        button.removeEventListener('click', clickHandler);
      };
    });
  }, []);

  const handleOpenOriginal = () => {
    window.open(article.url, '_blank', 'noopener,noreferrer');
  };

  const handleFollowAuthor = () => {
    if (article.authorHandle) {
      window.open(`https://medium.com/@${article.authorHandle}`, '_blank', 'noopener,noreferrer');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const processContent = (content: string) => {
    return content.replace(
      /<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/g,
      (match) => {
        const language = match.match(/language-(\w+)/)?.[1] || 'code';
        return `<div class="code-block-wrapper bg-gray-900 dark:bg-gray-900 rounded-b-lg" data-language="${language}">${match}</div>`;
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleOpenOriginal}
              className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors duration-200"
            >
              <span>View Original</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {article.image && (
          <div className="aspect-video w-full overflow-hidden rounded-xl mb-8 shadow-lg">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            {article.title}
          </h1>

          {article.excerpt && (
            <h2 className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed font-medium">
              {article.excerpt}
            </h2>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex items-center mb-4">
              {article.authorAvatar && (
                <img
                  src={article.authorAvatar}
                  alt={article.author}
                  className="w-14 h-14 rounded-full mr-4 border-2 border-gray-200 dark:border-gray-600"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-bold text-gray-900 dark:text-white text-lg">
                    {article.author}
                  </span>
                  {article.authorHandle && (
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      @{article.authorHandle}
                    </span>
                  )}
                </div>
                {article.read && (
                  <div className="text-gray-600 dark:text-gray-400 mb-2 text-sm">
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      {article.read}
                    </span>
                  </div>
                )}
              </div>

              {article.authorHandle && (
                <button
                  onClick={handleFollowAuthor}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors duration-200 font-medium"
                >
                  Follow
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center text-sm text-gray-600 dark:text-gray-400 space-x-4 border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(article.publishedAt)}</span>
              </div>
              {article.updatedAt && article.updatedAt !== article.publishedAt && (
                <div className="flex items-center space-x-1">
                  <Edit className="h-4 w-4" />
                  <span>(Updated: {formatDate(article.updatedAt)})</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                {article.isPaid ? (
                  <>
                    <Shield className="h-4 w-4 text-red-500" />
                    <span className="text-red-600 dark:text-red-400 font-medium">Free: No</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    <span className="text-green-600 dark:text-green-400 font-medium">Free: Yes</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {article.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors duration-200 cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <div
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: processContent(article.content) }}
          />
        </div>
      </article>
    </div>
  );
};

export default ArticleViewer;
