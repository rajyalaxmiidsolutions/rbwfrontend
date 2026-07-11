import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX, HiOutlineStar, HiStar } from 'react-icons/hi';
import { adminGetTestimonials, adminCreateTestimonial, adminUpdateTestimonial, adminDeleteTestimonial } from '../../services/api';
import toast from 'react-hot-toast';

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', business: '', text: '', rating: 5, isActive: true });
  const [saving, setSaving] = useState(false);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const { data } = await adminGetTestimonials();
      setTestimonials(data);
    } catch (err) {
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const openCreate = () => {
    setEditId(null);
    setForm({ name: '', business: '', text: '', rating: 5, isActive: true });
    setShowModal(true);
  };

  const openEdit = (test) => {
    setEditId(test._id);
    setForm({
      name: test.name,
      business: test.business || '',
      text: test.text,
      rating: test.rating || 5,
      isActive: test.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.text.trim()) {
      toast.error('Name and text are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        business: form.business.trim(),
        text: form.text.trim(),
        rating: Number(form.rating),
        isActive: form.isActive,
      };

      if (editId) {
        await adminUpdateTestimonial(editId, payload);
        toast.success('Testimonial updated successfully');
      } else {
        await adminCreateTestimonial(payload);
        toast.success('Testimonial added successfully');
      }
      setShowModal(false);
      fetchTestimonials();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await adminDeleteTestimonial(id);
      toast.success('Testimonial deleted successfully');
      fetchTestimonials();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-text">Client Testimonials</h2>
          <p className="text-sm text-gray-500">{testimonials.length} testimonial(s) listed</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-burgundy text-white px-5 py-3 rounded-xl text-base font-semibold hover:bg-burgundy-600 transition-colors"
        >
          <HiOutlinePlus className="w-5 h-5" /> Add Testimonial
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((test) => (
          <div key={test._id} className="bg-white rounded-2xl border border-border p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    i < test.rating ? (
                      <HiStar key={i} className="w-5 h-5 text-gold" />
                    ) : (
                      <HiOutlineStar key={i} className="w-5 h-5 text-gray-300" />
                    )
                  ))}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${test.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {test.isActive ? 'Active' : 'Hidden'}
                </span>
              </div>
              <p className="text-base text-gray-600 italic mb-6">"{test.text}"</p>
            </div>
            <div className="flex justify-between items-end pt-4 border-t border-border">
              <div>
                <p className="text-base font-bold text-text">{test.name}</p>
                {test.business && <p className="text-sm text-gray-400">{test.business}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(test)}
                  className="p-2 text-gray-400 hover:text-burgundy hover:bg-burgundy/5 rounded-lg transition-all"
                  title="Edit Testimonial"
                >
                  <HiOutlinePencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(test._id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Delete Testimonial"
                >
                  <HiOutlineTrash className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && <p className="text-center py-12 text-gray-400 text-base">Loading testimonials...</p>}
      {!loading && testimonials.length === 0 && (
        <p className="text-center py-12 text-gray-400 text-base">No testimonials added yet. Click "Add Testimonial" to start.</p>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-5 border-b border-border bg-gray-50/50">
              <h3 className="text-lg font-bold text-text">{editId ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-text rounded-lg hover:bg-bg transition-colors">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Client Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  required
                  className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-base focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-burgundy transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Business/Location</label>
                <input
                  type="text"
                  value={form.business}
                  onChange={(e) => setForm({ ...form, business: e.target.value })}
                  placeholder="e.g. Kumar Cards, Hyderabad"
                  className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-base focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-burgundy transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Rating *</label>
                <select
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-base focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-burgundy transition-all"
                >
                  <option value={5}>5 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={2}>2 Stars</option>
                  <option value={1}>1 Star</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Testimonial Text *</label>
                <textarea
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  placeholder="What did the client say about us?"
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-base focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-burgundy transition-all resize-none"
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
                  Active (Show on homepage)
                </label>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-burgundy text-white py-3.5 rounded-xl text-base font-bold hover:bg-burgundy-600 transition-colors disabled:opacity-50 mt-2 shadow-lg"
              >
                {saving ? 'Saving...' : editId ? 'Update Testimonial' : 'Add Testimonial'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTestimonials;
