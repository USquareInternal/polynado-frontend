'use client';
import React, { useState } from 'react';
import { SearchOutlined, FilterOutlined, DownOutlined } from '@ant-design/icons';

const categories = [
  'All',
  'Politics',
  'Box Office',
  'Mentions',
  'Elections',
  'Earnings',
  'Health',
  'Sports',

];

export const SearchAndFilters: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <section className="mt-8 xl:mt-12 fullhd:mt-16 mb-6 xl:mb-8 fullhd:mb-10">
      {/* Search Bar */}
      <div className="flex items-center gap-3 mb-4 xl:mb-6 fullhd:mb-8">
        <div className="flex-1 relative">
          <SearchOutlined className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            placeholder="Search ID, Order and User"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 xl:py-3.5 fullhd:py-4 rounded-lg border border-gray-700 placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
            style={{
              fontFamily: 'Poppins',
              fontWeight: 500,
              fontSize: '18.85px',
              lineHeight: '16px',
              letterSpacing: '0%',
              background: '#000000',
              color: '#D9D9D9',
            }}
          />
        </div>
        
        {/* Filter and Sort Icons */}
        <button className="p-3 xl:p-3.5 fullhd:p-4 rounded-lg bg-[#000000] border border-gray-700 text-gray-400 hover:text-white hover:border-orange-500/50 transition-all">
          <FilterOutlined className="text-lg xl:text-xl" />
        </button>
        <button className="p-3 xl:p-3.5 fullhd:p-4 rounded-lg bg-[#000000] border border-gray-700 text-gray-400 hover:text-white hover:border-orange-500/50 transition-all">
          <DownOutlined className="text-lg xl:text-xl" />
        </button>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 flex flex-wrap gap-2 xl:gap-3 fullhd:gap-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 xl:px-5 fullhd:px-6 py-2 xl:py-2.5 fullhd:py-3 font-medium text-sm xl:text-base fullhd:text-lg transition-all ${
                selectedCategory === category
                  ? 'bg-[#D9D9D9] text-[#1E2022]'
                  : 'bg-[#000000] border border-[#D9D9D9] text-[#D9D9D9] hover:border-[#D9D9D9]/80'
              }`}
              style={{
                borderRadius: '12px',
              }}
            >
              {category}
            </button>
          ))}
        </div>
        {/* Spacer matching the width of FilterOutlined and DownOutlined buttons */}
        {/* <div className="flex gap-3">
          <div className="w-12 xl:w-14 fullhd:w-16"></div>
          <div className="w-12 xl:w-14 fullhd:w-16"></div>
        </div> */}
      </div>
    </section>
  );
};

