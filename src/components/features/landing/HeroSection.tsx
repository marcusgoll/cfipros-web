'use client';

import { Button } from '@/components/ui/button';
import { usePostHog } from 'posthog-js/react';
import { ChevronRight, FileText } from 'lucide-react';

export function HeroSection() {
  const posthog = usePostHog();

  const trackCTA = (ctaType: string) => {
    posthog?.capture('landing_cta_clicked', {
      section: 'hero',
      cta_type: ctaType,
    });
  };

  return (
    <section className="py-20 md:py-32 border-b border-border">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center text-center max-w-[800px] mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            ACS Extractor: <span className="text-highlight">Analyze FAA Knowledge Tests</span> with
            precision
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-[600px]">
            Automatically extract and <span className=" font-medium">categorize</span> FAA Knowledge
            Test questions according to{' '}
            <span className="font-medium">Airman Certification Standards</span>, identify weak
            areas, and create <span className="font-medium">targeted training plans</span>.
          </p>
          <div className="mb-16">
            <Button
              onClick={() => trackCTA('get-started')}
              className="bg-primary hover:bg-highlight/90 text-white text-lg py-6 px-8 rounded-lg shadow-lg shadow-highlight/20 transform transition-transform hover:scale-105"
            >
              Get Started – Free
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          {/* ACS Extractor visualization */}
          <div className="relative w-full max-w-[680px] aspect-video bg-card rounded-lg border border-border flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-highlight/10 rounded-lg" />
            <div className="relative z-10 flex flex-col items-center justify-center gap-3 p-6">
              <FileText className="h-12 w-12 text-highlight mb-2" />
              <h3 className="text-xl font-medium">ACS Extractor</h3>
              <p className="text-sm text-muted-foreground text-center max-w-[400px]">
                Upload your FAA Knowledge Test results and get an instant breakdown of performance
                by ACS codes, identifying areas for improvement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
