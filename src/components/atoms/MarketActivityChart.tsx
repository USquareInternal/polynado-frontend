// src/components/atoms/MarketActivityChart.tsx
"use client";
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

// Chart data type
interface ChartDataPoint {
    time: string;
    zelensky: number;
    trump: number;
}

// Generate sample data for the chart matching the image pattern
const generateChartData = (): ChartDataPoint[] => {
    const data: ChartDataPoint[] = [];
    // Main time points to display on X-axis
    const mainTimePoints = ['19:00', '19:10', '19:20', '19:30', '19:40'];
    // Add intermediate points for smoother curves (not displayed on axis)
    const allTimePoints = ['19:00', '19:02', '19:05', '19:08', '19:10', '19:12', '19:15', '19:18', '19:20', '19:22', '19:25', '19:28', '19:30', '19:32', '19:35', '19:38', '19:40'];
    
    // Yellow line (ZELENSKY): starts at ~75%, drops sharply to ~25%, rises to ~50%, fluctuates, drops to ~25%, rises to ~40%
    const zelenskyValues = [0.75, 0.50, 0.30, 0.25, 0.25, 0.30, 0.40, 0.48, 0.50, 0.48, 0.50, 0.45, 0.30, 0.25, 0.25, 0.30, 0.40];
    // Red line (TRUMP): starts at ~22%, peaks at ~75%, dips to ~50%, fluctuates, peaks at ~75%, declines to ~60%
    const trumpValues = [0.22, 0.40, 0.60, 0.70, 0.75, 0.70, 0.60, 0.52, 0.50, 0.52, 0.50, 0.55, 0.70, 0.75, 0.75, 0.70, 0.60];
    
    allTimePoints.forEach((time, index) => {
        data.push({
            time,
            zelensky: zelenskyValues[index],
            trump: trumpValues[index],
        });
    });
    
    return data;
};

export const MarketActivityChart: React.FC = () => {
    const [data] = useState(generateChartData());
    const [selectedTimeRange, setSelectedTimeRange] = useState('1d');
    
    const timeRanges = ['1d', '1w', '1m'];
    
    // Current percentages from data
    const zelenskyPercentage = (data[data.length - 1].zelensky * 100).toFixed(2);
    const trumpPercentage = (data[data.length - 1].trump * 100).toFixed(2);

    return (
        <div className="w-full h-full overflow-hidden">
            <div className="bg-[#1E2022] rounded-lg p-3 border border-gray-700/50 h-full flex flex-col overflow-hidden">
                {/* Legend and Time Range Selectors */}
                <div className="flex justify-between items-center mb-3 flex-shrink-0">
                    {/* Legend */}
                    <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: '#eab308' }}></div>
                            <span className="text-white text-xs sm:text-sm whitespace-nowrap">ZELENSKY</span>
                            <span className="text-gray-400 text-xs sm:text-sm whitespace-nowrap">{zelenskyPercentage}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: '#dc2626' }}></div>
                            <span className="text-white text-xs sm:text-sm whitespace-nowrap">TRUMP</span>
                            <span className="text-gray-400 text-xs sm:text-sm whitespace-nowrap">{trumpPercentage}%</span>
                        </div>
                    </div>
                    
                    {/* Time Range Selectors */}
                    <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
                        {timeRanges.map((range) => (
                            <button
                                key={range}
                                onClick={() => setSelectedTimeRange(range)}
                                className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                                    selectedTimeRange === range
                                        ? 'bg-[#F5A366] text-white'
                                        : 'bg-[#1E2022] text-gray-400 hover:bg-gray-800/50 border border-gray-700/50'
                                }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chart */}
                <div className="flex-1 overflow-hidden" style={{ minHeight: '210px', height: '260px' }}>
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={data} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis 
                                dataKey="time" 
                                stroke="#888"
                                tick={{ fill: '#888', fontSize: 10 }}
                                axisLine={{ stroke: '#555' }}
                                tickFormatter={(value) => {
                                    // Only show main time points: 19:00, 19:10, 19:20, 19:30, 19:40
                                    const mainTimes = ['19:00', '19:10', '19:20', '19:30', '19:40'];
                                    return mainTimes.includes(value) ? value : '';
                                }}
                            />
                            <YAxis 
                                stroke="#888"
                                tick={{ fill: '#888', fontSize: 10 }}
                                axisLine={{ stroke: '#555' }}
                                domain={[0, 1]}
                                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                                ticks={[0, 0.25, 0.50, 0.75, 1]}
                                width={40}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#1E2022', 
                                    border: '1px solid rgba(245, 163, 102, 0.3)',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    fontSize: '12px'
                                }}
                                labelStyle={{ color: '#F5A366', fontSize: '12px' }}
                                formatter={(value: number | undefined) => {
                                    if (value === undefined) return 'N/A';
                                    return `${(value * 100).toFixed(2)}%`;
                                }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="zelensky" 
                                stroke="#eab308" 
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4, fill: '#eab308' }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="trump" 
                                stroke="#dc2626" 
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4, fill: '#dc2626' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

