// src/components/molecules/RewardCard.tsx
"use client";

import React, { useState } from 'react';

interface RewardCardProps {
  image: string;
  title: string;
  description: string;
}

const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzJEMkQyRCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Q0EzQUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZTwvdGV4dD48L3N2Zz4=';

export const RewardCard: React.FC<RewardCardProps> = ({ image, title, description }) => {
  const [imgSrc, setImgSrc] = useState(image);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(PLACEHOLDER_IMAGE);
    }
  };

  return (
    <div
      className="relative p-[1px] rounded-xl"
      style={{
        border: '1px solid',
        borderRadius: '16px',
        borderImageSource: 'linear-gradient(149.27deg, #E25D5F 0.73%, #D9D9D9 45.92%)',
        borderImageSlice: 1,
      }}
    >
      <div
        className="relative p-[1px] bg-[#0d0e10] rounded-xl"
        style={{
          border: '1px solid',
          borderRadius: '16px',
          borderImageSource: 'linear-gradient(149.27deg, #E25D5F 0.73%, rgba(217, 217, 217, 0) 45.92%)',
          borderImageSlice: 1,
        }}
      >
        {/* corner glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-[#DB7A23A3] blur-[50px]" />
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#DB7A23A3] blur-[50px]" />
        </div>

        <div className="relative overflow-hidden px-5 pt-7 pb-6">
          <div className="flex justify-center">
            <div
              className="rounded-[10px] overflow-hidden shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
              style={{ width: 320, height: 230.85043334960938 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgSrc}
                alt={title}
                onError={handleError}
                className="w-full h-full object-cover"
                style={{ borderRadius: 10 }}
              />
            </div>
          </div>

          <div className="mt-6 text-left">
            <h4 className="text-2xl font-semibold text-white mb-2">{title}</h4>
            <p className="text-lg text-white/90 leading-snug">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
