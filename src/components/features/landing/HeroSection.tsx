'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  return (
    <section
      className="relative min-h-[80vh] flex flex-col justify-center bg-gradient-to-r from-sky-100 via-blue-50 to-sky-100 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900"
      aria-labelledby="hero-heading"
    >
      {/* Hero Background - Can be replaced with a real aviation image */}
      <div className="absolute inset-0 overflow-hidden -z-10" aria-hidden="true">
        <Image
          src="/hero-aviation-background.jpg"
          alt="Aviation background with aircraft in sky"
          fill
          priority
          className="object-cover opacity-20"
          sizes="100vw"
        />
      </div>

      <div className="container mx-auto px-4 py-20 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6 text-center md:text-left">
          <h1
            id="hero-heading"
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white"
          >
            Elevate Your Flight Training Experience
          </h1>

          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-2xl">
            Connect flight instructors, students, and schools on a single platform designed to
            streamline training, certification, and career advancement.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button
              asChild
              size="lg"
              className="bg-blue-700 hover:bg-blue-800 text-white font-medium"
            >
              <Link href="/sign-up">Get Started Now</Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-gray-400 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>

        <div className="flex-1 relative h-[300px] md:h-[400px] w-full rounded-lg overflow-hidden shadow-2xl">
          <Image
            src="/hero-cockpit.jpg"
            alt="Flight training cockpit view showing instruments and controls"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>
    </section>
  );
}
