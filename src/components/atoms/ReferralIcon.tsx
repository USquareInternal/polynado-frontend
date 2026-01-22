// src/components/atoms/ReferralIcon.tsx
import React from 'react';
import {
  TeamOutlined,
  ShoppingOutlined,
  GiftOutlined,
  DollarCircleOutlined,
} from '@ant-design/icons';

export type ReferralIconType = 'users' | 'mints' | 'subscriptions' | 'rewards';

interface ReferralIconProps {
  type: ReferralIconType;
  className?: string;
}

// Simple icon wrapper to keep icon choices consistent across stat cards
export const ReferralIcon: React.FC<ReferralIconProps> = ({ type, className = '' }) => {
  const iconClasses = `text-orange-400 ${className}`;
  const size = 22;

  switch (type) {
    case 'users':
      return <TeamOutlined className={iconClasses} style={{ fontSize: size }} />;
    case 'mints':
      return <ShoppingOutlined className={iconClasses} style={{ fontSize: size }} />;
    case 'subscriptions':
      return <GiftOutlined className={iconClasses} style={{ fontSize: size }} />;
    case 'rewards':
      return <DollarCircleOutlined className={iconClasses} style={{ fontSize: size }} />;
    default:
      return null;
  }
};
