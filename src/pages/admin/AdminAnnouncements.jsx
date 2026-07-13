import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';
import { adminGetAnnouncements, adminCreateAnnouncement, adminUpdateAnnouncement, adminDeleteAnnouncement } from '../../services/api';
import toast from 'react-hot-toast';

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ text: '', textColor: '#ffffff', bgColor: '#800020', isActive: true });
  const [saving, setSaving] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data } = await adminGetAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const openCreate = () => {
    setEditId(null);
    setForm({ text: '', textColor: '#ffffff', bgColor: '#800020', isActive: true });
    setShowModal(true);
  };

  const openEdit = (ann) => {
    setEditId(ann._id);
    setForm({ text: ann.text, textColor: ann.textColor, bgColor: ann.bgColor, isActive: ann.isActive });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.text.trim()) {
      toast.error('Announcement text is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        text: form.text.trim(),
        textColor: form.textColor,
        bgColor: form.bgColor,
        isActive: form.isActive,
      };

      if (editId) {
        await adminUpdateAnnouncement(editId, payload);
        toast.success('Announcement updated successfully');
      } else {
        await adminCreateAnnouncement(payload);
        toast.success('Announcement created successfully');
      }
      setShowModal(false);
      fetchAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await adminDeleteAnnouncement(id);
      toast.success('Announcement deleted successfully');
      fetchAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-text">Announcements</h2>
          <p className="text-sm text-gray-500">{announcements.length} announcement(s) configured</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-burgundy text-white px-5 py-3 rounded-xl text-base font-semibold hover:bg-burgundy-600 transition-colors"
        >
          <HiOutlinePlus className="w-5 h-5" /> Add Announcement
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading announcements...</div>
          ) : announcements.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No announcements found. Add one to get started!</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg border-b border-border text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Preview</th>
                  <th className="px-6 py-4">Colors</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-base text-text">
                {announcements.map((ann) => (
                  <tr key={ann._id} className="hover:bg-bg/40 transition-colors">
                    <td className="px-6 py-4">
                      <div
                        style={{ backgroundColor: ann.bgColor, color: ann.textColor }}
                        className="px-4 py-2 rounded-lg text-sm font-medium max-w-lg truncate shadow-sm text-center"
                      >
                        {ann.text}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex gap-4">
                        <span className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded border border-border" style={{ backgroundColor: ann.bgColor }} />
                          Bg: {ann.bgColor.toUpperCase()}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded border border-border" style={{ backgroundColor: ann.textColor }} />
                          Text: {ann.textColor.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${ann.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {ann.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => openEdit(ann)} className="p-2 text-gray-400 hover:text-burgundy transition-colors">
                          <HiOutlinePencil className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(ann._id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                          <HiOutlineTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative shadow-2xl border border-border">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 hover:bg-bg rounded-full transition-colors">
              <HiOutlineX className="w-6 h-6 text-gray-400" />
            </button>
            <h3 className="text-lg font-bold text-text mb-4">{editId ? 'Edit Announcement' : 'Add Announcement'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Announcement Text *</label>
                <textarea
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  placeholder="Enter advertisement or notice text..."
                  required
                  rows="3"
                  className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-base focus:outline-none focus:border-burgundy resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Background Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={form.bgColor}
                      onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                      className="w-12 h-10 border border-border rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={form.bgColor}
                      onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                      className="flex-1 px-3 bg-bg border border-border rounded-lg text-sm text-center"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Text Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={form.textColor}
                      onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                      className="w-12 h-10 border border-border rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={form.textColor}
                      onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                      className="flex-1 px-3 bg-bg border border-border rounded-lg text-sm text-center"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="accent-burgundy w-5 h-5"
                  />
                  <span className="text-base font-medium text-text">Activate Announcement</span>
                </label>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-burgundy hover:bg-burgundy-600 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50 mt-2"
              >
                {saving ? 'Saving...' : editId ? 'Update Announcement' : 'Create Announcement'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncements;
