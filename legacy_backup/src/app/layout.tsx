import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
})

export const metadata: Metadata = {
  title: "ClinqApp - Gestión Inteligente de Consultorios",
  description: "Plataforma integral para la gestión de consultorios médicos. Organiza pacientes, citas, tratamientos y finanzas en una sola aplicación moderna y fácil de usar.",
  keywords: ["clinqapp", "gestión médica", "consultorio", "podología", "agenda médica", "pacientes"],
  authors: [{ name: "ClinqApp Team" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/logo-icon.png",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "ClinqApp - Gestión Inteligente de Consultorios",
    description: "Plataforma integral para la gestión de consultorios médicos",
    type: "website",
    images: ["/logo.png"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={poppins.className}>
        {children}

        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            classNames: {
              success: 'bg-primary text-primary-foreground',
              error: 'bg-destructive text-destructive-foreground',
              info: 'bg-accent text-accent-foreground',
            }
          }}
        />
      </body>
    </html>
  )
}