import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { FaWhatsapp } from 'react-icons/fa';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col relative">
      <Navbar />
      <main className="flex-1 pt-16 sm:pt-20">
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

      {/* Apple Camera UI Rounded Viewport Frame */}
      <div className="fixed inset-2 sm:inset-4 pointer-events-none rounded-[20px] sm:rounded-[32px] border-[6px] sm:border-[12px] border-black/75 backdrop-blur-[1px] z-40 shadow-[0_0_0_9999px_rgba(0,0,0,0.05)] ring-1 ring-white/10" />
    </div>
  );
};

export default MainLayout;
