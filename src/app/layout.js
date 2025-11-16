import { Providers } from '@/components/Providers';
import ConditionalLayout from '@/components/ConditionalLayout';
import ConsentBanner from '@/components/shared/ConsentBanner';
import './globals.css';

export const metadata = {
  title: 'TORINO - קניות חכמות ביבוא אישי',
  description: 'המוצרים הטובים ביותר במחירים הכי משתלמים',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@200;300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="flex flex-col min-h-screen">
        <Providers>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
          <ConsentBanner />
        </Providers>
      </body>
    </html>
  );
}