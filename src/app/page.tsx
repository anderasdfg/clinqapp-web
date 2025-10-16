// src/app/page.tsx
import Link from 'next/link'
import { ArrowRight, Check, Sparkles, Users, Calendar, FileText, CreditCard, BarChart3, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Logo } from '@/components/ui/logo'
import { cn } from '@/lib/utils'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-clinq-purple-900">
      {/* Header */}
      <header className="border-b border-clinq-cyan-500/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo size="lg" variant="white" />
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="text-white hover:bg-clinq-gradient hover:text-white transition-all" asChild>
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
              <Button className="btn-clinq" asChild>
                <Link href="/register">
                  Comenzar Gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="relative inline-flex items-center gap-2 rounded-full glass-dark px-4 py-2 text-sm text-clinq-cyan-500">
            <div className="absolute inset-0 -z-10 rounded-full bg-clinq-gradient opacity-20 blur-xl animate-pulse-glow"></div>
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span>La mejor plataforma para gestionar tu consultorio</span>
          </div>

          <h1 className="text-5xl font-bold text-white md:text-6xl lg:text-7xl">
            Gestiona tu consultorio de forma{' '}
            <span className="text-gradient animate-pulse">inteligente</span>
          </h1>

          <p className="text-xl text-white/80">
            ClinqApp te ayuda a organizar pacientes, citas, tratamientos y finanzas
            en una sola plataforma moderna y fácil de usar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="btn-clinq text-lg " asChild>
              <Link href="/register">
                Probar Gratis por 30 Días
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg border-clinq-cyan-500 text-clinq-cyan-500 hover:bg-clinq-cyan-500 hover:text-white"
              asChild
            >
              <Link href="#features">Ver Características</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Todo lo que necesitas en un solo lugar
          </h2>
          <p className="text-white/70 text-lg">
            Herramientas diseñadas específicamente para profesionales de la salud
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="glass-dark border-clinq-cyan-500/30 hover:border-clinq-cyan-500/50 transition-all">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-clinq-gradient">
                      <Icon className="h-6 w-6 text-white" strokeWidth={2} />
                    </div>
                    <CardTitle className="text-white">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-white/70">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Planes para cada necesidad
          </h2>
          <p className="text-white/70 text-lg">
            Comienza gratis y escala cuando lo necesites
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={cn(
                "glass-dark border-clinq-cyan-500/30 hover:border-clinq-cyan-500/50 transition-all",
                plan.featured && "ring-2 ring-clinq-cyan-500 scale-105"
              )}
            >
              <CardHeader>
                <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-white/70">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-clinq-cyan-500">{plan.price}</span>
                  {plan.period && <span className="text-white/60">/{plan.period}</span>}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-white/80">
                      <Check className="h-5 w-5 text-clinq-cyan-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={cn(
                    "w-full mt-6",
                    plan.featured ? "btn-clinq" : "border-clinq-cyan-500 text-clinq-cyan-500 hover:bg-clinq-cyan-500 hover:text-white"
                  )}
                  variant={plan.featured ? "default" : "outline"}
                  asChild
                >
                  <Link href="/register">
                    {plan.cta}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-clinq-cyan-500/20 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Logo size="sm" variant="white" />
            <p className="text-white/60 text-sm">
              © 2025 ClinqApp. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-sm text-white/60">
              <Link href="/terms" className="hover:text-clinq-cyan-500">
                Términos
              </Link>
              <Link href="/privacy" className="hover:text-clinq-cyan-500">
                Privacidad
              </Link>
              <Link href="/contact" className="hover:text-clinq-cyan-500">
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Features data
const features = [
  {
    icon: Users,
    title: "Gestión de Pacientes",
    description: "Organiza la información clínica y personal de tus pacientes de forma segura."
  },
  {
    icon: Calendar,
    title: "Agenda Inteligente",
    description: "Calendario compartido con recordatorios automáticos por WhatsApp."
  },
  {
    icon: FileText,
    title: "Tratamientos",
    description: "Registra y da seguimiento a tratamientos con evidencia fotográfica."
  },
  {
    icon: CreditCard,
    title: "Facturación",
    description: "Control de pagos con múltiples métodos y cupones de descuento."
  },
  {
    icon: BarChart3,
    title: "Reportes",
    description: "Analíticas y reportes detallados de tu consultorio."
  },
  {
    icon: UserPlus,
    title: "Multi-profesional",
    description: "Ideal para centros médicos con varios profesionales."
  },
]

// Plans data
const plans = [
  {
    name: "Prueba Gratuita",
    description: "Perfecto para comenzar",
    price: "Gratis",
    period: "30 días",
    features: [
      "Hasta 10 pacientes",
      "Agenda básica",
      "1 profesional",
      "Soporte por email"
    ],
    cta: "Comenzar Ahora",
    featured: false
  },
  {
    name: "Profesional",
    description: "Para consultores independientes",
    price: "S/79",
    period: "mes",
    features: [
      "Pacientes ilimitados",
      "Agenda completa",
      "1-3 profesionales",
      "Recordatorios WhatsApp",
      "Soporte prioritario"
    ],
    cta: "Elegir Plan",
    featured: true
  },
  {
    name: "Centro Médico",
    description: "Para clínicas y centros",
    price: "S/199",
    period: "mes",
    features: [
      "Todo de Profesional",
      "Profesionales ilimitados",
      "Múltiples sucursales",
      "Reportes avanzados",
      "Soporte 24/7"
    ],
    cta: "Contactar Ventas",
    featured: false
  }
]