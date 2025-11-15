// Toast Notification Utility
// Simple, lightweight toast notification system

class Toast {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    // Create toast container if it doesn't exist
    if (!document.getElementById('toast-container')) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
      document.body.appendChild(this.container);
    } else {
      this.container = document.getElementById('toast-container');
    }
  }

  show(message, type = 'success', duration = 3000) {
    const toast = document.createElement('div');
    const id = `toast-${Date.now()}`;
    toast.id = id;
    
    // Base classes
    const baseClasses = 'min-w-[300px] max-w-md px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in';
    
    // Type-specific styling
    const typeClasses = {
      success: 'bg-green-500 text-white',
      error: 'bg-red-500 text-white',
      warning: 'bg-yellow-500 text-white',
      info: 'bg-blue-500 text-white'
    };

    // Icon based on type
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    toast.className = `${baseClasses} ${typeClasses[type] || typeClasses.success}`;
    
    toast.innerHTML = `
      <span class="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-white bg-opacity-20 text-lg font-bold">
        ${icons[type] || icons.success}
      </span>
      <span class="flex-1 text-sm font-medium">${message}</span>
      <button onclick="this.parentElement.remove()" class="flex-shrink-0 text-white hover:text-gray-200">
        <span class="sr-only">Close</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    `;

    // Add animation styles if not already present
    if (!document.getElementById('toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slide-out {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animate-slide-out {
          animation: slide-out 0.3s ease-out;
        }
      `;
      document.head.appendChild(style);
    }

    this.container.appendChild(toast);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        toast.classList.add('animate-slide-out');
        setTimeout(() => {
          if (toast.parentElement) {
            toast.remove();
          }
        }, 300);
      }, duration);
    }

    return toast;
  }

  success(message, duration = 3000) {
    return this.show(message, 'success', duration);
  }

  error(message, duration = 5000) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration = 4000) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration = 3000) {
    return this.show(message, 'info', duration);
  }
}

// Create global instance
window.toast = new Toast();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Toast;
}

