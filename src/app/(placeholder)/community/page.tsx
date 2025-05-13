import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community | CFIPros',
  description:
    'Join the CFIPros community of flight instructors sharing knowledge and best practices.',
};

export default function CommunityPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <h1 className="text-4xl font-bold mb-6">Community</h1>

      <div className="bg-muted p-6 rounded-lg mb-8 text-center">
        <p className="text-lg mb-2">This is a placeholder page for the Community section.</p>
        <p className="text-muted-foreground">More content will be added soon.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="border rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Join the Discussion</h2>
          <p className="mb-4">
            Connect with fellow flight instructors and students in our community forums. Share
            experiences, ask questions, and learn from others in the field.
          </p>
          <button
            type="button"
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition"
          >
            Browse Forums
          </button>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
          <p className="mb-4">
            Participate in webinars, virtual meetups, and conferences for flight training
            professionals and enthusiasts.
          </p>
          <button
            type="button"
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition"
          >
            View Events
          </button>
        </div>
      </div>

      <div className="border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Community Resources</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            'Flight Training Blog',
            'Instructor Tools',
            'Student Resources',
            'Best Practices',
            'Safety Updates',
            'Regulations',
          ].map((resource) => (
            <div key={resource} className="p-4 bg-muted/50 rounded">
              <h3 className="font-medium mb-2">{resource}</h3>
              <p className="text-sm text-muted-foreground">
                Community resource placeholder for {resource.toLowerCase()}.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
