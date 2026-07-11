import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX, HiOutlineStar, HiStar } from 'react-icons/hi';
import { getCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory, adminToggleFeaturedCategory } from '../../services/api';
import toast from 'react-hot-toast';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleToggleFeatured = async (id) => {
    try {
      await adminToggleFeaturedCategory(id);
      toast.success('Category featured status updated');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle featured status');
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await getCategories();
      setCategories(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => {
    setEditId(null);
    setForm({ name: '', description: '' });
    setFile(null);
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditId(cat._id);
    setForm({ name: cat.name, description: cat.description || '' });
    setFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      if (file) formData.append('images', file);

      if (editId) {
        await adminUpdateCategory(editId, formData);
        toast.success('Category updated');
      } else {
        await adminCreateCategory(formData);
        toast.success('Category created');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await adminDeleteCategory(id);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-500">{categories.length} categories</p>
        <button onClick={openCreate} className="flex items-center gap-2 bg-burgundy text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-burgundy-600 transition-colors">
          <HiOutlinePlus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat._id} className="bg-white rounded-xl border border-border overflow-hidden relative">
            <button
              onClick={(e) => { e.stopPropagation(); handleToggleFeatured(cat._id); }}
              className="absolute top-2 left-2 z-10 bg-white/90 p-1.5 rounded-full shadow hover:bg-white hover:scale-105 transition-all duration-200"
              title={cat.isFeatured ? "Featured" : "Not Featured"}
            >
              {cat.isFeatured ? (
                <HiStar className="w-5 h-5 text-gold" />
              ) : (
                <HiOutlineStar className="w-5 h-5 text-gray-400" />
              )}
            </button>
            {cat.image?.url && (
              <div className="aspect-video bg-bg overflow-hidden">
                <img src={cat.image.url} alt={cat.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-4 flex justify-between items-start">
              <div>
                <h3 className="text-sm font-semibold text-text">{cat.name}</h3>
                {cat.description && <p className="text-xs text-gray-400 mt-1">{cat.description}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(cat)} className="p-1.5 text-gray-400 hover:text-burgundy"><HiOutlinePencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(cat._id)} className="p-1.5 text-gray-400 hover:text-red-500"><HiOutlineTrash className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && <p className="text-center py-8 text-gray-400 text-sm">Loading...</p>}
      {!loading && categories.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">No categories. Create one to get started.</p>}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b border-border">
              <h3 className="text-base font-semibold">{editId ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setShowModal(false)}><HiOutlineX className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Image</label>
                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])}
                  className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-burgundy/5 file:text-burgundy file:font-medium file:text-xs file:cursor-pointer" />
              </div>
              <button type="submit" disabled={saving} className="w-full bg-burgundy text-white py-2.5 rounded-xl text-sm font-medium hover:bg-burgundy-600 transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : editId ? 'Update' : 'Create'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
