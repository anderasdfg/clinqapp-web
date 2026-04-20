interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}

interface FeaturesBarProps {
  features: Feature[];
}

export default function FeaturesBar({ features }: FeaturesBarProps) {
  return (
    <section className="py-12 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-6">
          <div className="grid grid-cols-3 md:grid-cols-3 gap-6">
            {features.map((feature: Feature, index: number) => {
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
