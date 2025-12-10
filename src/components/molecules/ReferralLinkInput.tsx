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
          className="px-6 whitespace-nowrap"
          style={{ backgroundColor: '#f97316', color: 'white', borderColor: '#f97316' }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
    </div>
  );
};
