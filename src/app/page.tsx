// src/app/page.tsx
import Link from 'next/link'
import { ArrowRight, Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Logo } from '@/components/ui/logo'
import { cn } from '@/lib/utils'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-clinq-purple-600 via-clinq-purple-500 to-clinq-purple-600">
      {/* Header */}
      <header className="border-b border-clinq-cyan/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo size="lg" variant="white" />
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="text-white hover:text-clinq-cyan" asChild>
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
          <div className="inline-flex items-center gap-2 rounded-full glass-dark px-4 py-2 text-sm text-clinq-cyan">
            <Sparkles className="h-4 w-4" />
            <span>La mejor plataforma para gestionar tu consultorio</span>
          </div>

          <h1 className="text-5xl font-bold text-white md:text-6xl lg:text-7xl">
            Gestiona tu consultorio de forma{' '}
            <span className="text-gradient">inteligente</span>
          </h1>

          <p className="text-xl text-white/80">
            ClinqApp te ayuda a organizar pacientes, citas, tratamientos y finanzas
            en una sola plataforma moderna y fácil de usar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="btn-clinq text-lg" asChild>
              <Link href="/register">
                Probar Gratis por 30 Días
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg border-clinq-cyan text-clinq-cyan hover:bg-clinq-cyan hover:text-white"
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
          {features.map((feature, index) => (
            <Card key={index} className="glass-dark border-clinq-cyan/30 hover:border-clinq-cyan/50 transition-all">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-clinq-gradient">
                    <feature.icon className="h-6 w-6 text-white" />
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
          ))}
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
                "glass-dark border-clinq-cyan/30 hover:border-clinq-cyan/50 transition-all",
                plan.featured && "ring-2 ring-clinq-cyan scale-105"
              )}
            >
              <CardHeader>
                <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-white/70">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-clinq-cyan">{plan.price}</span>
                  {plan.period && <span className="text-white/60">/{plan.period}</span>}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-white/80">
                      <Check className="h-5 w-5 text-clinq-cyan" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={cn(
                    "w-full mt-6",
                    plan.featured ? "btn-clinq" : "border-clinq-cyan text-clinq-cyan hover:bg-clinq-cyan hover:text-white"
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
      <footer className="border-t border-clinq-cyan/20 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Logo size="sm" variant="white" />
            <p className="text-white/60 text-sm">
              © 2025 ClinqApp. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-sm text-white/60">
              <Link href="/terms" className="hover:text-clinq-cyan">
                Términos
              </Link>
              <Link href="/privacy" className="hover:text-clinq-cyan">
                Privacidad
              </Link>
              <Link href="/contact" className="hover:text-clinq-cyan">
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
    icon: () => <Check className="h-6 w-6" />,
    title: "Gestión de Pacientes",
    description: "Organiza la información clínica y personal de tus pacientes de forma segura."
  },
  {
    icon: () => <Check className="h-6 w-6" />,
    title: "Agenda Inteligente",
    description: "Calendario compartido con recordatorios automáticos por WhatsApp."
  },
  {
    icon: () => <Check className="h-6 w-6" />,
    title: "Tratamientos",
    description: "Registra y da seguimiento a tratamientos con evidencia fotográfica."
  },
  {
    icon: () => <Check className="h-6 w-6" />,
    title: "Facturación",
    description: "Control de pagos con múltiples métodos y cupones de descuento."
  },
  {
    icon: () => <Check className="h-6 w-6" />,
    title: "Reportes",
    description: "Analíticas y reportes detallados de tu consultorio."
  },
  {
    icon: () => <Check className="h-6 w-6" />,
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