import { Link } from 'react-router-dom';
import { HiOutlinePhone, HiOutlineMail, HiOutlineLocationMarker } from 'react-icons/hi';
import { BUSINESS } from '../../utils/constants';

const Footer = () => {
  return (
    <footer className="bg-burgundy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Brand */}
          <div>
            <img src="/logo.png" alt="RBW" className="h-12 w-auto mb-4" />
            <p className="text-white/70 text-sm leading-relaxed">
              Online store for our wholesale customers.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Quick Links</h3>
            <div className="space-y-3">
              <Link to="/" className="block text-sm text-white/70 hover:text-white transition-colors">Home</Link>
              <Link to="/shop" className="block text-sm text-white/70 hover:text-white transition-colors">Shop</Link>
              <Link to="/updates" className="block text-sm text-white/70 hover:text-white transition-colors">Updates</Link>
              <Link to="/contact" className="block text-sm text-white/70 hover:text-white transition-colors">Contact</Link>
              <Link to="/cart" className="block text-sm text-white/70 hover:text-white transition-colors">Cart</Link>
              <Link to="/dashboard" className="block text-sm text-white/70 hover:text-white transition-colors">My Account</Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Support</h3>
            <div className="space-y-3">
              <Link to="/login" className="block text-sm text-white/70 hover:text-white transition-colors">Login</Link>
              <Link to="/signup" className="block text-sm text-white/70 hover:text-white transition-colors">Register</Link>
              <Link to="/dashboard?tab=orders" className="block text-sm text-white/70 hover:text-white transition-colors">Track Order</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Contact Us</h3>
            <div className="space-y-3">
              <a href={`tel:${BUSINESS.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
                <HiOutlinePhone className="w-4 h-4 shrink-0" />
                {BUSINESS.phone}
              </a>
              <a href={`mailto:${BUSINESS.email}`} className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
                <HiOutlineMail className="w-4 h-4 shrink-0" />
                {BUSINESS.email}
              </a>
              <a href={BUSINESS.location} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
                <HiOutlineLocationMarker className="w-4 h-4 shrink-0" />
                {BUSINESS.address}
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.
          </p>
          <p className="text-xs text-white/50">
            Developed by{' '}
            <a href="https://github.com/AP24110010250" target="_blank" rel="noopener noreferrer" className="text-white hover:underline font-semibold transition-colors">
              Koushik Chava
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
