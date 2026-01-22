'use client';
import React, { useState } from 'react';
import { UpOutlined, DownOutlined } from '@ant-design/icons';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'What is Polynado?',
    answer: 'Polynado is an AI-powered "Bloomberg Terminal" for prediction markets that provides real-time data, statistical "Fair Odds" modeling, and an AI Copilot to help traders find an edge.',
  },
  {
    question: 'Can I trade directly on the platform?',
    answer: 'No, Polynado does not execute trades or hold user funds. It provides deep-link buttons to execute trades directly on Polymarket.',
  },
  {
    question: 'How does the "Fair Odds" Engine work?',
    answer: 'It calculates the difference between implied market probability and statistical "Fair Probability" to generate an "Edge" score for identifying mispriced markets.',
  },
  {
    question: 'What are the AI Copilot\'s capabilities?',
    answer: 'The LLM-powered assistant is context-aware, meaning it reads data from your active market page. It can query the SQL database to summarize price action or identify high-volume markets.',
  },
  {
    question: 'How do I get "Lifetime Access"?',
    answer: 'You must mint or purchase a "Polynado Lifetime Pass" NFT (ERC-721 or 1155). Holding this in your connected wallet automatically grants you a lifetime_pro role.',
  },
  {
    question: 'What happens if I sell my NFT?',
    answer: 'Access is portable; if you sell the NFT, you lose your Pro access, and the new owner gains it upon connecting their wallet.',
  },
  {
    question: 'How does the referral system work?',
    answer: 'Users share unique referral links to track signups, NFT mints, and subscriptions. Rewards are tracked in a personal dashboard where users can request payouts.',
  },
  {
    question: 'What data does the platform track?',
    answer: 'The system ingests Polymarket API data, including prices, volume, open interest, liquidity, and historical time-series data for charting.',
  },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="mb-8 xl:mb-10 fullhd:mb-12">
      <div className="mb-6 xl:mb-8 fullhd:mb-10">
        <h2 className="text-2xl sm:text-3xl xl:text-4xl fullhd:text-5xl font-bold text-white mb-2">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-400 text-sm sm:text-base xl:text-lg fullhd:text-xl">
          Find answers to common questions about Polynado
        </p>
      </div>

      <div className="space-y-3 xl:space-y-4 fullhd:space-y-5">
        {faqData.map((faq, index) => {
          const isOpen = openIndex === index;
          
          return (
            <div
              key={index}
              className="rounded-xl border border-gray-700 bg-[#1E2022] overflow-hidden transition-all duration-300 hover:border-orange-500/50"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-5 xl:px-6 fullhd:px-8 py-4 xl:py-5 fullhd:py-6 flex items-center justify-between text-left transition-colors hover:bg-gray-800/30"
              >
                <h3 className="text-base xl:text-lg fullhd:text-xl font-semibold text-white pr-4 flex-1">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  {isOpen ? (
                    <UpOutlined className="text-orange-500 text-lg xl:text-xl fullhd:text-2xl transition-transform" />
                  ) : (
                    <DownOutlined className="text-gray-400 text-lg xl:text-xl fullhd:text-2xl transition-transform" />
                  )}
                </div>
              </button>
              
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-5 xl:px-6 fullhd:px-8 pb-4 xl:pb-5 fullhd:pb-6 pt-0">
                  <p className="text-sm xl:text-base fullhd:text-lg text-gray-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

