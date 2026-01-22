// src/components/molecules/ReferralLinkInput.tsx
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/atoms/Button';

interface ReferralLinkInputProps {
  referralLink: string;
  onCopy?: () => void;
}

export const ReferralLinkInput: React.FC<ReferralLinkInputProps> = ({ referralLink, onCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-semibold text-white">Your Unique Referral Link</h3>
      <p className="text-sm text-gray-400">
        Share this link with friends and earn rewards when they mint NFTs or subscribe
      </p>
      <div className="flex gap-2 mt-2">
        <input
          type="text"
          value={referralLink}
          readOnly
          className="flex-1 p-3 bg-[#1E2022] border border-gray-500/50 rounded-lg text-white text-sm focus:outline-none focus:border-orange-400"
        />
        <Button
          variant="secondary"
          onClick={handleCopy}
          className="px-6 whitespace-nowrap relative overflow-hidden cursor-pointer"
          style={{
            backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%), linear-gradient(135deg, #F5A366 0%, #E88A33 25%, #D16300 60%, #B8540A 100%)',
            color: "white",
            border: "none",
            boxShadow: '3px 4px 5px 0px rgba(219, 122, 35, 0.31), -2px -2px 6px 0px rgba(255, 255, 255, 0.2) inset, 0px 1px 3px 0px rgba(255, 255, 255, 0.3) inset',
            position: 'relative',
          }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
    </div>
  );
};
