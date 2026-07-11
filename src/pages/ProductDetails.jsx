import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineShoppingCart, HiMinus, HiPlus } from 'react-icons/hi';
import ProductCard from '../components/shop/ProductCard';
import Loader from '../components/common/Loader';
import { getProduct, getRelatedProducts } from '../services/api';
import { formatPrice } from '../utils/helpers';
import useAuth from '../hooks/useAuth';
import useCart from '../hooks/useCart';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [prodRes, relRes] = await Promise.all([
          getProduct(id),
          getRelatedProducts(id),
        ]);
        setProduct(prodRes.data);
        setRelated(relRes.data);
        setQuantity(prodRes.data.moq || 1);
        setSelectedImage(0);
      } catch {
        navigate('/shop');
      } finally {
        setLoading(false);
      }
    };
    load();
    window.scrollTo({ top: 0 });
  }, [id]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    addToCart(product._id, quantity);
  };

  if (loading) return <Loader />;
  if (!product) return null;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
        >
          {/* Image Gallery */}
          <div>
            <div
              className="aspect-square bg-white rounded-xl overflow-hidden border border-border cursor-zoom-in relative"
              onClick={() => setZoomed(!zoomed)}
            >
              <img
                src={product.images?.[selectedImage]?.url || '/logo.png'}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-300 ${zoomed ? 'scale-150' : ''}`}
              />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedImage(i); setZoomed(false); }}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-colors ${i === selectedImage ? 'border-burgundy' : 'border-border'}`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="py-2">
            {product.category && (
              <p className="text-xs font-medium uppercase tracking-wider text-burgundy/70 mb-2">
                {product.category.name}
              </p>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-text mb-4">{product.name}</h1>
            <p className="text-3xl font-bold text-burgundy mb-6">{formatPrice(product.price)}</p>

            <div className="space-y-4 mb-8">
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-bg rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Min. Order Qty</p>
                  <p className="text-sm font-semibold text-text">{product.moq} pieces</p>
                </div>
                <div className="bg-bg rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Stock</p>
                  <p className="text-sm font-semibold text-text">
                    {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-text">Quantity:</span>
              <div className="flex items-center border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(product.moq, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-bg transition-colors"
                >
                  <HiMinus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(product.moq, Number(e.target.value) || product.moq))}
                  className="w-16 h-10 text-center text-sm font-medium border-x border-border focus:outline-none"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-bg transition-colors"
                >
                  <HiPlus className="w-3 h-3" />
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock < 1}
              className="w-full flex items-center justify-center gap-2 bg-burgundy text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-burgundy-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <HiOutlineShoppingCart className="w-4 h-4" />
              {product.stock < 1 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </motion.div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl font-bold text-text mb-8">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
