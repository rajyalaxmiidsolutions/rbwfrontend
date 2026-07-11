import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="text-center py-6">
      <h2 className="text-2xl font-bold text-text mb-4">Registration Disabled</h2>
      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
        Account registration is managed exclusively by the system administrator. 
        Please contact the administrator to obtain your login credentials.
      </p>
      <Link to="/login" className="inline-block bg-burgundy text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-burgundy-600 transition-colors">
        Go to Login
      </Link>
      <p className="text-xs text-gray-400 mt-4">Redirecting to login in 5 seconds...</p>
    </div>
  );
};

export default Signup;
