import { useState } from 'react';
import { seedAdmin } from '../../services/api';
import toast from 'react-hot-toast';
import { BUSINESS } from '../../utils/constants';

const AdminSettings = () => {
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const { data } = await seedAdmin();
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to seed admin');
    } finally { setSeeding(false); }
  };

  return (
    <div className="max-w-xl space-y-6">
      {/* Business Info */}
      <div className="bg-white rounded-xl border border-border p-6">
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
      <div className="bg-white rounded-xl border border-border p-6">
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
