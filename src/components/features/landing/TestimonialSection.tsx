import { Card, CardContent } from '@/components/ui/card';

export default function TestimonialSection() {
  // This is a placeholder component that can be filled with real testimonials later
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            What Our Users Say
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Hear from flight students, instructors, and schools who use CFIPros
          </p>
        </div>

        {/* Placeholder testimonial card */}
        <Card className="max-w-4xl mx-auto bg-gray-50 dark:bg-gray-800 shadow-md border-0">
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 italic mb-8">
              &quot;Testimonials from CFIPros users will be featured here. Real experiences from
              students, instructors, and flight schools sharing how the platform has improved their
              training and operations.&quot;
            </p>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mb-4" />
              <p className="font-medium text-gray-900 dark:text-white">Future User Testimonial</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Position & Organization</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
