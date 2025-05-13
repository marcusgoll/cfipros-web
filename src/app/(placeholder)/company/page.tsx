import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getFeatureFlag } from '@/lib/posthog-server';

export const metadata: Metadata = {
  title: 'Company | CFIPros',
  description:
    'Learn about CFIPros, our team, mission and vision for the future of flight training.',
};

export default async function CompanyPage() {
  // Check if the company link feature flag is enabled
  const isCompanyEnabled = await getFeatureFlag('nav-company-link-enabled', false);

  // If the feature flag is not enabled, redirect to the home page
  if (!isCompanyEnabled) {
    redirect('/');
  }

  // Company values for the list
  const companyValues = [
    'Safety First: We believe that safety is paramount in aviation training.',
    'Innovation: We constantly explore new technologies to improve flight training.',
    "Instructor-Focused: Our tools are designed with the CFI's needs at the center.",
    'Data-Driven: We leverage analytics to provide actionable insights.',
    'Community: We foster a collaborative community of aviation professionals.',
  ];

  // Team members for the grid
  const teamMembers = [
    { name: 'Team Member 1', position: 'Position Title' },
    { name: 'Team Member 2', position: 'Position Title' },
    { name: 'Team Member 3', position: 'Position Title' },
    { name: 'Team Member 4', position: 'Position Title' },
  ];

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <h1 className="text-4xl font-bold mb-6">About Our Company</h1>

      <div className="bg-muted p-6 rounded-lg mb-8 text-center">
        <p className="text-lg mb-2">This is a placeholder page for the Company section.</p>
        <p className="text-muted-foreground">More content will be added soon.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div>
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="mb-6">
            CFIPros is dedicated to revolutionizing flight training through advanced analytics and
            innovative tools that empower Certified Flight Instructors to build successful pilots.
          </p>

          <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
          <p>
            We envision a future where data-driven insights elevate the quality and effectiveness of
            flight instruction, resulting in safer, more skilled pilots and a more efficient
            training experience.
          </p>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Company Values</h2>
          <ul className="space-y-3">
            {companyValues.map((value) => (
              <li key={value} className="flex items-start">
                <span className="font-bold mr-2">•</span>
                <span>{value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-6">Our Team</h2>
        <p className="max-w-2xl mx-auto mb-8">
          The CFIPros team brings together experienced flight instructors, software engineers, and
          data scientists passionate about transforming flight training.
        </p>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <div key={member.name} className="text-center">
              <div className="h-32 w-32 rounded-full bg-muted mx-auto mb-4" />
              <h3 className="font-bold">{member.name}</h3>
              <p className="text-sm text-muted-foreground">{member.position}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
