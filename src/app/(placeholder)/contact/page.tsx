import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | CFIPros',
  description: 'Contact the CFIPros team for inquiries, support, or partnership opportunities.',
};

export default function ContactPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <h1 className="text-4xl font-bold mb-6">Contact Us</h1>

      <div className="bg-muted p-6 rounded-lg mb-8 text-center">
        <p className="text-lg mb-2">This is a placeholder page for the Contact section.</p>
        <p className="text-muted-foreground">More content will be added soon.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
          <p className="mb-6">
            We&apos;re here to answer your questions about CFIPros and how our platform can support
            your flight training goals. Fill out the form and we&apos;ll get back to you as soon as
            possible.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold mb-2">Email</h3>
              <p>info@cfipros.com</p>
            </div>

            <div>
              <h3 className="font-bold mb-2">Phone</h3>
              <p>(555) 123-4567</p>
            </div>

            <div>
              <h3 className="font-bold mb-2">Headquarters</h3>
              <p>
                123 Aviation Way
                <br />
                Suite 456
                <br />
                Flight City, FL 12345
                <br />
                United States
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">Hours of Operation</h3>
              <p>Monday - Friday: 9am - 5pm EST</p>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Contact Form</h2>

          <form className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="w-full p-2 border rounded"
                  placeholder="John"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className="w-full p-2 border rounded"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full p-2 border rounded"
                placeholder="john.doe@example.com"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium mb-1">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                className="w-full p-2 border rounded"
                placeholder="How can we help?"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className="w-full p-2 border rounded"
                placeholder="Tell us more about your inquiry..."
              />
            </div>

            <button
              type="submit"
              className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
