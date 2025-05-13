import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | CFIPros',
  description: 'Learn about the CFIPros team and our mission to transform flight training.',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <h1 className="text-4xl font-bold mb-6">About CFIPros</h1>

      <div className="bg-muted p-6 rounded-lg mb-8 text-center">
        <p className="text-lg mb-2">This is a placeholder page for the About Us section.</p>
        <p className="text-muted-foreground">More content will be added soon.</p>
      </div>

      <div className="prose max-w-none dark:prose-invert">
        <h2>Our Story</h2>
        <p>
          CFIPros was founded by a team of experienced flight instructors and software developers
          who identified a critical gap in the tools available for flight training professionals.
          After years of using outdated systems and manually tracking student progress, we set out
          to build a modern platform that brings data-driven insights to flight instruction.
        </p>

        <h2>Our Mission</h2>
        <p>
          Our mission is to empower Certified Flight Instructors with innovative tools and analytics
          that improve training outcomes, enhance safety, and build a more efficient flight training
          ecosystem.
        </p>

        <div className="my-8 p-6 bg-muted/50 rounded-lg">
          <blockquote className="text-xl italic border-l-4 pl-4 border-primary">
            &quot;We believe that better instructors create better pilots, and better pilots make
            aviation safer for everyone. Our platform is built to support the instructors who make
            that possible.&quot;
          </blockquote>
          <p className="text-right mt-4">— CFIPros Founding Team</p>
        </div>

        <h2>What Sets Us Apart</h2>
        <ul>
          <li>
            <strong>Built by Flight Instructors:</strong> Our team includes active CFIs who
            understand the day-to-day challenges of flight instruction.
          </li>
          <li>
            <strong>Data-Driven Approach:</strong> We leverage analytics to provide actionable
            insights that improve training efficiency and effectiveness.
          </li>
          <li>
            <strong>Comprehensive Toolkit:</strong> Our platform addresses the entire training
            cycle, from scheduling to certification.
          </li>
          <li>
            <strong>Community Focus:</strong> We&apos;re building not just a product, but a
            community of instructors sharing best practices.
          </li>
        </ul>

        <h2>Join Us</h2>
        <p>
          We&apos;re on a mission to transform flight training, and we invite you to be part of this
          journey. Whether you&apos;re a flight instructor, school owner, or student pilot, CFIPros
          has been designed with your needs in mind.
        </p>
      </div>
    </div>
  );
}
