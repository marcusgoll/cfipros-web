import { Metadata } from 'next';
import HeroSection from '@/components/features/landing/HeroSection';
import FeaturesSection from '@/components/features/landing/FeaturesSection';
import RoleSpecificBenefits from '@/components/features/landing/RoleSpecificBenefits';
import TestimonialSection from '@/components/features/landing/TestimonialSection';
import PricingSection from '@/components/features/landing/PricingSection';
import FAQSection from '@/components/features/landing/FAQSection';

export const metadata: Metadata = {
  title: 'CFIPros - Flight Training Platform',
  description:
    'Connect with flight instructors, track your training progress, and manage your flight school with our all-in-one platform.',
};

export default function Home() {
  return (
    <main className="flex flex-col w-full">
      <HeroSection />
      <FeaturesSection />
      <RoleSpecificBenefits />
      <TestimonialSection />
      <PricingSection />
      <FAQSection />
    </main>
  );
}
