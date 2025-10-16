import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ClinqApp - Gestión de Consultorios",
  description: "Plataforma integral para la gestión de consultorios médicos",
  keywords: ["clinqapp", "gestión médica", "consultorio", "podología"],
  authors: [{ name: "ClinqApp Team" }],
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={cn(
          inter.className,
          "dark antialiased" // Modo dark por defecto (como tu logo)
        )}
      >
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              success: 'bg-clinq-cyan text-white',
              error: 'bg-destructive text-destructive-foreground',
              info: 'bg-clinq-magenta text-white',
            }
          }}
        />
      </body>
    </html>
  )
}