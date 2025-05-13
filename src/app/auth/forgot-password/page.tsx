import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/features/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot Password - CFIPros',
  description: 'Reset your CFIPros account password.',
};

export default function ForgotPasswordPage() {
  return (
    <div className="container mx-auto flex min-h-screen flex-col justify-center bg-background py-12">
      <div className="w-full mx-auto max-w-md space-y-8">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
