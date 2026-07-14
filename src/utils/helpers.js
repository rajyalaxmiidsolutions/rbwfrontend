export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const getStatusColor = (status) => {
  const colors = {
    'Pending Payment': 'bg-amber-100 text-amber-800',
    Paid: 'bg-blue-100 text-blue-800',
    Confirmed: 'bg-indigo-100 text-indigo-800',
    Shipped: 'bg-purple-100 text-purple-800',
    Delivered: 'bg-green-100 text-green-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const truncate = (str, len = 60) => {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
};

export const optimizeCloudinaryUrl = (url, width) => {
  if (!url || typeof url !== 'string') return url || '';
  if (!url.includes('res.cloudinary.com')) return url;

  const uploadIndex = url.indexOf('image/upload');
  if (uploadIndex === -1) return url;

  const insertIndex = uploadIndex + 'image/upload'.length;
  const prefix = url.slice(0, insertIndex);
  const suffix = url.slice(insertIndex);

  const transformations = width ? `/f_auto,q_auto,w_${width}` : '/f_auto,q_auto';
  return prefix + transformations + suffix;
};
