'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface RoleBenefit {
  role: 'student' | 'cfi' | 'school';
  title: string;
  benefits: Array<{ id: string; text: string }>;
  ctaText: string;
  ctaLink: string;
}

const roleBenefits: RoleBenefit[] = [
  {
    role: 'student',
    title: 'For Flight Students',
    benefits: [
      { id: 'student-1', text: 'Find qualified flight instructors in your area' },
      { id: 'student-2', text: 'Track your progress toward certificates and ratings' },
      { id: 'student-3', text: 'Digital logbook for all your flight hours' },
      { id: 'student-4', text: 'Easy scheduling with your instructor' },
      { id: 'student-5', text: 'Training resources and study materials' },
      { id: 'student-6', text: 'Connect with other students in your area' },
    ],
    ctaText: 'Sign Up as a Student',
    ctaLink: '/sign-up?role=student',
  },
  {
    role: 'cfi',
    title: 'For Certified Flight Instructors',
    benefits: [
      { id: 'cfi-1', text: 'Manage multiple students efficiently' },
      { id: 'cfi-2', text: 'Digital endorsements and record keeping' },
      { id: 'cfi-3', text: 'Automatic hour logging and reporting' },
      { id: 'cfi-4', text: 'Get discovered by new students' },
      { id: 'cfi-5', text: 'Streamline billing and payments' },
      { id: 'cfi-6', text: 'Flexible scheduling tools' },
    ],
    ctaText: 'Sign Up as a CFI',
    ctaLink: '/cfi-sign-up',
  },
  {
    role: 'school',
    title: 'For Flight Schools',
    benefits: [
      { id: 'school-1', text: 'Comprehensive school management platform' },
      { id: 'school-2', text: 'Track instructor and student activity' },
      { id: 'school-3', text: 'Manage aircraft fleet and maintenance' },
      { id: 'school-4', text: 'Streamline enrollment and billing' },
      { id: 'school-5', text: 'Analytics and reporting tools' },
      { id: 'school-6', text: 'Custom branding options' },
    ],
    ctaText: 'Sign Up as a School',
    ctaLink: '/school-sign-up',
  },
];

export default function RoleSpecificBenefits() {
  const [activeTab, setActiveTab] = useState<'student' | 'cfi' | 'school'>('student');

  const activeBenefit = roleBenefits.find((benefit) => benefit.role === activeTab);

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Benefits for Every Aviation Role
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            CFIPros is designed for the entire flight training ecosystem
          </p>
        </div>

        {/* Role Tabs */}
        <div className="flex justify-center mb-8 border-b border-gray-200 dark:border-gray-700">
          {roleBenefits.map((benefit) => (
            <button
              key={benefit.role}
              type="button"
              onClick={() => setActiveTab(benefit.role)}
              className={`px-8 py-4 text-lg font-medium ${
                activeTab === benefit.role
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {benefit.title}
            </button>
          ))}
        </div>

        {/* Role Content */}
        {activeBenefit && (
          <Card className="max-w-4xl mx-auto bg-white dark:bg-gray-900 shadow-lg border-0">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-5 gap-8">
                <div className="md:col-span-3">
                  <h3 className="text-2xl font-bold mb-6 text-blue-600 dark:text-blue-400">
                    {activeBenefit.title}
                  </h3>
                  <ul className="space-y-4">
                    {activeBenefit.benefits.map((benefit) => (
                      <li key={benefit.id} className="flex items-start">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-green-500 mr-2 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <title>Check Icon</title>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">{benefit.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="md:col-span-2 flex flex-col justify-center items-center text-center">
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                    Ready to get started with CFIPros?
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                  >
                    <Link href={activeBenefit.ctaLink}>{activeBenefit.ctaText}</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
