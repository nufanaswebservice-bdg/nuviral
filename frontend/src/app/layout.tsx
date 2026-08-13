import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lumora - AI Creative Studio | 9 AI Tools dalam 1 Platform',
  description: 'Platform AI creative studio terdepan di Indonesia. Generate video, gambar, musik, efek suara, 3D model, voice clone, dan brainstorm ide konten — semua dalam satu dashboard.',
  keywords: 'AI video generator, Lumora, AI creative studio, text to image, text to video, text to music, voice clone, 3D generation, content creator, Indonesia',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
