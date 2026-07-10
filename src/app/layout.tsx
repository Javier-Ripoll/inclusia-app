import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'Inclusia – Ofertas de trabajo en sector social y apoyo educativo',
    template: '%s | Inclusia',
  },
  description: 'Ofertas de trabajo en sector social y apoyo educativo: Terapeuta Ocupacional, Logopeda, Psicólogo, Integrador Social, Educador Social, Trabajador Social, PATI. Conectamos centros educativos con los mejores profesionales.',
  keywords: ['ofertas trabajo sector social', 'terapeuta ocupacional', 'logopeda empleo', 'integrador social trabajo', 'educador social ofertas', 'trabajador social empleo', 'PATI trabajo', 'empleo apoyo educativo', 'educación especial'],
  authors: [{ name: 'Inclusia', url: 'https://inclusiajobs.com' }],
  metadataBase: new URL('https://inclusiajobs.com'),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Inclusia',
    locale: 'es_ES',
    url: 'https://inclusiajobs.com',
    title: 'Inclusia – Conectamos centros educativos con profesionales de apoyo',
    description: 'La plataforma líder para conectar centros educativos con profesionales de apoyo educativo en España.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inclusia – Apoyo educativo rápido y fiable',
    description: 'Conectamos centros educativos con profesionales de apoyo: PATI, logopedas, integradores sociales y más.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
