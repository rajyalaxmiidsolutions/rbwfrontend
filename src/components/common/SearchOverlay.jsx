import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineSearch, HiOutlineX, HiOutlineArrowRight } from 'react-icons/hi';
import { getProducts } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import useDebounce from '../../hooks/useDebounce';
import useAuth from '../../hooks/useAuth';

const SearchOverlay = ({ isOpen, onClose }) => {
  const { isAuthenticated } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!isOpen) {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      return;
    }
    const search = async () => {
      setLoading(true);
      try {
        const { data } = await getProducts({ search: debouncedQuery, limit: 6 });
        setResults(data.products);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    search();
  }, [debouncedQuery]);

  const handleProductClick = (id) => {
    onClose();
    navigate(`/product/${id}`);
  };

  const handleViewAll = () => {
    onClose();
    navigate(`/shop?search=${encodeURIComponent(query)}`);
  };

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  return (
    <div
      className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-all duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        className={`max-w-2xl mx-4 sm:mx-auto mt-20 sm:mt-28 transition-all duration-300 transform ${
          isOpen ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-8 opacity-0 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center gap-4 px-6 py-5 border-b border-border">
            <HiOutlineSearch className="w-6 h-6 text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 text-lg text-text bg-transparent outline-none placeholder:text-gray-400"
            />
            <button onClick={onClose} className="p-1.5 hover:bg-bg rounded-lg transition-colors">
              <HiOutlineX className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Results */}
          {(loading || results.length > 0 || (query.length >= 2 && !loading)) && (
            <div className="max-h-[400px] overflow-y-auto">
              {loading && (
                <div className="px-6 py-8 text-center text-gray-400 text-base">Searching...</div>
              )}
              {!loading && results.length === 0 && query.length >= 2 && (
                <div className="px-6 py-8 text-center text-gray-400 text-base">No products found for "{query}"</div>
              )}
              {!loading && results.length > 0 && (
                <div>
                  {results.map((product) => (
                    <button
                      key={product._id}
                      onClick={() => handleProductClick(product._id)}
                      className="w-full flex items-center gap-4 px-6 py-4 hover:bg-bg transition-colors text-left"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-bg shrink-0">
                        <img
                          src={product.images?.[0]?.url || '/logo.png'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-medium text-text truncate">{product.name}</p>
                        <p className="text-sm text-gray-400">{product.category?.name}</p>
                      </div>
                      {isAuthenticated && (
                        <p className="text-base font-semibold text-burgundy shrink-0">{formatPrice(product.price)}</p>
                      )}
                    </button>
                  ))}
                  <button
                    onClick={handleViewAll}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 text-base font-medium text-burgundy hover:bg-burgundy/5 transition-colors border-t border-border"
                  >
                    View all results <HiOutlineArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Hint */}
          {query.length < 2 && (
            <div className="px-6 py-6 text-center text-gray-400 text-sm">
              Type at least 2 characters to search
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
