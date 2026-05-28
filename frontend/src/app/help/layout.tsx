import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help Center - NuViral AI Video Generator | Panduan & FAQ',
  description: 'Pusat bantuan NuViral. Panduan lengkap cara membuat video AI, generate gambar, berlangganan, troubleshooting, dan tips prompt viral untuk TikTok, YouTube Shorts, Instagram Reels.',
  keywords: 'NuViral help, cara buat video AI, AI video generator Indonesia, tutorial NuViral, FAQ video AI, panduan content creator, TikTok AI, generate video otomatis, harga NuViral, paket berlangganan AI',
  openGraph: {
    title: 'Help Center - NuViral AI Video Generator',
    description: 'Panduan lengkap menggunakan NuViral AI untuk membuat video viral secara otomatis. FAQ, tutorial, dan tips.',
    url: 'https://nuviral.cloud/help',
    siteName: 'NuViral',
    type: 'website',
    locale: 'id_ID',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Help Center - NuViral AI Video Generator',
    description: 'Panduan lengkap menggunakan NuViral AI untuk membuat video viral secara otomatis.',
  },
  alternates: {
    canonical: 'https://nuviral.cloud/help',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
