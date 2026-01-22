import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Web3ModalProvider } from "@/components/providers/Web3Provider";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900", "1000"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Polynado - Market Intelligence & Prediction Markets",
  description: "Polynado is a market intelligence platform providing real-time insights, prediction markets analysis, NFT minting, and AI-powered market assistance. Join the future of decentralized prediction markets.",
  icons: {
    icon: '/image 7.svg',
    shortcut: '/image 7.svg',
    apple: '/image 7.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} antialiased`}
      >
        <Web3ModalProvider>
          {children}
        </Web3ModalProvider>
      </body>
    </html>
  );
}
