import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GlobalGlow } from "@/components/GlobalGlow";
import { Navbar } from "@/components/Navbar";
import { SideQuoteTab } from "@/components/SideQuoteTab";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SRI VENKATESWARA Constructions",
  description: "Building Dreams Into Reality - Premium Construction and Interior Design",
};

import { ConfigProvider } from "@/components/ConfigProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col text-white overflow-x-hidden selection:bg-[#d4af37] selection:text-black`}>
        <ConfigProvider>
          <GlobalGlow />
          <Navbar />
          <main className="flex-grow pt-24 relative z-10">{children}</main>
          <Footer />
          <SideQuoteTab />
          <WhatsAppFloat />
        </ConfigProvider>
      </body>
    </html>
  );
}
