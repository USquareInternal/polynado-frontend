'use client';
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const categories: CategoryData[] = [
  { name: 'Culture', value: 34, color: '#06B6D4' }, // Light blue - largest
  { name: 'Sports', value: 32, color: '#F5A366' }, // Orange
  { name: 'Politics', value: 26, color: '#9333EA' }, // Purple
  { name: 'Crypto', value: 12, color: '#EF4444' }, // Red
];

// All categories for legend (including 0% ones)
const allCategories = [
  { name: 'Sports', value: 32, color: '#F5A366' },
  { name: 'Culture', value: 34, color: '#06B6D4' },
  { name: 'Politics', value: 26, color: '#9333EA' },
  { name: 'Crypto', value: 12, color: '#EF4444' },
  { name: 'Box Office', value: 0, color: '#6B7280' },
  { name: 'Others', value: 0, color: '#6B7280' },
];

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-col space-y-3 xl:space-y-4">
      {allCategories.map((category, index) => (
        <div key={index} className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: category.color }}
          />
          <span className="text-sm xl:text-base text-gray-300">
            {category.name} ({category.value}%)
          </span>
        </div>
      ))}
    </div>
  );
};

export const CategoryExposure: React.FC = () => {
  return (
    <div className="p-6 xl:p-8 fullhd:p-10">
      <h2 className="text-xl xl:text-2xl fullhd:text-3xl font-bold text-white mb-6 xl:mb-8">
        Category Exposure
      </h2>
      
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 xl:gap-8">
        {/* Donut Chart */}
        <div className="flex-shrink-0 w-full lg:w-auto flex items-center justify-center">
          <ResponsiveContainer width={250} height={250}>
            <PieChart>
              <Pie
                data={categories}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex-1 w-full lg:w-auto">
          <CustomLegend />
        </div>
      </div>
    </div>
  );
};
