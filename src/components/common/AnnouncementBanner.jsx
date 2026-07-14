import { useState, useEffect, useRef } from 'react';
import { getActiveAnnouncements } from '../../services/api';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

const AnnouncementBanner = ({ page }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for next, -1 for prev
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
        setDirection(1);
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
      setDirection(1);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
    }, 5000);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? announcements.length - 1 : prev - 1));
    resetTimer();
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
    resetTimer();
  };

  if (announcements.length === 0) return null;

  const currentAnnouncement = announcements[currentIndex];

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 150 : -150,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir < 0 ? 150 : -150,
      opacity: 0,
    }),
  };

  return (
    <div className="bg-burgundy text-white py-2.5 px-4 text-center text-xs sm:text-sm font-semibold tracking-wide relative overflow-hidden transition-all duration-300 shadow-sm flex items-center justify-between min-h-[44px]">
      {announcements.length >= 2 ? (
        <button
          onClick={handlePrev}
          className="p-1 hover:bg-white/10 rounded-full transition-colors focus:outline-none z-10 shrink-0"
          aria-label="Previous announcement"
        >
          <HiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white/80 hover:text-white" />
        </button>
      ) : (
        <div className="w-6 sm:w-8 shrink-0" /> // Spacer to balance layout
      )}

      <div className="flex-1 max-w-[80%] mx-auto relative overflow-hidden flex items-center justify-center min-h-[24px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 220, damping: 24 },
              opacity: { duration: 0.2 },
            }}
            className="w-full text-center whitespace-normal break-words"
          >
            {currentAnnouncement.message}
          </motion.div>
        </AnimatePresence>
      </div>

      {announcements.length >= 2 ? (
        <button
          onClick={handleNext}
          className="p-1 hover:bg-white/10 rounded-full transition-colors focus:outline-none z-10 shrink-0"
          aria-label="Next announcement"
        >
          <HiChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/80 hover:text-white" />
        </button>
      ) : (
        <div className="w-6 sm:w-8 shrink-0" /> // Spacer to balance layout
      )}
    </div>
  );
};

export default AnnouncementBanner;
