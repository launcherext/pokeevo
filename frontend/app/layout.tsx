import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PikachuChain - Pichu to Pikachu to Raichu!',
  description: 'Watch Pichu evolve into Pikachu and Raichu as tokens reach their bonding curve. A recursive evolution experiment on Solana.',
  icons: {
    icon: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-pokemon-darker text-white`}>{children}</body>
    </html>
  )
}
