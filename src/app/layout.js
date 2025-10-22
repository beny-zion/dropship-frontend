import { Providers } from '@/components/Providers';
import Header from '@/components/layout/Header';
import './globals.css';

export const metadata = {
  title: 'שופינג סמארט - קניות חכמות מאמזון',
  description: 'המוצרים הטובים ביותר מאמזון במחירים הכי משתלמים',
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}