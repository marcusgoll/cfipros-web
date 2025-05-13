import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Products | CFIPros',
  description:
    'Explore the suite of tools and analytics offered by CFIPros for flight instructors and schools.',
};

export default function ProductsPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <h1 className="text-4xl font-bold mb-6">Our Products</h1>

      <div className="bg-muted p-6 rounded-lg mb-8 text-center">
        <p className="text-lg mb-2">This is a placeholder page for the Products section.</p>
        <p className="text-muted-foreground">More content will be added soon.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Product cards */}
        {['Student Progress Tracking', 'Lesson Planning', 'Flight Analysis'].map((product) => (
          <div key={product} className="border rounded-lg p-6">
            <h3 className="text-xl font-medium mb-2">{product}</h3>
            <p className="text-muted-foreground mb-4">
              Feature description placeholder for {product.toLowerCase()} functionality.
            </p>
            <div className="h-40 bg-muted/50 rounded flex items-center justify-center mb-4">
              <span className="text-muted-foreground">Product Screenshot</span>
            </div>
            <button
              type="button"
              className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition"
            >
              Learn More
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
