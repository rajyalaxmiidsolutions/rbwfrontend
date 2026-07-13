import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineShoppingBag, HiOutlineUser, HiOutlineMenu, HiOutlineX, HiOutlineSearch, HiOutlinePhone } from 'react-icons/hi';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import SearchOverlay from './SearchOverlay';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/gallery', label: 'Gallery' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'glass-white shadow-lg'
            : 'bg-white/0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 sm:h-22">
            {/* Logo */}
            <div className="flex-1 flex justify-start">
              <Link to="/" className="flex items-center gap-3 shrink-0">
                <img src="/logo.png" alt="RBW" className="h-12 sm:h-14 w-auto" />
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center justify-center gap-2">
              {navLinks.map((link) => {
                const active = link.to === '/' 
                  ? location.pathname === '/' 
                  : (link.to === '/shop' 
                      ? (location.pathname === '/shop' || location.pathname.startsWith('/product')) 
                      : location.pathname === link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`text-sm sm:text-base font-semibold tracking-wide px-4.5 py-2 rounded-full transition-all duration-300 ${
                      active
                        ? 'bg-burgundy/10 text-burgundy border border-burgundy/10 backdrop-blur-md shadow-sm scale-105 font-bold'
                        : 'text-text hover:text-burgundy hover:bg-black/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Actions (Desktop + Mobile) */}
            <div className="flex-1 flex justify-end items-center gap-3">
              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-3">
                {/* Search */}
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2.5 rounded-full hover:bg-burgundy/5 transition-colors"
                  aria-label="Search"
                >
                  <HiOutlineSearch className="w-6 h-6 text-text" />
                </button>

                {/* Cart */}
                <Link
                  to="/cart"
                  className="relative p-2.5 rounded-full hover:bg-burgundy/5 transition-colors"
                >
                  <HiOutlineShoppingBag className="w-6 h-6 text-text" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-burgundy text-white text-[11px] font-bold min-w-[20px] h-[20px] flex items-center justify-center rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Account */}
                {isAuthenticated ? (
                  <div className="relative group">
                    <button className="flex items-center gap-2 text-base font-medium text-text hover:text-burgundy transition-colors p-2.5 rounded-full hover:bg-burgundy/5">
                      <HiOutlineUser className="w-6 h-6" />
                      <span className="hidden lg:inline">{user?.name?.split(' ')[0]}</span>
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
                      <Link to="/dashboard" className="block px-5 py-3.5 text-base text-text hover:bg-bg transition-colors">My Account</Link>
                      <Link to="/dashboard?tab=orders" className="block px-5 py-3.5 text-base text-text hover:bg-bg transition-colors">My Orders</Link>
                      <button onClick={() => { logout(); navigate('/'); }} className="w-full text-left px-5 py-3.5 text-base text-burgundy hover:bg-burgundy/5 transition-colors border-t border-border">
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="bg-burgundy text-white px-6 py-2.5 rounded-xl text-base font-medium hover:bg-burgundy-600 transition-colors"
                  >
                    Login
                  </Link>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="flex items-center gap-3 md:hidden">
                <button onClick={() => setSearchOpen(true)} className="p-2.5">
                  <HiOutlineSearch className="w-6 h-6 text-text" />
                </button>
                <Link to="/cart" className="relative p-2.5">
                  <HiOutlineShoppingBag className="w-6 h-6 text-text" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-burgundy text-white text-[11px] font-bold min-w-[20px] h-[20px] flex items-center justify-center rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2.5">
                  {mobileOpen ? <HiOutlineX className="w-7 h-7" /> : <HiOutlineMenu className="w-7 h-7" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-border overflow-hidden"
            >
              <div className="px-4 py-5 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`block px-4 py-3.5 rounded-xl text-base font-medium transition-colors ${
                      location.pathname === link.to ? 'bg-burgundy/5 text-burgundy' : 'text-text hover:bg-bg'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {/* Search */}
                <button
                  onClick={() => { setMobileOpen(false); setSearchOpen(true); }}
                  className="w-full text-left block px-4 py-3.5 rounded-xl text-base font-medium text-text hover:bg-bg"
                >
                  Search
                </button>
                {/* Cart */}
                <Link
                  to="/cart"
                  className="block px-4 py-3.5 rounded-xl text-base font-medium text-text hover:bg-bg flex justify-between items-center"
                >
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="bg-burgundy text-white text-[11px] font-bold min-w-[20px] h-[20px] flex items-center justify-center rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>
                {/* Account */}
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" className="block px-4 py-3.5 rounded-xl text-base font-medium text-text hover:bg-bg">My Account</Link>
                    <button onClick={() => { logout(); navigate('/'); }} className="w-full text-left px-4 py-3.5 rounded-xl text-base font-medium text-burgundy hover:bg-burgundy/5">
                      Logout
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="block px-4 py-3.5 mt-2 bg-burgundy text-white rounded-xl text-base font-medium text-center">
                    Login / Register
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Search Overlay */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;
