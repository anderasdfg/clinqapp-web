import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { landingContent } from '../../constants/landingContent';

const { contact } = landingContent;

gsap.registerPlugin(ScrollTrigger);

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate info card
      gsap.from(infoRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
        x: -50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });

      // Animate form card
      gsap.from(formRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
        x: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.2,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic for form submission could be added here
    alert('Mensaje enviado con éxito (Demostración)');
  };

  return (
    <section 
      ref={sectionRef} 
      id="contacto" 
      className="relative py-24 px-6 md:px-12 lg:px-24 bg-gradient-to-br from-gray-50 via-white to-gray-100"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            {contact.header.title}
            <span className="gradient-text">{contact.header.highlight}</span>
            {contact.header.question}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            {contact.header.description}
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 items-start">
          {/* Contact Info */}
          <div ref={infoRef} className="lg:col-span-2 space-y-8">
            <div className="glass-card-strong p-8 rounded-3xl refraction-effect bg-white/40 border border-white/50 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">{contact.info.title}</h3>
              <div className="space-y-6">
                {contact.info.items.map((item: any, index: number) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-brand-cyan to-brand-purple rounded-xl flex items-center justify-center text-white flex-shrink-0">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{item.label}</p>
                        {item.href ? (
                          <a href={item.href} className="text-lg font-bold text-gray-900 hover:text-brand-purple transition-colors">
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-lg font-bold text-gray-900">{item.value}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Subtle decorative element */}
            <div className="relative group overflow-hidden rounded-3xl h-32 bg-gradient-to-br from-brand-purple/10 to-brand-cyan/10 border border-white/50 backdrop-blur-sm flex items-center justify-center p-6 italic text-gray-500">
              "Llevando la podología al siguiente nivel con tecnología y trato humano."
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-brand-purple/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            </div>
          </div>

          {/* Contact Form */}
          <div ref={formRef} className="lg:col-span-3">
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100">
              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-1 space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">{contact.form.fields.name.label}</label>
                  <input 
                    type="text" 
                    required
                    placeholder={contact.form.fields.name.placeholder}
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 outline-none transition-all bg-gray-50/50"
                  />
                </div>
                <div className="md:col-span-1 space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">{contact.form.fields.email.label}</label>
                  <input 
                    type="email" 
                    required
                    placeholder={contact.form.fields.email.placeholder}
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 outline-none transition-all bg-gray-50/50"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">{contact.form.fields.subject.label}</label>
                  <input 
                    type="text" 
                    required
                    placeholder={contact.form.fields.subject.placeholder}
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 outline-none transition-all bg-gray-50/50"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">{contact.form.fields.message.label}</label>
                  <textarea 
                    rows={4}
                    required
                    placeholder={contact.form.fields.message.placeholder}
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 outline-none transition-all bg-gray-50/50 resize-none"
                  />
                </div>
                <div className="md:col-span-2 pt-4">
                  <button 
                    type="submit"
                    className="glass-button w-full py-5 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all group"
                  >
                    {contact.form.submit.text}
                    <contact.form.submit.icon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
