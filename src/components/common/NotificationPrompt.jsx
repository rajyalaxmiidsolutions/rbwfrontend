import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { subscribeUserToPush, getNotificationPermissionState } from '../../utils/pushManager';
import { toast } from 'react-hot-toast';

const NotificationPrompt = () => {
  const { token, adminToken, isAuthenticated, isAdmin } = useContext(AuthContext);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Only show to authenticated users (customer or admin)
    const isUserLoggedIn = isAuthenticated || !!adminToken;
    if (!isUserLoggedIn) {
      setShowPrompt(false);
      return;
    }

    const permission = getNotificationPermissionState();
    
    // Check if browser supports push and permissions are at default state
    const supportsPush = 'serviceWorker' in navigator && 'PushManager' in window;
    const isDismissed = localStorage.getItem('rbw_push_prompt_dismissed') === 'true';

    if (supportsPush && permission === 'default' && !isDismissed) {
      // Show prompt after a short delay for better UX
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [token, adminToken, isAuthenticated]);

  const handleEnable = async () => {
    const isUserAdmin = !!adminToken || isAdmin;
    const success = await subscribeUserToPush(isUserAdmin);
    
    if (success) {
      toast.success('Notifications enabled successfully!');
    } else {
      toast.error('Failed to enable notifications. Please check your browser settings.');
    }
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('rbw_push_prompt_dismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white border border-gray-150 shadow-2xl rounded-2xl p-5 transform transition-all duration-300 ease-out hover:scale-[1.02] flex flex-col gap-4">
      <div className="flex gap-3 items-start">
        <div className="flex-shrink-0 bg-[#f9ebeb] p-3 rounded-xl text-[#6D0F1A]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-[15px]">Stay Updated!</h3>
          <p className="text-gray-500 text-xs mt-1 leading-relaxed">
            Enable web notifications to receive real-time updates for orders, deliveries, and new announcements.
          </p>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 text-xs font-medium">
        <button 
          onClick={handleDismiss} 
          className="px-4 py-2 text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition duration-200"
        >
          Later
        </button>
        <button 
          onClick={handleEnable} 
          className="px-4 py-2 bg-[#6D0F1A] hover:bg-[#520b13] text-white rounded-xl transition duration-200 shadow-md shadow-red-900/10"
        >
          Enable
        </button>
      </div>
    </div>
  );
};

export default NotificationPrompt;
