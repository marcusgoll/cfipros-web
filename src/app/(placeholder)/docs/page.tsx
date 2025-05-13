import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentation | CFIPros',
  description: 'Find detailed documentation and guides for using CFIPros tools and platform.',
};

export default function DocsPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <h1 className="text-4xl font-bold mb-6">Documentation</h1>

      <div className="bg-muted p-6 rounded-lg mb-8 text-center">
        <p className="text-lg mb-2">This is a placeholder page for the Documentation section.</p>
        <p className="text-muted-foreground">More content will be added soon.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {['Getting Started', 'API Reference', 'Tutorials', 'FAQs', 'Guides', 'Integrations'].map(
          (section) => (
            <div key={section} className="border rounded-lg p-6">
              <h3 className="text-xl font-medium mb-2">{section}</h3>
              <p className="text-muted-foreground mb-4">
                Documentation placeholder for {section.toLowerCase()} section.
              </p>
              <button type="button" className="text-primary hover:underline flex items-center">
                Read More
                <svg
                  className="ml-1 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
