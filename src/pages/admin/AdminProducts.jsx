import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';
import { adminGetProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct, getCategories } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import useDebounce from '../../hooks/useDebounce';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ name: '', description: '', category: '', price: '', moq: '1', stock: '0', status: 'active' });
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const debouncedSearch = useDebounce(search);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await adminGetProducts({ page, limit: 20, search: debouncedSearch });
      setProducts(data.products);
      setTotalPages(data.totalPages);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [page, debouncedSearch]);
  useEffect(() => { getCategories().then(res => setCategories(res.data)).catch(() => {}); }, []);

  const openCreate = () => {
    setEditId(null);
    setForm({ name: '', description: '', category: '', price: '', moq: '1', stock: '0', status: 'active' });
    setFiles([]);
    setExistingImages([]);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditId(product._id);
    setForm({
      name: product.name,
      description: product.description,
      category: product.category?._id || product.category,
      price: product.price,
      moq: product.moq,
      stock: product.stock,
      status: product.status,
    });
    setExistingImages(product.images || []);
    setFiles([]);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      files.forEach(f => formData.append('images', f));
      if (editId) {
        formData.append('existingImages', JSON.stringify(existingImages));
        await adminUpdateProduct(editId, formData);
        toast.success('Product updated');
      } else {
        await adminCreateProduct(formData);
        toast.success('Product created');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await adminDeleteProduct(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search products..."
          className="px-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy flex-1 max-w-sm"
        />
        <button onClick={openCreate} className="flex items-center gap-2 bg-burgundy text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-burgundy-600 transition-colors">
          <HiOutlinePlus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">Product</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">Category</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">Price</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">MOQ</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">Stock</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-b border-border last:border-0 hover:bg-bg/50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.images?.[0]?.url || '/logo.png'} alt="" className="w-10 h-10 rounded-lg object-cover bg-bg" />
                    <span className="font-medium line-clamp-1">{p.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-500">{p.category?.name || '—'}</td>
                <td className="px-5 py-3 font-medium">{formatPrice(p.price)}</td>
                <td className="px-5 py-3 text-gray-500">{p.moq}</td>
                <td className="px-5 py-3 text-gray-500">{p.stock}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-burgundy"><HiOutlinePencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(p._id)} className="p-1.5 text-gray-400 hover:text-red-500 ml-1"><HiOutlineTrash className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="text-center py-8 text-gray-400 text-sm">Loading...</p>}
        {!loading && products.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">No products found</p>}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 rounded-lg text-xs font-medium ${p === page ? 'bg-burgundy text-white' : 'bg-white border border-border'}`}>{p}</button>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b border-border">
              <h3 className="text-base font-semibold">{editId ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setShowModal(false)}><HiOutlineX className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Description *</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3} className="w-full px-3 py-2 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Category *</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required className="w-full px-3 py-2 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy appearance-none">
                    <option value="">Select</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Price (₹) *</label>
                  <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required min="0" className="w-full px-3 py-2 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">MOQ *</label>
                  <input type="number" value={form.moq} onChange={(e) => setForm({ ...form, moq: e.target.value })} required min="1" className="w-full px-3 py-2 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Stock</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} min="0" className="w-full px-3 py-2 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy appearance-none">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Existing images */}
              {existingImages.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Current Images</label>
                  <div className="flex gap-2 flex-wrap">
                    {existingImages.map((img, i) => (
                      <div key={i} className="relative w-16 h-16">
                        <img src={img.url} alt="" className="w-full h-full object-cover rounded-lg" />
                        <button type="button" onClick={() => setExistingImages(existingImages.filter((_, j) => j !== i))}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Upload Images</label>
                <input type="file" multiple accept="image/*" onChange={(e) => setFiles([...e.target.files])}
                  className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-burgundy/5 file:text-burgundy file:font-medium file:text-xs file:cursor-pointer" />
              </div>

              {/* Selected files preview */}
              {files.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 font-semibold text-burgundy">New Images Preview</label>
                  <div className="flex gap-2 flex-wrap">
                    {files.map((file, i) => {
                      const url = URL.createObjectURL(file);
                      return (
                        <div key={i} className="relative w-16 h-16">
                          <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
                          <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">×</button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <button type="submit" disabled={saving} className="w-full bg-burgundy text-white py-2.5 rounded-xl text-sm font-medium hover:bg-burgundy-600 transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : editId ? 'Update Product' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
