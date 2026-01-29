import { useRef } from 'react';
import { landingContent } from '../../constants/landingContent';

const { benefits } = landingContent;

export default function BenefitsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  return (
    <section 
      ref={sectionRef} 
      id="funcionalidades" 
      className="relative py-24 px-6 md:px-12 lg:px-24 bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            {benefits.header.title}
            <span className="gradient-text">{benefits.header.highlight}</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {benefits.header.description}
          </p>
        </div>

        {/* Benefits Cards */}
        <div ref={cardsRef} className="grid md:grid-cols-3 gap-8 mb-12">
          {benefits.items.map((benefit: any, index: number) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                {/* Image with Badge */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={benefit.image} 
                    alt={benefit.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`${benefit.badgeColor} text-white text-xs font-semibold px-3 py-1.5 rounded-full`}>
                      {benefit.badge}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Icon */}
                  <div className={`w-12 h-12 ${benefit.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${benefit.iconColor}`} strokeWidth={2.5} />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {benefit.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Features Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {benefits.features.map((feature: any, index: number) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 justify-center"
                >
                  <Icon className="w-5 h-5 text-brand-purple" />
                  <span className="text-gray-900 font-medium text-sm">
                    {feature.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
