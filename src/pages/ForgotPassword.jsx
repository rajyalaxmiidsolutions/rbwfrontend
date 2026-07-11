import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword } from '../services/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword({ email });
      toast.success('Reset OTP sent to your email');
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-text mb-2">Forgot Password</h2>
      <p className="text-sm text-gray-500 mb-6">Enter your email to receive a password reset OTP.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2.5 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-burgundy text-white py-3 rounded-xl font-semibold text-sm hover:bg-burgundy-600 transition-colors disabled:opacity-50">
          {loading ? 'Sending...' : 'Send Reset OTP'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        <Link to="/login" className="text-burgundy font-medium hover:underline">Back to Login</Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
