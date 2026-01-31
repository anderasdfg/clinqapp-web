import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { landingContent } from '../../constants/landingContent';

gsap.registerPlugin(ScrollTrigger);

const { hero } = landingContent;
const { badge, title, ctas, socialProof } = hero;

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Entrance animations
  useEffect(() => {
    // GSAP Animations
    const ctx = gsap.context(() => {

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

      /* // Floating animation for mockup
      gsap.to(mockupRef.current, {
        y: -15,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      }); */
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // Scrollytelling video synchronization
  useGSAP(() => {
    if (!isVideoLoaded || !videoRef.current || !heroRef.current) return;
    
    // Only initialize ScrollTrigger on desktop (min-width: 1024px)
    const mm = gsap.matchMedia();
    const video = videoRef.current;
    video.currentTime = 0;

    mm.add("(min-width: 1024px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "+=200%", // 200% scroll distance
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        }
      });

      tl.fromTo(
        video,
        { currentTime: 0 },
        {
          currentTime: video.duration || 0,
          ease: "none",
        }
      );
    });

    return () => mm.revert();
  }, { dependencies: [isVideoLoaded], scope: heroRef });

  return (
    <section ref={heroRef} className="relative pt-32 pb-32 px-6 md:px-12 lg:px-24">
      {/* Hero Content */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Column - Text */}
        <div className="space-y-8 z-50">
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

          <p className="text-xl text-gray-600 leading-relaxed whitespace-pre-line">
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

        {/* Right Column - Video Scrollytelling */}
        <div ref={mockupRef} className="relative hidden lg:flex items-center justify-center lg:justify-end">
          <div className="w-full max-w-[850px] lg:scale-[1.5] lg:origin-center transition-transform duration-1000">
            <video
              ref={videoRef}
              src="/output_web.webm"
              muted
              playsInline
              preload="auto"
              onLoadedMetadata={() => setIsVideoLoaded(true)}
              className="w-full h-auto object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.18)] pointer-events-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
