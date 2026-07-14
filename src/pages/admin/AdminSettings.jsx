import { useState, useEffect } from 'react';
import { seedAdmin, adminGetPushStats, adminSendCustomNotification } from '../../services/api';
import { subscribeUserToPush, getNotificationPermissionState } from '../../utils/pushManager';
import toast from 'react-hot-toast';
import { BUSINESS } from '../../utils/constants';

const AdminSettings = () => {
  const [seeding, setSeeding] = useState(false);
  const [stats, setStats] = useState({ customers: 0, admins: 0, total: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Custom notification form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [sending, setSending] = useState(false);
  const [permission, setPermission] = useState(getNotificationPermissionState());

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await adminGetPushStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch push stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const { data } = await seedAdmin();
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to seed admin');
    } finally { setSeeding(false); }
  };

  const handleSubscribeAdmin = async () => {
    const success = await subscribeUserToPush(true);
    if (success) {
      toast.success('Successfully subscribed this device to admin notifications!');
      setPermission(getNotificationPermissionState());
      fetchStats();
    } else {
      toast.error('Failed to subscribe this device. Please check site permissions.');
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error('Please enter both a title and message body.');
      return;
    }

    const confirmSend = window.confirm(
      `Are you sure you want to send this push notification to all ${stats.customers} active customer subscribers?`
    );
    if (!confirmSend) return;

    setSending(true);
    try {
      const { data } = await adminSendCustomNotification({
        title: title.trim(),
        body: body.trim(),
        targetUrl: targetUrl.trim() || undefined
      });
      toast.success(data.message);
      setTitle('');
      setBody('');
      setTargetUrl('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Push Notifications Card */}
      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        <h3 className="text-base font-semibold text-text mb-2 flex items-center gap-2">
          <span>🔔</span> Web Push Notifications Settings
        </h3>
        <p className="text-xs text-gray-400 mb-6">
          Manage system notification delivery stats and dispatch custom messages.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
            <div className="text-lg font-bold text-burgundy">{statsLoading ? '...' : stats.customers}</div>
            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Customers</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
            <div className="text-lg font-bold text-burgundy">{statsLoading ? '...' : stats.admins}</div>
            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Admins</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
            <div className="text-lg font-bold text-burgundy">{statsLoading ? '...' : stats.total}</div>
            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Total Subscribers</div>
          </div>
        </div>

        {/* Admin device subscription */}
        <div className="bg-[#fcf8f9] rounded-xl border border-[#f5e6e8] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-semibold text-[#6D0F1A]">Get Admin Alerts on this Device</h4>
            <p className="text-[10px] text-gray-500 mt-0.5">Receive real-time sound/screen alerts when new customer orders are placed.</p>
          </div>
          {permission === 'granted' ? (
            <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-semibold self-start md:self-auto">
              ✓ Active on this Device
            </span>
          ) : (
            <button 
              onClick={handleSubscribeAdmin} 
              className="bg-burgundy text-white hover:bg-burgundy-600 px-4 py-2 rounded-xl text-xs font-semibold transition"
            >
              Subscribe Device
            </button>
          )}
        </div>

        {/* Send Custom Notification Form */}
        <form onSubmit={handleSendNotification} className="mt-8 space-y-4 pt-6 border-t border-gray-150">
          <h4 className="text-sm font-semibold text-text">Broadcast Custom Notification</h4>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Notification Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g., Flash Sale Today! ⚡"
              className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-burgundy"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Message Body</label>
            <textarea 
              rows="3" 
              value={body} 
              onChange={(e) => setBody(e.target.value)} 
              placeholder="e.g., Use coupon code SAVE20 for an extra 20% off on premium series invitations."
              className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-burgundy resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Target Page URL (Optional)</label>
            <input 
              type="text" 
              value={targetUrl} 
              onChange={(e) => setTargetUrl(e.target.value)} 
              placeholder="e.g., /shop"
              className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-burgundy"
            />
          </div>
          <button 
            type="submit" 
            disabled={sending || stats.customers === 0} 
            className="w-full bg-burgundy hover:bg-burgundy-600 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            {sending ? 'Sending Broadcast...' : 'Broadcast to All Customers'}
          </button>
        </form>
      </div>

      {/* Business Info */}
      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        <h3 className="text-base font-semibold text-text mb-4">Business Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Business Name</span>
            <span className="font-medium">{BUSINESS.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Phone</span>
            <span className="font-medium">{BUSINESS.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Email</span>
            <span className="font-medium">{BUSINESS.email}</span>
          </div>
        </div>
      </div>

      {/* Admin Seed */}
      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        <h3 className="text-base font-semibold text-text mb-2">Setup</h3>
        <p className="text-xs text-gray-400 mb-4">Create the default admin account (admin@rbw.com / admin123456). Use this only during initial setup.</p>
        <button onClick={handleSeed} disabled={seeding} className="bg-burgundy text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-burgundy-600 transition-colors disabled:opacity-50">
          {seeding ? 'Creating...' : 'Create Default Admin'}
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
