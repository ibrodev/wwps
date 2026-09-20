import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Image from 'next/image'

import eiarLogo from '@/public/eiar-logo.png'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WWP Dashboard - Ethiopian Institute of Agricultural Research",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="px-4 py-1 flex items-center">
          <div className="flex items-center">
              <Image
                src={eiarLogo}
                alt="ethiopian institution of agriculture logo"
                className="w-12 h-auto"
              />
            <div>
              <h1 className=" font-bold text-lg leading-tight text-eiar-dark">Wheat Water Productivity</h1>
              <p className="text-xs leading-tight text-eiar-deep">Ethiopian Institute of Agricultural Research</p>
            </div>
          </div>
        </header>
        <main className="w-full flex-auto relative">
          {children}
        </main>
      </body>
    </html>
  );
}
