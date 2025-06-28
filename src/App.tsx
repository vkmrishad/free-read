import { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Article } from './types';
import { extractArticleData } from './utils/articleParser';
import Header from './components/Header';
import UrlInput from './components/UrlInput';
import RecentArticles from './components/RecentArticles';
import ArticleViewer from './components/ArticleViewer';
import LoadingSpinner from './components/LoadingSpinner';
import Footer from './components/Footer';

function HomePage({
  articles,
  onSubmit,
  loading,
  error,
  onReadArticle,
  onDeleteArticle,
}: {
  articles: Article[];
  onSubmit: (url: string) => void;
  loading: boolean;
  error: string;
  onReadArticle: (article: Article) => void;
  onDeleteArticle: (id: string) => void;
}) {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Read Medium Articles For Free</h1>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Access any Medium article instantly without paywalls or limitations. Just paste the URL and start reading.
        </p>
        <UrlInput onSubmit={onSubmit} loading={loading} />
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>

      {loading && <LoadingSpinner message="Fetching article content..." />}

      {!loading && (
        <RecentArticles
          articles={articles}
          onReadArticle={onReadArticle}
          onDeleteArticle={onDeleteArticle}
        />
      )}
    </main>
  );
}

function ArticleUrlPage({ articles }: { articles: Article[] }) {
  const url = window.location.pathname.slice(1); // Get raw URL directly
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // const existing = articles.find((a) => a.url === url);
    // if (existing) {
    //   setArticle(existing);
    //   setLoading(false);
    // } else {
      extractArticleData(url)
        .then((data) => {
          setArticle(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    // }
  }, [url, articles]);

  if (!url.startsWith('http')) return <Navigate to="/" />;
  if (loading) return <LoadingSpinner message="Loading article..." />;
  if (!article) {
    return (
      <div className="text-center py-20">
        <h1 className="text-xl text-gray-600 dark:text-gray-300">Article not found</h1>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  return <ArticleViewer article={article} onBack={() => navigate('/')} />;
}

function App() {
  const [articles, setArticles] = useLocalStorage<Article[]>('freeread-articles', []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleUrlSubmit = async (url: string) => {
    setLoading(true);
    setError('');
    try {
      // const existingArticle = articles.find((article) => article.url === url);
      // if (existingArticle) {
      //   navigate(`/${decodeURIComponent(url)}`);
      //   setLoading(false);
      //   return;
      // }

      const article = await extractArticleData(url);
      const updatedArticles = [article, ...articles.slice(0, 49)];
      setArticles(updatedArticles);
      navigate(`/${decodeURIComponent(article.url)}`);
    } catch (err) {
      setError('Failed to fetch article. Please check the URL and try again.');
      console.error('Error fetching article:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArticle = (id: string) => {
    setArticles((prev) => prev.filter((article) => article.id !== id));
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Header />
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                articles={articles}
                onSubmit={handleUrlSubmit}
                loading={loading}
                error={error}
                onReadArticle={(article) => navigate(`/${decodeURIComponent(article.url)}`)}
                onDeleteArticle={handleDeleteArticle}
              />
            }
          />
          <Route path="*" element={<ArticleUrlPage articles={articles} />} />
        </Routes>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default function WrappedApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}
