import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineCube, HiOutlineClipboardList, HiOutlineUsers, HiOutlineCurrencyRupee } from 'react-icons/hi';
import { getDashboard } from '../../services/api';
import { formatPrice, formatDate, getStatusColor } from '../../utils/helpers';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard().then(res => setStats(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  const cards = [
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: HiOutlineCube, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: HiOutlineClipboardList, color: 'bg-green-50 text-green-600' },
    { label: 'Total Customers', value: stats?.totalCustomers || 0, icon: HiOutlineUsers, color: 'bg-purple-50 text-purple-600' },
    { label: 'Total Revenue', value: formatPrice(stats?.totalRevenue || 0), icon: HiOutlineCurrencyRupee, color: 'bg-burgundy-50 text-burgundy' },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl border border-border p-5"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-xs text-gray-400 mb-1">{card.label}</p>
              <p className="text-xl font-bold text-text">{card.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-border">
        <div className="p-5 border-b border-border">
          <h3 className="text-base font-semibold text-text">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">Order ID</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">Customer</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">Date</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders?.map((order) => (
                <tr key={order._id} className="border-b border-border last:border-0 hover:bg-bg/50">
                  <td className="px-5 py-3 font-medium">#{order._id.slice(-6).toUpperCase()}</td>
                  <td className="px-5 py-3 text-gray-600">{order.user?.name || '—'}</td>
                  <td className="px-5 py-3 text-gray-400">{formatDate(order.createdAt)}</td>
                  <td className="px-5 py-3 font-medium">{formatPrice(order.totalPrice)}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
            <p className="text-center py-8 text-gray-400 text-sm">No orders yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
