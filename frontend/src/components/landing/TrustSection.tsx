import { useEffect, useRef } from 'react';
import { X, Check, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { landingContent } from '../../constants/landingContent';

const { trust } = landingContent;

gsap.registerPlugin(ScrollTrigger);

export default function TrustSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const problemRef = useRef<HTMLDivElement>(null);
  const solutionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate problem card
      gsap.from(problemRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
        x: -100,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });

      // Animate solution card
      gsap.from(solutionRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
        x: 100,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.2,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="relative py-24 px-6 md:px-12 lg:px-24 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            {trust.header.title}
            <span className="gradient-text">{trust.header.highlight}</span>
            {trust.header.question}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            {trust.header.description}
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-12 max-w-5xl mx-auto">
          {/* Problem Card */}
          <div 
            ref={problemRef} 
            className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <X className="w-5 h-5 text-red-500" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{trust.problem.title}</h3>
            </div>
            <ul className="space-y-4">
              {trust.problem.items.map((item: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <span className="text-gray-700 text-sm md:text-base">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Solution Card */}
          <div 
            ref={solutionRef} 
            className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-cyan to-brand-purple flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{trust.solution.title}</h3>
            </div>
            <ul className="space-y-4">
              {trust.solution.items.map((item: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-cyan flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <span className="text-gray-900 font-medium text-sm md:text-base">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to={trust.cta.to}
            className="glass-button inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold text-lg group shadow-lg hover:shadow-xl transition-all"
          >
            {trust.cta.text}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            {trust.cta.subtext}
          </p>
        </div>
      </div>
    </section>
  );
}
