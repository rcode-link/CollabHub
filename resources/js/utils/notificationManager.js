/**
 * Simplified Notification Manager - Handles browser focus detection
 * Used for determining when to show toast notifications
 */

class NotificationManager {
  constructor() {
    this.isWindowFocused = true;
    this.initialize();
  }

  initialize() {
    // Add event listeners for window focus/blur
    window.addEventListener('focus', () => this.handleWindowFocus());
    window.addEventListener('blur', () => this.handleWindowBlur());
    
    // Set initial focus state based on document.hasFocus()
    this.isWindowFocused = document.hasFocus();
  }

  handleWindowFocus() {
    this.isWindowFocused = true;
    console.log('Window is now focused');
  }

  handleWindowBlur() {
    this.isWindowFocused = false;
    console.log('Window is now blurred');
  }

  /**
   * Check if window is focused
   * @returns {boolean} - Whether the window is focused
   */
  isWindowFocused() {
    return this.isWindowFocused;
  }
}

// Create singleton instance
const notificationManager = new NotificationManager();

export default notificationManager;