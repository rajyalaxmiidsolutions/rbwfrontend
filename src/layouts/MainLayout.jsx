import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { FaWhatsapp } from 'react-icons/fa';
import { getActiveAnnouncements } from '../services/api';
import AnnouncementBanner from '../components/common/AnnouncementBanner';

const MainLayout = () => {
  const [announcements, setAnnouncements] = useState([]);
  const location = useLocation();

  useEffect(() => {
    getActiveAnnouncements()
      .then((res) => setAnnouncements(res.data))
      .catch(() => {});
  }, [location.pathname]); // Refetch on route change to keep active list fresh

  const isHome = location.pathname === '/';
  const hasHomeAnnouncements = announcements.some((ann) => 
    ann.displayPages && ann.displayPages.includes('Home')
  );

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="fixed top-0 left-0 right-0 z-50">
        {/* Announcement Bar */}
        {isHome && <AnnouncementBanner page="Home" />}
        <Navbar />
      </div>

      <main className={`flex-1 ${(isHome && hasHomeAnnouncements) ? 'pt-28 sm:pt-32' : 'pt-18 sm:pt-22'}`}>
        <Outlet />
      </main>
      <Footer />

      {/* Floating WhatsApp Chat Button */}
      <a
        href="https://wa.me/916300450725"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-[#25D366] text-white p-3.5 rounded-full shadow-2xl hover:bg-[#128C7E] hover:scale-110 transition-all duration-300 z-50 flex items-center justify-center cursor-pointer"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <FaWhatsapp className="w-7 h-7" />
      </a>
    </div>
  );
};

export default MainLayout;
