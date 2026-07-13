import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineClipboardList, HiOutlineUser, HiOutlineLocationMarker, HiOutlineLogout, HiOutlineTrash, HiOutlineCheckCircle } from 'react-icons/hi';
import useAuth from '../hooks/useAuth';
import { getOrders, addAddress, deleteAddress } from '../services/api';
import { formatPrice, formatDate, getStatusColor } from '../utils/helpers';
import { INDIAN_STATES } from '../utils/constants';
import toast from 'react-hot-toast';

const tabs = [
  { id: 'orders', label: 'My Orders', icon: HiOutlineClipboardList },
  { id: 'profile', label: 'Profile', icon: HiOutlineUser },
  { id: 'addresses', label: 'Addresses', icon: HiOutlineLocationMarker },
];

// Simplified order steps
const ORDER_STEPS = ['Paid', 'Confirmed', 'Shipped', 'Delivered'];
const OrderStepper = ({ status }) => {
  if (status === 'Pending Payment') return null;

  const currentIdx = ORDER_STEPS.indexOf(status);

  return (
    <div className="flex items-center gap-1.5 mt-4 mb-2 overflow-x-auto pb-1">
      {ORDER_STEPS.map((step, idx) => {
        const isCompleted = idx <= currentIdx;
        const isCurrent = idx === currentIdx;
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  isCompleted
                    ? 'bg-burgundy border-burgundy text-white'
                    : 'border-gray-300 text-gray-300'
                } ${isCurrent ? 'ring-2 ring-burgundy/30' : ''}`}
              >
                {isCompleted ? '✓' : idx + 1}
              </div>
              <span className={`text-[11px] mt-1 whitespace-nowrap ${isCompleted ? 'text-burgundy font-medium' : 'text-gray-400'}`}>
                {step}
              </span>
            </div>
            {idx < ORDER_STEPS.length - 1 && (
              <div className={`w-8 h-0.5 mx-1 mt-[-12px] ${idx < currentIdx ? 'bg-burgundy' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'orders');

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [addressForm, setAddressForm] = useState({ street: '', city: '', state: '', pincode: '' });

  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab]);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await getOrders();
      setOrders(res.data);
    } catch { /* silent */ }
    finally { setLoadingOrders(false); }
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
  }, [activeTab, fetchOrders]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const { data } = await addAddress(addressForm);
      setUser({ ...user, addresses: data });
      setAddressForm({ street: '', city: '', state: '', pincode: '' });
      toast.success('Address added');
    } catch { toast.error('Failed to add address'); }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const { data } = await deleteAddress(id);
      setUser({ ...user, addresses: data });
      toast.success('Address removed');
    } catch { toast.error('Failed to remove address'); }
  };

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl sm:text-4xl font-bold text-text mb-10">
          My Account
        </motion.h1>

        {/* Tabs */}
        <div className="flex gap-1.5 bg-white rounded-xl border border-border p-1.5 mb-10 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-lg text-base font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-burgundy text-white' : 'text-text hover:bg-bg'}`}
              >
                <Icon className="w-5 h-5" /> {tab.label}
              </button>
            );
          })}
          <button onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-2.5 px-5 py-3 rounded-lg text-base font-medium text-burgundy hover:bg-burgundy/5 transition-colors ml-auto whitespace-nowrap"
          >
            <HiOutlineLogout className="w-5 h-5" /> Logout
          </button>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-5">
            {loadingOrders ? (
              <div className="text-center py-12 text-gray-400 text-base">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-base">No orders yet</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order._id} className="bg-white rounded-2xl border border-border p-6 sm:p-7">
                  <div className="flex flex-wrap justify-between gap-2 mb-3">
                    <div>
                      <p className="text-sm text-gray-400">Order #{order._id.slice(-8).toUpperCase()}</p>
                      <p className="text-sm text-gray-400">{formatDate(order.createdAt)}</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>

                  {/* Progress stepper */}
                  <OrderStepper status={order.orderStatus} />

                  <div className="space-y-2.5 mb-5 mt-4">
                    {order.products.map((item, i) => (
                      <div key={i} className="flex justify-between text-base">
                        <span className="text-gray-600">{item.name} × {item.quantity}</span>
                        <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Price breakdown */}
                  <div className="border-t border-border pt-4 space-y-2 text-base">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Product Total</span>
                      <span className="font-medium">{formatPrice(order.productTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Shipping</span>
                      <span className="font-medium">{formatPrice(order.shippingCharge)}</span>
                    </div>
                    {order.shippingLocation?.name && (
                      <p className="text-sm text-gray-400">📍 {order.shippingLocation.name}</p>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Payment</span>
                      <span className="text-gray-500">{order.paymentMethod}</span>
                    </div>
                    <div className="border-t border-border pt-3 flex justify-between">
                      <span className="font-semibold">Grand Total</span>
                      <span className="font-bold text-burgundy">{formatPrice(order.totalPrice)}</span>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  {order.deliveryInfo && (order.deliveryInfo.receivingSpot || order.deliveryInfo.deliveryBoyPhone || order.deliveryInfo.trackingNumber || order.deliveryInfo.deliveryNotes) && (
                    <div className="mt-5 bg-blue-50 border border-blue-200 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <HiOutlineCheckCircle className="w-5 h-5 text-blue-600" />
                        <span className="text-base font-semibold text-blue-800">Delivery Information</span>
                      </div>
                      <div className="space-y-1.5 text-base text-blue-700">
                        {order.deliveryInfo.trackingNumber && (
                          <p>📦 Tracking: <strong>{order.deliveryInfo.trackingNumber}</strong></p>
                        )}
                        {order.deliveryInfo.receivingSpot && (
                          <p>📍 Receiving Spot: {order.deliveryInfo.receivingSpot}</p>
                        )}
                        {order.deliveryInfo.deliveryBoyName && (
                          <p>👤 Delivery Person: {order.deliveryInfo.deliveryBoyName}</p>
                        )}
                        {order.deliveryInfo.deliveryBoyPhone && (
                          <p>📞 Phone: <a href={`tel:${order.deliveryInfo.deliveryBoyPhone}`} className="underline">{order.deliveryInfo.deliveryBoyPhone}</a></p>
                        )}
                        {order.deliveryInfo.deliveryNotes && (
                          <p>📝 Notes: {order.deliveryInfo.deliveryNotes}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Profile Tab — Read Only */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-border p-7 max-w-xl">
            <h3 className="text-lg font-semibold text-text mb-2">My Profile</h3>
            <p className="text-sm text-gray-400 mb-6">Profile details can only be edited by the admin. Contact support for changes.</p>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Name</label>
                <input value={user?.name || ''} disabled className="w-full px-5 py-3.5 bg-gray-100 border border-border rounded-xl text-base text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Phone</label>
                <input value={user?.phone || ''} disabled className="w-full px-5 py-3.5 bg-gray-100 border border-border rounded-xl text-base text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Email</label>
                <input value={user?.email || ''} disabled className="w-full px-5 py-3.5 bg-gray-100 border border-border rounded-xl text-base text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Business Name</label>
                <input value={user?.businessName || '—'} disabled className="w-full px-5 py-3.5 bg-gray-100 border border-border rounded-xl text-base text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">GST Number</label>
                <input value={user?.gstNumber || '—'} disabled className="w-full px-5 py-3.5 bg-gray-100 border border-border rounded-xl text-base text-gray-500 cursor-not-allowed" />
              </div>
            </div>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="space-y-6 max-w-xl">
            {user?.addresses?.length > 0 && (
              <div className="space-y-3">
                {user.addresses.map((addr) => (
                  <div key={addr._id} className="bg-white rounded-xl border border-border p-5 flex justify-between items-center">
                    <div className="text-base text-gray-600">
                      {addr.street}, {addr.city}, {addr.state} — {addr.pincode}
                    </div>
                    <button onClick={() => handleDeleteAddress(addr._id)} className="text-gray-400 hover:text-red-500 p-1">
                      <HiOutlineTrash className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={handleAddAddress} className="bg-white rounded-2xl border border-border p-7">
              <h3 className="text-lg font-semibold text-text mb-5">Add Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <input value={addressForm.street} onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} placeholder="Street Address" required className="w-full px-5 py-3.5 bg-bg border border-border rounded-xl text-base focus:outline-none focus:border-burgundy" />
                </div>
                <input value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} placeholder="City" required className="w-full px-5 py-3.5 bg-bg border border-border rounded-xl text-base focus:outline-none focus:border-burgundy" />
                <select value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} required className="w-full px-5 py-3.5 bg-bg border border-border rounded-xl text-base focus:outline-none focus:border-burgundy appearance-none">
                  <option value="">State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input value={addressForm.pincode} onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })} placeholder="Pincode" required pattern="[0-9]{6}" className="w-full px-5 py-3.5 bg-bg border border-border rounded-xl text-base focus:outline-none focus:border-burgundy" />
              </div>
              <button type="submit" className="mt-5 bg-burgundy text-white px-7 py-3 rounded-xl text-base font-medium hover:bg-burgundy-600 transition-colors">
                Add Address
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
