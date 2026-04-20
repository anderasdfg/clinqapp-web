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
      line1: "Gestiona tu,",
      highlight: "Centro Podológico",
      line2: "desde un solo lugar",
    },
    description:
      "El primer software diseñado especialmente para podólogos. \n Gestiona historias clínicas, citas, ingresos y, sobre todo,  \n la evolucion de tus pacientes en un solo lugar",
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
        "Menos desorden, más control y mejor atención para tus pacientes.",
    },
    items: [
      {
        icon: Camera,
        title: "Fotografía Clínica",
        description:
          "Guarda y compara la evolución de tus pacientes fácilmente. \n Ten toda la evidencia visual organizada sin perder fotos ni información.",
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
          "Organiza tus citas sin enredos. \n Recibe recordatorios automáticos y evita espacios vacíos en tu agenda.",
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
          "Toda la información de tus pacientes en un solo lugar. \nAccede rápido, sin papeles y desde cualquier dispositivo.",
        badge: "Datos Seguros",
        badgeColor: "bg-blue-500",
        image: digitalRecords,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
      },
    ],
    features: [
      { icon: Target, text: "Pago mensual o anual" },
      { icon: MessageCircle, text: "Ahorra 20% Anual" },
      { icon: CreditCard, text: "Sin contratos" },      
    ],
  },
  trust: {
    header: {
      title: "¿Sientes que tu clínica está ",
      highlight: "fuera de control",
      question: "?",
      description:
        "Deja atrás las agendas de papel y las hojas de cálculo desorganizadas.",
    },
    problem: {
      title: "Sin ClinqApp",
      items: [
        "Historias clínicas incompletas o perdidas",
        "Agendas en papel que nadie entiende",
        "No recuerdas qué tratamiento hiciste en cada visita",
        "Falta de claridad en tus ingresos",
        "Fotos perdidas en el celular",
      ],
    },
    solution: {
      title: "Con ClinqApp",
      items: [
        "Toda la información de tus pacientes en un solo lugar",
        "Agenda ordenada y sin enredos",
        "Historial claro de cada tratamiento por visita",
        "Ingresos organizados y fáciles de entender",
        "Fotos y evolución de pacientes bien organizadas",
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
        "Sin comisiones ocultas. Cancela cuando quieras.",
    },
    plans: [
      {
        name: "Básico",
        price: "S/.59",
        period: "/mes",
        description:
          "Ideal para podólogos independientes que quieren empezar a organizar su consulta (1 podólogo)",
        features: [
          "Gestión de agenda y citas en tiempo real",
          "Registro completo de pacientes",
          "Historias clínicas digitales organizadas",
          "Control básico de ingresos",
        ],
        cta: "Empezar gratis →",
        highlighted: false,
      },
      {
        name: "Profesional",
        price: "S/.120",
        period: "/mes",
        description: "Nuestra opción más elegida por clínicas en crecimiento (Hasta 4 podólogos)",
        badge: "Más popular",
        features: [
          "Incluye todo lo del plan Básico, más:",
          "Seguimiento visual de pacientes con fotografías",
          "Recordatorios automáticos para reducir ausencias",
          "Control completo de ingresos",
          "Gestión de inventario de productos"
        ],
        cta: "Elegir plan →",
        highlighted: true,
      },
      {
        name: "Clínica",
        price: "Precio personalizado",
        period: "",
        description:
          "Para centros con múltiples especialistas y mayor volumen (Más de 4 podólogos)",
        features: [
          "Incluye todo lo del plan Profesional, más:",
          "Gestión avanzada de múltiples usuarios",
          "Reportes financieros y operativos en tiempo real",
          "Soporte prioritario y acompañamiento",
          "Configuración adaptada a tu clínica"
        ],        
        cta: "Contactar ventas →",
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
        "Únete a quienes ya están llevando su clínica al siguiente nivel con ClinqApp.",
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
