import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { HiOutlineChartBar, HiOutlineCube, HiOutlineClipboardList, HiOutlineTag, HiOutlineUsers, HiOutlineCog, HiOutlineMenu, HiOutlineX, HiOutlineLogout, HiOutlineLocationMarker, HiOutlineChatAlt, HiOutlinePhotograph, HiOutlineVolumeUp } from 'react-icons/hi';
import useAuth from '../hooks/useAuth';

const sidebarLinks = [
  { to: '/admin', label: 'Dashboard', icon: HiOutlineChartBar, exact: true },
  { to: '/admin/products', label: 'Products', icon: HiOutlineCube },
  { to: '/admin/orders', label: 'Orders', icon: HiOutlineClipboardList },
  { to: '/admin/categories', label: 'Series', icon: HiOutlineTag },
  { to: '/admin/customers', label: 'Customers', icon: HiOutlineUsers },
  { to: '/admin/locations', label: 'Locations', icon: HiOutlineLocationMarker },
  { to: '/admin/testimonials', label: 'Testimonials', icon: HiOutlineChatAlt },
  { to: '/admin/gallery', label: 'Gallery & Announcements', icon: HiOutlinePhotograph },
  { to: '/admin/settings', label: 'Settings', icon: HiOutlineCog },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logoutAdmin } = useAuth();

  const isActive = (link) => {
    if (link.exact) return location.pathname === link.to;
    return location.pathname.startsWith(link.to);
  };

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-border transform transition-transform duration-200 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-5 border-b border-border">
          <Link to="/admin" className="flex items-center gap-2">
            <img src="/logo.png" alt="RBW" className="h-8 w-auto" />
            <span className="text-sm font-semibold text-burgundy">Admin</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive(link) ? 'bg-burgundy text-white' : 'text-text hover:bg-bg'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={() => { logoutAdmin(); navigate('/admin/login'); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-burgundy hover:bg-burgundy/5 transition-colors w-full"
          >
            <HiOutlineLogout className="w-4.5 h-4.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <header className="h-16 bg-white border-b border-border flex items-center px-4 lg:px-6 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 mr-2">
            <HiOutlineMenu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-text">
            {sidebarLinks.find((l) => isActive(l))?.label || 'Admin'}
          </h1>
        </header>
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
