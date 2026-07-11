import { useState, useEffect } from 'react';
import { adminGetOrders, adminUpdateOrderStatus, adminUpdateDeliveryInfo, adminDeliverAndNotifyOrder } from '../../services/api';
import { formatPrice, formatDate, getStatusColor } from '../../utils/helpers';
import { ORDER_STATUSES } from '../../utils/constants';
import { HiOutlineChevronDown, HiOutlineChevronUp, HiOutlineTruck, HiOutlineLocationMarker } from 'react-icons/hi';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Delivery info form
  const [deliveryForm, setDeliveryForm] = useState({
    receivingSpot: '',
    deliveryBoyPhone: '',
    deliveryBoyName: '',
    deliveryNotes: '',
    trackingNumber: '',
  });
  const [savingDelivery, setSavingDelivery] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await adminGetOrders(params);
      setOrders(data.orders);
      setTotalPages(data.totalPages);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminUpdateOrderStatus(orderId, { orderStatus: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch { toast.error('Failed to update status'); }
  };

  const toggleExpand = (order) => {
    if (expandedOrder === order._id) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(order._id);
      setDeliveryForm({
        receivingSpot: order.deliveryInfo?.receivingSpot || '',
        deliveryBoyPhone: order.deliveryInfo?.deliveryBoyPhone || '',
        deliveryBoyName: order.deliveryInfo?.deliveryBoyName || '',
        deliveryNotes: order.deliveryInfo?.deliveryNotes || '',
        trackingNumber: order.deliveryInfo?.trackingNumber || '',
      });
    }
  };

  const handleSaveDeliveryInfo = async (orderId) => {
    setSavingDelivery(true);
    try {
      await adminUpdateDeliveryInfo(orderId, deliveryForm);
      toast.success('Delivery info updated');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update delivery info');
    } finally {
      setSavingDelivery(false);
    }
  };

  const handleDeliverAndNotify = async (orderId) => {
    const confirm = window.confirm("Are you sure you want to mark this order as Delivered and email the invoice PDF to the customer?");
    if (!confirm) return;

    setSavingDelivery(true);
    try {
      await adminDeliverAndNotifyOrder(orderId, deliveryForm);
      toast.success('Order marked as Delivered and email sent!');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete delivery notification');
    } finally {
      setSavingDelivery(false);
    }
  };

  return (
    <div>
      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => { setStatusFilter(''); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!statusFilter ? 'bg-burgundy text-white' : 'bg-white border border-border text-text'}`}>
          All
        </button>
        {ORDER_STATUSES.map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-burgundy text-white' : 'bg-white border border-border text-text'}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">Order ID</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">Customer</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">Items</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">Product</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">Shipping</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">Total</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">Payment</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">Date</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <>
                <tr key={order._id} className={`border-b border-border last:border-0 hover:bg-bg/50 cursor-pointer ${expandedOrder === order._id ? 'bg-bg/50' : ''}`} onClick={() => toggleExpand(order)}>
                  <td className="px-5 py-3 font-medium">#{order._id.slice(-6).toUpperCase()}</td>
                  <td className="px-5 py-3">
                    <p className="font-medium">{order.user?.name || '—'}</p>
                    <p className="text-xs text-gray-400">{order.user?.email}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{order.products?.length} items</td>
                  <td className="px-5 py-3 font-medium">{formatPrice(order.productTotal)}</td>
                  <td className="px-5 py-3">
                    {order.shippingCharge > 0 ? (
                      <span className="font-medium">{formatPrice(order.shippingCharge)}</span>
                    ) : (
                      <span className="text-xs text-amber-600">Not set</span>
                    )}
                  </td>
                  <td className="px-5 py-3 font-semibold text-burgundy">{formatPrice(order.totalPrice)}</td>
                  <td className="px-5 py-3 text-gray-500">{order.paymentMethod}</td>
                  <td className="px-5 py-3 text-gray-400">{formatDate(order.createdAt)}</td>
                  <td className="px-5 py-3">
                    <select
                      value={order.orderStatus}
                      onChange={(e) => { e.stopPropagation(); handleStatusChange(order._id, e.target.value); }}
                      onClick={(e) => e.stopPropagation()}
                      className={`px-2 py-1 rounded-lg text-xs font-medium border-0 appearance-none cursor-pointer ${getStatusColor(order.orderStatus)}`}
                    >
                      {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    {expandedOrder === order._id ? (
                      <HiOutlineChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <HiOutlineChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </td>
                </tr>

                {/* Expanded Detail Row */}
                {expandedOrder === order._id && (
                  <tr key={`${order._id}-detail`}>
                    <td colSpan="10" className="px-5 py-4 bg-gray-50/50">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Left: Order Details & Shipping Address */}
                        <div className="space-y-4">
                          {/* Items */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Order Items</h4>
                            <div className="space-y-1">
                              {order.products.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                  <span className="text-gray-600">{item.name} × {item.quantity}</span>
                                  <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Shipping Address */}
                          <div className="bg-white rounded-lg border border-border p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <HiOutlineLocationMarker className="w-4 h-4 text-burgundy" />
                              <h4 className="text-xs font-semibold text-gray-500 uppercase">Shipping Address</h4>
                            </div>
                            <div className="text-sm text-gray-600 space-y-0.5">
                              <p className="font-medium">{order.shippingAddress?.fullName}</p>
                              <p>{order.shippingAddress?.street}</p>
                              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}</p>
                              <p>📞 {order.shippingAddress?.phone}</p>
                              <p>✉️ {order.shippingAddress?.email}</p>
                              {order.shippingAddress?.businessName && <p>🏢 {order.shippingAddress.businessName}</p>}
                              {order.shippingAddress?.gstNumber && <p>GST: {order.shippingAddress.gstNumber}</p>}
                            </div>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="space-y-4">

                          {/* Delivery Info — When order is paid or later */}
                          {['Paid', 'Confirmed', 'Shipped'].includes(order.orderStatus) && (
                            <div className="bg-white rounded-lg border border-blue-200 p-4">
                              <h4 className="text-xs font-semibold text-blue-800 uppercase mb-3">Delivery Information</h4>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Tracking Number</label>
                                  <input
                                    value={deliveryForm.trackingNumber}
                                    onChange={(e) => setDeliveryForm({ ...deliveryForm, trackingNumber: e.target.value })}
                                    placeholder="e.g. AWB12345678"
                                    className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-burgundy"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Receiving Spot</label>
                                  <input
                                    value={deliveryForm.receivingSpot}
                                    onChange={(e) => setDeliveryForm({ ...deliveryForm, receivingSpot: e.target.value })}
                                    placeholder="e.g. Front gate, warehouse entrance"
                                    className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-burgundy"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs text-gray-500 mb-1">Delivery Boy Name</label>
                                    <input
                                      value={deliveryForm.deliveryBoyName}
                                      onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryBoyName: e.target.value })}
                                      placeholder="Name"
                                      className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-burgundy"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-500 mb-1">Delivery Boy Phone</label>
                                    <input
                                      value={deliveryForm.deliveryBoyPhone}
                                      onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryBoyPhone: e.target.value })}
                                      placeholder="Phone number"
                                      className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-burgundy"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Delivery Notes</label>
                                  <textarea
                                    value={deliveryForm.deliveryNotes}
                                    onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryNotes: e.target.value })}
                                    placeholder="Any special instructions..."
                                    rows={2}
                                    className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-burgundy resize-none"
                                  />
                                </div>
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => handleSaveDeliveryInfo(order._id)}
                                    disabled={savingDelivery}
                                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-text rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                  >
                                    Save Draft Info
                                  </button>
                                  <button
                                    onClick={() => handleDeliverAndNotify(order._id)}
                                    disabled={savingDelivery}
                                    className="flex-1 px-4 py-2 bg-burgundy hover:bg-burgundy/90 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                  >
                                    {savingDelivery ? 'Processing...' : 'Deliver & Send Bill'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Show existing delivery info for delivered/cancelled */}
                          {['Delivered', 'Cancelled'].includes(order.orderStatus) && order.deliveryInfo && (
                            <div className="bg-white rounded-lg border border-border p-4">
                              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Delivery Info</h4>
                              <div className="text-sm text-gray-600 space-y-1">
                                {order.deliveryInfo.trackingNumber && <p>📦 Tracking: {order.deliveryInfo.trackingNumber}</p>}
                                {order.deliveryInfo.receivingSpot && <p>📍 Spot: {order.deliveryInfo.receivingSpot}</p>}
                                {order.deliveryInfo.deliveryBoyName && <p>👤 {order.deliveryInfo.deliveryBoyName}</p>}
                                {order.deliveryInfo.deliveryBoyPhone && <p>📞 {order.deliveryInfo.deliveryBoyPhone}</p>}
                                {order.deliveryInfo.deliveryNotes && <p>📝 {order.deliveryInfo.deliveryNotes}</p>}
                              </div>
                            </div>
                          )}

                          {/* Waiting info messages */}
                          {order.orderStatus === 'Pending Payment' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-700">
                              ⏳ Waiting for customer to complete payment via Razorpay.
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        {loading && <p className="text-center py-8 text-gray-400 text-sm">Loading...</p>}
        {!loading && orders.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">No orders found</p>}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 rounded-lg text-xs font-medium ${p === page ? 'bg-burgundy text-white' : 'bg-white border border-border'}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
