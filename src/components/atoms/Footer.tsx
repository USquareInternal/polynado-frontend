import React from 'react';

const footerLinks = ['Privacy', 'Terms of Use', 'Learn', 'Careers', 'Press'];

export const Footer: React.FC = () => {
  return (
    <footer className="mt-10 border-t border-white/10 pt-4 pb-4 px-4 sm:px-6 md:px-8 text-xs bg-[#1E2022] text-gray-300">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <p className="w-full sm:w-auto text-gray-300">Polynado Pvt Limited. © 2025</p>

        <nav className="flex flex-wrap gap-x-4 gap-y-2">
          {footerLinks.map((link) => (
            <a key={link} href="#" className="text-gray-300 hover:text-white transition-colors">
              {link}
            </a>
          ))}
          <div className="ml-2 space-x-2 hidden sm:flex text-gray-500">
            <span>[X]</span>
            <span>[Instagram]</span>
            <span>[Discord]</span>
          </div>
        </nav>
      </div>
    </footer>
  );
};

