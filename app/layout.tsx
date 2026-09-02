import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Noctra — Real-Time Digital Atmosphere & Ambient Sync',
  description:
    'A living real-time digital atmosphere combining weather, celestial rhythms, background visuals, synchronized music, and ambient audio.',
  keywords: [
    'Noctra',
    'Atmosphere',
    'Real-time weather',
    'Ambient audio',
    'Synchronized lyrics',
    'Lofi background',
    'World clock',
    'Astronomical events',
  ],
  authors: [{ name: 'Noctra Engine' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full flex flex-col antialiased bg-[#06070d] text-white">
        {children}
      </body>
    </html>
  );
}
