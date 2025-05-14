'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { trackEvent, EVENTS } from '@/lib/analytics';

export default function SubscriptionGuidancePage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Get role from localStorage
    const role = localStorage.getItem('selectedRole');
    if (role) {
      setUserRole(role);
    }

    // Track page view with role context
    trackEvent(EVENTS.SUBSCRIPTION_PAGE_VIEWED, { role });
  }, []);

  // Function to handle skip action
  const handleSkip = () => {
    router.push('/dashboard');
  };

  // Function to proceed to subscription page
  const handleSubscribe = () => {
    trackEvent(EVENTS.SUBSCRIPTION_STARTED, { role: userRole });
    // TODO: Implement actual subscription flow in Epic 4
    router.push('/dashboard');
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Unlock Premium Features</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Free Tier */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Free Access</CardTitle>
            <CardDescription>Basic features to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <span>Basic profile management</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <span>View and search FAA test questions</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <span>Limited dashboard features</span>
            </div>

            {userRole === 'cfi' && (
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <span>Connect with up to 3 students</span>
              </div>
            )}

            {userRole === 'school_admin' && (
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <span>Basic school profile listing</span>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={handleSkip}>
              Continue with Free Access
            </Button>
          </CardFooter>
        </Card>

        {/* Premium Tier */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-xl">Premium Access</CardTitle>
            <CardDescription>
              {userRole === 'cfi'
                ? 'Complete CFI toolkit for effective teaching'
                : 'Full features for managing your flight school'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <span>
                <strong>All free features</strong>, plus:
              </span>
            </div>

            {userRole === 'cfi' && (
              <>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <span>Unlimited student connections</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <span>Create and manage custom lesson plans</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <span>Track student progress with detailed analytics</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <span>Priority support</span>
                </div>
              </>
            )}

            {userRole === 'school_admin' && (
              <>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <span>Manage unlimited CFIs at your school</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <span>School-wide analytics and reporting</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <span>Enhanced school profile with search priority</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <span>Dedicated account manager</span>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full flex items-center justify-center gap-2"
              onClick={handleSubscribe}
            >
              Get Premium Access
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="text-center text-gray-600 text-sm">
        <p>You can upgrade to premium at any time from your dashboard settings.</p>
      </div>
    </div>
  );
}
