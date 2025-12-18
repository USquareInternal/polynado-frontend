// src/components/atoms/MarketActivityChart.tsx
"use client";
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Sample market activity data - Polymarket style (probability/price 0-100%)
const generateSampleData = () => {
    const data = [];
    const baseValue = 0.50; // Base probability at 50% ($0.50)
    for (let i = 0; i < 30; i++) {
        // Generate probability values between 0.20 and 0.80 (20% to 80%)
        const probability = Math.max(0.20, Math.min(0.80, 
            baseValue + Math.random() * 0.30 - 0.15 + Math.sin(i * 0.3) * 0.15
        ));
        data.push({
            time: `${i + 1}`,
            value: probability, // Value as decimal (0.20 to 0.80)
        });
    }
    return data;
};

export const MarketActivityChart: React.FC = () => {
    const [data] = React.useState(generateSampleData());

    return (
        <div
            className="h-48 bg-black rounded-lg p-4 
                        border border-orange-500/50 
                        shadow-[0_0_8px_rgba(255,165,0,0.3)] 
                        relative overflow-hidden w-full"
        >
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis 
                        dataKey="time" 
                        stroke="#888"
                        tick={{ fill: '#888', fontSize: 10 }}
                        axisLine={{ stroke: '#555' }}
                    />
                    <YAxis 
                        stroke="#888"
                        tick={{ fill: '#888', fontSize: 10 }}
                        axisLine={{ stroke: '#555' }}
                        domain={[0, 1]}
                        tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                        label={{ value: 'Probability', angle: -90, position: 'left', fill: '#888', fontSize: 12, dy: -10 }}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#1a1a1a', 
                            border: '1px solid #F5A366',
                            borderRadius: '4px',
                            color: '#fff'
                        }}
                        labelStyle={{ color: '#F5A366' }}
                        formatter={(value: number | undefined) => {
                            if (value === undefined) return ['N/A', 'Price'];
                            return [
                                `${(value * 100).toFixed(2)}% ($${value.toFixed(2)})`,
                                'Price'
                            ];
                        }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#F5A366" 
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: '#F5A366' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};