import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help Center - Lumora Video Generator | Panduan & FAQ',
  description: 'Pusat bantuan Lumora. Panduan lengkap cara membuat video AI, generate gambar, berlangganan, troubleshooting, dan tips prompt viral untuk TikTok, YouTube Shorts, Instagram Reels.',
  keywords: 'Lumora help, cara buat video AI, AI video generator Indonesia, tutorial Lumora, FAQ video AI, panduan content creator, TikTok AI, generate video otomatis, harga Lumora, paket berlangganan AI',
  openGraph: {
    title: 'Help Center - Lumora Video Generator',
    description: 'Panduan lengkap menggunakan Lumora untuk membuat video viral secara otomatis. FAQ, tutorial, dan tips.',
    url: 'https://Lumora.cloud/help',
    siteName: 'Lumora',
    type: 'website',
    locale: 'id_ID',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Help Center - Lumora Video Generator',
    description: 'Panduan lengkap menggunakan Lumora untuk membuat video viral secara otomatis.',
  },
  alternates: {
    canonical: 'https://Lumora.cloud/help',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

