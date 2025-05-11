import { RoleSelection } from '@/components/features/auth/RoleSelection';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Select Your Role | CFI PROS',
  description: "Choose how you'll use the CFI PROS platform",
};

export default function RoleSelectionPage() {
  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <RoleSelection />
    </div>
  );
} 