import { useEffect, useRef } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { landingContent } from '../../constants/landingContent';

const { pricing } = landingContent;

gsap.registerPlugin(ScrollTrigger);

export default function PricingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      if (headerRef.current) {
        gsap.fromTo(headerRef.current.children, 
          { y: -40, opacity: 0 },
          {
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
              toggleActions: 'play none none none',
            },
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
          }
        );
      }

      // Cards animation
      if (cardsRef.current) {
        gsap.fromTo(cardsRef.current.children,
          { y: 60, opacity: 0 },
          {
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
              toggleActions: 'play none none none',
            },
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power3.out',
          }
        );
      }
    }, sectionRef);

    // Refresh ScrollTrigger to handle layout changes (like commented out sections)
    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      id="precios" 
      className="relative py-24 px-6 md:px-12 lg:px-24 bg-white"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div ref={headerRef} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            {pricing.header.title}
            <span className="gradient-text">{pricing.header.highlight}</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            {pricing.header.description}
          </p>
        </div>

        {/* Pricing Cards */}
        <div ref={cardsRef} className="grid md:grid-cols-3 gap-8 items-center pt-8">
          {pricing.plans.map((plan: any, index: number) => (
            <div
              key={index}
              className={`relative p-8 rounded-3xl border transition-all duration-300 ${
                plan.highlighted 
                  ? 'bg-white border-brand-purple shadow-2xl scale-105 -translate-y-6 z-10' 
                  : 'bg-gray-50/50 border-gray-100 shadow-lg hover:-translate-y-2 z-0'
              } hover:shadow-xl`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                  <span className="bg-brand-purple text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider inline-block shadow-lg">
                    Más Popular
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <p className="text-sm text-gray-600 mt-4 leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature: string, fIndex: number) => (
                  <li key={fIndex} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 ${plan.highlighted ? 'text-brand-purple' : 'text-brand-cyan'} flex-shrink-0`} strokeWidth={2.5} />
                    <span className="text-gray-700 text-sm leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/app/register"
                className={`w-full py-4 rounded-xl font-bold text-center flex items-center justify-center gap-2 transition-all ${
                  plan.highlighted
                    ? 'glass-button text-white shadow-lg'
                    : 'bg-white border-2 border-gray-200 text-gray-900 hover:border-brand-purple hover:text-brand-purple'
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
