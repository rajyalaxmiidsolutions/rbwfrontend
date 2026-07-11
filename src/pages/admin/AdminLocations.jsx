import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';
import { adminGetLocations, adminCreateLocation, adminUpdateLocation, adminDeleteLocation } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';

const AdminLocations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', shippingCharge: '', isActive: true });
  const [saving, setSaving] = useState(false);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const { data } = await adminGetLocations();
      setLocations(data);
    } catch (err) {
      toast.error('Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const openCreate = () => {
    setEditId(null);
    setForm({ name: '', shippingCharge: '', isActive: true });
    setShowModal(true);
  };

  const openEdit = (loc) => {
    setEditId(loc._id);
    setForm({ name: loc.name, shippingCharge: String(loc.shippingCharge), isActive: loc.isActive });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || form.shippingCharge === '') {
      toast.error('Name and shipping charge are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        shippingCharge: Number(form.shippingCharge),
        isActive: form.isActive,
      };

      if (editId) {
        await adminUpdateLocation(editId, payload);
        toast.success('Location updated successfully');
      } else {
        await adminCreateLocation(payload);
        toast.success('Location created successfully');
      }
      setShowModal(false);
      fetchLocations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this shipping location?')) return;
    try {
      await adminDeleteLocation(id);
      toast.success('Location deleted successfully');
      fetchLocations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-text">Shipping Locations</h2>
          <p className="text-sm text-gray-500">{locations.length} location(s) configured</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-burgundy text-white px-5 py-3 rounded-xl text-base font-semibold hover:bg-burgundy-600 transition-colors"
        >
          <HiOutlinePlus className="w-5 h-5" /> Add Location
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="border-b border-border bg-gray-50/50">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Location Name</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Shipping Charge</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {locations.map((loc) => (
                <tr key={loc._id} className="hover:bg-bg/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-text">{loc.name}</td>
                  <td className="px-6 py-4 font-bold text-burgundy">{formatPrice(loc.shippingCharge)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${loc.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {loc.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => openEdit(loc)}
                        className="p-2 text-gray-400 hover:text-burgundy hover:bg-burgundy/5 rounded-lg transition-all"
                        title="Edit Location"
                      >
                        <HiOutlinePencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(loc._id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Location"
                      >
                        <HiOutlineTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && <p className="text-center py-12 text-gray-400 text-base">Loading locations...</p>}
        {!loading && locations.length === 0 && (
          <p className="text-center py-12 text-gray-400 text-base">No locations added yet. Click "Add Location" to start.</p>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-5 border-b border-border bg-gray-50/50">
              <h3 className="text-lg font-bold text-text">{editId ? 'Edit Location' : 'Add New Location'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-text rounded-lg hover:bg-bg transition-colors">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Location Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Hyderabad, Vijayawada"
                  required
                  className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-base focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-burgundy transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Shipping Charge (₹) *</label>
                <input
                  type="number"
                  min="0"
                  value={form.shippingCharge}
                  onChange={(e) => setForm({ ...form, shippingCharge: e.target.value })}
                  placeholder="e.g. 150"
                  required
                  className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-base focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-burgundy transition-all"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-5 h-5 accent-burgundy cursor-pointer"
                />
                <label htmlFor="isActive" className="text-base font-semibold text-gray-600 cursor-pointer">
                  Active (Costumers can select this location)
                </label>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-burgundy text-white py-3.5 rounded-xl text-base font-bold hover:bg-burgundy-600 transition-colors disabled:opacity-50 mt-2 shadow-lg"
              >
                {saving ? 'Saving...' : editId ? 'Update Location' : 'Add Location'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLocations;
