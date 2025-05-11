'use client';

import Link from 'next/link';
import {
  Users,
  BookOpen,
  Plane,
  Calendar,
  School,
  CheckCircle,
  Code,
  Database,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePageV2() {
  // Partner logos
  const partnerLogos = [
    { name: 'Partner 1', logo: '/logos/placeholder1.svg' },
    { name: 'Partner 2', logo: '/logos/placeholder2.svg' },
    { name: 'Partner 3', logo: '/logos/placeholder3.svg' },
    { name: 'Partner 4', logo: '/logos/placeholder4.svg' },
    { name: 'Partner 5', logo: '/logos/placeholder5.svg' },
    { name: 'Partner 6', logo: '/logos/placeholder6.svg' },
  ];

  // Features for the grid
  const features = [
    {
      id: '1',
      title: 'Student Management',
      description: 'Comprehensive student tracking with progress monitoring',
      icon: <Users className="h-6 w-6" />,
    },
    {
      id: '2',
      title: 'Digital Logbooks',
      description: 'Track flight hours, endorsements, and training progress',
      icon: <BookOpen className="h-6 w-6" />,
    },
    {
      id: '3',
      title: 'Smart Scheduling',
      description: 'AI-powered scheduling optimizes training efficiency',
      icon: <Calendar className="h-6 w-6" />,
    },
    {
      id: '4',
      title: 'School Administration',
      description: 'Complete tools for managing your flight school',
      icon: <School className="h-6 w-6" />,
    },
  ];

  // Role cards
  const roleCards = [
    {
      id: 'student',
      title: 'For Students',
      description: 'Accelerate your flight training journey',
      benefits: [
        'Find qualified flight instructors in your area',
        'Track your progress toward certificates and ratings',
        'Digital logbook for all your flight hours',
        'Easy scheduling with your instructor',
        'Training resources and study materials',
      ],
      cta: 'Sign Up as a Student',
      href: '/sign-up?role=student',
    },
    {
      id: 'cfi',
      title: 'For CFIs',
      description: 'Streamline your instruction business',
      benefits: [
        'Manage multiple students efficiently',
        'Digital endorsements and record keeping',
        'Automatic hour logging and reporting',
        'Get discovered by new students',
        'Streamline billing and payments',
      ],
      cta: 'Sign Up as a CFI',
      href: '/cfi-sign-up',
      popular: true,
    },
    {
      id: 'school',
      title: 'For Flight Schools',
      description: 'Comprehensive school management platform',
      benefits: [
        'Multiple instructor management',
        'Fleet management',
        'Student enrollment',
        'Advanced analytics',
        'Custom branding',
      ],
      cta: 'Sign Up as a School',
      href: '/school-sign-up',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-[#ff6738] p-1">
              <Plane className="h-5 w-5 text-white" />
            </div>
            <span className="font-heading text-xl font-bold text-white">CFIPros</span>
          </div>
          <nav className="hidden gap-6 md:flex">
            <Link
              href="#why-cfipros"
              className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
            >
              Why CFIPros?
            </Link>
            <Link
              href="#features"
              className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
            >
              Features
            </Link>
            <Link
              href="#roles"
              className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
            >
              Solutions
            </Link>
            <Link
              href="#api"
              className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
            >
              API
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
            >
              Sign In
            </Link>
            <Button className="bg-[#ff6738] hover:bg-[#ff6738]/90" asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-b border-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                How flight schools <span className="text-[#ff6738]">build successful pilots</span>
              </h1>
              <p className="max-w-[800px] text-xl text-gray-400">
                Connect flight instructors, students, and schools on a single platform designed to
                streamline training, certification, and career advancement.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Button size="lg" className="bg-[#ff6738] hover:bg-[#ff6738]/90" asChild>
                  <Link href="/sign-up">Get Started</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-700 text-white hover:bg-gray-800"
                  asChild
                >
                  <Link href="#demo">Watch Demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Partners/Logos Section */}
        <section className="w-full py-12 border-b border-gray-800 bg-gray-900/50">
          <div className="container px-4 md:px-6">
            <h2 className="text-lg text-center text-gray-400 mb-8">
              These schools build pilots faster with us
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 items-center justify-items-center">
              {partnerLogos.map((partner) => (
                <div
                  key={`partner-${partner.name}`}
                  className="grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100"
                >
                  <div className="h-10 w-24 bg-gray-800 rounded-md flex items-center justify-center text-sm text-gray-400">
                    {partner.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="w-full py-16 border-b border-gray-800" id="features">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">No products to buy or install</h2>
              <p className="text-xl text-gray-400">
                Everything you need for flight training in one platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Features */}
              <div className="space-y-6">
                {features.map((feature) => (
                  <div
                    key={feature.id}
                    className="p-6 bg-gray-900 border border-gray-800 rounded-lg flex items-start"
                  >
                    <div className="mr-4 mt-1 rounded-full bg-[#ff6738]/20 p-2 text-[#ff6738]">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
                      <p className="text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right - Dashboard Preview */}
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-gray-800 shadow-lg bg-gray-900">
                  <div className="bg-gray-800 p-2 border-b border-gray-700">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Student Progress</h4>
                        <div className="text-xs bg-gray-800 px-2 py-1 rounded">Private Pilot</div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Pre-solo phase</span>
                          <span className="font-medium">100%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div
                            className="bg-[#ff6738] h-2 rounded-full"
                            style={{ width: '100%' }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Solo phase</span>
                          <span className="font-medium">85%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div className="bg-[#ff6738] h-2 rounded-full" style={{ width: '85%' }} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Cross-country</span>
                          <span className="font-medium">62%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div className="bg-[#ff6738] h-2 rounded-full" style={{ width: '62%' }} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Checkride prep</span>
                          <span className="font-medium">41%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div className="bg-[#ff6738] h-2 rounded-full" style={{ width: '41%' }} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="flex flex-col items-center justify-center p-3 bg-gray-800 rounded-lg">
                        <span className="text-2xl font-bold">18.5</span>
                        <span className="text-xs text-gray-400">Flight hours</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-3 bg-gray-800 rounded-lg">
                        <span className="text-2xl font-bold">93%</span>
                        <span className="text-xs text-gray-400">Maneuver proficiency</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Second Feature Section - Screenshot */}
        <section className="w-full py-16 border-b border-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <div className="bg-gray-800 h-64 w-full rounded-md flex items-center justify-center text-gray-600">
                    Flight Training Dashboard Preview Image
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-3xl font-bold mb-4">We also visualize flight data</h2>
                <p className="text-gray-400 mb-6">
                  Track student progress with detailed analytics and clear visualizations of flight
                  data, performance metrics, and certification progress.
                </p>
                <ul className="space-y-3">
                  {[
                    'Real-time flight data analysis',
                    'Detailed maneuver proficiency tracking',
                    'Certification progress visualization',
                    'Customizable instructor reports',
                    'Student improvement metrics',
                  ].map((item) => (
                    <li
                      key={`feature-${item.replace(/\s+/g, '-').toLowerCase()}`}
                      className="flex items-start"
                    >
                      <CheckCircle className="h-5 w-5 text-[#ff6738] mr-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* API Section with Code */}
        <section className="w-full py-16 border-b border-gray-800" id="api">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">APIs for customization</h2>
              <p className="text-xl text-gray-400">
                Integrate with your existing systems and extend functionality
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Code className="h-5 w-5 text-[#ff6738]" />
                    <h3 className="font-semibold">Easy Integration</h3>
                  </div>
                  <p className="text-gray-400">
                    Connect CFIPros with your school management systems with our REST and GraphQL
                    APIs.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-[#ff6738]" />
                    <h3 className="font-semibold">Secure Authentication</h3>
                  </div>
                  <p className="text-gray-400">
                    OAuth 2.0 and API keys with fine-grained permissions for secure access.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Database className="h-5 w-5 text-[#ff6738]" />
                    <h3 className="font-semibold">Data Export/Import</h3>
                  </div>
                  <p className="text-gray-400">
                    Easily move data between systems with JSON exports and imports.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="rounded-lg border border-gray-800 bg-gray-900 overflow-hidden">
                  <div className="flex items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                    </div>
                    <div className="ml-4 text-xs text-gray-400">api-example.js</div>
                  </div>
                  <pre className="p-4 text-sm overflow-x-auto text-gray-300">
                    <code>
                      {`// Fetch a student's flight hours
const fetchStudentHours = async (studentId) => {
  const response = await fetch(
    \`https://api.cfipros.com/v1/students/\${studentId}/hours\`,
    {
      headers: {
        Authorization: \`Bearer \${API_KEY}\`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  return data;
};

// Update training progress
const updateProgress = async (lessonId, progress) => {
  const response = await fetch(
    \`https://api.cfipros.com/v1/lessons/\${lessonId}/progress\`,
    {
      method: 'POST',
      headers: {
        Authorization: \`Bearer \${API_KEY}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ progress })
    }
  );
  
  return response.json();
};`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Role-Specific Cards */}
        <section className="w-full py-16 border-b border-gray-800" id="roles">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">Solutions for every role</h2>
              <p className="text-xl text-gray-400">
                We&apos;ve built specialized tools for all parts of the flight training ecosystem
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {roleCards.map((role) => (
                <div
                  key={role.id}
                  className={`relative bg-gray-900 rounded-lg border ${role.popular ? 'border-[#ff6738]' : 'border-gray-800'} p-6`}
                >
                  {role.popular && (
                    <div className="absolute top-0 right-4 transform -translate-y-1/2 bg-[#ff6738] text-white px-3 py-1 rounded-full text-sm">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-semibold mb-2">{role.title}</h3>
                  <p className="text-gray-400 mb-4">{role.description}</p>
                  <ul className="space-y-3 mb-6">
                    {role.benefits.map((benefit) => (
                      <li
                        key={`${role.id}-${benefit.replace(/\s+/g, '-').toLowerCase()}`}
                        className="flex items-start"
                      >
                        <CheckCircle className="h-5 w-5 text-[#ff6738] mr-2 flex-shrink-0" />
                        <span className="text-gray-300">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${role.popular ? 'bg-[#ff6738] hover:bg-[#ff6738]/90' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}
                    asChild
                  >
                    <Link href={role.href}>{role.cta}</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Terminal Example */}
        <section className="w-full py-16 border-b border-gray-800 bg-gray-900/50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">Mission: code examples</h2>
              <p className="text-xl text-gray-400">
                Teaching resources built right into the platform
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="rounded-lg border border-gray-800 bg-gray-900 overflow-hidden">
                  <div className="flex items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                    </div>
                    <div className="ml-4 text-xs text-gray-400">terminal</div>
                  </div>
                  <div className="p-4 text-sm overflow-x-auto font-mono">
                    <div className="text-green-500 mb-1">
                      $ flight-sim --pattern=&quot;traffic-pattern&quot; --aircraft=&quot;c172&quot;
                    </div>
                    <div className="text-gray-400 mb-2">
                      Initializing traffic pattern simulation for Cessna 172...
                    </div>
                    <div className="text-gray-300">
                      {'> '}
                      <span className="text-blue-400">Upwind</span> leg complete
                      <br />
                      {'> '}
                      <span className="text-blue-400">Crosswind</span> leg complete
                      <br />
                      {'> '}
                      <span className="text-blue-400">Downwind</span> leg complete
                      <br />
                      {'> '}
                      <span className="text-blue-400">Base</span> leg complete
                      <br />
                      {'> '}
                      <span className="text-yellow-400">CAUTION: Approach speed high</span>
                      <br />
                      {'> '}Applying corrective action...
                      <br />
                      {'> '}
                      <span className="text-blue-400">Final</span> leg complete
                      <br />
                      {'> '}
                      <span className="text-green-400">Landing successful!</span> Touchdown rate:
                      150 fpm
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-bold">Built-in simulation code</h3>
                <p className="text-gray-400">
                  CFIPros includes APIs for integration with simulator training content and
                  scenarios, enabling instructors to create custom training missions and review
                  student performance.
                </p>
                <ul className="space-y-3">
                  {[
                    'Integrate with popular flight simulator platforms',
                    'Create custom training scenarios',
                    'Track student performance in simulated environments',
                    'Connect real-world training with simulator practice',
                  ].map((item) => (
                    <li
                      key={`sim-feature-${item.replace(/\s+/g, '-').toLowerCase()}`}
                      className="flex items-start"
                    >
                      <CheckCircle className="h-5 w-5 text-[#ff6738] mr-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Resources Section */}
        <section className="w-full py-16 border-b border-gray-800">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Resources</h2>
              <p className="text-xl text-gray-400 mt-2">
                Free tools, guides, and resources for flight training
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'FAA Exam Prep',
                  color: 'bg-purple-500',
                  description: 'Study guides and practice exams for all FAA written tests',
                },
                {
                  title: 'Maneuver Guides',
                  color: 'bg-blue-500',
                  description: 'Illustrated guides to all required flight maneuvers',
                },
                {
                  title: 'Weather Mastery',
                  color: 'bg-green-500',
                  description: 'Learn to read and interpret aviation weather information',
                },
                {
                  title: 'Radio Communications',
                  color: 'bg-yellow-500',
                  description: 'Practice scripts and tips for clear radio communications',
                },
              ].map((resource) => (
                <div
                  key={`resource-${resource.title.replace(/\s+/g, '-').toLowerCase()}`}
                  className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
                >
                  <div
                    className={`w-12 h-12 rounded ${resource.color} mb-4 flex items-center justify-center`}
                  >
                    <span className="text-lg font-bold text-white">{resource.title.charAt(0)}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{resource.title}</h3>
                  <p className="text-gray-400">{resource.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 bg-gradient-to-br from-gray-900 to-black">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">
                Join our
                <br />
                <span className="text-[#ff6738]">flight training community</span>
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Connect with thousands of students, instructors, and flight schools already using
                CFIPros to revolutionize flight training.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-[#ff6738] hover:bg-[#ff6738]/90" asChild>
                  <Link href="/sign-up">Get Started Free</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-700 text-white hover:bg-gray-800"
                  asChild
                >
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-800 bg-black py-12">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="rounded-md bg-[#ff6738] p-1">
                  <Plane className="h-5 w-5 text-white" />
                </div>
                <span className="font-heading text-xl font-bold text-white">CFIPros</span>
              </div>
              <p className="text-gray-400 mb-4">
                The all-in-one platform for flight training, connecting students, instructors, and
                schools.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-white mb-4">Product</h4>
              <ul className="space-y-2">
                {['Features', 'Solutions', 'Pricing', 'API', 'Resources'].map((item) => (
                  <li key={`footer-product-${item.toLowerCase()}`}>
                    <Link
                      href={`#${item.toLowerCase()}`}
                      className="text-sm text-gray-400 hover:text-white"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-white mb-4">Company</h4>
              <ul className="space-y-2">
                {['About', 'Blog', 'Careers', 'Contact', 'Press'].map((item) => (
                  <li key={`footer-company-${item.toLowerCase()}`}>
                    <Link
                      href={`#${item.toLowerCase()}`}
                      className="text-sm text-gray-400 hover:text-white"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-white mb-4">Support</h4>
              <ul className="space-y-2">
                {['Help Center', 'Documentation', 'Status', 'Terms', 'Privacy'].map((item) => (
                  <li key={`footer-support-${item.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Link
                      href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-sm text-gray-400 hover:text-white"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-white mb-4">Connect</h4>
              <ul className="space-y-2">
                {['Twitter', 'LinkedIn', 'Facebook', 'Instagram', 'YouTube'].map((item) => (
                  <li key={`footer-connect-${item.toLowerCase()}`}>
                    <Link
                      href={`#${item.toLowerCase()}`}
                      className="text-sm text-gray-400 hover:text-white"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-center md:text-left text-sm text-gray-400 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} CFIPros. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-sm text-gray-400 hover:text-white">
                Terms
              </Link>
              <Link href="#" className="text-sm text-gray-400 hover:text-white">
                Privacy
              </Link>
              <Link href="#" className="text-sm text-gray-400 hover:text-white">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
