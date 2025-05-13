import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing | CFIPros',
  description:
    'Explore flexible pricing options for CFIPros tools and analytics for flight instructors and schools.',
};

export default function PricingPage() {
  const features = [
    'Feature placeholder one',
    'Feature placeholder two',
    'Feature placeholder three',
    'Feature placeholder four',
  ];

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <h1 className="text-4xl font-bold mb-6">Pricing</h1>

      <div className="bg-muted p-6 rounded-lg mb-8 text-center">
        <p className="text-lg mb-2">This is a placeholder page for the Pricing section.</p>
        <p className="text-muted-foreground">More content will be added soon.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Pricing tiers */}
        {[
          { name: 'Individual', price: '$29', period: 'monthly' },
          { name: 'Professional', price: '$79', period: 'monthly', popular: true },
          { name: 'Enterprise', price: 'Contact Us', period: 'custom' },
        ].map((tier) => (
          <div
            key={tier.name}
            className={`border rounded-lg p-6 ${tier.popular ? 'ring-2 ring-primary relative' : ''}`}
          >
            {tier.popular && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs px-3 py-1 rounded-full">
                Most Popular
              </div>
            )}
            <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold">{tier.price}</span>
              {tier.period !== 'custom' && (
                <span className="text-muted-foreground">/{tier.period}</span>
              )}
            </div>
            <ul className="space-y-2 mb-6">
              {features.map((feature) => (
                <li key={feature} className="flex items-center">
                  <svg
                    className="h-5 w-5 text-green-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={`w-full py-2 px-4 rounded ${
                tier.popular
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted hover:bg-muted/80'
              } transition`}
            >
              {tier.price === 'Contact Us' ? 'Contact Sales' : 'Get Started'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
