import { useState, useEffect } from 'react';
import { 
  adminGetPushStats, 
  adminSendCustomNotification,
  adminGetSettings,
  adminUpdateSettings,
  adminChangePassword,
  adminRequestEmergencyOTP,
  adminRevokeSession
} from '../../services/api';
import { subscribeUserToPush, getNotificationPermissionState } from '../../utils/pushManager';
import { BUSINESS } from '../../utils/constants';
import { formatDate, maskEmail } from '../../utils/helpers';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  // Global States
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ registeredCustomers: 0, customers: 0, admins: 0, total: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [settings, setSettings] = useState({
    email: '',
    phone: '',
    otpEnabled: true,
    emergencyApproverEmail: '',
    maintenanceMode: false,
    maintenanceMessage: '',
    activeDevices: []
  });

  // Local Form Inputs (Boss Admin Settings)
  const [bossEmail, setBossEmail] = useState('');
  const [bossPhone, setBossPhone] = useState('');
  const [approverEmail, setApproverEmail] = useState('');

  // Password Change Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Push Announcement Form
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [sending, setSending] = useState(false);
  const [permission, setPermission] = useState(getNotificationPermissionState());

  // Store Controls Form
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [savingControls, setSavingControls] = useState(false);

  // OTP Verification Modal
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [statsRes, settingsRes] = await Promise.all([
        adminGetPushStats(),
        adminGetSettings()
      ]);
      setStats(statsRes.data);
      const data = settingsRes.data;
      setSettings(data);

      setBossEmail(data.email);
      setBossPhone(data.phone);
      setApproverEmail(data.emergencyApproverEmail);
      setMaintenanceMode(data.maintenanceMode);
      setMaintenanceMessage(data.maintenanceMessage);
    } catch (err) {
      toast.error('Failed to load settings data');
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  };

  const handleSubscribeAdmin = async () => {
    const success = await subscribeUserToPush(true);
    if (success) {
      toast.success('Successfully subscribed this device to admin alerts!');
      setPermission(getNotificationPermissionState());
      // Refresh push statistics
      const { data } = await adminGetPushStats();
      setStats(data);
    } else {
      toast.error('Failed to subscribe device. Please allow site notifications.');
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error('Please fill in both a title and message body');
      return;
    }
    const confirm = window.confirm('Send this push broadcast to all subscribed customers?');
    if (!confirm) return;

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
      toast.error(err.response?.data?.message || 'Failed to send announcement');
    } finally {
      setSending(false);
    }
  };

  // Change password handler (does not require Emergency OTP)
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setPasswordLoading(true);
    try {
      const { data } = await adminChangePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success(data.message);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Store Controls save (does not require Emergency OTP)
  const handleSaveStoreControls = async (e) => {
    e.preventDefault();
    setSavingControls(true);
    try {
      const { data } = await adminUpdateSettings({
        maintenanceMode,
        maintenanceMessage: maintenanceMessage.trim()
      });
      toast.success(data.message);
      setSettings(prev => ({
        ...prev,
        maintenanceMode: data.settings.maintenanceMode,
        maintenanceMessage: data.settings.maintenanceMessage
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update store controls');
    } finally {
      setSavingControls(false);
    }
  };

  // Triggers Emergency OTP code dispatch to Emergency Approver
  const triggerEmergencyOTP = async (changes) => {
    setPendingChanges(changes);
    setOtpLoading(true);
    try {
      const { data } = await adminRequestEmergencyOTP();
      toast.success(data.message);
      setOtpValue('');
      setOtpModalOpen(true);
      setCooldown(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request emergency code');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (cooldown > 0) return;
    try {
      const { data } = await adminRequestEmergencyOTP();
      toast.success(data.message);
      setCooldown(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend code');
    }
  };

  const handleVerifyEmergencyOTP = async (e) => {
    e.preventDefault();
    if (!otpValue || otpValue.length < 4) {
      toast.error('Please enter a valid verification code');
      return;
    }

    setOtpLoading(true);
    try {
      const { data } = await adminUpdateSettings({
        ...pendingChanges,
        otp: otpValue.trim()
      });
      toast.success('Security settings updated successfully!');
      
      // Update local values
      setSettings(prev => ({
        ...prev,
        email: data.settings.email,
        phone: data.settings.phone,
        otpEnabled: data.settings.otpEnabled,
        emergencyApproverEmail: data.settings.emergencyApproverEmail
      }));
      setBossEmail(data.settings.email);
      setBossPhone(data.settings.phone);
      setApproverEmail(data.settings.emergencyApproverEmail);

      setOtpModalOpen(false);
      setPendingChanges(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setOtpLoading(false);
    }
  };

  // Handler for Boss Admin Email/Phone saving
  const handleUpdateBossAdmin = (e) => {
    e.preventDefault();
    const changes = {};
    if (bossEmail.toLowerCase() !== settings.email.toLowerCase()) {
      changes.email = bossEmail.trim();
    }
    if (bossPhone !== settings.phone) {
      changes.phone = bossPhone.trim();
    }

    if (Object.keys(changes).length === 0) {
      toast.error('No changes detected');
      return;
    }

    triggerEmergencyOTP(changes);
  };

  // Handler for Security OTP status toggle
  const handleToggleOTP = () => {
    const nextVal = !settings.otpEnabled;
    triggerEmergencyOTP({ otpEnabled: nextVal });
  };

  // Handler for Emergency Approver email change
  const handleUpdateApprover = (e) => {
    e.preventDefault();
    if (approverEmail.toLowerCase() === settings.emergencyApproverEmail.toLowerCase()) {
      toast.error('No changes detected');
      return;
    }
    triggerEmergencyOTP({ emergencyApproverEmail: approverEmail.trim() });
  };

  // Revoke device session handler
  const handleRevokeSession = async (sessionId) => {
    const confirm = window.confirm('Are you sure you want to revoke this session? The device will be logged out instantly.');
    if (!confirm) return;

    try {
      const { data } = await adminRevokeSession(sessionId);
      toast.success(data.message);
      // Refresh settings
      const settingsRes = await adminGetSettings();
      setSettings(settingsRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to revoke device session');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-burgundy"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* 1. Push Notifications Section */}
      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        <h3 className="text-base font-semibold text-text mb-2 flex items-center gap-2">
          <span>🔔</span> Push Notifications
        </h3>
        <p className="text-xs text-gray-400 mb-6">
          Manage system notification delivery statistics and dispatch custom messages.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
            <div className="text-lg font-bold text-burgundy">{statsLoading ? '...' : stats.registeredCustomers}</div>
            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Registered Customers</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
            <div className="text-lg font-bold text-burgundy">{statsLoading ? '...' : stats.customers}</div>
            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Subscribed Customers</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
            <div className="text-lg font-bold text-burgundy">{statsLoading ? '...' : stats.admins}</div>
            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Subscribed Admins</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
            <div className="text-lg font-bold text-burgundy">{statsLoading ? '...' : stats.total}</div>
            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Total Subscribers</div>
          </div>
        </div>

        {/* Device Alert Subscribe Box */}
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

        {/* Send Broadcast Form */}
        <form onSubmit={handleSendNotification} className="mt-8 space-y-4 pt-6 border-t border-gray-150">
          <h4 className="text-sm font-semibold text-text">Broadcast Custom Notification</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="block text-xs font-medium text-gray-500 mb-1">Target Page URL (Optional)</label>
              <input 
                type="text" 
                value={targetUrl} 
                onChange={(e) => setTargetUrl(e.target.value)} 
                placeholder="e.g., /shop"
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-burgundy"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Message Body</label>
            <textarea 
              rows="2" 
              value={body} 
              onChange={(e) => setBody(e.target.value)} 
              placeholder="e.g., Use coupon code SAVE20 for an extra 20% off on premium series invitations."
              className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-burgundy resize-none"
            />
          </div>
          <button 
            type="submit" 
            disabled={sending} 
            className="w-full bg-burgundy hover:bg-burgundy-600 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            {sending ? 'Sending Broadcast...' : 'Broadcast to All Customers'}
          </button>
        </form>
      </div>

      {/* 2. Business Information Section */}
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

      {/* 3. Boss Admin Section */}
      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        <h3 className="text-base font-semibold text-text mb-4">Boss Admin Settings</h3>
        
        {/* Modify Email/Phone Form */}
        <form onSubmit={handleUpdateBossAdmin} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Boss Admin Email *</label>
              <input 
                type="email" 
                value={bossEmail} 
                onChange={(e) => setBossEmail(e.target.value)} 
                required
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-burgundy"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Boss Admin Phone Number *</label>
              <input 
                type="text" 
                value={bossPhone} 
                onChange={(e) => setBossPhone(e.target.value)} 
                required
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-burgundy"
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="bg-burgundy text-white hover:bg-burgundy-600 px-5 py-2.5 rounded-xl text-xs font-semibold transition"
          >
            Save Admin Details
          </button>
        </form>

        {/* Change Password Form */}
        <form onSubmit={handlePasswordChange} className="mt-8 pt-8 border-t border-gray-150 space-y-4">
          <h4 className="text-sm font-semibold text-text">Change Password</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Current Password *</label>
              <input 
                type="password" 
                value={passwordForm.currentPassword} 
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                required
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-burgundy"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">New Password *</label>
              <input 
                type="password" 
                value={passwordForm.newPassword} 
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                required
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-burgundy"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Confirm New Password *</label>
              <input 
                type="password" 
                value={passwordForm.confirmPassword} 
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-burgundy"
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={passwordLoading}
            className="bg-burgundy text-white hover:bg-burgundy-600 disabled:opacity-50 px-5 py-2.5 rounded-xl text-xs font-semibold transition"
          >
            {passwordLoading ? 'Updating Password...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* 4. Security Section */}
      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        <h3 className="text-base font-semibold text-text mb-4">Security</h3>

        {/* OTP Toggle Display */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 mb-6">
          <div>
            <h4 className="text-xs font-semibold text-text">Email OTP Security Verification</h4>
            <p className="text-[10px] text-gray-400 mt-0.5">Prompt for email OTP confirmation when logging into this admin panel.</p>
          </div>
          <button 
            onClick={handleToggleOTP}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${settings.otpEnabled ? 'bg-burgundy text-white hover:bg-burgundy-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
          >
            {settings.otpEnabled ? '✓ Enabled' : 'Disabled'}
          </button>
        </div>

        {/* Device Sessions List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-semibold text-text">Active Admin Devices</h4>
            <span className="text-xs text-gray-400 font-semibold">{settings.activeDevices?.length || 0} of 3 devices active</span>
          </div>

          <div className="divide-y divide-gray-100 border border-gray-150 rounded-xl overflow-hidden">
            {settings.activeDevices?.map((device) => (
              <div key={device._id} className="p-4 flex items-center justify-between bg-white hover:bg-gray-50/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text">{device.deviceInfo}</span>
                    {device.isCurrent && (
                      <span className="bg-burgundy/10 text-burgundy px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                        Current Device
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 text-[10px] text-gray-400">
                    <span>IP: {device.ip || 'Unknown'}</span>
                    <span>Last active: {formatDate(device.lastActive)}</span>
                  </div>
                </div>
                {!device.isCurrent && (
                  <button 
                    onClick={() => handleRevokeSession(device._id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Remove session"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
            {(!settings.activeDevices || settings.activeDevices.length === 0) && (
              <div className="p-6 text-center text-xs text-gray-400 bg-gray-50">No active device sessions found.</div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Emergency Approval Section */}
      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        <h3 className="text-base font-semibold text-text mb-2">Emergency Approval</h3>
        <p className="text-xs text-gray-400 mb-6">
          Critical operations must be approved by the designated Emergency Approver.
        </p>

        <div className="bg-[#f8f9fa] border border-[#e9ecef] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Emergency Approver</span>
            <div className="text-sm font-semibold text-text">{maskEmail(settings.emergencyApproverEmail)}</div>
          </div>
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold self-start md:self-auto uppercase tracking-wide">
            Status: Active
          </span>
        </div>

        {/* Change Approver Form */}
        <form onSubmit={handleUpdateApprover} className="space-y-4 pt-4 border-t border-gray-150">
          <h4 className="text-xs font-semibold text-text">Change Emergency Approver</h4>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">New Approver Email Address</label>
            <input 
              type="email" 
              value={approverEmail} 
              onChange={(e) => setApproverEmail(e.target.value)} 
              placeholder="e.g., approver@example.com"
              required
              className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-burgundy max-w-md"
            />
          </div>
          <button 
            type="submit" 
            className="bg-burgundy text-white hover:bg-burgundy-600 px-5 py-2.5 rounded-xl text-xs font-semibold transition"
          >
            Request Approver Change
          </button>
        </form>
      </div>

      {/* 6. Store Controls Section */}
      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        <h3 className="text-base font-semibold text-text mb-2">Store Controls</h3>
        <p className="text-xs text-gray-400 mb-6">
          Take control of customer checkout actions and order placement settings.
        </p>

        <form onSubmit={handleSaveStoreControls} className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <h4 className="text-xs font-semibold text-text">Maintenance Mode</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Toggle this ON to temporarily stop customer checkouts and new orders.</p>
            </div>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setMaintenanceMode(false)}
                className={`px-4 py-2 text-xs font-bold transition ${!maintenanceMode ? 'bg-[#6D0F1A] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                OFF
              </button>
              <button
                type="button"
                onClick={() => setMaintenanceMode(true)}
                className={`px-4 py-2 text-xs font-bold transition ${maintenanceMode ? 'bg-[#6D0F1A] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                ON
              </button>
            </div>
          </div>

          {maintenanceMode && (
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-500">Custom Maintenance Message</label>
              <textarea 
                rows="3" 
                value={maintenanceMessage} 
                onChange={(e) => setMaintenanceMessage(e.target.value)} 
                placeholder="Message displayed to customers when trying to checkout..."
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-burgundy resize-none"
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={savingControls}
            className="bg-burgundy text-white hover:bg-burgundy-600 disabled:opacity-50 px-5 py-2.5 rounded-xl text-xs font-semibold transition"
          >
            {savingControls ? 'Saving Controls...' : 'Save Store Controls'}
          </button>
        </form>
      </div>

      {/* OTP verification popup overlay */}
      {otpModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl border border-border p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-[#6D0F1A] mb-1">Emergency Approval Required</h3>
            <p className="text-xs text-gray-400 mb-6">
              A 6-digit verification code has been dispatched to the registered Emergency Approver email ({maskEmail(settings.emergencyApproverEmail)}).
            </p>

            <form onSubmit={handleVerifyEmergencyOTP} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Verification Code</label>
                <input 
                  type="text" 
                  value={otpValue} 
                  onChange={(e) => setOtpValue(e.target.value)} 
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  required
                  className="w-full text-sm text-center tracking-[0.2em] font-bold border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-burgundy"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setOtpModalOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={otpLoading}
                  className="flex-1 bg-burgundy hover:bg-burgundy-600 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  {otpLoading ? 'Verifying...' : 'Confirm'}
                </button>
              </div>
            </form>

            <div className="mt-4 text-center">
              <button 
                type="button" 
                onClick={handleResendOTP}
                disabled={cooldown > 0}
                className="text-xs font-semibold text-burgundy hover:underline disabled:opacity-50 disabled:no-underline"
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend Verification Code'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
