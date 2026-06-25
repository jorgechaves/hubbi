import type { Metadata } from 'next'
import { Space_Mono, DM_Sans } from 'next/font/google'
import './globals.css'
import { getPortalSettings } from '@/lib/db/portal-settings'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'

const spaceMono = Space_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '700'],
})

const dmSans = DM_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
})

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPortalSettings()
  return {
    title: settings.name,
    description: `Portal de BI — ${settings.name}`,
    openGraph: { title: settings.name },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getPortalSettings()

  return (
    <html
      lang="pt-BR"
      className={`${spaceMono.variable} ${dmSans.variable} h-full antialiased`}
      style={{ '--color-primary': settings.primary_color } as React.CSSProperties}
      suppressHydrationWarning
    >
      <body className="h-full font-sans">
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
