import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import BenefitsSection from '../components/landing/BenefitsSection';
import TrustSection from '../components/landing/TrustSection';
import PricingSection from '../components/landing/PricingSection';
/* import ContactSection from '../components/landing/ContactSection';
 */import FooterCTA from '../components/landing/FooterCTA';
import '../styles/liquid-glass.css';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Liquid Orbs Background - Real ClinqApp Colors */}
      <div className="liquid-orb liquid-orb-purple w-96 h-96 top-20 -left-48 animate-float" />
      <div className="liquid-orb liquid-orb-cyan w-80 h-80 top-1/2 -right-40 animate-float" style={{ animationDelay: '5s' }} />
      <div className="liquid-orb liquid-orb-violet w-72 h-72 bottom-20 left-1/4 animate-float" style={{ animationDelay: '10s' }} />
      
      {/* Content */}
      <Navbar />
      <HeroSection />
      <BenefitsSection />
      <TrustSection />
      <PricingSection />
     {/*  <ContactSection /> */}
      <FooterCTA />
    </div>
  );
}
