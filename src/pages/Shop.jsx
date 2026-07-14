import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineSearch, HiOutlineAdjustments, HiOutlineX } from 'react-icons/hi';
import ProductCard from '../components/shop/ProductCard';
import Loader from '../components/common/Loader';
import { getProducts, getCategories } from '../services/api';
import useDebounce from '../hooks/useDebounce';
import AnnouncementBanner from '../components/common/AnnouncementBanner';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 12, sort };
        if (debouncedSearch) params.search = debouncedSearch;
        if (category) params.category = category;

        const { data } = await getProducts(params);
        setProducts(data.products);
        setTotalPages(data.totalPages);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [debouncedSearch, category, sort, page]);

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (sort !== 'newest') params.sort = sort;
    if (page > 1) params.page = page;
    setSearchParams(params);
  }, [search, category, sort, page]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-burgundy py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-bold text-white"
          >
            Shop Collection
          </motion.h1>
          <p className="mt-2 text-white/60 text-sm">Explore our premium wedding invitation cards</p>
        </div>
      </div>

      <AnnouncementBanner page="Shop" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex-1 relative">
            <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search products..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy transition-colors"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="px-4 py-3 bg-white border border-border rounded-xl text-sm focus:outline-none focus:border-burgundy appearance-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-border rounded-xl text-sm hover:bg-bg transition-colors lg:hidden"
          >
            <HiOutlineAdjustments className="w-4 h-4" />
            Filters
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters — Desktop */}
          <div className={`${showFilters ? 'fixed inset-0 z-50 bg-black/20' : 'hidden'} lg:block lg:static lg:bg-transparent lg:z-auto`}>
            <div className={`${showFilters ? 'fixed right-0 top-0 h-full w-72 bg-white p-6 shadow-xl overflow-y-auto' : ''} lg:w-56 lg:shrink-0 lg:static lg:shadow-none lg:p-0`}>
              {showFilters && (
                <div className="flex justify-between items-center mb-6 lg:hidden">
                  <h3 className="font-semibold">Filters</h3>
                  <button onClick={() => setShowFilters(false)}><HiOutlineX className="w-5 h-5" /></button>
                </div>
              )}
              <div className="bg-white rounded-xl border border-border p-5 lg:sticky lg:top-24">
                <h3 className="text-sm font-semibold text-text mb-4">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => { setCategory(''); setPage(1); setShowFilters(false); }}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!category ? 'bg-burgundy text-white' : 'text-text hover:bg-bg'}`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => { setCategory(cat._id); setPage(1); setShowFilters(false); }}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${category === cat._id ? 'bg-burgundy text-white' : 'text-text hover:bg-bg'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <Loader />
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg">No products found</p>
                <p className="text-gray-300 text-sm mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${p === page ? 'bg-burgundy text-white' : 'bg-white border border-border text-text hover:bg-bg'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
