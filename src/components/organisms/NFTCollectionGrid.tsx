import React from 'react';
import { Heading } from '@/components/atoms/Heading';

interface NFTCardProps {
  title: string;
  price: string;
  image: string;
}

const NFTCard: React.FC<NFTCardProps> = ({ title, price, image }) => {
  return (
    <div
      className="relative rounded-xl overflow-hidden border border-orange-500/30 shadow-[0_12px_30px_rgba(0,0,0,0.55)] hover:border-orange-400/60 transition-all duration-200 p-3"
      style={{
        backgroundImage:
          'radial-gradient(circle at 12% 12%, rgba(255,140,60,0.38) 0%, rgba(255,140,60,0) 46%),' +
          'radial-gradient(circle at 88% 85%, rgba(255,115,45,0.32) 0%, rgba(255,115,45,0) 48%),' +
          'linear-gradient(180deg, #0a0a0a 0%, #0e0a08 45%, #120804 100%)',
      }}
    >
      <div className="relative rounded-lg overflow-hidden border border-orange-500/25 bg-black/60">
        <img src={image} alt={title} className="w-full h-64 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/55" />
      </div>

      <div className="pt-3 pb-2 px-1 space-y-2">
        <div className="flex items-center justify-between text-sm text-white">
          <span className="font-semibold tracking-wide">{title}</span>
          <div className="flex items-center gap-1 text-xs text-gray-300">
            <span className="tracking-tight font-semibold text-orange-400">Pay</span>
            <span className="font-semibold text-white">{price}</span>
          </div>
        </div>
      </div>

      <div className="px-1 pb-1">
        <button
          className="w-full py-2 px-4 rounded-xl font-semibold text-white transition-colors duration-150 shadow-[0_10px_25px_rgba(255,126,53,0.35)] cursor-pointer hover:cursor-pointer hover:brightness-110"
          style={{
            backgroundImage:
              'linear-gradient(0deg, #D16300, #D16300), radial-gradient(63.11% 63.11% at 31.97% 19.67%, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0) 69.79%, rgba(255, 255, 255, 0) 100%)',
          }}
        >
          Mint Now
        </button>
      </div>
    </div>
  );
};

interface NFTCollectionGridProps {
  items?: number;
}

export const NFTCollectionGrid: React.FC<NFTCollectionGridProps> = ({ items = 9 }) => {
  const cards = Array.from({ length: items }, (_, index) => ({
    id: index,
    title: 'GENESIS',
    price: '0.5 ETH',
    image: '/NFT.png',
  }));

  return (
    <section className="max-w-6xl mx-auto">
      <Heading level={2} className="mb-4 text-white text-2xl">
        Collection
      </Heading>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <NFTCard key={card.id} title={card.title} price={card.price} image={card.image} />
        ))}
      </div>
    </section>
  );
};

