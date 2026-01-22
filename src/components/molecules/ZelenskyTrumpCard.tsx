// src/components/molecules/ZelenskyTrumpCard.tsx
import React from 'react';

export interface ZelenskyTrumpCardProps {
  title: string; // "$ZELENSKY" or "$TRUMP"
  letter: 'Z' | 'T';
  marketCap: string; // e.g., "$69,654,896 MC"
  yesPrice: string; // e.g., "40.69¢"
  noPrice: string; // e.g., "59.31¢"
}

export const ZelenskyTrumpCard: React.FC<ZelenskyTrumpCardProps> = ({
  title,
  letter,
  marketCap,
  yesPrice,
  noPrice,
}) => {
  return (
    <div className="flex flex-col items-center justify-between bg-[#1E2022] rounded-lg p-4 border border-gray-700/50 h-full">
      {/* Title */}
      <div className="w-full mb-2">
        <h3 className="text-white text-sm sm:text-base font-semibold">{title}</h3>
      </div>

      {/* Circle with Letter - Reduced size */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-20 md:h-20 rounded-full bg-gray-800 flex items-center justify-center mb-2 flex-shrink-0">
        <span className="text-white text-2xl sm:text-3xl md:text-3xl font-bold">{letter}</span>
      </div>

      {/* Market Cap */}
      <div className="mb-3 flex items-center">
        <span className="text-white text-sm sm:text-base font-medium">{marketCap}</span>
      </div>

      {/* Yes/No Buttons - Vertical Layout - Compact */}
      <div className="flex flex-col gap-2 w-full mt-auto">
        <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-lg transition-colors flex flex-col items-center justify-center">
          <div className="text-xs font-semibold">Yes</div>
          <div className="text-sm font-bold">{yesPrice}</div>
        </button>
        <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-3 rounded-lg transition-colors flex flex-col items-center justify-center">
          <div className="text-xs font-semibold">No</div>
          <div className="text-sm font-bold">{noPrice}</div>
        </button>
      </div>
    </div>
  );
};

