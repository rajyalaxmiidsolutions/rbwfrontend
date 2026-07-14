import { subscribePush, subscribeAdminPush, unsubscribePush } from '../services/api';

const VAPID_PUBLIC_KEY = 'BBOx9sabpQsUZYHzD_IuRZMiYDdiWrXiLOZrwlINngLuXFqh0NaIgE4ZgVJpXslkMQCFqoWjkgmrIf5gbqaow1Q';

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Registers the Service Worker.
 */
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration.scope);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  console.warn('Service Worker is not supported in this browser.');
  return null;
}

/**
 * Requests push permission and subscribes the user.
 * @param {boolean} isAdmin - Whether the logged-in user is an administrator.
 */
export async function subscribeUserToPush(isAdmin = false) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push messaging is not supported in this browser.');
    return false;
  }

  try {
    // Wait for the service worker to be ready
    const registration = await navigator.serviceWorker.ready;

    // Get current subscription
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Convert VAPID key
      const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

      // Subscribe to the push server
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
    }

    // Save subscription to the backend database
    const subscriptionJSON = subscription.toJSON();

    if (isAdmin) {
      await subscribeAdminPush(subscriptionJSON);
    } else {
      await subscribePush(subscriptionJSON);
    }

    console.log('User successfully subscribed to push notifications.');
    return true;
  } catch (error) {
    console.error('Failed to subscribe user to push notifications:', error);
    return false;
  }
}

/**
 * Unsubscribes the user from push notifications.
 */
export async function unsubscribeUserFromPush() {
  if (!('serviceWorker' in navigator)) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Unsubscribe from push service
      await subscription.unsubscribe();

      // Notify backend to remove from database
      await unsubscribePush(subscription.endpoint);
      console.log('User successfully unsubscribed from push notifications.');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
    return false;
  }
}

/**
 * Checks if the user has already granted notification permissions.
 */
export function getNotificationPermissionState() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}
