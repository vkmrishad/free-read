import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="w-full border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-6 mt-12">
            <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
                © {new Date().getFullYear()}&nbsp;
                <Link
                    to=""
                    rel="noopener noreferrer"
                    className="font-bold text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >FreeRead</Link> • Built with ❤️ to make knowledge free.
            </div>
        </footer>
    );
};

export default Footer;