import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { FaWhatsapp } from 'react-icons/fa';
import { getActiveAnnouncements } from '../services/api';

const MainLayout = () => {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    getActiveAnnouncements()
      .then((res) => setAnnouncements(res.data))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="fixed top-0 left-0 right-0 z-50">
        {/* Announcement Bar */}
        {announcements.map((ann) => (
          <div
            key={ann._id}
            style={{ backgroundColor: ann.bgColor, color: ann.textColor }}
            className="py-2.5 text-center text-xs sm:text-sm font-semibold tracking-wide px-4 shadow-sm"
          >
            {ann.text}
          </div>
        ))}
        <Navbar />
      </div>

      <main className={`flex-1 ${announcements.length > 0 ? 'pt-28 sm:pt-36' : 'pt-16 sm:pt-20'}`}>
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
