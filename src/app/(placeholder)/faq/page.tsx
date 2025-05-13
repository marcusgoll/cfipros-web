import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | CFIPros',
  description:
    'Find answers to common questions about CFIPros and our flight training analytics platform.',
};

export default function FAQPage() {
  const faqs = [
    {
      id: 'what-is-cfipros',
      question: 'What is CFIPros?',
      answer:
        'CFIPros is a comprehensive analytics and training platform designed specifically for Certified Flight Instructors (CFIs) and flight schools. Our tools help instructors track student progress, manage training resources, and make data-driven decisions to improve training outcomes.',
    },
    {
      id: 'who-can-use',
      question: 'Who can use CFIPros?',
      answer:
        "CFIPros is designed for flight instructors, flight schools, and student pilots. Whether you're an independent CFI or part of a large flight training organization, our platform scales to meet your needs.",
    },
    {
      id: 'how-improve-training',
      question: 'How does CFIPros help improve flight training?',
      answer:
        "By providing detailed analytics on student performance, training trends, and areas for improvement, CFIPros helps instructors identify strengths and weaknesses in their teaching approach and their students' learning. This data-driven approach leads to more targeted instruction and better training outcomes.",
    },
    {
      id: 'faa-compliant',
      question: 'Is CFIPros compliant with FAA regulations?',
      answer:
        'Yes, CFIPros is designed with FAA regulations in mind. Our platform helps instructors maintain compliance with training requirements and documentation standards set by the FAA.',
    },
    {
      id: 'pricing',
      question: 'How much does CFIPros cost?',
      answer:
        'CFIPros offers several pricing tiers to accommodate different needs and budgets. Please visit our Pricing page for detailed information on our subscription plans and features.',
    },
    {
      id: 'technical-skills',
      question: 'Do I need special technical skills to use CFIPros?',
      answer:
        'No, CFIPros is designed to be user-friendly and intuitive. While it offers powerful analytics capabilities, the interface is straightforward and accessible, even for users with limited technical experience.',
    },
    {
      id: 'data-security',
      question: 'How secure is my data with CFIPros?',
      answer:
        'Data security is a top priority for CFIPros. We employ industry-standard encryption and security practices to protect your information. All data is stored securely, and we maintain strict privacy policies to ensure your information is never shared without your consent.',
    },
    {
      id: 'free-trial',
      question: 'Can I try CFIPros before subscribing?',
      answer:
        'Yes, we offer a free trial period for new users to explore our platform and experience its benefits firsthand. Sign up on our website to start your trial today.',
    },
  ];

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <h1 className="text-4xl font-bold mb-6">Frequently Asked Questions</h1>

      <div className="bg-muted p-6 rounded-lg mb-8 text-center">
        <p className="text-lg mb-2">This is a placeholder page for the FAQ section.</p>
        <p className="text-muted-foreground">More content will be added soon.</p>
      </div>

      <div className="space-y-6">
        {faqs.map((faq) => (
          <div key={faq.id} className="border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-2">{faq.question}</h2>
            <p className="text-muted-foreground">{faq.answer}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
        <p className="mb-6">
          If you can&apos;t find the answer to your question in our FAQ, please don&apos;t hesitate
          to reach out to us. Our support team is ready to assist you with any inquiries.
        </p>
        <a
          href="/contact"
          className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition"
        >
          Contact Us
        </a>
      </div>
    </div>
  );
}
