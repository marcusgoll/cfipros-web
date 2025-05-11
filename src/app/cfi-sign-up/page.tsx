import { redirect } from 'next/navigation';

export default function CFISignUpPage() {
  // Always redirect to the main signup page
  redirect('/sign-up');
} 