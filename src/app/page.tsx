import type { Metadata } from 'next';
import { HeroSection } from '@/components/features/landing/HeroSection';
import { ProductMatrix } from '@/components/features/landing/ProductMatrix';
import { ValueSection } from '@/components/features/landing/ValueSection';
import { RoadmapSection } from '@/components/features/landing/RoadmapSection';
import { CallToAction } from '@/components/features/landing/CallToAction';
import { SectionObserver } from '@/components/features/landing/SectionObserver';

export const metadata: Metadata = {
  title: 'CFIPros - Flight Training Analytics Platform',
  description:
    'Helping flight instructors build successful pilots with data-driven insights and training tools.',
  keywords: 'flight training, CFI, flight instructor, aviation, training analytics, pilot training',
};

export default function LandingPage() {
  return (
    <>
      <SectionObserver sectionId="hero" sectionName="Hero">
        <HeroSection />
      </SectionObserver>
      <SectionObserver sectionId="products" sectionName="Products">
        <ProductMatrix />
      </SectionObserver>
      <SectionObserver sectionId="value" sectionName="Value Proposition">
        <ValueSection />
      </SectionObserver>
      <SectionObserver sectionId="roadmap" sectionName="Roadmap">
        <RoadmapSection />
      </SectionObserver>
      <SectionObserver sectionId="cta" sectionName="Call To Action">
        <CallToAction />
      </SectionObserver>
    </>
  );
}
