'use client';
import React, { useState } from 'react';
import { CloseOutlined, CopyOutlined, ShareAltOutlined } from '@ant-design/icons';
import { showSuccessToast } from '@/utils/toast';

interface InviteLinksModalProps {
  userName: string;
  referralId: string;
  avatarUrl: string;
  onClose: () => void;
}

const InviteLinksModal: React.FC<InviteLinksModalProps> = ({
  userName,
  referralId,
  avatarUrl,
  onClose,
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Get base URL for referral link
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://polynado.com'; // Fallback
  };

  const referralLink = `${getBaseUrl()}/signup?ref=${referralId}`;

  const copyToClipboard = async (text: string, type: 'id' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'id') {
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
      showSuccessToast('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl border border-gray-700/50"
        style={{ backgroundColor: '#1E2022' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <img
              src={avatarUrl}
              alt={userName}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-semibold text-white">{userName}</p>
              <p className="text-sm text-orange-400">ID: {referralId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
          >
            <CloseOutlined className="text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div className="flex items-center gap-2">
            <ShareAltOutlined className="text-orange-400 text-xl" />
            <h2 className="text-xl font-bold text-white">Invite links</h2>
          </div>

          {/* My ID Section */}
          <div className="space-y-2">
            <h3 className="font-semibold text-white">My ID:</h3>
            <p className="text-sm text-gray-400">
              Share your ID directly with others. They can enter it manually during signup.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={referralId}
                readOnly
                className="flex-1 px-4 py-3 rounded-lg border border-gray-700/50 bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                }}
              />
              <button
                onClick={() => copyToClipboard(referralId, 'id')}
                className="px-4 py-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 transition-colors"
              >
                <CopyOutlined className={`text-gray-400 ${copiedId ? 'text-green-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Referral Link Section */}
          <div className="space-y-2">
            <h3 className="font-semibold text-white">Referral Link:</h3>
            <p className="text-sm text-gray-400">
              Share this link to refer new users. They will be automatically linked to your account.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 px-4 py-3 rounded-lg border border-gray-700/50 bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 text-sm"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                }}
              />
              <button
                onClick={() => copyToClipboard(referralLink, 'link')}
                className="px-4 py-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 transition-colors"
              >
                <CopyOutlined className={`text-gray-400 ${copiedLink ? 'text-green-500' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteLinksModal;

