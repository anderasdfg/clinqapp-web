import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { landingContent } from '../../constants/landingContent';

const { hero } = landingContent;
const { logo, navigation } = hero;

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Navigation fade in from top
    gsap.from(navRef.current, {
      y: -100,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
    });
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <nav 
        ref={navRef} 
        className="bg-white/10 backdrop-blur-glass border border-white/30 shadow-glass-lg max-w-7xl mx-auto px-4 py-3 md:px-6 md:py-4 flex items-center justify-between rounded-[2rem]"
      >
        <div className="flex items-center gap-2 md:gap-3">
          <img src={logo.src} alt={logo.alt} className="w-8 h-8 md:w-10 md:h-10" />
          <span className="text-lg md:text-xl font-bold text-gray-900 italic hover:text-brand-purple">{logo.name}</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          {navigation.map((nav: any, index: number) => (
            <a 
              key={index} 
              href={nav.href} 
              className="text-gray-700 hover:text-brand-purple transition-colors font-medium"
            >
              {nav.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Link 
            to="/app/login" 
            className="hidden sm:block text-gray-700 hover:text-brand-purple transition-colors font-medium"
          >
            Iniciar sesión
          </Link>
          <Link 
            to="/app/register" 
            className="glass-button px-4 py-2 md:px-6 md:py-2.5 rounded-full text-white font-semibold flex items-center gap-2 text-sm md:text-base shadow-lg shadow-brand-cyan/20"
          >
            Empezar
            <hero.ctas.primary.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </Link>
        </div>
      </nav>
    </div>
  );
}
