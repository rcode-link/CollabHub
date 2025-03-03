/**
 * Notification Manager - Handles browser focus detection and notification display
 * Shows browser notifications only when the tab is not focused
 */

class NotificationManager {
  constructor() {
    this.isWindowFocused = true;
    this.serviceWorkerRegistration = null;
    this.hasNotificationPermission = false;
    this.initialize();
  }

  async initialize() {
    // Add event listeners for window focus/blur
    window.addEventListener('focus', () => this.handleWindowFocus());
    window.addEventListener('blur', () => this.handleWindowBlur());
    
    // Set initial focus state based on document.hasFocus()
    this.isWindowFocused = document.hasFocus();
    
    // Check notification permission
    this.hasNotificationPermission = await this.checkNotificationPermission();
    
    // Get service worker registration
    if ('serviceWorker' in navigator) {
      try {
        this.serviceWorkerRegistration = await navigator.serviceWorker.ready;
        console.log('Notification manager initialized with service worker');
      } catch (error) {
        console.error('Error getting service worker registration:', error);
      }
    }
  }

  handleWindowFocus() {
    this.isWindowFocused = true;
    console.log('Window is now focused');
  }

  handleWindowBlur() {
    this.isWindowFocused = false;
    console.log('Window is now blurred');
  }

  async checkNotificationPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    
    return false;
  }

  /**
   * Show a notification based on window focus
   * If window is focused, it will not show a browser notification
   * If window is not focused, it will show a browser notification
   * 
   * @param {Object} data - Notification data
   * @param {string} data.title - Notification title
   * @param {string} data.body - Notification body
   * @param {string} data.icon - Notification icon URL (optional)
   * @param {string} data.url - URL to open when notification is clicked (optional)
   * @returns {boolean} - Whether the notification was shown
   */
  async showNotification(data) {
    // Always dispatch event for in-app notification handling regardless of focus
    // This allows the app to show in-app notifications when focused
    const event = new CustomEvent('app-notification', { detail: data });
    window.dispatchEvent(event);
    
    // If window is focused, don't show browser notification
    if (this.isWindowFocused) {
      console.log('Window is focused, not showing browser notification');
      return false;
    }
    
    // If no notification permission, don't show browser notification
    if (!this.hasNotificationPermission) {
      console.log('No notification permission, not showing browser notification');
      return false;
    }
    
    // If we have a service worker, use it to show the notification
    if (this.serviceWorkerRegistration) {
      try {
        // Use the service worker to show the notification
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'notification',
            notification: data
          });
          console.log('Notification sent to service worker');
          return true;
        } else {
          // Fallback to showing notification directly if controller isn't available
          await this.showDirectNotification(data);
          return true;
        }
      } catch (error) {
        console.error('Error showing notification through service worker:', error);
        
        // Fallback to showing notification directly
        await this.showDirectNotification(data);
        return true;
      }
    } else {
      // No service worker, show notification directly
      await this.showDirectNotification(data);
      return true;
    }
  }
  
  /**
   * Show a notification directly (without service worker)
   * This is a fallback method when service worker is not available
   * 
   * @param {Object} data - Notification data
   */
  async showDirectNotification(data) {
    if (!('Notification' in window)) {
      return;
    }
    
    try {
      const notification = new Notification(data.title || 'CollabHub Notification', {
        body: data.body || 'New notification',
        icon: data.icon || '/logo.png',
        badge: '/logo.png',
        data: {
          url: data.url || '/'
        }
      });
      
      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault();
        if (data.url) {
          window.open(data.url, '_blank');
        }
        notification.close();
      };
      
      console.log('Direct notification shown');
    } catch (error) {
      console.error('Error showing direct notification:', error);
    }
  }
}

// Create singleton instance
const notificationManager = new NotificationManager();

export default notificationManager;