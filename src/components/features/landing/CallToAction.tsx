'use client';

import { Button } from '@/components/ui/button';
import { usePostHog } from 'posthog-js/react';
import { Check, ChevronRight } from 'lucide-react';

export function CallToAction() {
  const posthog = usePostHog();

  const trackCTA = (ctaType: string) => {
    posthog?.capture('landing_cta_clicked', {
      section: 'final',
      cta_type: ctaType,
    });
  };

  return (
    <section className="py-20">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="max-w-3xl mx-auto">
          {/* Retro-style pricing box */}
          <div className="relative bg-card border-2 border-highlight rounded-lg overflow-hidden shadow-lg mt-6">
            {/* Pricing content */}
            <div className="p-8">
              <div className="flex flex-col items-center text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Start for <span className="text-highlight">free</span>, upgrade when you&apos;re
                  ready
                </h2>
                <p className="text-xl text-muted-foreground">
                  Our free tier gives you everything you need to get started and see results.
                </p>
              </div>

              {/* Free tier highlights */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-3">
                  <h3 className="text-lg font-bold border-b border-border pb-2">
                    Included in Free
                  </h3>
                  <ul className="space-y-2">
                    {[
                      'Up to 5 active students',
                      'Basic knowledge test analysis',
                      'Student performance tracking',
                      'Standard reporting tools',
                      'Email support',
                    ].map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-highlight shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-bold border-b border-border pb-2">
                    Premium Features
                  </h3>
                  <ul className="space-y-2">
                    {[
                      'Unlimited students',
                      'Advanced analytics',
                      'AI-powered lesson plans',
                      'Custom reporting',
                      'Integration APIs',
                      'Priority support',
                    ].map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-muted-foreground">
                        <span className="h-5 w-5 border border-muted-foreground rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs">+</span>
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-highlight hover:bg-highlight/90 text-white"
                  onClick={() => trackCTA('get-started-free')}
                >
                  Get Started – Free
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => trackCTA('see-pricing')}>
                  See All Pricing
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
