import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/lib/store/provider'
import { AuthProvider } from '@/lib/providers/AuthProvider'
import { Header } from '@/components/layout/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BestPractice HR SaaS',
  description: 'HR management system for small retail stores',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
            <Header />
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}
