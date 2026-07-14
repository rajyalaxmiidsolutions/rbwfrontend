import { useState, useEffect, useRef } from 'react';
import { getActiveAnnouncements } from '../../services/api';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

const AnnouncementBanner = ({ page }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data } = await getActiveAnnouncements();
        // Filter by the page prop (e.g. 'Home', 'Shop', 'Cart', 'Contact')
        const filtered = data.filter((ann) => 
          ann.displayPages && ann.displayPages.includes(page)
        );
        setAnnouncements(filtered);
      } catch (err) {
        console.error('Failed to fetch announcements for banner:', err);
      }
    };
    fetchBanners();
  }, [page]);

  // Set up auto rotation if 2+ announcements
  useEffect(() => {
    if (announcements.length < 2) return;

    const startTimer = () => {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
      }, 5000);
    };

    startTimer();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [announcements]);

  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
    }, 5000);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? announcements.length - 1 : prev - 1));
    resetTimer();
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
    resetTimer();
  };

  if (announcements.length === 0) return null;

  const currentAnnouncement = announcements[currentIndex];

  return (
    <div className="bg-burgundy text-white py-2.5 px-4 text-center text-xs sm:text-sm font-semibold tracking-wide relative overflow-hidden transition-all duration-300 shadow-sm flex items-center justify-center min-h-[40px]">
      {announcements.length >= 2 && (
        <button
          onClick={handlePrev}
          className="absolute left-2 sm:left-4 p-1 hover:bg-white/10 rounded-full transition-colors focus:outline-none"
          aria-label="Previous announcement"
        >
          <HiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white/80 hover:text-white" />
        </button>
      )}

      <div className="max-w-[75%] sm:max-w-[85%] mx-auto transition-opacity duration-500 ease-in-out select-none">
        {currentAnnouncement.message}
      </div>

      {announcements.length >= 2 && (
        <button
          onClick={handleNext}
          className="absolute right-2 sm:right-4 p-1 hover:bg-white/10 rounded-full transition-colors focus:outline-none"
          aria-label="Next announcement"
        >
          <HiChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/80 hover:text-white" />
        </button>
      )}
    </div>
  );
};

export default AnnouncementBanner;
