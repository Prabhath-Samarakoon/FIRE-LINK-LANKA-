// Notification System for User Feedback
export const NotificationTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export const showNotification = (message, type = NotificationTypes.INFO, duration = 5000) => {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 translate-x-full`;
  
  // Set colors based on type
  const colors = {
    [NotificationTypes.SUCCESS]: 'bg-green-500 text-white',
    [NotificationTypes.ERROR]: 'bg-red-500 text-white',
    [NotificationTypes.WARNING]: 'bg-yellow-500 text-black',
    [NotificationTypes.INFO]: 'bg-blue-500 text-white'
  };
  
  notification.className += ` ${colors[type]}`;
  
  // Add icon based on type
  const icons = {
    [NotificationTypes.SUCCESS]: '✅',
    [NotificationTypes.ERROR]: '❌',
    [NotificationTypes.WARNING]: '⚠️',
    [NotificationTypes.INFO]: 'ℹ️'
  };
  
  notification.innerHTML = `
    <div class="flex items-center">
      <span class="text-lg mr-2">${icons[type]}</span>
      <span class="flex-1">${message}</span>
      <button class="ml-2 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
        ✕
      </button>
    </div>
  `;
  
  // Add to DOM
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.classList.remove('translate-x-full');
  }, 100);
  
  // Auto remove
  setTimeout(() => {
    notification.classList.add('translate-x-full');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, duration);
};

// Convenience functions
export const showSuccess = (message) => showNotification(message, NotificationTypes.SUCCESS);
export const showError = (message) => showNotification(message, NotificationTypes.ERROR);
export const showWarning = (message) => showNotification(message, NotificationTypes.WARNING);
export const showInfo = (message) => showNotification(message, NotificationTypes.INFO);

// API Error Handler
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  let message = defaultMessage;
  
  if (error.message) {
    message = error.message;
  } else if (error.response?.data?.message) {
    message = error.response.data.message;
  } else if (error.response?.status) {
    message = `Server error: ${error.response.status}`;
  }
  
  showError(message);
  return message;
};

// Success Handler
export const handleApiSuccess = (message = 'Operation completed successfully') => {
  showSuccess(message);
};
