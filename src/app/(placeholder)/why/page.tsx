import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Why CFIPros? | CFIPros',
  description:
    'Learn why CFIPros is the leading platform for flight training analytics and instructor tools.',
};

export default function WhyPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <h1 className="text-4xl font-bold mb-6">Why CFIPros?</h1>

      <div className="bg-muted p-6 rounded-lg mb-8 text-center">
        <p className="text-lg mb-2">This is a placeholder page for the Why CFIPros section.</p>
        <p className="text-muted-foreground">More content will be added soon.</p>
      </div>

      <div className="prose max-w-none dark:prose-invert">
        <h2>The CFIPros Advantage</h2>
        <p>
          CFIPros is building the next generation of flight training analytics and tools
          specifically designed for Certified Flight Instructors and flight schools.
        </p>

        <h2>Our Mission</h2>
        <p>
          We&apos;re on a mission to help flight instructors build successful pilots through
          data-driven insights and tools that make training more effective and efficient.
        </p>
      </div>
    </div>
  );
}
