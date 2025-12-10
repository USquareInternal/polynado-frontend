// src/components/molecules/QRCodeSection.tsx
"use client";

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/atoms/Button';
import { DownloadOutlined } from '@ant-design/icons';

interface QRCodeSectionProps {
  referralLink: string;
  onDownload?: () => void;
}

export const QRCodeSection: React.FC<QRCodeSectionProps> = ({ referralLink, onDownload }) => {
  const qrRef = useRef<SVGSVGElement>(null);

  const handleDownload = () => {
    if (qrRef.current) {
      const svg = qrRef.current;
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = 'referral-qr-code.png';
        downloadLink.href = pngFile;
        downloadLink.click();
        onDownload?.();
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }
  };

  return (
    <div className="flex flex-col gap-3 items-center text-center">
      <h3 className="text-lg font-semibold text-white">Scan QR Code</h3>
      <p className="text-sm text-gray-300">
        Share this QR code on social media, presentations, or printed materials
      </p>
      <div className="flex flex-col items-center gap-3 mt-2">
        <div className="bg-white p-3 rounded-lg shadow-[0_6px_18px_rgba(0,0,0,0.35)]">
          <QRCodeSVG ref={qrRef} value={referralLink} size={128} level="H" includeMargin={false} />
        </div>
        <Button
          variant="secondary"
          onClick={handleDownload}
          className="px-6 whitespace-nowrap font-semibold border-none text-white cursor-pointer hover:cursor-pointer"
          style={{
            backgroundImage:
              'linear-gradient(0deg, #D16300, #D16300), radial-gradient(63.11% 63.11% at 31.97% 19.67%, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0) 69.79%, rgba(255, 255, 255, 0) 100%)',
          }}
        >
          Download QR code
        </Button>
      </div>
    </div>
  );
};
