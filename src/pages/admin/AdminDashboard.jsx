import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HiOutlineCube, 
  HiOutlineClipboardList, 
  HiOutlineUsers, 
  HiOutlineCurrencyRupee, 
  HiOutlineRefresh, 
  HiOutlineChevronDown,
  HiOutlineChevronRight,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle
} from 'react-icons/hi';
import { getDashboard } from '../../services/api';
import { formatPrice, getStatusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

const dateOptions = [
  { id: 'Today', label: 'Today' },
  { id: 'Yesterday', label: 'Yesterday' },
  { id: 'Last 7 Days', label: 'Last 7 Days' },
  { id: 'Last 30 Days', label: 'Last 30 Days' },
  { id: 'Custom', label: 'Custom Date Range' }
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Date filter state
  const [dateFilter, setDateFilter] = useState('Today');
  const [showDropdown, setShowDropdown] = useState(false);
  const [customRange, setCustomRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Current live time state
  const [liveTime, setLiveTime] = useState(new Date());

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

  const fetchDashboardStats = async (filter = dateFilter, range = customRange) => {
    try {
      const { startDate, endDate } = getBoundaries(filter, range);
      const { data } = await getDashboard({ startDate, endDate });
      setStats(data);
    } catch (err) {
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  // Clock tick interval
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Reload statistics
  useEffect(() => {
    fetchDashboardStats();
  }, [dateFilter]);

  // Handle midnight day auto refetch for Today filter
  useEffect(() => {
    if (dateFilter === 'Today') {
      const now = new Date();
      const midnight = new Date();
      midnight.setDate(now.getDate() + 1);
      midnight.setHours(0, 0, 0, 0);
      const timeToMidnight = midnight.getTime() - now.getTime();

      const midnightTimer = setTimeout(() => {
        fetchDashboardStats();
      }, timeToMidnight);

      return () => clearTimeout(midnightTimer);
    }
  }, [dateFilter, liveTime.getDate()]);

  // Auto-refresh stats every 60 seconds
  useEffect(() => {
    const autoRefreshTimer = setInterval(() => {
      fetchDashboardStats();
    }, 60000);
    return () => clearInterval(autoRefreshTimer);
  }, [dateFilter, customRange]);

  const handleCustomRangeSubmit = (e) => {
    e.preventDefault();
    if (new Date(customRange.startDate) > new Date(customRange.endDate)) {
      toast.error('Start date cannot be after end date');
      return;
    }
    fetchDashboardStats('Custom', customRange);
  };

  // Formatting clock display
  const formatClock = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayName = days[date.getDay()];
    const day = String(date.getDate());
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedHours = String(hours).padStart(2, '0');

    return `${dayName}, ${day} ${month} ${year} · ${formattedHours}:${minutes}:${seconds} ${ampm}`;
  };

  const formatOrderTime = (dateStr) => {
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${day} ${month} · ${hours}:${minutes} ${ampm}`;
  };

  const kpiCards = [
    { label: 'Total Products', value: stats?.kpis?.totalProducts || 0, icon: HiOutlineCube, color: 'bg-blue-50 text-blue-600' },
    { label: 'Orders', value: stats?.kpis?.orders || 0, icon: HiOutlineClipboardList, color: 'bg-green-50 text-green-600' },
    { label: 'New Customers', value: stats?.kpis?.newCustomers || 0, icon: HiOutlineUsers, color: 'bg-purple-50 text-purple-600' },
    { label: 'Revenue', value: formatPrice(stats?.kpis?.revenue || 0), icon: HiOutlineCurrencyRupee, color: 'bg-burgundy-50 text-burgundy' },
  ];

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-5 rounded-2xl border border-border">
        <div>
          <h2 className="text-xl font-bold text-text">Dashboard</h2>
          <p className="text-sm font-medium text-gray-400 mt-1">{formatClock(liveTime)}</p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-4 py-2.5 bg-bg border border-border rounded-xl text-sm font-semibold text-text hover:bg-bg/80 transition-colors"
          >
            {dateOptions.find(o => o.id === dateFilter)?.label}
            <HiOutlineChevronDown className="w-4 h-4 text-gray-500" />
          </button>
          {showDropdown && (
            <div className="absolute right-10 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-border py-1 z-30">
              {dateOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setDateFilter(opt.id);
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${dateFilter === opt.id ? 'bg-burgundy/5 text-burgundy' : 'text-text hover:bg-bg'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
          <button 
            onClick={() => { setLoading(true); fetchDashboardStats(); }}
            className="p-2.5 bg-bg border border-border rounded-xl text-text hover:bg-bg/80 transition-colors"
            title="Refresh statistics"
          >
            <HiOutlineRefresh className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Custom Date Range Picker Form */}
      {dateFilter === 'Custom' && (
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

      {/* KPI Cards */}
      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading KPI statistics...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-border p-5 shadow-sm hover:shadow transition-shadow"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{card.label}</p>
                <p className="text-xl font-bold text-text">{card.value}</p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Needs Attention Section */}
      <div className="bg-white p-6 rounded-2xl border border-border">
        <h3 className="text-sm font-bold text-text uppercase tracking-wide mb-4">Needs Attention</h3>
        {stats?.needsAttention?.ordersToConfirm > 0 ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-burgundy/5 rounded-xl border border-burgundy/10 gap-3">
            <div className="flex items-start gap-3">
              <HiOutlineExclamationCircle className="w-5 h-5 text-burgundy mt-0.5 shrink-0" />
              <div>
                <h4 className="text-base font-bold text-text">Orders to Confirm</h4>
                <p className="text-sm text-gray-600 mt-1">{stats.needsAttention.ordersToConfirm} paid order(s) are waiting for confirmation.</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/admin/orders?status=Paid')}
              className="flex items-center gap-1 text-sm font-semibold text-burgundy hover:text-burgundy-600 transition-colors self-start sm:self-auto shrink-0"
            >
              View Orders <HiOutlineChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100 text-green-800">
            <HiOutlineCheckCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-base font-bold">Everything is up to date</p>
              <p className="text-sm text-green-700/80">No orders are waiting for confirmation.</p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border flex justify-between items-center">
          <h3 className="text-sm font-bold text-text uppercase tracking-wide">Recent Orders</h3>
          <button 
            onClick={() => navigate('/admin/orders')}
            className="flex items-center gap-1 text-sm font-semibold text-burgundy hover:text-burgundy-600 transition-colors"
          >
            View All <HiOutlineChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          {(!stats?.recentOrders || stats.recentOrders.length === 0) ? (
            <p className="text-center py-10 text-gray-500 text-sm">No orders yet</p>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-bg border-b border-border text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-base text-text">
                {stats.recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-bg/40 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold block text-sm">#{order._id.slice(-6).toUpperCase()}</span>
                      <span className="text-xs text-gray-400 block mt-0.5">{formatOrderTime(order.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{order.user?.name || '—'}</td>
                    <td className="px-6 py-4 font-semibold">{formatPrice(order.totalPrice)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => navigate(`/admin/orders`)}
                        className="text-sm font-semibold text-burgundy hover:text-burgundy-600 transition-colors"
                      >
                        View &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Stock Alerts Section */}
      <div className="bg-white p-6 rounded-2xl border border-border">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-sm font-bold text-text uppercase tracking-wide">Stock Alerts</h3>
          <button 
            onClick={() => navigate('/admin/products')}
            className="flex items-center gap-1 text-sm font-semibold text-burgundy hover:text-burgundy-600 transition-colors"
          >
            View Products <HiOutlineChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Out of Stock column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between">
              Out of Stock 
              <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px]">{stats?.stockAlerts?.outOfStockCount || 0}</span>
            </h4>
            <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-bg/20">
              {(!stats?.stockAlerts?.outOfStock || stats.stockAlerts.outOfStock.length === 0) ? (
                <p className="p-4 text-sm text-gray-500 text-center">No out of stock products</p>
              ) : (
                stats.stockAlerts.outOfStock.map((prod) => (
                  <div key={prod._id} className="p-3.5 flex justify-between items-center text-sm">
                    <span className="font-semibold text-gray-700">{prod.name}</span>
                    <span className="text-red-600 font-bold">0 cards</span>
                  </div>
                ))
              )}
              {stats?.stockAlerts?.outOfStockCount > 5 && (
                <div className="p-2.5 text-center text-xs font-semibold text-gray-500 bg-bg">
                  + {stats.stockAlerts.outOfStockCount - 5} more products
                </div>
              )}
            </div>
          </div>

          {/* Low Stock column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between">
              Low Stock 
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px]">{stats?.stockAlerts?.lowStockCount || 0}</span>
            </h4>
            <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-bg/20">
              {(!stats?.stockAlerts?.lowStock || stats.stockAlerts.lowStock.length === 0) ? (
                <p className="p-4 text-sm text-gray-500 text-center">No low stock products</p>
              ) : (
                stats.stockAlerts.lowStock.map((prod) => (
                  <div key={prod._id} className="p-3.5 flex justify-between items-center text-sm">
                    <span className="font-semibold text-gray-700">{prod.name}</span>
                    <span className="text-amber-600 font-semibold">{prod.stock} cards <span className="text-xs text-gray-400 font-normal">(MOQ: {prod.moq})</span></span>
                  </div>
                ))
              )}
              {stats?.stockAlerts?.lowStockCount > 5 && (
                <div className="p-2.5 text-center text-xs font-semibold text-gray-500 bg-bg">
                  + {stats.stockAlerts.lowStockCount - 5} more products
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
