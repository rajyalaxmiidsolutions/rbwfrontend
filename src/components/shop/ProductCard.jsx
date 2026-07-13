import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineShoppingCart } from 'react-icons/hi';
import { formatPrice } from '../../utils/helpers';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    addToCart(product._id, product.moq);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Link to={`/product/${product._id}`} className="group block">
        <div className="bg-white rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300">
          {/* Image */}
          <div className="aspect-[4/5] overflow-hidden bg-bg relative">
            <img
              src={product.images?.[0]?.url || '/logo.png'}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            {/* Quick Add */}
            <button
              onClick={handleAddToCart}
              className="absolute bottom-3 right-3 bg-burgundy text-white p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-burgundy-600 shadow-lg"
            >
              <HiOutlineShoppingCart className="w-4 h-4" />
            </button>
          </div>

          {/* Info */}
          <div className="p-4">
            {product.category && (
              <p className="text-[11px] font-medium uppercase tracking-wider text-burgundy/70 mb-1">
                {product.category.name}
              </p>
            )}
            <h3 className="text-sm font-medium text-text line-clamp-1 mb-2">
              {product.name}
            </h3>
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold text-burgundy">
                {formatPrice(product.price)}
              </p>
              <p className="text-[11px] text-gray-400">
                MOQ: {product.moq}
              </p>
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-border/50 flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${product.stock > 0 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
