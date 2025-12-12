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

