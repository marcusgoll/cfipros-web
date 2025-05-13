import type { Metadata } from 'next';
import { ResetPasswordForm } from '@/components/features/auth/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password - CFIPros',
  description: 'Set a new password for your CFIPros account.',
};

export default function ResetPasswordPage() {
  return (
    <div className="container flex min-h-screen flex-col justify-center bg-background py-12">
      <div className="w-full max-w-md space-y-8">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
