import { useState, useEffect } from 'react';
import { getGalleryPhotos } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineX, HiChevronLeft, HiChevronRight, HiOutlinePhotograph } from 'react-icons/hi';

const Gallery = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePhotoIndex, setActivePhotoIndex] = useState(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const { data } = await getGalleryPhotos();
        setPhotos(data);
      } catch (err) {
        console.error('Failed to fetch gallery photos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, []);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activePhotoIndex === null) return;
      if (e.key === 'Escape') setActivePhotoIndex(null);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhotoIndex, photos]);

  const handleNext = () => {
    setActivePhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setActivePhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-gradient-to-b from-white via-bg to-white">
      {/* Luxury Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-xs uppercase tracking-[0.3em] font-semibold text-burgundy/80 bg-burgundy/5 px-4 py-1.5 rounded-full inline-block mb-4">
            Visual Experience
          </span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-text tracking-wide leading-tight">
            Our Business Gallery
          </h1>
          <div className="w-16 h-[2px] bg-burgundy/40 mx-auto my-6"></div>
          <p className="max-w-xl mx-auto text-gray-500 font-light text-base md:text-lg leading-relaxed">
            Take a visual tour through our craft. Explore our printing workspace, high-quality binding machinery, and our collection of premium wedding cards.
          </p>
        </motion.div>
      </div>

      {/* Gallery Photos Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          // Shimmer loading state
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-video w-full rounded-2xl bg-gray-200 animate-pulse"></div>
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-border max-w-lg mx-auto">
            <HiOutlinePhotograph className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text mb-1">Gallery is Empty</h3>
            <p className="text-gray-400 text-sm">Photos will be uploaded soon. Please check back later.</p>
          </div>
        ) : (
          // Luxury Art/Masonry Grid
          <motion.div 
            layout
            className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8"
          >
            {photos.map((photo, index) => (
              <motion.div
                key={photo._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="break-inside-avoid relative overflow-hidden rounded-2xl bg-white border border-border group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500"
                onClick={() => setActivePhotoIndex(index)}
              >
                {/* Photo Element */}
                <div className="overflow-hidden bg-bg relative">
                  <img
                    src={photo.image.url}
                    alt={photo.title || 'RBW Gallery'}
                    className="w-full h-auto object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  {/* Luxury Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 md:p-8">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-burgundy-light/95 mb-1.5 block">
                      Rajyalaxmi Binding
                    </span>
                    {photo.title && (
                      <h3 className="text-white font-serif text-lg md:text-xl tracking-wide mb-2">
                        {photo.title}
                      </h3>
                    )}
                    {photo.description && (
                      <p className="text-white/70 font-light text-xs md:text-sm line-clamp-2 leading-relaxed">
                        {photo.description}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activePhotoIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center select-none"
            onClick={() => setActivePhotoIndex(null)}
          >
            {/* Close Button */}
            <button
              onClick={() => setActivePhotoIndex(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-white/80 hover:text-white hover:bg-white/10 transition-colors z-50 focus:outline-none"
            >
              <HiOutlineX className="w-6 h-6" />
            </button>

            {/* Left Control */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-6 p-3 rounded-full bg-white/5 text-white/80 hover:text-white hover:bg-white/10 transition-colors z-50 focus:outline-none"
            >
              <HiChevronLeft className="w-6 h-6" />
            </button>

            {/* Content Container */}
            <div 
              className="max-w-5xl max-h-[85vh] w-full px-6 flex flex-col items-center justify-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                key={photos[activePhotoIndex]._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                src={photos[activePhotoIndex].image.url}
                alt={photos[activePhotoIndex].title || 'RBW Gallery Item'}
                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl"
              />

              {/* Photo Details (Below image) */}
              <div className="text-center mt-6 max-w-xl text-white">
                {photos[activePhotoIndex].title && (
                  <h2 className="font-serif text-xl md:text-2xl tracking-wide mb-2 text-white">
                    {photos[activePhotoIndex].title}
                  </h2>
                )}
                {photos[activePhotoIndex].description && (
                  <p className="text-white/60 font-light text-xs md:text-sm leading-relaxed">
                    {photos[activePhotoIndex].description}
                  </p>
                )}
              </div>
            </div>

            {/* Right Control */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-6 p-3 rounded-full bg-white/5 text-white/80 hover:text-white hover:bg-white/10 transition-colors z-50 focus:outline-none"
            >
              <HiChevronRight className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
