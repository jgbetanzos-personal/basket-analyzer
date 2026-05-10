import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Basket Analyzer — Análisis de partidos con IA',
  description: 'Sube un vídeo de baloncesto y obtén un análisis detallado de todos los eventos del partido gracias a Gemini 2.5 Flash.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
