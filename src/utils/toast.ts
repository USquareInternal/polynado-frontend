// src/utils/toast.ts
import Swal from 'sweetalert2';

const toastConfig = {
  toast: true,
  position: 'top-end' as const,
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast: HTMLElement) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
  customClass: {
    popup: 'swal-toast-popup',
  },
};

/**
 * Checks if an error is a user rejection from MetaMask
 * @param error - The error object from wagmi/ethers
 * @returns true if the error indicates user rejection
 */
export const isUserRejection = (error: any): boolean => {
  if (!error) return false;

  const errorMessage = String(error?.message || error?.shortMessage || '').toLowerCase();
  const errorName = String(error?.name || '').toLowerCase();
  const errorCode = error?.code;

  // Check for common rejection patterns
  const rejectionPatterns = [
    'user rejected',
    'user denied',
    'rejected',
    'denied',
    'user rejected the request',
    'user denied transaction',
    'user cancelled',
    'cancelled',
  ];

  // Check error message
  if (rejectionPatterns.some(pattern => errorMessage.includes(pattern))) {
    return true;
  }

  // Check error name
  if (rejectionPatterns.some(pattern => errorName.includes(pattern))) {
    return true;
  }

  // Check error code (4001 is MetaMask user rejection code)
  if (errorCode === 4001 || errorCode === '4001') {
    return true;
  }

  // Check for specific error types
  if (
    errorName.includes('userrejectedrequesterror') ||
    errorName.includes('actionrejectederror') ||
    errorName.includes('rejected')
  ) {
    return true;
  }

  return false;
};

/**
 * Shows a snackbar notification for transaction rejections
 */
export const showRejectionToast = () => {
  Swal.fire({
    ...toastConfig,
    icon: 'info',
    title: 'Transaction cancelled',
    text: 'You rejected the transaction in MetaMask.',
    iconColor: '#f59e0b',
  });
};

export const showSuccessToast = (message: string) => {
  Swal.fire({
    ...toastConfig,
    icon: 'success',
    title: message,
    iconColor: '#22c55e',
  });
};

export const showErrorToast = (message: string) => {
  Swal.fire({
    ...toastConfig,
    icon: 'error',
    title: message,
    iconColor: '#ef4444',
  });
};

export const showWarningToast = (message: string) => {
  Swal.fire({
    ...toastConfig,
    icon: 'warning',
    title: message,
    iconColor: '#f59e0b',
  });
};

