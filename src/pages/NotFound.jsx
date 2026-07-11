import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-bg">
    <h1 className="text-6xl font-bold text-burgundy mb-4">404</h1>
    <p className="text-xl text-text mb-2">Page Not Found</p>
    <p className="text-gray-400 text-sm mb-8">The page you're looking for doesn't exist.</p>
    <Link to="/" className="bg-burgundy text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-burgundy-600 transition-colors">
      Go Home
    </Link>
  </div>
);

export default NotFound;
