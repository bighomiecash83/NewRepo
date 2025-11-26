import { ReactNode } from 'react'
import '../styles/globals.css'

export const metadata = {
  title: 'DMF Music Platform',
  description: 'Complete Record Label Hub - Dashboard, Artists, Releases, Bots & Revenue',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-dmf-dark text-white">
        {children}
      </body>
    </html>
  )
}
