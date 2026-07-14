import { useState, useEffect, useRef } from 'react';
import { 
  adminGetOrders, 
  adminUpdateOrderStatus, 
  adminUpdateDeliveryInfo, 
  adminDeliverAndNotifyOrder 
} from '../../services/api';
import { formatPrice, getStatusColor } from '../../utils/helpers';
import { ORDER_STATUSES } from '../../utils/constants';
import { 
  HiOutlineChevronDown, 
  HiOutlineChevronUp, 
  HiOutlineLocationMarker,
  HiOutlineRefresh,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineSearch,
  HiOutlineX
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const dateOptions = [
  { id: 'Today', label: 'Today' },
  { id: 'Yesterday', label: 'Yesterday' },
  { id: 'Last 7 Days', label: 'Last 7 Days' },
  { id: 'Last 30 Days', label: 'Last 30 Days' },
  { id: 'Custom', label: 'Custom Date Range' }
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedOrder, setExpandedOrder] = useState(null);
  
  // Search state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Date filter state
  const [dateFilter, setDateFilter] = useState('Today');
  const [showDropdown, setShowDropdown] = useState(false);
  const [customRange, setCustomRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const [statusCounts, setStatusCounts] = useState(null);

  // Delivery info form
  const [deliveryForm, setDeliveryForm] = useState({
    receivingSpot: '',
    deliveryBoyPhone: '',
    deliveryBoyName: '',
    deliveryNotes: '',
    trackingNumber: '',
  });
  const [savingDelivery, setSavingDelivery] = useState(false);
  const [isEditingDelivered, setIsEditingDelivered] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const getBoundaries = (filter, custom) => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (filter === 'Today') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (filter === 'Yesterday') {
      start.setDate(now.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(now.getDate() - 1);
      end.setHours(23, 59, 59, 999);
    } else if (filter === 'Last 7 Days') {
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (filter === 'Last 30 Days') {
      start.setDate(now.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (filter === 'Custom' && custom) {
      start = new Date(custom.startDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(custom.endDate);
      end.setHours(23, 59, 59, 999);
    }
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (statusFilter && statusFilter !== 'All') {
        params.status = statusFilter;
      }
      if (debouncedSearch && debouncedSearch.trim() !== '') {
        params.search = debouncedSearch;
      } else {
        const { startDate, endDate } = getBoundaries(dateFilter, customRange);
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const { data } = await adminGetOrders(params);
      setOrders(data.orders);
      setTotalPages(data.totalPages);
      setTotalOrdersCount(data.total);
      setStatusCounts(data.statusCounts);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch orders when dependencies change
  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, debouncedSearch, dateFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminUpdateOrderStatus(orderId, { orderStatus: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch { 
      toast.error('Failed to update status'); 
    }
  };

  const toggleExpand = (order) => {
    setIsEditingDelivered(false);
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

  const handleSaveDeliveryInfo = async (order, orderId) => {
    const isDelivered = order.orderStatus === 'Delivered';
    const msg = isDelivered
      ? "Are you sure you want to update the delivery info? This will count as one of your 2 permitted edits after delivery."
      : "Are you sure you want to save the delivery info?";
    
    if (!window.confirm(msg)) return;

    setSavingDelivery(true);
    try {
      await adminUpdateDeliveryInfo(orderId, deliveryForm);
      toast.success('Delivery info updated');
      setIsEditingDelivered(false);
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

  const handleCustomRangeSubmit = (e) => {
    e.preventDefault();
    if (new Date(customRange.startDate) > new Date(customRange.endDate)) {
      toast.error('Start date cannot be after end date');
      return;
    }
    setPage(1);
    fetchOrders();
  };

  const formatFullDateTime = (dateStr) => {
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    return {
      date: `${day} ${month} ${year}`,
      time: `${hours}:${minutes} ${ampm}`
    };
  };

  const renderStatusTab = (s, count) => {
    const isActive = statusFilter === s;
    return (
      <button 
        key={s} 
        onClick={() => { setStatusFilter(s); setPage(1); }}
        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${isActive ? 'bg-burgundy text-white border-burgundy' : 'bg-white border-border text-text hover:bg-bg'}`}
      >
        {s} <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-bg text-gray-500'}`}>{count || 0}</span>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Page controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text">Orders</h2>
          <p className="text-sm text-gray-500">{totalOrdersCount} order(s) listed</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Universal Search Bar */}
          <div className="relative flex-1 sm:w-80">
            <HiOutlineSearch className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-border rounded-xl text-base focus:outline-none focus:border-burgundy"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Date filter dropdown (only active when not searching) */}
            <div className="relative flex-1 sm:flex-initial">
              <button 
                disabled={!!debouncedSearch}
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white border border-border rounded-xl text-sm font-semibold text-text hover:bg-bg/85 transition-colors disabled:opacity-50"
              >
                {debouncedSearch ? 'Global Search' : dateOptions.find(o => o.id === dateFilter)?.label}
                <HiOutlineChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              {showDropdown && !debouncedSearch && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-border py-1 z-30">
                  {dateOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setDateFilter(opt.id);
                        setPage(1);
                        setShowDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${dateFilter === opt.id ? 'bg-burgundy/5 text-burgundy' : 'text-text hover:bg-bg'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button 
              onClick={() => { setLoading(true); fetchOrders(); }}
              className="p-3 bg-white border border-border rounded-xl text-text hover:bg-bg/85 transition-colors"
              title="Refresh results"
            >
              <HiOutlineRefresh className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Custom Date Range picker form */}
      {!debouncedSearch && dateFilter === 'Custom' && (
        <form onSubmit={handleCustomRangeSubmit} className="flex flex-wrap items-end gap-4 bg-white p-5 rounded-2xl border border-border animate-fadeIn">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Start Date</label>
            <input 
              type="date" 
              value={customRange.startDate}
              onChange={(e) => setCustomRange({ ...customRange, startDate: e.target.value })}
              required
              className="px-4 py-2.5 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">End Date</label>
            <input 
              type="date" 
              value={customRange.endDate}
              onChange={(e) => setCustomRange({ ...customRange, endDate: e.target.value })}
              required
              className="px-4 py-2.5 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-burgundy hover:bg-burgundy-600 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Apply Range
          </button>
        </form>
      )}

      {/* Global search status message */}
      {debouncedSearch && (
        <p className="text-xs font-medium text-burgundy italic">Searching all orders globally (date filters paused)</p>
      )}

      {/* Status Filter Tabs with Counts */}
      <div className="flex flex-wrap gap-2">
        {renderStatusTab('All', statusCounts?.All)}
        {ORDER_STATUSES.map(s => renderStatusTab(s, statusCounts?.[s]))}
      </div>

      {/* Orders Table & Empty States */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-gray-500">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-gray-500 space-y-4">
              {debouncedSearch ? (
                <>
                  <p className="text-base font-semibold">No orders found</p>
                  <p className="text-sm text-gray-400">No orders match "{debouncedSearch}".</p>
                  <button onClick={() => setSearch('')} className="text-sm font-semibold text-burgundy hover:underline">Clear Search</button>
                </>
              ) : dateFilter === 'Today' ? (
                <>
                  <p className="text-base font-semibold">No orders today</p>
                  <p className="text-sm text-gray-400">New orders placed today will appear here.</p>
                </>
              ) : (
                <>
                  <p className="text-base font-semibold">No {statusFilter !== 'All' ? statusFilter : ''} orders</p>
                  <p className="text-sm text-gray-400">There are no {statusFilter !== 'All' ? statusFilter : ''} orders matching the selected filters.</p>
                </>
              )}
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-bg border-b border-border text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-4">Order ID</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Items</th>
                  <th className="px-5 py-4">Product(s) & Qty</th>
                  <th className="px-5 py-4">Shipping</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Payment</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-4 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-base text-text">
                {orders.map((order) => {
                  const formatted = formatFullDateTime(order.createdAt);
                  return (
                    <tr key={order._id} className={`hover:bg-bg/40 cursor-pointer transition-colors ${expandedOrder === order._id ? 'bg-bg/40' : ''}`} onClick={() => toggleExpand(order)}>
                      <td className="px-5 py-4 font-semibold text-sm">#{order._id.slice(-6).toUpperCase()}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold block text-sm">{order.user?.name || '—'}</p>
                        <p className="text-xs text-gray-400 block mt-0.5">{order.user?.email}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-sm">
                        {order.products?.reduce((acc, p) => acc + p.quantity, 0)} item(s)
                      </td>
                      <td className="px-5 py-4 text-sm max-w-[200px]">
                        {order.products?.map((p, idx) => (
                          <div key={idx} className="truncate text-xs" title={`${p.name} × ${p.quantity}`}>
                            <span className="font-semibold text-text">{p.name}</span>
                            <span className="text-gray-400 font-medium ml-1">×{p.quantity}</span>
                          </div>
                        ))}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        {order.shippingCharge > 0 ? (
                          <span className="font-semibold">{formatPrice(order.shippingCharge)}</span>
                        ) : (
                          <span className="text-xs text-amber-600 font-semibold">Not set</span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-bold text-burgundy text-sm">{formatPrice(order.totalPrice)}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{order.paymentMethod}</td>
                      <td className="px-5 py-4">
                        <span className="font-semibold block text-sm">{formatted.date}</span>
                        <span className="text-xs text-gray-400 block mt-0.5">{formatted.time}</span>
                      </td>
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border-0 appearance-none cursor-pointer ${getStatusColor(order.orderStatus)}`}
                        >
                          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-4 text-right">
                        {expandedOrder === order._id ? (
                          <HiOutlineChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <HiOutlineChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Expanded detail row placement - render inline or absolute depending on layout */}
      {expandedOrder && !loading && (
        (() => {
          const order = orders.find(o => o._id === expandedOrder);
          if (!order) return null;
          return (
            <div className="bg-bg/40 border border-border rounded-2xl p-6 space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <h3 className="text-base font-bold text-text">Order Detail (Last 6 Digits: #{order._id.slice(-6).toUpperCase()})</h3>
                <button onClick={() => setExpandedOrder(null)} className="text-gray-400 hover:text-burgundy">
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Order Items & Shipping address */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Order Items</h4>
                    <div className="divide-y divide-border border border-border rounded-xl bg-white p-4 space-y-1">
                      {order.products.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm py-2 last:pb-0 first:pt-0">
                          <span className="text-gray-600 font-semibold">{item.product?.name || item.name} &times; {item.quantity}</span>
                          <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-border p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <HiOutlineLocationMarker className="w-4 h-4 text-burgundy" />
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Shipping Address</h4>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="font-semibold">{order.shippingAddress?.fullName}</p>
                      <p>{order.shippingAddress?.street}</p>
                      <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}</p>
                      <p>📞 {order.shippingAddress?.phone}</p>
                      <p>✉️ {order.shippingAddress?.email}</p>
                      {order.shippingAddress?.businessName && <p>🏢 {order.shippingAddress.businessName}</p>}
                      {order.shippingAddress?.gstNumber && <p>GST: {order.shippingAddress.gstNumber}</p>}
                    </div>
                  </div>
                </div>

                {/* Right: Actions / Delivery Info */}
                <div className="space-y-6">
                  {['Paid', 'Confirmed', 'Shipped'].includes(order.orderStatus) && (
                    <div className="bg-white rounded-xl border border-blue-200 p-5 shadow-sm">
                      <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-4">Delivery Information</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tracking Number</label>
                          <input
                            value={deliveryForm.trackingNumber}
                            onChange={(e) => setDeliveryForm({ ...deliveryForm, trackingNumber: e.target.value })}
                            placeholder="e.g. AWB12345678"
                            className="w-full px-3 py-2 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Receiving Spot</label>
                          <input
                            value={deliveryForm.receivingSpot}
                            onChange={(e) => setDeliveryForm({ ...deliveryForm, receivingSpot: e.target.value })}
                            placeholder="e.g. Front gate, warehouse entrance"
                            className="w-full px-3 py-2 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Delivery Boy Name</label>
                            <input
                              value={deliveryForm.deliveryBoyName}
                              onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryBoyName: e.target.value })}
                              placeholder="Name"
                              className="w-full px-3 py-2 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Delivery Boy Phone</label>
                            <input
                              value={deliveryForm.deliveryBoyPhone}
                              onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryBoyPhone: e.target.value })}
                              placeholder="Phone number"
                              className="w-full px-3 py-2 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Delivery Notes</label>
                          <textarea
                            value={deliveryForm.deliveryNotes}
                            onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryNotes: e.target.value })}
                            placeholder="Any special instructions..."
                            rows={2}
                            className="w-full px-3 py-2 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy resize-none"
                          />
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => handleSaveDeliveryInfo(order, order._id)}
                            disabled={savingDelivery}
                            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-text rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                          >
                            Save Draft Info
                          </button>
                          <button
                            onClick={() => handleDeliverAndNotify(order._id)}
                            disabled={savingDelivery}
                            className="flex-1 px-4 py-2.5 bg-burgundy hover:bg-burgundy/90 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                          >
                            {savingDelivery ? 'Processing...' : 'Deliver & Send Bill'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {order.orderStatus === 'Delivered' && order.deliveryInfo && (
                    <div className="bg-white rounded-xl border border-border p-5 space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-border">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Delivery Info</h4>
                        {(() => {
                          const deliveredTime = order.deliveredAt ? new Date(order.deliveredAt).getTime() : new Date(order.updatedAt).getTime();
                          const timeElapsedMs = Date.now() - deliveredTime;
                          const hoursElapsed = timeElapsedMs / (1000 * 60 * 60);
                          const editsRemaining = 2 - (order.deliveryInfoEditCount || 0);
                          const isEditAllowed = hoursElapsed < 2 && editsRemaining > 0;
                          const minsRemaining = Math.max(0, Math.ceil(120 - timeElapsedMs / 60000));

                          if (isEditingDelivered) return null;

                          return (
                            <div className="text-right">
                              {isEditAllowed ? (
                                <div className="flex items-center gap-3">
                                  <span className="text-xs text-amber-600 font-medium">
                                    {editsRemaining} edit(s) left ({minsRemaining}m left)
                                  </span>
                                  <button
                                    onClick={() => {
                                      setDeliveryForm({
                                        receivingSpot: order.deliveryInfo.receivingSpot || '',
                                        deliveryBoyPhone: order.deliveryInfo.deliveryBoyPhone || '',
                                        deliveryBoyName: order.deliveryInfo.deliveryBoyName || '',
                                        deliveryNotes: order.deliveryInfo.deliveryNotes || '',
                                        trackingNumber: order.deliveryInfo.trackingNumber || '',
                                      });
                                      setIsEditingDelivered(true);
                                    }}
                                    className="text-xs bg-burgundy/10 text-burgundy hover:bg-burgundy hover:text-white px-2.5 py-1 rounded-lg font-semibold transition-all duration-200"
                                  >
                                    Edit Info
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[11px] text-gray-400 font-medium">
                                  {editsRemaining <= 0 ? 'Edit limit reached' : 'Edit window expired (2h)'}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      {isEditingDelivered ? (
                        <div className="space-y-4 pt-1">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tracking Number</label>
                            <input
                              value={deliveryForm.trackingNumber}
                              onChange={(e) => setDeliveryForm({ ...deliveryForm, trackingNumber: e.target.value })}
                              placeholder="e.g. AWB12345678"
                              className="w-full px-3 py-2 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Receiving Spot</label>
                            <input
                              value={deliveryForm.receivingSpot}
                              onChange={(e) => setDeliveryForm({ ...deliveryForm, receivingSpot: e.target.value })}
                              placeholder="e.g. Front gate, warehouse entrance"
                              className="w-full px-3 py-2 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Delivery Boy Name</label>
                              <input
                                value={deliveryForm.deliveryBoyName}
                                onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryBoyName: e.target.value })}
                                placeholder="Name"
                                className="w-full px-3 py-2 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Delivery Boy Phone</label>
                              <input
                                value={deliveryForm.deliveryBoyPhone}
                                onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryBoyPhone: e.target.value })}
                                placeholder="Phone number"
                                className="w-full px-3 py-2 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Delivery Notes</label>
                            <textarea
                              value={deliveryForm.deliveryNotes}
                              onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryNotes: e.target.value })}
                              placeholder="Any special instructions..."
                              rows={2}
                              className="w-full px-3 py-2 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy resize-none"
                            />
                          </div>
                          <div className="flex gap-3 pt-2">
                            <button
                              onClick={() => setIsEditingDelivered(false)}
                              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-text rounded-xl text-xs font-semibold transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveDeliveryInfo(order, order._id)}
                              disabled={savingDelivery}
                              className="flex-1 px-4 py-2 bg-burgundy hover:bg-burgundy/90 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                            >
                              {savingDelivery ? 'Saving...' : 'Save Changes'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600 space-y-1.5 pt-1">
                          <p>📦 Tracking: {order.deliveryInfo.trackingNumber || '—'}</p>
                          <p>📍 Spot: {order.deliveryInfo.receivingSpot || '—'}</p>
                          <p>👤 Delivery Boy: {order.deliveryInfo.deliveryBoyName || '—'}</p>
                          <p>📞 Phone: {order.deliveryInfo.deliveryBoyPhone || '—'}</p>
                          <p>📝 Notes: {order.deliveryInfo.deliveryNotes || '—'}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {order.orderStatus === 'Pending Payment' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700 font-medium">
                      ⏳ Waiting for customer to complete payment via Razorpay.
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()
      )}

      {/* Pagination Footer */}
      {!loading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-border text-sm text-gray-500">
          <div>
            Showing <span className="font-semibold">{Math.min((page - 1) * 20 + 1, totalOrdersCount)}</span>&ndash;
            <span className="font-semibold">{Math.min(page * 20, totalOrdersCount)}</span> of <span className="font-semibold">{totalOrdersCount}</span> orders
          </div>
          <div className="flex items-center gap-3">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-xl font-semibold bg-white hover:bg-bg disabled:opacity-40 transition-colors disabled:cursor-not-allowed"
            >
              <HiOutlineChevronLeft className="w-5 h-5" /> Previous
            </button>
            <span className="font-medium text-text">Page {page} of {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-xl font-semibold bg-white hover:bg-bg disabled:opacity-40 transition-colors disabled:cursor-not-allowed"
            >
              Next <HiOutlineChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
