import React from 'react';
import { FileQuestion, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <FileQuestion className="h-24 w-24 text-gray-300 mb-6" />
      <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
      <h2 className="text-xl font-medium text-gray-600 mb-8">Page Not Found</h2>
      <p className="text-gray-500 max-w-md text-center mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
      >
        <Home className="h-5 w-5 mr-2" />
        Go Home
      </button>
    </div>
  );
};

export default NotFound;