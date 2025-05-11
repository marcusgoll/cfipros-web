import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  highlighted?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    id: 'student-tier',
    name: 'Student',
    description: 'Perfect for flight students at any stage of training',
    price: 'Free',
    features: [
      'Digital logbook',
      'Progress tracking',
      'Find & connect with CFIs',
      'Basic scheduling tools',
      'Training resources',
    ],
    ctaText: 'Sign Up Free',
    ctaLink: '/sign-up?role=student',
  },
  {
    id: 'cfi-tier',
    name: 'Certified Flight Instructor',
    description: 'Professional tools for independent CFIs',
    price: '$29.99',
    features: [
      'Student management',
      'Digital endorsements',
      'Advanced scheduling',
      'Student progress tracking',
      'Get discovered by students',
      'Billing & payment tools',
    ],
    ctaText: 'Start 14-Day Free Trial',
    ctaLink: '/cfi-sign-up',
    highlighted: true,
  },
  {
    id: 'school-tier',
    name: 'Flight School',
    description: 'Complete management solution for flight schools',
    price: 'Custom',
    features: [
      'Multiple instructor management',
      'Fleet management',
      'Student enrollment',
      'Advanced analytics',
      'Custom branding',
      'Priority support',
      'API access',
    ],
    ctaText: 'Contact Sales',
    ctaLink: '/school-sign-up',
  },
];

export default function PricingSection() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Plans for everyone in the flight training ecosystem
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.id}
              className={`border ${
                tier.highlighted
                  ? 'border-blue-500 dark:border-blue-400 shadow-lg relative'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {tier.highlighted && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}

              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <p className="text-gray-500 dark:text-gray-400 mt-2">{tier.description}</p>
              </CardHeader>

              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {tier.price}
                  </span>
                  {tier.price !== 'Free' && tier.price !== 'Custom' && (
                    <span className="text-gray-500 dark:text-gray-400 ml-2">/month</span>
                  )}
                </div>

                <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <li key={`${tier.id}-feature-${index}`} className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-green-500 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <title>Check Icon</title>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  asChild
                  className={`w-full ${
                    tier.highlighted
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600'
                  }`}
                >
                  <Link href={tier.ctaLink}>{tier.ctaText}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
