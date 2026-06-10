import type { Metadata } from 'next';
import { Playfair_Display, Lato } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/hooks/useCart';
import { Toaster } from 'react-hot-toast';
import AuthProvider from '@/providers/session-provider';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-lato',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Bolos da Dani — Feito com Amor',
  description:
    'Bolos artesanais, salgados e pães fresquinhos. Encomende agora e receba em casa.',
  keywords:
    'bolo, artesanal, encomenda, confeitaria, salgados, pão de queijo',
  openGraph: {
    title: 'Bolos da Dani',
    description:
      'Bolos artesanais feitos com amor para todas as ocasiões.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${lato.variable}`}>
      <body className="font-body bg-cream text-espresso antialiased">
        <AuthProvider>
          <CartProvider>
            {children}

            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#FDF6EE',
                  color: '#2C1810',
                  border: '1px solid #EDD5B8',
                  fontFamily: 'var(--font-lato)',
                },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}