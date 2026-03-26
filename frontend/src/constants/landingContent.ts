import {
  Camera,
  Calendar,
  FileText,
  ArrowRight,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  Send,
  Target,
  MessageCircle,
  CreditCard,
  RefreshCw,
} from "lucide-react";

// Images
import logoIcon from "@/assets/images/logos/logo-icon.png";
import heroMockup from "@/assets/images/landing/hero-mockup.png";
import clinicalPhoto from "@/assets/images/landing/clinical-photography.png";
import smartCalendar from "@/assets/images/landing/smart-calendar.png";
import digitalRecords from "@/assets/images/landing/digital-records.png";

export const landingContent = {
  hero: {
    logo: {
      src: logoIcon,
      alt: "ClinqApp",
      name: "ClinqApp",
    },
    navigation: [
      { label: "Funcionalidades", href: "#funcionalidades" },
      { label: "Precios", href: "#precios" },
      { label: "Contacto", href: "#contacto" },
    ],
    badge: {
      text: "La nueva forma de gestión",
      icon: Sparkles,
    },
    title: {
      line1: "Tu Clínica Podológica,",
      highlight: "Organizada",
      line2: "y Visual",
    },
    description:
      "La primera herramienta diseñada para podólogos. \nGestiona citas, ingresos y, sobre todo, \nla evidencia visual de tus pacientes en un solo lugar.",
    ctas: {
      primary: {
        text: "Prueba Gratis 14 Días",
        to: "/app/register",
        icon: ArrowRight,
      },
      secondary: {
        text: "Contáctanos",
        icon: Phone,
      },
    },
    socialProof: {
      textStart: "Usado por ",
      highlight: "podólogos y clínicas",
      textEnd: " en Perú",
    },
    mockup: {
      src: heroMockup,
      alt: "ClinqApp Interface",
    },
    stats: {
      label: "Ingresos Hoy",
      value: "+ S/.450,00",
      emoji: "💰",
    },
  },
  benefits: {
    header: {
      title: "Todo lo que necesitas para ",
      highlight: "gestionar tu clínica",
      description:
        "Diseñado específicamente para podólogos modernos que valoran la evidencia visual y la eficiencia clínica.",
    },
    items: [
      {
        icon: Camera,
        title: "Fotografía Clínica",
        description:
          "Captura y compara la evolución de tus pacientes. Organiza la evidencia visual automáticamente en el historial clínico.",
        badge: "Evidencia Visual",
        badgeColor: "bg-cyan-500",
        image: clinicalPhoto,
        iconBg: "bg-cyan-100",
        iconColor: "text-cyan-600",
      },
      {
        icon: Calendar,
        title: "Agenda Inteligente",
        description:
          "Optimiza tus citas con recordatorios automáticos por WhatsApp. Reduce el ausentismo y llena tus huecos libres.",
        badge: "Gestión Inteligente",
        badgeColor: "bg-purple-500",
        image: smartCalendar,
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600",
      },
      {
        icon: FileText,
        title: "Historia Clínica 100% Digital",
        description:
          "Olvídate del papel. Accede a los datos de tus pacientes desde cualquier dispositivo con la máxima seguridad en la nube.",
        badge: "Datos Seguros",
        badgeColor: "bg-blue-500",
        image: digitalRecords,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
      },
    ],
    features: [
      { icon: Target, text: "14 días de prueba gratis" },
      { icon: MessageCircle, text: "Soporte 24/7" },
      { icon: CreditCard, text: "Sin tarjeta de crédito" },
      { icon: RefreshCw, text: "Cancela cuando quieras" },
    ],
  },
  trust: {
    header: {
      title: "¿Cansado del ",
      highlight: "caos administrativo",
      question: "?",
      description:
        "Deja atrás las agendas de papel y las hojas de cálculo desorganizadas.",
    },
    problem: {
      title: "Sin ClinqApp",
      items: [
        "Agendas de papel difíciles de leer",
        "Pérdida de historiales clínicos",
        "Citas olvidadas y ausentismo",
        "Caja desorganizada sin reportes",
        "Fotos perdidas en el celular",
      ],
    },
    solution: {
      title: "Con ClinqApp",
      items: [
        "Agenda digital sincronizada en todos tus dispositivos",
        "Historiales clínicos visuales siempre accesibles",
        "Recordatorios automáticos por WhatsApp",
        "Reportes de caja en tiempo real",
        "Comparativas antes/después organizadas",
      ],
    },
    cta: {
      text: "Empieza tu prueba gratis",
      subtext: "Sin tarjeta de crédito requerida",
      to: "/app/register",
    },
  },
  pricing: {
    header: {
      title: "Planes que crecen ",
      highlight: "contigo",
      description:
        "Sin comisiones ocultas. Cancela o cambia de plan en cualquier momento.",
    },
    plans: [
      {
        name: "Básico",
        price: "S/.99",
        period: "/mes",
        description:
          "Ideal para podólogos independientes que empiezan a digitalizarse.",
        features: [
          "Hasta 100 pacientes",
          "Agenda básica",
          "Historial clínico digital",
          "Soporte por email",
        ],
        cta: "Empezar Gratis",
        highlighted: false,
      },
      {
        name: "Profesional",
        price: "S/.199",
        period: "/mes",
        description: "Nuestra opción más popular para clínicas en crecimiento.",
        features: [
          "Pacientes ilimitados",
          "Agenda inteligente con IA",
          "Módulo de fotografía avanzada",
          "Recordatorios WhatsApp ilimitados",
          "Soporte prioritario 24/7",
        ],
        cta: "Elegir Plan",
        highlighted: true,
      },
      {
        name: "Clínica",
        price: "S/.399",
        period: "/mes",
        description:
          "Para centros con múltiples especialistas y necesidades complejas.",
        features: [
          "Múltiples sedes/sucursales",
          "Gestión de staff ilimitada",
          "Reportes financieros avanzados",
          "API para integraciones",
          "Account Manager dedicado",
        ],
        cta: "Contactar Ventas",
        highlighted: false,
      },
    ],
  },
  contact: {
    header: {
      title: "¿Tienes alguna ",
      highlight: "duda",
      question: "?",
      description:
        "Estamos aquí para ayudarte. Escríbenos y te responderemos lo antes posible.",
    },
    info: {
      title: "Información de Contacto",
      items: [
        {
          icon: Mail,
          label: "Soporte Técnico",
          value: "clinqapp.team@gmail.com",
          href: "mailto:clinqapp.team@gmail.com",
        },
        {
          icon: Phone,
          label: "Ventas y Consultas",
          value: "+51 991 396 963",
          href: "wa.me/51991396963",
        },
        {
          icon: MapPin,
          label: "Nuestra Oficina",
          value: "Lima, Perú",
          href: "#",
        },
      ],
    },
    form: {
      fields: {
        name: { label: "Nombre Completo", placeholder: "Ej. Juan Pérez" },
        email: { label: "Correo Electrónico", placeholder: "juan@ejemplo.com" },
        subject: { label: "Asunto", placeholder: "¿En qué podemos ayudarte?" },
        message: {
          label: "Mensaje",
          placeholder: "Escribe tu mensaje aquí...",
        },
      },
      submit: {
        text: "Enviar Mensaje",
        icon: Send,
      },
    },
  },
  footer: {
    cta: {
      title: "¿Listo para ",
      highlight: "modernizar",
      end: " tu consulta?",
      description:
        "Únete a más de 500 podólogos que ya confían en ClinqApp para gestionar sus clínicas",
      primaryBtn: {
        text: "Comenzar Prueba Gratis",
        to: "/app/register",
      },
      secondaryBtn: {
        text: "Hablar con Ventas",
        href: "#contacto",
      },
    },
    brand: {
      description: "La herramienta líder para clínicas podológicas en Perú",
    },
    sections: [
      {
        title: "Producto",
        links: [
          { label: "Funcionalidades", href: "#funcionalidades" },
          { label: "Precios", href: "#precios" },
          { label: "Integraciones", href: "#" },
          { label: "Actualizaciones", href: "#" },
        ],
      },
      {
        title: "Empresa",
        links: [
          { label: "Sobre Nosotros", href: "#" },
          { label: "Blog", href: "#" },
          { label: "Casos de Éxito", href: "#" },
          { label: "Trabaja con Nosotros", href: "#" },
        ],
      },
    ],
    contact: {
      title: "Contacto",
      items: [
        {
          icon: Mail,
          label: "clinqapp.team@gmail.com",
          href: "mailto:clinqapp.team@gmail.com",
        },
        { icon: Phone, label: "+51 991 396 963", href: "wa.me/51991396963" },
        { icon: MapPin, label: "Lima, Perú" },
      ],
    },
    bottom: {
      copyright: "© 2026 ClinqApp. Todos los derechos reservados.",
      links: [
        { label: "Privacidad", href: "#" },
        { label: "Términos", href: "#" },
        { label: "Cookies", href: "#" },
      ],
    },
  },
};
