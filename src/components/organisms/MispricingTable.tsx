// src/components/organisms/MispricingTable.tsx
import React from 'react';
import { Heading } from '@/components/atoms/Heading';
import { Button } from '@/components/atoms/Button';

// Assuming MispricingRow and MispricingTableProps are imported from a types file
// src/types/data.ts (You should put this in a dedicated types file)

interface MispricingRow {
  id: string | number;
  marketName: string;
  category: string;
  priceA: number;
  priceB: number;
  difference: string; // formatted percentage string
  liquidity: string;
  risk: string;
}

interface MispricingTableProps {
  data: MispricingRow[];
}
// Mock Data for demonstration
const mockMispricingData: MispricingRow[] = [
  { id: 1, marketName: 'US Inflation Rate Q3 2026', category: 'Finance', priceA: 0.45, priceB: 0.50, difference: '5.0%', liquidity: '$150k', risk: 'Medium' },
  { id: 2, marketName: 'Ethereum Merge Date', category: 'Crypto', priceA: 0.90, priceB: 0.95, difference: '5.0%', liquidity: '$320k', risk: 'Low' },
  { id: 3, marketName: 'Next Fed Chair Appointment', category: 'Political', priceA: 0.20, priceB: 0.28, difference: '8.0%', liquidity: '$90k', risk: 'High' },
  // Add more mock data as needed
];



export const MispricingTable: React.FC<MispricingTableProps> = ({ data = mockMispricingData }) => {
  const headers = [
    'Market Name',
    'Category',
    'Price A',
    'Price B',
    'Difference',
    'Liquidity',
    'Risk'
  ];

  const formatPercent = (value: number) => `${Math.round(value * 100)}%`;
  const differenceColor = (diff: string) => diff.trim().startsWith('-') ? 'text-red-500' : 'text-green-500';
  const riskBadge = (risk: string) => {
    if (risk === 'High') return 'bg-red-500/10 text-red-300 border border-red-500/30';
    if (risk === 'Medium') return 'bg-amber-500/10 text-amber-200 border border-amber-500/30';
    return 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/30';
  };

  return (
    <section className="mt-12">
      <Heading level={2} className="mb-4 text-2xl text-white">
        Top Mispricings
      </Heading>

      <div className="overflow-x-auto rounded-2xl border border-orange-500/40 bg-[#1f1f1f] shadow-[0_0_12px_rgba(0,0,0,0.25)]">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-orange-700 via-amber-600 to-orange-500 text-white">
            <tr>
              {headers.map(header => (
                <th
                  key={header}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700 text-sm text-gray-200">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap font-medium">{row.marketName}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-400">{row.category}</td>
                <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-100">{formatPercent(row.priceA)}</td>
                <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-100">{formatPercent(row.priceB)}</td>
                <td className={`px-4 py-3 whitespace-nowrap font-semibold ${differenceColor(row.difference)}`}>{row.difference}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-300">{row.liquidity}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${riskBadge(row.risk)}`}>
                    {row.risk}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-center mt-6">
        <Button variant="secondary">Explore Market</Button>
      </div>
    </section>
  );
};