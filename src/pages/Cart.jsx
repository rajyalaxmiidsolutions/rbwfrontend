import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiMinus, HiPlus, HiOutlineTrash, HiOutlineArrowRight, HiOutlineShoppingBag } from 'react-icons/hi';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';
import { formatPrice } from '../utils/helpers';
import Loader from '../components/common/Loader';

const Cart = () => {
  const { items, loading, cartTotal, updateQuantity, removeFromCart } = useCart();
  const { isAuthenticated } = useAuth();

  if (loading) return <Loader />;

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <HiOutlineShoppingBag className="w-16 h-16 text-gray-200 mb-4" />
        <h2 className="text-xl font-semibold text-text mb-2">Your Cart</h2>
        <p className="text-gray-400 mb-6 text-sm">Please login to view your cart</p>
        <Link to="/login" className="bg-burgundy text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-burgundy-600 transition-colors">
          Login
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <HiOutlineShoppingBag className="w-16 h-16 text-gray-200 mb-4" />
        <h2 className="text-xl font-semibold text-text mb-2">Your Cart is Empty</h2>
        <p className="text-gray-400 mb-6 text-sm">Looks like you haven't added anything yet</p>
        <Link to="/shop" className="bg-burgundy text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-burgundy-600 transition-colors">
          Browse Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl font-bold text-text mb-8"
        >
          Shopping Cart ({items.length})
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <motion.div
                key={item.product?._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-border p-4 flex gap-4"
              >
                <Link to={`/product/${item.product?._id}`} className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-bg shrink-0">
                  <img
                    src={item.product?.images?.[0]?.url || '/logo.png'}
                    alt={item.product?.name}
                    className="w-full h-full object-cover"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.product?._id}`} className="text-sm font-medium text-text hover:text-burgundy line-clamp-1">
                    {item.product?.name}
                  </Link>
                  <p className="text-sm font-semibold text-burgundy mt-1">{formatPrice(item.product?.price || 0)}</p>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.product._id, Math.max(item.product.moq, item.quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center hover:bg-bg transition-colors"
                      >
                        <HiMinus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (val >= item.product.moq) {
                            updateQuantity(item.product._id, val);
                          }
                        }}
                        onBlur={(e) => {
                          const val = Number(e.target.value);
                          if (!val || val < item.product.moq) {
                            updateQuantity(item.product._id, item.product.moq);
                          }
                        }}
                        className="w-12 h-8 text-center text-xs font-medium border-x border-border focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-transparent"
                      />
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-bg transition-colors"
                      >
                        <HiPlus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product._id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white rounded-xl border border-border p-6 sticky top-24">
              <h3 className="text-base font-semibold text-text mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">{formatPrice(cartTotal)}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between text-base">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-burgundy">{formatPrice(cartTotal)}</span>
                </div>
              </div>
              <Link
                to="/checkout"
                className="mt-6 w-full flex items-center justify-center gap-2 bg-burgundy text-white py-3 rounded-xl font-semibold text-sm hover:bg-burgundy-600 transition-colors"
              >
                Checkout <HiOutlineArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
