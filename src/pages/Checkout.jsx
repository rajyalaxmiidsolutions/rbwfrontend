import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineCheck } from 'react-icons/hi';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';
import { placeOrder, verifyPayment, getLocations } from '../services/api';
import { formatPrice } from '../utils/helpers';
import { INDIAN_STATES } from '../utils/constants';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [locations, setLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState('');

  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    businessName: user?.businessName || '',
    gstNumber: user?.gstNumber || '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    if (items.length === 0 && !orderPlaced) navigate('/cart');
  }, [items]);

  // Load locations
  useEffect(() => {
    getLocations().then((res) => setLocations(res.data)).catch(() => {});
  }, []);

  // Pre-fill from saved addresses
  useEffect(() => {
    if (user?.addresses?.length > 0) {
      const addr = user.addresses[0];
      setForm((f) => ({ ...f, street: addr.street, city: addr.city, state: addr.state, pincode: addr.pincode }));
    }
  }, [user]);

  // Auto-select location ID if prefilled city matches a location name
  useEffect(() => {
    if (locations.length > 0 && form.city) {
      const found = locations.find((l) => l.name.toLowerCase() === form.city.toLowerCase());
      if (found && !selectedLocationId) {
        setSelectedLocationId(found._id);
      }
    }
  }, [locations, form.city, selectedLocationId]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const selectedLocation = locations.find((l) => l._id === selectedLocationId);
  const shippingCharge = selectedLocation?.shippingCharge || 0;
  const grandTotal = cartTotal + shippingCharge;

  const loadScript = (src) => {
    return new Promise((resolve) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.email || !form.street || !form.city || !form.state || !form.pincode) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!selectedLocationId) {
      toast.error('Please select a shipping location');
      return;
    }
    setLoading(true);

    try {
      const { data } = await placeOrder({
        shippingAddress: form,
        paymentMethod,
        locationId: selectedLocationId,
      });

      if (paymentMethod === 'Razorpay') {
        // Load Razorpay SDK script
        const isLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
        if (!isLoaded) {
          toast.error('Razorpay SDK failed to load. Are you online?');
          setLoading(false);
          return;
        }

        const options = {
          key: 'rzp_test_TA7Xt2VkDXNTPc',
          amount: data.razorpayOrder.amount,
          currency: data.razorpayOrder.currency,
          name: 'Rajyalaxmi Binding Works',
          description: 'Order Payment',
          image: '/logo.png',
          order_id: data.razorpayOrder.id,
          handler: async (response) => {
            setLoading(true);
            try {
              const verifyRes = await verifyPayment({
                orderId: data.order._id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              setOrderPlaced(verifyRes.data.order);
              await clearCart();
              toast.success('Payment successful! Order confirmed.');
            } catch (err) {
              toast.error(err.response?.data?.message || 'Payment verification failed');
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: form.fullName,
            email: form.email,
            contact: form.phone,
          },
          config: {
            display: {
              blocks: {
                upi_block: {
                  name: 'Pay via UPI',
                  instruments: [{ method: 'upi' }],
                },
              },
              sequence: ['block.upi_block'],
              preferences: {
                show_default_blocks: true,
              },
            },
          },
          theme: {
            color: '#6D0F1A',
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (response) => {
          toast.error(response.error.description || 'Payment Failed');
        });
        rzp.open();
      } else {
        // COD — order placed directly
        setOrderPlaced(data.order);
        await clearCart();
        toast.success('Order placed successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  // Order Success
  if (orderPlaced) {
    return (
      <div className="min-h-screen py-10">
        <div className="max-w-lg mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-border p-8 sm:p-10 text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <HiOutlineCheck className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-text mb-3">
              {paymentMethod === 'Razorpay' ? 'Payment Successful!' : 'Order Placed!'}
            </h2>
            <p className="text-base text-gray-500 mb-2">
              Your order has been received and confirmed.
            </p>
            <p className="text-sm text-gray-400 mb-2">
              Payment: {paymentMethod === 'Razorpay' ? 'Online (Razorpay)' : 'Cash on Delivery'}
            </p>
            {selectedLocation && (
              <p className="text-sm text-gray-400 mb-2">
                Shipping to: {selectedLocation.name} — {formatPrice(shippingCharge)}
              </p>
            )}
            <p className="text-3xl font-bold text-burgundy mb-6">{formatPrice(grandTotal)}</p>
            <button
              onClick={() => navigate('/dashboard?tab=orders')}
              className="w-full bg-burgundy text-white py-3.5 rounded-xl font-semibold text-base hover:bg-burgundy-600 transition-colors"
            >
              View My Orders
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl font-bold text-text mb-10"
        >
          Checkout
        </motion.h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Details */}
              <div className="bg-white rounded-2xl border border-border p-7">
                <h3 className="text-lg font-semibold text-text mb-5">Customer Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Full Name *</label>
                    <input name="fullName" value={form.fullName} onChange={onChange} required className="w-full px-5 py-3.5 bg-bg border border-border rounded-xl text-base focus:outline-none focus:border-burgundy" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Phone Number *</label>
                    <input name="phone" value={form.phone} onChange={onChange} required className="w-full px-5 py-3.5 bg-bg border border-border rounded-xl text-base focus:outline-none focus:border-burgundy" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Email *</label>
                    <input name="email" type="email" value={form.email} onChange={onChange} required className="w-full px-5 py-3.5 bg-bg border border-border rounded-xl text-base focus:outline-none focus:border-burgundy" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Business Name</label>
                    <input name="businessName" value={form.businessName} onChange={onChange} className="w-full px-5 py-3.5 bg-bg border border-border rounded-xl text-base focus:outline-none focus:border-burgundy" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-2">GST Number (Optional)</label>
                    <input name="gstNumber" value={form.gstNumber} onChange={onChange} className="w-full px-5 py-3.5 bg-bg border border-border rounded-xl text-base focus:outline-none focus:border-burgundy" />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-2xl border border-border p-7">
                <h3 className="text-lg font-semibold text-text mb-5">Shipping Address</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-2">Street Address *</label>
                    <input name="street" value={form.street} onChange={onChange} required className="w-full px-5 py-3.5 bg-bg border border-border rounded-xl text-base focus:outline-none focus:border-burgundy" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Shipping Location *</label>
                    <select
                      name="location"
                      value={selectedLocationId}
                      onChange={(e) => {
                        const locId = e.target.value;
                        setSelectedLocationId(locId);
                        const selectedLoc = locations.find((l) => l._id === locId);
                        setForm((f) => ({ ...f, city: selectedLoc ? selectedLoc.name : '' }));
                      }}
                      required
                      className="w-full px-5 py-3.5 bg-bg border border-border rounded-xl text-base focus:outline-none focus:border-burgundy appearance-none"
                    >
                      <option value="">Select Shipping Location</option>
                      {locations.map((loc) => (
                        <option key={loc._id} value={loc._id}>
                          {loc.name} (+{formatPrice(loc.shippingCharge)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">State *</label>
                    <select name="state" value={form.state} onChange={onChange} required className="w-full px-5 py-3.5 bg-bg border border-border rounded-xl text-base focus:outline-none focus:border-burgundy appearance-none">
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Pincode *</label>
                    <input name="pincode" value={form.pincode} onChange={onChange} required pattern="[0-9]{6}" className="w-full px-5 py-3.5 bg-bg border border-border rounded-xl text-base focus:outline-none focus:border-burgundy" />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl border border-border p-7">
                <h3 className="text-lg font-semibold text-text mb-5">Payment Method</h3>
                <div className="space-y-3">
                  <label className={`flex items-center gap-4 px-5 py-4 rounded-xl border cursor-pointer transition-colors ${paymentMethod === 'Razorpay' ? 'border-burgundy bg-burgundy/5' : 'border-border hover:bg-bg'}`}>
                    <input type="radio" name="payment" value="Razorpay" checked={paymentMethod === 'Razorpay'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-burgundy w-4 h-4" />
                    <div className="flex flex-col">
                      <span className="text-base font-medium">Pay Online</span>
                      <span className="text-sm text-gray-400">UPI, Cards, NetBanking & Wallets via Razorpay</span>
                    </div>
                  </label>
                  <label className={`flex items-center gap-4 px-5 py-4 rounded-xl border cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-burgundy bg-burgundy/5' : 'border-border hover:bg-bg'}`}>
                    <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-burgundy w-4 h-4" />
                    <div className="flex flex-col">
                      <span className="text-base font-medium">Cash on Delivery</span>
                      <span className="text-sm text-gray-400">Pay when your order arrives</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white rounded-2xl border border-border p-7 sticky top-24">
                <h3 className="text-lg font-semibold text-text mb-5">Order Summary</h3>
                <div className="space-y-3 mb-5">
                  {items.map((item) => (
                    <div key={item.product?._id} className="flex justify-between text-base">
                      <span className="text-gray-500 line-clamp-1 flex-1 mr-2">{item.product?.name} × {item.quantity}</span>
                      <span className="font-medium shrink-0">{formatPrice((item.product?.price || 0) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-4 space-y-3 text-base">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Product Total</span>
                    <span className="font-medium">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping</span>
                    {selectedLocation ? (
                      <span className="font-medium">{formatPrice(shippingCharge)}</span>
                    ) : (
                      <span className="text-sm text-amber-600 font-medium">Select location</span>
                    )}
                  </div>
                  {selectedLocation && (
                    <p className="text-sm text-gray-400">📍 {selectedLocation.name}</p>
                  )}
                  <div className="border-t border-border pt-4 flex justify-between text-lg">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-burgundy">{formatPrice(grandTotal)}</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full bg-burgundy text-white py-3.5 rounded-xl font-semibold text-base hover:bg-burgundy-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processing...' : paymentMethod === 'Razorpay' ? `Pay ${formatPrice(grandTotal)}` : `Place Order (COD) — ${formatPrice(grandTotal)}`}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
