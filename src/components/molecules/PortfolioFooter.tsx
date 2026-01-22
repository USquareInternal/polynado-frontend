'use client';
import React from 'react';
import { DownloadOutlined, ReloadOutlined, ShareAltOutlined } from '@ant-design/icons';

export const PortfolioFooter: React.FC = () => {
  return (
    <div className="space-y-6 xl:space-y-8">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 xl:gap-4 justify-center">
        <button
          className="flex items-center gap-2 px-4 xl:px-6 py-2 xl:py-3 text-white rounded-lg font-medium transition-all text-sm xl:text-base border-none relative overflow-hidden"
          style={{
            backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%), linear-gradient(135deg, #F5A366 0%, #E88A33 25%, #D16300 60%, #B8540A 100%)',
            backgroundColor: 'transparent',
            boxShadow: '3px 4px 5px 0px rgba(219, 122, 35, 0.31), -2px -2px 6px 0px rgba(255, 255, 255, 0.2) inset, 0px 1px 3px 0px rgba(255, 255, 255, 0.3) inset',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = 'brightness(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = 'brightness(1)';
          }}
        >
          <DownloadOutlined />
          Export to CSV
        </button>
        <button
          className="flex items-center gap-2 px-4 xl:px-6 py-2 xl:py-3 text-white rounded-lg font-medium transition-all text-sm xl:text-base border-none relative overflow-hidden"
          style={{
            backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%), linear-gradient(135deg, #F5A366 0%, #E88A33 25%, #D16300 60%, #B8540A 100%)',
            backgroundColor: 'transparent',
            boxShadow: '3px 4px 5px 0px rgba(219, 122, 35, 0.31), -2px -2px 6px 0px rgba(255, 255, 255, 0.2) inset, 0px 1px 3px 0px rgba(255, 255, 255, 0.3) inset',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = 'brightness(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = 'brightness(1)';
          }}
        >
          <ReloadOutlined />
          Refresh Data
        </button>
        <button
          className="flex items-center gap-2 px-4 xl:px-6 py-2 xl:py-3 text-white rounded-lg font-medium transition-all text-sm xl:text-base border-none relative overflow-hidden"
          style={{
            backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%), linear-gradient(135deg, #F5A366 0%, #E88A33 25%, #D16300 60%, #B8540A 100%)',
            backgroundColor: 'transparent',
            boxShadow: '3px 4px 5px 0px rgba(219, 122, 35, 0.31), -2px -2px 6px 0px rgba(255, 255, 255, 0.2) inset, 0px 1px 3px 0px rgba(255, 255, 255, 0.3) inset',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = 'brightness(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = 'brightness(1)';
          }}
        >
          <ShareAltOutlined />
          Share My Portfolio
        </button>
      </div>
      
     
    </div>
  );
};

