'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserOutlined, LinkOutlined, BarChartOutlined, SettingOutlined, LogoutOutlined, DownOutlined } from '@ant-design/icons';
import { getUserData, removeToken } from '@/services/authService';
import InviteLinksModal from './InviteLinksModal';

interface UserDropdownProps {
  userEmail: string;
  referralId: string;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ userEmail, referralId }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get display name from email
  const getDisplayName = (email: string): string => {
    const username = email.split('@')[0];
    return username.charAt(0).toUpperCase() + username.slice(1);
  };

  // Generate avatar URL based on user email (using UI Avatars service)
  const getAvatarUrl = (email: string): string => {
    const name = getDisplayName(email);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=F5A366&color=fff&size=128&bold=true`;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    removeToken();
    setIsOpen(false);
    router.push('/login');
  };

  const handleInviteClick = () => {
    setIsOpen(false);
    setShowInviteModal(true);
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* User Profile Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg  hover:bg-gray-50 transition-colors"
        >
          <img
            src={getAvatarUrl(userEmail)}
            alt={getDisplayName(userEmail)}
            className="w-8 h-8 rounded-full"
          />
          <DownOutlined className="text-gray-600 text-xs" />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className="absolute right-0 mt-2 w-64 rounded-lg shadow-xl border border-gray-700/50 overflow-hidden z-50"
            style={{
              backgroundColor: '#1E2022',
            }}
          >
            {/* User Info Section */}
            <div className="px-4 py-3 border-b border-gray-700/50">
              <div className="flex items-center gap-3">
                <img
                  src={getAvatarUrl(userEmail)}
                  alt={getDisplayName(userEmail)}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="text-white font-medium">{getDisplayName(userEmail)}</p>
                  <p className="text-orange-400 text-sm">ID: {referralId}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={handleInviteClick}
                className="w-full px-4 py-3 flex items-center gap-3 text-white hover:bg-gray-800/50 transition-colors"
              >
                <LinkOutlined className="text-orange-400" />
                <span>Invite Links</span>
              </button>

        

              <button
                className="w-full px-4 py-3 flex items-center gap-3 text-white hover:bg-gray-800/50 transition-colors"
              >
                <SettingOutlined className="text-orange-400" />
                <span>Settings</span>
              </button>

              {/* Separator */}
              <div className="border-t border-gray-700/50 my-2"></div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 flex items-center gap-3 text-red-400 hover:bg-gray-800/50 transition-colors"
              >
                <LogoutOutlined className="text-red-400" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invite Links Modal */}
      {showInviteModal && (
        <InviteLinksModal
          userName={getDisplayName(userEmail)}
          referralId={referralId}
          avatarUrl={getAvatarUrl(userEmail)}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </>
  );
};

export default UserDropdown;

