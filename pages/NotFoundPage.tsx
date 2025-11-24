import React from 'react';
import { Link } from 'react-router-dom';
import { LOGO_URL_ROUNDED } from '../constants';

const NotFoundPage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center text-center h-full py-16">
            <img src={LOGO_URL_ROUNDED} alt="Toasty FC Logo" className="h-24 w-auto mb-8 opacity-80" />
            <h1 className="text-6xl font-black text-secondary mb-4">404</h1>
            <h2 className="text-3xl font-bold text-accent mb-4">Page Not Found</h2>
            <p className="text-gray-600 mb-8 max-w-md">
                Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
            </p>
            <Link to="/" className="inline-block bg-primary text-background px-6 py-3 rounded-lg hover:bg-opacity-80 transition-colors font-bold">
                Go Back Home
            </Link>
        </div>
    );
};

export default NotFoundPage;