import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginAPI } from '../services/api';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await loginAPI(form);
      loginUser(data.token, data.user);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      if (err.response?.data?.needsVerification) {
        navigate('/verify-otp', { state: { email: err.response.data.email } });
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-text mb-6">Welcome Back</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full px-4 py-2.5 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Password</label>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="w-full px-4 py-2.5 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy" />
        </div>
        <div className="text-right">
          <Link to="/forgot-password" className="text-xs text-burgundy hover:underline">Forgot Password?</Link>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-burgundy text-white py-3 rounded-xl font-semibold text-sm hover:bg-burgundy-600 transition-colors disabled:opacity-50">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="mt-6 text-center text-xs text-gray-500">
        Need an account? Please contact your administrator to get login credentials.
      </p>
    </div>
  );
};

export default Login;
