import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { isMediumUrl } from '../utils/articleParser';
import LoadingSpinner from './LoadingSpinner';

interface UrlInputProps {
  onSubmit: (url: string) => void;
  loading?: boolean;
}

const UrlInput: React.FC<UrlInputProps> = ({ onSubmit, loading = false }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(false);

  const handleSubmit = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setValidating(true);
    setError('');

    try {
      const isValidMediumUrl = await isMediumUrl(url.trim());
      
      if (!isValidMediumUrl) {
        setError('Please enter a valid Medium article URL');
        return;
      }

      // Call onSubmit which should trigger the parent's loading state
      onSubmit(url.trim());
    } catch (err) {
      setError('Failed to validate URL. Please try again.');
    } finally {
      setValidating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if (error) setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const isProcessing = loading || validating;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="space-y-4">
        <div className="relative">
          <input
            type="url"
            value={url}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Enter Medium article URL (e.g., https://medium.com/@author/article-title)"
            className="w-full px-4 py-3 pl-12 pr-24 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 transition-colors duration-200"
            disabled={isProcessing}
          />
          <ExternalLink className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
          <button
            onClick={handleSubmit}
            disabled={isProcessing || !url.trim()}
            className="absolute right-2 top-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="relative w-4 h-4">
                  <div className="w-4 h-4 border-2 border-white/30 rounded-full" />
                  <div className="absolute top-0 left-0 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
                <span>{validating ? 'Validating...' : 'Processing...'}</span>
              </>
            ) : (
              <span>Read</span>
            )}
          </button>
        </div>
        
        {error && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-2 px-1">
            {error}
          </p>
        )}
        
        {isProcessing &&(
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
              <div className="max-w-4xl mx-auto px-4">
                <LoadingSpinner message="Fetching article content..." />
              </div>
            </div>
          )}

      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Paste any Medium article URL to read it for free, without limits
        </p>
      </div>
    </div>
  );
};

export default UrlInput;