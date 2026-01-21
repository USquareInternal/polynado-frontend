'use client';
import React, { useState, useEffect } from 'react';
import { LikeOutlined, DislikeOutlined } from '@ant-design/icons';
import { useAccount, useChainId } from 'wagmi';
import { fetchPortfolio, BetData } from '@/services/portfolioService';
import Spinner from '@/components/atoms/Spinner';

interface Bet {
  id: string;
  marketQuestion: string;
  yourPick: string;
  entryPrice: number;
  currentPrice: number;
  profitLoss: number;
  status: 'ACTIVE' | 'WIN' | 'LOSS';
  icon?: string;
}

// Map API data to Bet format (direct mapping since API already provides the fields)
const mapBetDataToBet = (betData: BetData, index: number): Bet => {
  return {
    id: `bet-${index}`,
    marketQuestion: betData.market.title || '',
    yourPick: betData.yourPick || 'Unknown',
    entryPrice: betData.entryPrice,
    currentPrice: betData.currentPrice,
    profitLoss: betData.profitLoss,
    status: betData.status,
    icon: betData.market.icon,
  };
};


const StatusBadge: React.FC<{ status: Bet['status'] }> = ({ status }) => {
  const getStatusStyle = (status: Bet['status']) => {
    switch (status) {
      case 'ACTIVE':
        return {
          border: '1.5px solid #007BD3',
          background: '#0C293D',
          color: 'white',
        };
      case 'WIN':
        return {
          border: '1.5px solid #4CAF50',
          background: '#143215',
          color: 'white',
        };
      case 'LOSS':
        return {
          border: '1.5px solid #DF261C',
          background: '#331514',
          color: 'white',
        };
      default:
        return {
          border: '1.5px solid #007BD3',
          background: '#0C293D',
          color: 'white',
        };
    }
  };

  return (
    <span
      className="px-3 py-1 rounded-lg text-xs font-semibold"
      style={getStatusStyle(status)}
    >
      {status}
    </span>
  );
};

export const YourBetsTable: React.FC = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const [bets, setBets] = useState<Bet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPortfolio = async () => {
      if (!address) {
        setIsLoading(false);
        setError('Please connect your wallet to view your bets');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const portfolioData = await fetchPortfolio(address, chainId);
        
        // Combine both activeBets and closedBets into a single array
        const allBets = [
          ...(portfolioData.activeBets || []),
          ...(portfolioData.closedBets || [])
        ];
        
        // Map bet data to Bet format
        const mappedBets = allBets.map((betData, index) => 
          mapBetDataToBet(betData, index)
        );
        
        setBets(mappedBets);
      } catch (err) {
        console.error('Failed to load portfolio:', err);
        setError(err instanceof Error ? err.message : 'Failed to load your bets');
      } finally {
        setIsLoading(false);
      }
    };

    loadPortfolio();
  }, [address, chainId]);

  if (isLoading) {
    return (
      <div className="overflow-hidden">
        <div className="mb-6 xl:mb-8">
          <h2 className="text-xl xl:text-2xl fullhd:text-3xl font-bold text-white">
            Your Bets
          </h2>
        </div>
        <div className="flex justify-center items-center py-12">
          <Spinner visible={true} size="md" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overflow-hidden">
        <div className="mb-6 xl:mb-8">
          <h2 className="text-xl xl:text-2xl fullhd:text-3xl font-bold text-white">
            Your Bets
          </h2>
        </div>
        <div className="text-center text-red-400 py-8">
          {error}
        </div>
      </div>
    );
  }

  if (bets.length === 0) {
    return (
      <div className="overflow-hidden">
        <div className="mb-6 xl:mb-8">
          <h2 className="text-xl xl:text-2xl fullhd:text-3xl font-bold text-white">
            Your Bets
          </h2>
        </div>
        <div className="text-center text-gray-400 py-8">
          No bets found. Start placing bets to see them here.
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="mb-6 xl:mb-8">
        <h2 className="text-xl xl:text-2xl fullhd:text-3xl font-bold text-white">
          Your Bets
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr
              style={{
                background: 'linear-gradient(90deg, #DB7A23 0%, #000000 100%)',
                backdropFilter: 'blur(2px)',
              }}
            >
              <th className="px-4 xl:px-6 fullhd:px-8 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-white uppercase">
                Market Bets
              </th>
              <th className="px-4 xl:px-6 fullhd:px-8 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-white uppercase">
                Your Pick
              </th>
              <th className="px-4 xl:px-6 fullhd:px-8 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-white uppercase">
                Entry Price
              </th>
              <th className="px-4 xl:px-6 fullhd:px-8 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-white uppercase">
                Current Price
              </th>
              <th className="px-4 xl:px-6 fullhd:px-8 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-white uppercase">
                Profit/Loss
              </th>
              <th className="px-4 xl:px-6 fullhd:px-8 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-white uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {bets.map((bet, index) => (
              <tr
                key={bet.id}
                className="hover:bg-white/5 transition-colors"
                style={{ backgroundColor: index % 2 === 0 ? '#000000' : '#1E2022' }}
              >
                <td className="px-4 xl:px-6 fullhd:px-8 py-4 xl:py-5">
                  <div className="flex items-center gap-3">
                    {bet.icon && (
                      <img 
                        src={bet.icon} 
                        alt={bet.marketQuestion}
                        className="w-10 h-10 xl:w-12 xl:h-12 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => {
                          // Hide image if it fails to load
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <span className="text-sm xl:text-base text-white font-medium">
                      {bet.marketQuestion}
                    </span>
                  </div>
                </td>
                <td className="px-4 xl:px-6 fullhd:px-8 py-4 xl:py-5">
                  <div className="flex items-center gap-2">
                    {bet.yourPick === 'Yes' || bet.yourPick?.toLowerCase() === 'yes' ? (
                      <LikeOutlined className="text-white" />
                    ) : (
                      <DislikeOutlined className="text-white" />
                    )}
                    <span className="text-sm xl:text-base text-white">{bet.yourPick}</span>
                  </div>
                </td>
                <td className="px-4 xl:px-6 fullhd:px-8 py-4 xl:py-5 text-sm xl:text-base text-white">
                  {bet.entryPrice.toFixed(4)}
                </td>
                <td className="px-4 xl:px-6 fullhd:px-8 py-4 xl:py-5 text-sm xl:text-base text-white">
                  {bet.currentPrice.toFixed(4)}
                </td>
                <td className="px-4 xl:px-6 fullhd:px-8 py-4 xl:py-5">
                  <span
                    className={`text-sm xl:text-base font-semibold ${
                      bet.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {bet.profitLoss >= 0 ? '+' : ''}
                    ${bet.profitLoss.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 xl:px-6 fullhd:px-8 py-4 xl:py-5">
                  <StatusBadge status={bet.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
