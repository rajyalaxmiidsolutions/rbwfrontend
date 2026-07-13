import { useState, useEffect } from 'react';
import { 
  adminGetCustomers, 
  adminGetCustomerOrders, 
  adminCreateCustomer, 
  adminUpdateCustomer, 
  adminDeleteCustomer 
} from '../../services/api';
import { formatPrice, formatDate, getStatusColor } from '../../utils/helpers';
import useDebounce from '../../hooks/useDebounce';
import toast from 'react-hot-toast';
import { HiEye, HiEyeOff } from 'react-icons/hi';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Forms state
  const [addForm, setAddForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    businessName: '',
    businessLocation: '',
    gstNumber: ''
  });
  const [editForm, setEditForm] = useState({
    _id: '',
    name: '',
    phone: '',
    email: '',
    password: '',
    businessName: '',
    businessLocation: '',
    gstNumber: ''
  });

  const debouncedSearch = useDebounce(search);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data } = await adminGetCustomers({ page, limit: 20, search: debouncedSearch });
      setCustomers(data.customers);
      setTotalPages(data.totalPages);
      
      // Keep selected customer in sync if they are in the list
      if (selectedCustomer) {
        const updated = data.customers.find(c => c._id === selectedCustomer._id);
        if (updated) {
          setSelectedCustomer(updated);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, debouncedSearch]);

  const viewOrders = async (customer) => {
    setSelectedCustomer(customer);
    setLoadingOrders(true);
    try {
      const { data } = await adminGetCustomerOrders(customer._id);
      setCustomerOrders(data);
    } catch { 
      setCustomerOrders([]); 
    } finally { 
      setLoadingOrders(false); 
    }
  };

  // Add Customer
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminCreateCustomer(addForm);
      toast.success('Customer created successfully');
      setShowAddModal(false);
      setAddForm({ name: '', phone: '', email: '', password: '', businessName: '', businessLocation: '', gstNumber: '' });
      setShowAddPassword(false);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create customer');
    }
  };

  // Edit Customer
  const handleEditClick = (customer, e) => {
    e.stopPropagation(); // Prevent trigger viewOrders
    setEditForm({
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      password: '', // blank by default
      businessName: customer.businessName || '',
      businessLocation: customer.businessLocation || '',
      gstNumber: customer.gstNumber || ''
    });
    setShowEditPassword(false);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = { ...editForm };
      if (!updateData.password) {
        delete updateData.password; // Don't update password if left blank
      }
      await adminUpdateCustomer(editForm._id, updateData);
      toast.success('Customer updated successfully');
      setShowEditModal(false);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update customer');
    }
  };

  // Delete Customer
  const handleDeleteClick = (customer, e) => {
    e.stopPropagation(); // Prevent trigger viewOrders
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await adminDeleteCustomer(customerToDelete._id);
      toast.success('Customer deleted successfully');
      setShowDeleteModal(false);
      if (selectedCustomer?._id === customerToDelete._id) {
        setSelectedCustomer(null);
      }
      setCustomerToDelete(null);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete customer');
    }
  };

  return (
    <div>
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name, email, or business..."
          className="px-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy w-full max-w-sm"
        />
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-burgundy text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-burgundy-600 transition-colors"
        >
          + Add Customer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer List */}
        <div className="bg-white rounded-xl border border-border overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-border bg-gray-50 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-text">Customers</h3>
            <span className="text-xs text-gray-500">{customers.length} listed</span>
          </div>
          <div className="divide-y divide-border overflow-y-auto flex-1">
            {customers.map((c) => (
              <div
                key={c._id}
                onClick={() => viewOrders(c)}
                className={`w-full text-left p-4 hover:bg-bg/50 transition-colors flex justify-between items-center cursor-pointer ${selectedCustomer?._id === c._id ? 'bg-burgundy/5 border-l-4 border-burgundy' : ''}`}
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-text truncate">{c.name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${c.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {c.verified ? 'Verified' : 'Pending OTP'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{c.email}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-400">
                    {c.businessName && <span className="truncate">🏢 {c.businessName}</span>}
                    {c.businessLocation && <span className="truncate">📍 {c.businessLocation}</span>}
                    {c.phone && <span>📞 {c.phone}</span>}
                  </div>
                </div>
                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={(e) => handleEditClick(c, e)}
                    className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors"
                    title="Edit Customer"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(c, e)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                    title="Delete Customer"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
          {loading && <p className="text-center py-6 text-gray-400 text-sm">Loading...</p>}
          {!loading && customers.length === 0 && <p className="text-center py-6 text-gray-400 text-sm">No customers found</p>}
        </div>

        {/* Customer Detail & Orders */}
        <div className="bg-white rounded-xl border border-border overflow-hidden h-[600px] flex flex-col">
          {selectedCustomer ? (
            <>
              <div className="p-4 border-b border-border bg-gray-50">
                <h3 className="text-sm font-semibold text-text">{selectedCustomer.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{selectedCustomer.email} • {selectedCustomer.phone}</p>
                {selectedCustomer.businessName && <p className="text-xs text-gray-400 mt-1">Business: {selectedCustomer.businessName}</p>}
                {selectedCustomer.businessLocation && <p className="text-xs text-gray-400">Location: {selectedCustomer.businessLocation}</p>}
                {selectedCustomer.gstNumber && <p className="text-xs text-gray-400">GST: {selectedCustomer.gstNumber}</p>}
              </div>
              <div className="p-4 flex-1 overflow-y-auto">
                <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Order History</h4>
                {loadingOrders ? (
                  <p className="text-center py-4 text-gray-400 text-sm">Loading...</p>
                ) : customerOrders.length === 0 ? (
                  <p className="text-center py-4 text-gray-400 text-sm">No orders found for this customer</p>
                ) : (
                  <div className="space-y-3">
                    {customerOrders.map((order) => (
                      <div key={order._id} className="bg-bg rounded-lg p-3 border border-border/50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-xs font-medium">#{order._id.slice(-6).toUpperCase()}</p>
                            <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(order.orderStatus)}`}>{order.orderStatus}</span>
                        </div>
                        <p className="text-xs text-gray-500">{order.products?.length} items</p>
                        <p className="text-sm font-semibold text-burgundy mt-1">{formatPrice(order.totalPrice)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Select a customer to view details
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 rounded-lg text-xs font-medium ${p === page ? 'bg-burgundy text-white' : 'bg-white border border-border'}`}>{p}</button>
          ))}
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border max-w-md w-full overflow-hidden shadow-xl">
            <div className="p-4 border-b border-border bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold text-text text-sm">Add New Customer</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Full Name *</label>
                <input required value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Email Address *</label>
                <input required type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Phone Number *</label>
                <input required value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Login Password *</label>
                <div className="relative">
                  <input required type={showAddPassword ? 'text' : 'password'} value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy pr-10" minLength={6} />
                  <button type="button" onClick={() => setShowAddPassword(!showAddPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-burgundy focus:outline-none">
                    {showAddPassword ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Business Name</label>
                <input value={addForm.businessName} onChange={(e) => setAddForm({ ...addForm, businessName: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Business Location</label>
                <input value={addForm.businessLocation} onChange={(e) => setAddForm({ ...addForm, businessLocation: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy" placeholder="City / Town" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">GST Number</label>
                <input value={addForm.gstNumber} onChange={(e) => setAddForm({ ...addForm, gstNumber: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border mt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-xs font-semibold border border-border rounded-xl text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-semibold bg-burgundy text-white rounded-xl hover:bg-burgundy-600">Create Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border max-w-md w-full overflow-hidden shadow-xl">
            <div className="p-4 border-b border-border bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold text-text text-sm">Edit Customer Details</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Full Name</label>
                <input required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Email Address</label>
                <input required type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Phone Number</label>
                <input required value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Change Password (leave blank to keep current)</label>
                <div className="relative">
                  <input type={showEditPassword ? 'text' : 'password'} placeholder="••••••" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy pr-10" minLength={6} />
                  <button type="button" onClick={() => setShowEditPassword(!showEditPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-burgundy focus:outline-none">
                    {showEditPassword ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Business Name</label>
                <input value={editForm.businessName} onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Business Location</label>
                <input value={editForm.businessLocation} onChange={(e) => setEditForm({ ...editForm, businessLocation: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">GST Number</label>
                <input value={editForm.gstNumber} onChange={(e) => setEditForm({ ...editForm, gstNumber: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border mt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-xs font-semibold border border-border rounded-xl text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-semibold bg-burgundy text-white rounded-xl hover:bg-burgundy-600">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Customer Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border max-w-sm w-full overflow-hidden shadow-xl p-6">
            <h3 className="font-semibold text-text text-base mb-2">Delete Customer</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete customer <strong>{customerToDelete?.name}</strong>? This action is permanent and cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-xs font-semibold border border-border rounded-xl text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleDeleteConfirm} className="px-4 py-2 text-xs font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
