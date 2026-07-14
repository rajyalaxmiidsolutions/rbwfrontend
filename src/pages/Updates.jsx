import { useState, useEffect } from 'react';
import { getGalleryPhotos, getPublicAnnouncements } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineX, HiChevronLeft, HiChevronRight, HiOutlinePhotograph, HiOutlineVolumeUp } from 'react-icons/hi';
import { optimizeCloudinaryUrl } from '../utils/helpers';

const Updates = () => {
  // Announcements (Notice Board) State
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [showAllAnnouncements, setShowAllAnnouncements] = useState(false);

  // Gallery State
  const [photos, setPhotos] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [activePhotoIndex, setActivePhotoIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch public announcements
      try {
        const { data } = await getPublicAnnouncements();
        setAnnouncements(data);
      } catch (err) {
        console.error('Failed to fetch announcements for notice board:', err);
      } finally {
        setAnnouncementsLoading(false);
      }

      // Fetch gallery photos
      try {
        const { data } = await getGalleryPhotos();
        setPhotos(data);
      } catch (err) {
        console.error('Failed to fetch gallery photos:', err);
      } finally {
        setGalleryLoading(false);
      }
    };
    fetchData();
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

  const displayedAnnouncements = showAllAnnouncements 
    ? announcements 
    : announcements.slice(0, 5);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-gradient-to-b from-white via-bg to-white">
      {/* Page Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-xs uppercase tracking-[0.3em] font-semibold text-burgundy bg-burgundy/5 px-4 py-1.5 rounded-full inline-block mb-4">
            LATEST UPDATES
          </span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-text tracking-wide leading-tight">
            Notice Board
          </h1>
          <div className="w-16 h-[2px] bg-burgundy/40 mx-auto my-6"></div>
          <p className="max-w-xl mx-auto text-gray-500 font-light text-base md:text-lg leading-relaxed">
            Stay updated with our latest collections, business notices and important information.
          </p>
        </motion.div>
      </div>

      {/* Notice Board Timeline Section */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        {announcementsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-border">
            <HiOutlineVolumeUp className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No announcements posted on the notice board.</p>
          </div>
        ) : (
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-border shadow-sm">
            <div className="relative border-l-2 border-burgundy/25 pl-6 sm:pl-8 space-y-8 py-2">
              {displayedAnnouncements.map((ann, index) => (
                <motion.div
                  key={ann._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="relative group"
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 bg-burgundy rounded-full border-4 border-white shadow-sm transition-transform duration-300 group-hover:scale-125" />
                  
                  {/* Content */}
                  <div>
                    <span className="text-xs font-semibold text-burgundy/80 bg-burgundy/5 px-2.5 py-1 rounded-md inline-block mb-2">
                      {formatDate(ann.startDate || ann.createdAt)}
                    </span>
                    <p className="text-base sm:text-lg text-text font-medium leading-relaxed break-words whitespace-pre-line">
                      {ann.message}
                    </p>
                    {ann.image?.url && (
                      <div className="mt-4 max-w-lg rounded-xl overflow-hidden border border-border bg-bg/50 shadow-sm">
                        <img 
                          src={optimizeCloudinaryUrl(ann.image.url, 600)} 
                          alt="Update Attachment" 
                          className="w-full h-auto max-h-[320px] object-contain"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Toggle Button */}
            {announcements.length > 5 && (
              <div className="mt-8 text-center border-t border-border pt-6">
                <button
                  onClick={() => setShowAllAnnouncements(!showAllAnnouncements)}
                  className="text-sm font-semibold text-burgundy hover:text-burgundy/80 transition-colors inline-flex items-center gap-1 focus:outline-none"
                >
                  {showAllAnnouncements ? 'Show Less' : 'View All Announcements'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Visual Separation / Section Divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-4 text-xs font-serif uppercase tracking-[0.2em] text-gray-400">
            Business Gallery
          </span>
          <div className="flex-grow border-t border-border"></div>
        </div>
      </div>

      {/* Business Gallery Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {galleryLoading ? (
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
          /* Responsive Layout logic based on photo count */
          <div className="w-full">
            {photos.length === 1 ? (
              /* 1 Image: centered */
              <div className="flex justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-2xl w-full overflow-hidden rounded-2xl bg-white border border-border group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500"
                  onClick={() => setActivePhotoIndex(0)}
                >
                  <div className="overflow-hidden bg-bg relative aspect-video sm:aspect-auto">
                    <img
                      src={optimizeCloudinaryUrl(photos[0].image.url, 1000)}
                      alt={photos[0].title || 'RBW Gallery'}
                      className="w-full h-auto max-h-[60vh] object-cover mx-auto transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 sm:p-8">
                      <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-burgundy-light/95 mb-1.5 block">
                        Rajyalaxmi Binding
                      </span>
                      {photos[0].title && (
                        <h3 className="text-white font-serif text-lg md:text-xl tracking-wide mb-2">
                          {photos[0].title}
                        </h3>
                      )}
                      {photos[0].description && (
                        <p className="text-white/70 font-light text-xs md:text-sm line-clamp-2 leading-relaxed">
                          {photos[0].description}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            ) : photos.length === 2 ? (
              /* 2 Images: Balanced 2-column layout */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {photos.map((photo, index) => (
                  <motion.div
                    key={photo._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="overflow-hidden rounded-2xl bg-white border border-border group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500"
                    onClick={() => setActivePhotoIndex(index)}
                  >
                    <div className="overflow-hidden bg-bg relative aspect-video sm:aspect-square md:aspect-video">
                      <img
                        src={optimizeCloudinaryUrl(photo.image.url, 600)}
                        alt={photo.title || 'RBW Gallery'}
                        className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-burgundy-light/95 mb-1.5 block">
                          Rajyalaxmi Binding
                        </span>
                        {photo.title && (
                          <h3 className="text-white font-serif text-base md:text-lg tracking-wide mb-1">
                            {photo.title}
                          </h3>
                        )}
                        {photo.description && (
                          <p className="text-white/70 font-light text-xs line-clamp-2 leading-relaxed">
                            {photo.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* 3 or more Images: Responsive Masonry Grid */
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
                    <div className="overflow-hidden bg-bg relative">
                      <img
                        src={optimizeCloudinaryUrl(photo.image.url, 500)}
                        alt={photo.title || 'RBW Gallery'}
                        className="w-full h-auto object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
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
                src={optimizeCloudinaryUrl(photos[activePhotoIndex].image.url, 1200)}
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

export default Updates;
