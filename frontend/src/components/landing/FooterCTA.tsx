import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { landingContent } from '../../constants/landingContent';

const { footer, hero } = landingContent;
const { logo } = hero;

export default function FooterCTA() {
  return (
    <footer id="contacto"  className="relative py-24 px-6 md:px-12 lg:px-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Final CTA */}
        <div className="glass-card-strong p-12 md:p-16 rounded-3xl text-center mb-16 refraction-effect">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {footer.cta.title}<span className="gradient-text">{footer.cta.highlight}</span>{footer.cta.end}
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {footer.cta.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={footer.cta.primaryBtn.to}
              className="glass-button px-8 py-4 rounded-full text-white font-semibold text-lg inline-flex items-center justify-center gap-2 group"
            >
              {footer.cta.primaryBtn.text}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href={footer.cta.secondaryBtn.href}
              className="glass-button-secondary px-8 py-4 rounded-full text-gray-900 font-semibold text-lg inline-flex items-center justify-center gap-2"
            >
              {footer.cta.secondaryBtn.text}
            </a>
          </div>
        </div>

        {/* Footer Content */}
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src={logo.src} alt={logo.alt} className="w-10 h-10" />
              <span className="text-xl font-bold text-gray-900">{logo.name}</span>
            </div>
            <p className="text-gray-600 text-sm">
              {footer.brand.description}
            </p>
          </div>

          {/* Dynamic Sections */}
          {footer.sections.map((section: any, index: number) => (
            <div key={index}>
              <h3 className="font-bold text-gray-900 mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link: any, lIndex: number) => (
                  <li key={lIndex}>
                    <a href={link.href} className="text-gray-600 hover:text-brand-purple transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">{footer.contact.title}</h3>
            <ul className="space-y-3">
              {footer.contact.items.map((item: any, index: number) => {
                const Icon = item.icon;
                return (
                  <li key={index} className="flex items-start gap-2 text-gray-600">
                    <Icon className="w-4 h-4 text-brand-cyan flex-shrink-0 mt-1" />
                    {item.href ? (
                      <a href={item.href} className="hover:text-brand-purple transition-colors">
                        {item.label}
                      </a>
                    ) : (
                      <span>{item.label}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              {footer.bottom.copyright}
            </p>
            <div className="flex gap-6">
              {footer.bottom.links.map((link: any, index: number) => (
                <a key={index} href={link.href} className="text-sm text-gray-600 hover:text-brand-purple transition-colors">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
