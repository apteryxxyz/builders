import '@/styles/reset.css';
import '@/styles/global.css';
import 'tailwindcss/tailwind.css';
import '@/styles/theme/code.css';
import '@/styles/theme/ui.css';
import '@/env';
import { Inter, JetBrains_Mono } from 'next/font/google';
import type { LayoutProps } from '@/types';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

export default function Layout(p: LayoutProps) {
  return (
    <Providers>
      <html lang="en" className={`${inter.variable} ${jetBrainsMono.variable}`}>
        <head>
          <meta name="darkreader-lock" />
        </head>
        <body>{p.children}</body>
      </html>
    </Providers>
  );
}
