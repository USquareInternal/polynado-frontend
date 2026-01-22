'use client';
import React, { useEffect, useState } from 'react';
import { CloseOutlined, WarningOutlined } from '@ant-design/icons';

interface SideSnackbarProps {
  visible: boolean;
  message: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  duration?: number;
  onClose?: () => void;
}

export const SideSnackbar: React.FC<SideSnackbarProps> = ({
  visible,
  message,
  type = 'error',
  duration = 0, // 0 means don't auto-close
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    error: {
      bg: 'bg-red-500/90',
      border: 'border-red-400',
      icon: <WarningOutlined className="text-red-200" />,
    },
    warning: {
      bg: 'bg-yellow-500/90',
      border: 'border-yellow-400',
      icon: <WarningOutlined className="text-yellow-200" />,
    },
    info: {
      bg: 'bg-blue-500/90',
      border: 'border-blue-400',
      icon: <WarningOutlined className="text-blue-200" />,
    },
    success: {
      bg: 'bg-green-500/90',
      border: 'border-green-400',
      icon: <WarningOutlined className="text-green-200" />,
    },
  };

  const styles = typeStyles[type];

  return (
    <div
      className={`fixed right-4 top-20 z-[10000] min-w-[320px] max-w-[420px] rounded-lg ${styles.bg} border ${styles.border} shadow-2xl transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      style={{
        animation: isVisible ? 'slideInRight 0.3s ease-out' : 'slideOutRight 0.3s ease-in',
      }}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>
        <div className="flex-1">
          <p className="text-white text-sm font-medium leading-relaxed">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
        >
          <CloseOutlined className="text-sm" />
        </button>
      </div>
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

