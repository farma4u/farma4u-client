import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from '@/components/Sidebar'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Farma4U",
  description: "Descontos em medicamentos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body className={`${inter.className} flex items-start justify-between`}>
        <Sidebar />
        <main className='w-full h-full'>
          {children}
        </main>
      </body>
    </html>
  );
}