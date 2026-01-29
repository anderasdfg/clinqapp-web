import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { landingContent } from '../../constants/landingContent';

const { hero } = landingContent;
const { logo, navigation, badge, title, ctas, socialProof, mockup, stats } = hero;

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP Animations
    const ctx = gsap.context(() => {
      // Navigation fade in from top
      gsap.from(navRef.current, {
        y: -100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      });

      // Headline animation with stagger
      gsap.from(headlineRef.current?.children || [], {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.3,
      });

      // CTA buttons scale in
      gsap.from(ctaRef.current?.children || [], {
        scale: 0.8,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'back.out(1.7)',
        delay: 0.8,
      });

      // Mockup 3D entrance
      gsap.from(mockupRef.current, {
        x: 100,
        opacity: 0,
        rotateY: -15,
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.5,
      });

      // Floating animation for mockup
      gsap.to(mockupRef.current, {
        y: -15,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative pt-10 pb-32 px-6 md:px-12 lg:px-24">
      {/* Navigation */}
      <nav ref={navRef} className="bg-white/40 backdrop-blur-xl border border-white/50 shadow-lg max-w-7xl mx-auto mb-16 px-4 py-3 md:px-6 md:py-4 flex items-center justify-between rounded-2xl">
        <div className="flex items-center gap-2 md:gap-3">
          <img src={logo.src} alt={logo.alt} className="w-8 h-8 md:w-10 md:h-10" />
          <span className="text-lg md:text-xl font-bold text-gray-900">{logo.name}</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {navigation.map((nav: any, index: number) => (
            <a key={index} href={nav.href} className="text-gray-700 hover:text-brand-purple transition-colors">
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
            className="glass-button px-4 py-2 md:px-6 md:py-2.5 rounded-full text-white font-semibold flex items-center gap-2 text-sm md:text-base"
          >
            Empezar
            <ctas.primary.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Column - Text */}
        <div className="space-y-8">
          <div className="inline-block">
            <div className="glass-card px-4 py-2 text-sm text-brand-cyan font-medium flex items-center gap-2">
              <badge.icon className="w-4 h-4" />
              {badge.text}
            </div>
          </div>

          <h1 ref={headlineRef} className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
            <div>{title.line1}</div>
            <div className="gradient-text">{title.highlight}</div>
            <div>{title.line2}</div>
          </h1>

          <p className="text-xl text-gray-600 leading-relaxed">
            {hero.description}
          </p>

          {/* CTAs */}
          <div ref={ctaRef} className="glass-card p-6 rounded-3xl inline-block">
            <div className="flex flex-col sm:flex-row gap-4 relative z-10">
              <Link 
                to={ctas.primary.to} 
                className="glass-button px-8 py-4 rounded-full text-white font-semibold text-lg flex items-center justify-center gap-2 group relative z-10"
              >
                {ctas.primary.text}
                <ctas.primary.icon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="glass-button-secondary px-8 py-4 rounded-full text-gray-900 font-semibold text-lg flex items-center justify-center gap-2 group relative z-10">
                <ctas.secondary.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {ctas.secondary.text}
              </button>
            </div>
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-cyan to-brand-purple border-2 border-white"
                />
              ))}
            </div>
            <p className="text-sm text-gray-600">
              {socialProof.textStart}<span className="font-semibold text-gray-900">{socialProof.highlight}</span>{socialProof.textEnd}
            </p>
          </div>
        </div>

        {/* Right Column - Mockup */}
        <div ref={mockupRef} className="relative">
          <div className="glass-card-strong p-8 refraction-effect">
            <img 
              src={mockup.src} 
              alt={mockup.alt} 
              className="w-full h-auto drop-shadow-2xl rounded-xl"
            />
          </div>
          
          {/* Floating Stats Card */}
          <div className="absolute -bottom-6 -left-6 glass-card p-6 max-w-xs animate-bounce">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center text-white text-2xl">
                {stats.emoji}
              </div>
              <div>
                <p className="text-sm text-gray-600">{stats.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.value}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
