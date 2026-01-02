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
    const timePoints = ['19:00', '19:05', '19:10', '19:15', '19:20', '19:25', '19:30', '19:35', '19:40'];
    
    // Zelensky starts high, drops, then fluctuates
    const zelenskyValues = [0.80, 0.25, 0.50, 0.45, 0.55, 0.40, 0.25, 0.35, 0.4069];
    // Trump starts low, rises, then fluctuates (opposite of Zelensky)
    const trumpValues = [0.20, 0.75, 0.50, 0.55, 0.45, 0.60, 0.75, 0.65, 0.5931];
    
    timePoints.forEach((time, index) => {
        data.push({
            time,
            zelensky: zelenskyValues[index],
            trump: trumpValues[index],
        });
    });
    
    return data;
};

interface MarketCardProps {
    label: string;
    marketCap: string;
    yesPrice: string;
    noPrice: string;
    yesPercentage: number;
    noPercentage: number;
    gradientFrom: string;
    gradientTo: string;
    imageUrl?: string;
    imageAlt?: string;
}

const MarketCard: React.FC<MarketCardProps> = ({
    label,
    marketCap,
    yesPrice,
    noPrice,
    yesPercentage,
    noPercentage,
    gradientFrom,
    gradientTo,
    imageUrl,
    imageAlt,
}) => {
    return (
        <div className="relative rounded-lg overflow-hidden bg-[#1E2022] border border-gray-700/50">
            {/* Label */}
            <div className="absolute top-4 left-4 z-10">
                <span className="text-white font-bold text-lg">{label}</span>
            </div>
            
            {/* Gradient Background */}
            <div 
                className="absolute inset-0"
                style={{
                    background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})`,
                    opacity: 0.6,
                }}
            />
            
            {/* Image Container */}
            <div className="relative h-50 flex items-center justify-center">
                {imageUrl ? (
                    <img 
                        src={imageUrl} 
                        alt={imageAlt || label}
                        className="h-full w-full object-cover opacity-90"
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full bg-gray-800/60 backdrop-blur-sm flex items-center justify-center border border-gray-700/30">
                            <span className="text-white text-2xl font-bold">{label.charAt(1)}</span>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Market Cap */}
            <div className="relative px-4 py-2 bg-[#1E2022]/80 backdrop-blur-sm border-t border-gray-700/30">
                <span className="text-white font-semibold">{marketCap} MC</span>
            </div>
            
            {/* Yes/No Buttons */}
            <div className="relative flex gap-2 p-4 bg-[#1E2022]">
                <button
                    className="flex-1 py-2 px-4 rounded font-semibold text-sm transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#10b981', color: 'white' }}
                >
                    Yes {yesPrice}
                </button>
                <button
                    className="flex-1 py-2 px-4 rounded font-semibold text-sm transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#ef4444', color: 'white' }}
                >
                    No {noPrice}
                </button>
            </div>
        </div>
    );
};

export const MarketActivityChart: React.FC = () => {
    const [data] = useState(generateChartData());
    const [selectedTimeRange, setSelectedTimeRange] = useState('1d');
    
    const timeRanges = ['1d', '1w', '1m'];
    
    // Current percentages from data
    const zelenskyPercentage = (data[data.length - 1].zelensky * 100).toFixed(2);
    const trumpPercentage = (data[data.length - 1].trump * 100).toFixed(2);

    return (
        <div className="w-full space-y-6">
            {/* Top Section - Two Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Zelensky Card */}
                <MarketCard
                    label="$ZELENSKY"
                    marketCap="$69,654,896"
                    yesPrice="40.69¢"
                    noPrice="59.31¢"
                    yesPercentage={40.69}
                    noPercentage={59.31}
                    gradientFrom="#1e40af"
                    gradientTo="#eab308"
                    imageAlt="Zelensky"
                />
                
                {/* Trump Card */}
                <MarketCard
                    label="$TRUMP"
                    marketCap="$76,241,845"
                    yesPrice="59.31¢"
                    noPrice="40.69¢"
                    yesPercentage={59.31}
                    noPercentage={40.69}
                    gradientFrom="#dc2626"
                    gradientTo="#1e40af"
                    imageAlt="Trump"
                />
            </div>

            {/* Bottom Section - Line Graph */}
            <div className="bg-[#1E2022] rounded-lg p-4 border border-gray-700/50">
                {/* Legend and Time Range Selectors */}
                <div className="flex justify-between items-center mb-4">
                    {/* Legend */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#eab308' }}></div>
                            <span className="text-white text-sm">ZELENSKY</span>
                            <span className="text-gray-400 text-sm">{zelenskyPercentage}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#dc2626' }}></div>
                            <span className="text-white text-sm">TRUMP</span>
                            <span className="text-gray-400 text-sm">{trumpPercentage}%</span>
                        </div>
                    </div>
                    
                    {/* Time Range Selectors */}
                    <div className="flex gap-2">
                        {timeRanges.map((range) => (
                            <button
                                key={range}
                                onClick={() => setSelectedTimeRange(range)}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
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
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis 
                                dataKey="time" 
                                stroke="#888"
                                tick={{ fill: '#888', fontSize: 12 }}
                                axisLine={{ stroke: '#555' }}
                            />
                            <YAxis 
                                stroke="#888"
                                tick={{ fill: '#888', fontSize: 12 }}
                                axisLine={{ stroke: '#555' }}
                                domain={[0, 1]}
                                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#1E2022', 
                                    border: '1px solid rgba(245, 163, 102, 0.3)',
                                    borderRadius: '4px',
                                    color: '#fff'
                                }}
                                labelStyle={{ color: '#F5A366' }}
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
