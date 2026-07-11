import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../services/api';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await adminLogin(form);
      loginAdmin(data.token);
      toast.success('Admin login successful');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-text mb-6">Admin Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full px-4 py-2.5 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Password</label>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="w-full px-4 py-2.5 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-burgundy text-white py-3 rounded-xl font-semibold text-sm hover:bg-burgundy-600 transition-colors disabled:opacity-50">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
