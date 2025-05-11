'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    id: 'faq-1',
    question: 'What is CFIPros?',
    answer:
      'CFIPros is a comprehensive platform designed specifically for flight training. It connects flight students with certified flight instructors (CFIs) and provides tools for flight schools to manage their operations, all in one integrated solution.',
  },
  {
    id: 'faq-2',
    question: 'Is CFIPros free for students?',
    answer:
      'Yes! Students can sign up and use CFIPros for free. This includes access to find CFIs, track training progress, and use the digital logbook. Premium features may be available through subscription plans in the future.',
  },
  {
    id: 'faq-3',
    question: 'How do I sign up as a CFI?',
    answer:
      "Certified Flight Instructors can sign up through our dedicated CFI registration page. You'll need to provide proof of your CFI certification and complete a profile to help students find you.",
  },
  {
    id: 'faq-4',
    question: 'What features are available for flight schools?',
    answer:
      'Flight schools get comprehensive management tools including instructor management, student enrollment tracking, scheduling, fleet management, and analytics. Custom integrations are available for larger operations.',
  },
  {
    id: 'faq-5',
    question: 'Is my logbook data secure?',
    answer:
      'Absolutely. We use industry-standard encryption and security practices to protect all user data. Your logbook data is backed up regularly and remains your property at all times.',
  },
  {
    id: 'faq-6',
    question: 'Can I export my data if I decide to leave the platform?',
    answer:
      'Yes, we provide data export options for all users. You can export your logbook, training records, and other data in standard formats compatible with other aviation software.',
  },
];

export default function FAQSection() {
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-900" aria-labelledby="faq-heading">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2
            id="faq-heading"
            className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white"
          >
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Get answers to common questions about CFIPros
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq) => {
            const isOpen = openFAQ === faq.id;
            const headingId = `question-${faq.id}`;
            const panelId = `answer-${faq.id}`;

            return (
              <Card key={faq.id} className="border border-gray-200 dark:border-gray-700">
                <CardContent className="p-0">
                  <button
                    type="button"
                    className="flex justify-between items-center w-full p-6 text-left"
                    onClick={() => toggleFAQ(faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    id={headingId}
                  >
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {faq.question}
                    </h3>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 text-gray-500 transition-transform ${
                        isOpen ? 'transform rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <title>Toggle Icon</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isOpen && (
                    <div
                      className="px-6 pb-6 pt-2"
                      id={panelId}
                      role="region"
                      aria-labelledby={headingId}
                    >
                      <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
