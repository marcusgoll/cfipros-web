import { redirect } from 'next/navigation';

export default function SchoolSignUpPage() {
  // Always redirect to the main signup page
  redirect('/sign-up');
} 