import { lazy, Suspense, useEffect, useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import Loader from './components/common/Loader';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import { AuthContext } from './context/AuthContext';
import { subscribeUserToPush, getNotificationPermissionState } from './utils/pushManager';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Auth pages
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const VerifyOTP = lazy(() => import('./pages/VerifyOTP'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

// Admin pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminLocations = lazy(() => import('./pages/admin/AdminLocations'));
const AdminTestimonials = lazy(() => import('./pages/admin/AdminTestimonials'));
const AdminGallery = lazy(() => import('./pages/admin/AdminGallery'));

const Contact = lazy(() => import('./pages/Contact'));
const Updates = lazy(() => import('./pages/Updates'));
const NotFound = lazy(() => import('./pages/NotFound'));

const App = () => {
  const { isAuthenticated, adminToken, isAdmin } = useContext(AuthContext);

  useEffect(() => {
    // Listen to Service Worker message events
    if ('serviceWorker' in navigator) {
      const handleSWMessage = (event) => {
        if (event.data && event.data.type === 'NAVIGATE') {
          window.location.href = event.data.url;
        }
      };
      navigator.serviceWorker.addEventListener('message', handleSWMessage);
      return () => navigator.serviceWorker.removeEventListener('message', handleSWMessage);
    }
  }, []);

  useEffect(() => {
    // Automatically trigger notification permission prompt when a user logs in
    const isUserLoggedIn = isAuthenticated || !!adminToken;
    if (isUserLoggedIn) {
      const permission = getNotificationPermissionState();
      if (permission === 'default') {
        const timer = setTimeout(() => {
          subscribeUserToPush(!!adminToken || isAdmin);
        }, 3000); // Trigger after 3 seconds for better loading flow
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, adminToken, isAdmin]);

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/updates" element={<Updates />} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Route>

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin/login" element={<AdminLogin />} />
        </Route>

        {/* Admin routes */}
        <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/locations" element={<AdminLocations />} />
          <Route path="/admin/testimonials" element={<AdminTestimonials />} />
          <Route path="/admin/gallery" element={<AdminGallery />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
