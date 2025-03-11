import type { Metadata } from "next";
import { Anton, Roboto } from "next/font/google";
import "./globals.css";
import { UserProvider } from '@/contexts/UserContext'

const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Intfinex",
  description: "Intfinex is a platform for financial solutions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={`${anton.className} ${roboto.className} bg-gray-900 text-white min-h-screen`}>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  )
}
