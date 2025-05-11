import { ProfileSetupForm } from '@/components/features/auth/ProfileSetupForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Complete Your Profile | CFI PROS',
  description: 'Complete your profile to get started',
};

export default function ProfileSetupPage() {
  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <ProfileSetupForm />
    </div>
  );
}
