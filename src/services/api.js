import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://rbwbackend.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  // Use admin token if URL contains 'admin', user token for everything else
  const isAdminRoute = config.url?.includes('admin');
  const token = isAdminRoute
    ? localStorage.getItem('rbw_admin_token')
    : localStorage.getItem('rbw_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Client-side query cache and request deduplicator (Expires in 30 seconds)
const getCache = {};
const cachedGet = (url, config) => {
  const cacheKey = url + (config ? JSON.stringify(config) : '');
  const cached = getCache[cacheKey];
  const now = Date.now();

  if (cached && (now - cached.time < 30000)) {
    return cached.promise;
  }

  const promise = API.get(url, config);
  getCache[cacheKey] = { promise, time: now };
  return promise;
};

// Auth
export const signup = (data) => API.post('/auth/signup', data);
export const verifyOTP = (data) => API.post('/auth/verify-otp', data);
export const resendOTP = (data) => API.post('/auth/resend-otp', data);
export const login = (data) => API.post('/auth/login', data);
export const logout = () => API.post('/auth/logout');
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);
export const resetPassword = (data) => API.post('/auth/reset-password', data);

// Web Push Notifications
export const subscribePush = (subscription) => API.post('/push/subscribe', { subscription });
export const subscribeAdminPush = (subscription) => API.post('/push/admin-subscribe', { subscription });
export const unsubscribePush = (endpoint) => API.post('/push/unsubscribe', { endpoint });
export const adminSendCustomNotification = (data) => API.post('/push/admin/send-custom', data);
export const adminGetPushStats = () => API.get('/push/admin/stats');

// Products
export const getProducts = (params) => API.get('/products', { params });
export const getProduct = (id) => API.get(`/products/${id}`);
export const getRelatedProducts = (id) => API.get(`/products/related/${id}`);

// Categories
export const getCategories = () => cachedGet('/categories');

// Locations (public — for checkout)
export const getLocations = () => cachedGet('/locations');

// Testimonials (public — for homepage)
export const getTestimonials = () => cachedGet('/testimonials');

// Cart
export const getCart = () => API.get('/cart');
export const addToCart = (data) => API.post('/cart', data);
export const removeFromCart = (productId) => API.delete(`/cart/${productId}`);
export const clearCart = () => API.delete('/cart');

// Orders
export const placeOrder = (data) => API.post('/orders', data);
export const verifyPayment = (data) => API.post('/orders/verify-payment', data);
export const getOrders = () => API.get('/orders');
export const getOrder = (id) => API.get(`/orders/${id}`);

// User
export const getProfile = () => API.get('/users/profile');
export const updateProfile = (data) => API.put('/users/profile', data);
export const addAddress = (data) => API.post('/users/addresses', data);
export const deleteAddress = (id) => API.delete(`/users/addresses/${id}`);
export const submitTestimonial = (data) => API.post('/users/testimonials', data);

// Admin
export const adminLogin = (data) => API.post('/admin/login', data);
export const seedAdmin = () => API.post('/admin/seed');
export const getDashboard = (params) => API.get('/admin/dashboard', { params });

// Admin Products
export const adminGetProducts = (params) => API.get('/admin/products', { params });
export const adminCreateProduct = (data) => API.post('/admin/products', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const adminUpdateProduct = (id, data) => API.put(`/admin/products/${id}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const adminDeleteProduct = (id) => API.delete(`/admin/products/${id}`);

// Admin Categories
export const adminCreateCategory = (data) => API.post('/admin/categories', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const adminUpdateCategory = (id, data) => API.put(`/admin/categories/${id}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const adminDeleteCategory = (id) => API.delete(`/admin/categories/${id}`);
export const adminToggleFeaturedCategory = (id) => API.put(`/admin/categories/${id}/featured`);

// Admin Locations
export const adminGetLocations = () => API.get('/admin/locations');
export const adminCreateLocation = (data) => API.post('/admin/locations', data);
export const adminUpdateLocation = (id, data) => API.put(`/admin/locations/${id}`, data);
export const adminDeleteLocation = (id) => API.delete(`/admin/locations/${id}`);

// Admin Testimonials
export const adminGetTestimonials = () => API.get('/admin/testimonials');
export const adminCreateTestimonial = (data) => API.post('/admin/testimonials', data);
export const adminUpdateTestimonial = (id, data) => API.put(`/admin/testimonials/${id}`, data);
export const adminDeleteTestimonial = (id) => API.delete(`/admin/testimonials/${id}`);

// Admin Orders
export const adminGetOrders = (params) => API.get('/admin/orders', { params });
export const adminUpdateOrderStatus = (id, data) => API.put(`/admin/orders/${id}`, data);
export const adminUpdateDeliveryInfo = (id, data) => API.put(`/admin/orders/${id}/delivery-info`, data);
export const adminDeliverAndNotifyOrder = (id, data) => API.put(`/admin/orders/${id}/deliver-and-notify`, data);

// Admin Gallery
export const adminUploadGalleryPhoto = (data) => API.post('/admin/gallery', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const adminDeleteGalleryPhoto = (id) => API.delete(`/admin/gallery/${id}`);

// Public Gallery
export const getGalleryPhotos = () => API.get('/gallery');

// Admin Customers
export const adminGetCustomers = (params) => API.get('/admin/customers', { params });
export const adminCreateCustomer = (data) => API.post('/admin/customers', data);
export const adminUpdateCustomer = (id, data) => API.put(`/admin/customers/${id}`, data);
export const adminDeleteCustomer = (id) => API.delete(`/admin/customers/${id}`);
export const adminGetCustomerOrders = (id) => API.get(`/admin/customers/${id}/orders`);

// Announcements
export const getActiveAnnouncements = () => cachedGet('/announcements/active');
export const getPublicAnnouncements = () => API.get('/announcements/public-all');
export const adminGetAnnouncements = () => API.get('/admin/announcements');
export const adminCreateAnnouncement = (data) => API.post('/admin/announcements', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const adminUpdateAnnouncement = (id, data) => API.put(`/admin/announcements/${id}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const adminDeleteAnnouncement = (id) => API.delete(`/admin/announcements/${id}`);

export default API;
