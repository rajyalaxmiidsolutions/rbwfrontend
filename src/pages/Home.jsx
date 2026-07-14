import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowRight, HiOutlineStar, HiOutlineTruck, HiOutlineCurrencyRupee, HiOutlineShieldCheck, HiOutlineCube } from 'react-icons/hi';
import ProductCard from '../components/shop/ProductCard';
import { getProducts, getCategories, getTestimonials } from '../services/api';
import { BUSINESS } from '../utils/constants';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const Home = () => {
  const [bestSellers, setBestSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [prodRes, catRes, testRes] = await Promise.all([
          getProducts({ limit: 8, sort: 'newest' }),
          getCategories(),
          getTestimonials(),
        ]);
        setBestSellers(prodRes.data.products);
        // Only show featured categories on homepage
        const featured = catRes.data.filter((cat) => cat.isFeatured);
        setCategories(featured.length > 0 ? featured : catRes.data.slice(0, 8));
        setTestimonials(testRes.data);
      } catch { /* silent */ }
    };
    load();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-burgundy overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-gold blur-3xl" />
          <div className="absolute bottom-20 left-20 w-72 h-72 rounded-full bg-white blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-36 lg:py-44 relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
              Rajyalaxmi Binding Works
              <br />
              And PaperMart
            </h1>
            <p className="mt-6 text-xl text-white/70 leading-relaxed">
              Online store for our wholesale customers.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-white text-burgundy px-10 py-4 rounded-xl font-semibold text-base hover:bg-white/90 transition-colors"
              >
                Browse Collection
                <HiOutlineArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 border border-white/30 text-white px-10 py-4 rounded-xl font-semibold text-base hover:bg-white/10 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Series */}
      {categories.length > 0 && (
        <section className="py-20 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeUp} className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text">Featured Series</h2>
              <p className="mt-4 text-lg text-gray-500">Explore our curated collection</p>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7">
              {categories.slice(0, 8).map((cat, i) => (
                <motion.div
                  key={cat._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <Link
                    to={`/shop?category=${cat._id}`}
                    className="group block bg-white rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300"
                  >
                    <div className="aspect-square bg-bg overflow-hidden">
                      <img
                        src={cat.image?.url || '/logo.png'}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-5 text-center">
                      <h3 className="text-base font-semibold text-text">{cat.name}</h3>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="py-20 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeUp} className="flex items-end justify-between mb-14">
              <div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text">Best Sellers</h2>
                <p className="mt-4 text-lg text-gray-500">Our most popular designs</p>
              </div>
              <Link to="/shop" className="hidden sm:inline-flex items-center gap-1 text-base font-medium text-burgundy hover:underline">
                View All <HiOutlineArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7">
              {bestSellers.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            <div className="mt-10 text-center sm:hidden">
              <Link to="/shop" className="inline-flex items-center gap-2 text-base font-medium text-burgundy">
                View All Products <HiOutlineArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text">Why Choose Us</h2>
            <p className="mt-4 text-lg text-gray-500">Trusted by wholesalers across Telugu States</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: HiOutlineStar, title: 'Exclusively for wholesale costumers', desc: 'we are offering an easy to use ecommerce store for our wholesale costumers' },
              { icon: HiOutlineCurrencyRupee, title: 'Wholesale Prices', desc: 'Best competitive pricing for bulk orders. Save more when you order more.' },
              { icon: HiOutlineTruck, title: 'Delivery all over telugu states', desc: 'we deliver wholesale orders all over the telugu states' },
              { icon: HiOutlineCube, title: 'Wide Range of Products', desc: 'we have a wide range of products for our costumers' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-border p-7 sm:p-9 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-burgundy/5 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <item.icon className="w-7 h-7 text-burgundy" />
                </div>
                <h3 className="text-lg font-semibold text-text mb-3">{item.title}</h3>
                <p className="text-base text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-20 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeUp} className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text">What Our Clients Say</h2>
              <p className="mt-4 text-lg text-gray-500">Trusted by hundreds of businesses</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.slice(0, 6).map((t, i) => (
                <motion.div
                  key={t._id || i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="bg-bg rounded-2xl p-7 sm:p-9 border border-border"
                >
                  <div className="flex gap-1 mb-5">
                    {[...Array(t.rating || 5)].map((_, j) => (
                      <HiOutlineStar key={j} className="w-5 h-5 text-gold fill-gold" />
                    ))}
                  </div>
                  <p className="text-base text-gray-600 leading-relaxed mb-6">"{t.text}"</p>
                  <div>
                    <p className="text-base font-semibold text-text">{t.name}</p>
                    {t.business && <p className="text-sm text-gray-400">{t.business}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact CTA */}
      <section className="py-20 sm:py-24 bg-burgundy relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-1/2 w-96 h-96 rounded-full bg-gold blur-3xl" />
        </div>
        <div className="max-w-3xl mx-auto px-4 text-center relative">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5">Ready to Order?</h2>
            <p className="text-lg text-white/70 mb-10">Get in touch for wholesale pricing and custom orders.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/shop" className="bg-white text-burgundy px-10 py-4 rounded-xl font-semibold text-base hover:bg-white/90 transition-colors">
                Browse Collection
              </Link>
              <Link to="/contact" className="border border-white/30 text-white px-10 py-4 rounded-xl font-semibold text-base hover:bg-white/10 transition-colors">
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
