// src/config/landing.ts
import {
  BookOpen,
  BarChart2,
  Users,
  Zap,
  Lightbulb,
  CheckCircle,
  ListChecks,
  FileText,
  Rocket,
  ShieldCheck,
  HelpCircle,
  User,
  Building,
  UserCircle,
} from 'lucide-react'; // Added ChevronDown, Building, UserCircle
export const siteName = 'CFIPros';

// New type for navigation items, allowing for submenus
export interface NavItem {
  label: string;
  href?: string; // Optional if it's a parent for a submenu
  Icon?: React.ElementType; // Optional icon for the main item
  subItems?: NavSubItem[];
  isButton?: boolean; // Optional: if this item should be styled as a button
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'brand-outline'; // For button styling
  className?: string; // Custom classes for the link/button
}

export interface NavSubItem {
  label: string;
  description?: string; // Optional description for submenu item
  href: string;
  Icon?: React.ElementType; // Optional icon for submenu item
}

export const landingTopbarNavItems: NavItem[] = [
  {
    label: 'Solutions',
    Icon: Lightbulb, // Example icon
    subItems: [
      {
        label: 'For Individual CFIs',
        description: 'Tools to enhance your solo instruction.',
        href: '/solutions/cfi',
        Icon: UserCircle,
      },
      {
        label: 'For Flight Schools',
        description: "Manage and scale your school's operations.",
        href: '/solutions/schools',
        Icon: Building,
      },
      {
        label: 'Knowledge Extraction',
        description: 'AI-powered FAA document analysis.',
        href: '#faa-tool', // Link to section on landing page
        Icon: BookOpen,
      },
    ],
  },
  { label: 'Features', href: '#features' }, // Assuming #features is on the landing page
  { label: 'Pricing', href: '#pricing' }, // Assuming #pricing is on the landing page
  { label: 'Roadmap', href: '#roadmap' }, // Assuming #roadmap is on the landing page
];

// These are for the right side of the header, might need different handling
export const topbarAuthNavItems = (isLoggedIn: boolean): NavItem[] =>
  isLoggedIn
    ? [
        {
          label: 'Dashboard',
          href: '/dashboard',
          isButton: true,
          variant: 'brand-outline',
          className: 'font-bold rounded-md mb-1 sm:mb-0',
        },
      ]
    : [
        {
          label: 'Log In',
          href: '/login',
          isButton: true,
          variant: 'ghost',
          className: 'text-brand-light/80 hover:text-brand-light hover:bg-white/10',
        },
        {
          label: 'Get Started',
          href: '/sign-up',
          isButton: true,
          variant: 'brand-outline',
          className: 'font-bold rounded-md mb-1 sm:mb-0',
        },
      ];

export const topbarIconNavItems: NavItem[] = [
  {
    label: 'Help',
    href: '/help',
    Icon: HelpCircle,
    className: 'text-brand-light/70 hover:text-brand-light hover:bg-white/10',
  },
  {
    label: 'Profile',
    href: '/profile',
    Icon: User,
    className: 'text-brand-light/70 hover:text-brand-light hover:bg-white/10',
  },
];

export const currentTopbarNavItems: NavItem[] = [
  {
    label: 'Solutions',
    Icon: Lightbulb, // Example icon
    subItems: [
      {
        label: 'For Individual CFIs',
        description: 'Tools to enhance your solo instruction.',
        href: '/solutions/cfi',
        Icon: UserCircle,
      },
      {
        label: 'For Flight Schools',
        description: "Manage and scale your school's operations.",
        href: '/solutions/schools',
        Icon: Building,
      },
      {
        label: 'Knowledge Extraction',
        description: 'AI-powered FAA document analysis.',
        href: '#faa-tool', // Link to section on landing page
        Icon: BookOpen,
      },
    ],
  },
  { label: 'Features', href: '#features' },
  { label: 'FAA Tool', href: '#faa-tool' }, // From old topbarNavItems
  { label: 'Roadmap', href: '#roadmap' }, // From old topbarNavItems
  { label: 'Pricing', href: '#pricing' }, // From old topbarNavItems
];

export interface Feature {
  id: string;
  title: string;
  description: string;
  Icon?: React.ElementType;
  details?: {
    heading: string;
    text: string;
    imageUrl?: string;
  };
}

export const featureShowcaseItems: Feature[] = [
  {
    id: 'knowledge-extraction',
    title: 'FAA Knowledge Extraction',
    description: 'Unlock insights from complex FAA documents instantly.',
    Icon: BookOpen,
    details: {
      heading: 'Instant FAA Document Insights',
      text: 'Our AI-powered tool scans FAA publications, handbooks, and regulations to extract key knowledge points, definitions, and procedures. Save hours of manual research and get the information you need, when you need it. Perfect for lesson planning and staying up-to-date.',
      imageUrl: 'https://placehold.co/600x400/A0C4FF/333333?text=FAA+Doc+Analysis',
    },
  },
  {
    id: 'student-tracking',
    title: 'Student Progress Tracking',
    description: 'Monitor student performance and identify weak areas effectively.',
    Icon: BarChart2,
    details: {
      heading: 'Comprehensive Student Analytics',
      text: "Track your students' quiz scores, lesson completion, and overall progress. Our dashboard provides a clear overview, helping you tailor instruction and provide targeted support where it's needed most. (Coming Soon)",
      imageUrl: 'https://placehold.co/600x400/A0C4FF/333333?text=Student+Progress',
    },
  },
  {
    id: 'curriculum-builder',
    title: 'Curriculum Builder',
    description: 'Design and manage your flight training curriculum with ease.',
    Icon: ListChecks,
    details: {
      heading: 'Intuitive Curriculum Management',
      text: 'Create, organize, and update your training syllabi and lesson plans within CFIPros. Ensure consistency and comprehensive coverage of all required training elements. (Coming Soon)',
      imageUrl: 'https://placehold.co/600x400/A0C4FF/333333?text=Curriculum+Tools',
    },
  },
];

export const faaKnowledgeExtractor = {
  title: 'Free FAA Knowledge Extractor Tool',
  description:
    'Paste text from an FAA document or enter a topic, and let our AI extract key information for you. A powerful tool for CFIs and students alike, available for free to get a taste of CFIPros.',
  placeholder: "Paste FAA document text here or type a topic (e.g., 'stall recovery procedures')",
  buttonText: 'Extract Key Knowledge',
  example: {
    inputTitle: 'Example Input:',
    inputText:
      'The Airplane Flying Handbook (FAA-H-8083-3C) provides basic knowledge that is essential for pilots. This handbook introduces basic pilot skills and knowledge that are essential for piloting airplanes. It provides information on transitioning to different types of airplanes and Fundamentals of Instruction for current certificated flight instructors (CFIs) and applicants for flight instructor certificates.',
    resultsTitle: 'Example Extracted Insights:',
    results: [
      { point: 'Source: Airplane Flying Handbook (FAA-H-8083-3C)' },
      { point: 'Purpose: Provides basic knowledge for pilots.' },
      {
        point:
          'Content: Basic pilot skills, transitioning to different airplanes, Fundamentals of Instruction.',
      },
      { point: 'Audience: Pilots, CFIs, CFI applicants.' },
    ],
    valueProposition:
      "Valuable Insights: Quickly grasp the core concepts of any FAA text, identify key regulations, or understand procedural steps without sifting through pages of content. Our tool highlights what's important, saving you time and effort.",
  },
};

export const roadmapItems = [
  {
    title: 'Advanced Student Analytics',
    description:
      'Deeper insights into student learning patterns and predictive performance indicators.',
    Icon: BarChart2,
    status: 'Planned',
  },
  {
    title: 'Integrated Scheduling',
    description: 'Manage flight and ground training schedules directly within the platform.',
    Icon: Users,
    status: 'Researching',
  },
  {
    title: 'Mobile App for Students',
    description: 'Allow students to access materials and track progress on the go.',
    Icon: Zap,
    status: 'Planned',
  },
  {
    title: 'Part 141 School Management Tools',
    description:
      'Features specifically designed for compliance and record-keeping for flight schools.',
    Icon: ShieldCheck,
    status: 'Researching',
  },
];

export const cfiFeatures = [
  {
    title: 'Automated Knowledge Extraction',
    Icon: FileText,
    description: 'Quickly generate study guides and lesson notes from FAA texts.',
  },
  {
    title: 'Efficient Lesson Planning',
    Icon: Lightbulb,
    description: 'Streamline your prep time with AI-assisted content generation.',
  },
  {
    title: 'Identify Student Weak Spots',
    Icon: CheckCircle,
    description: 'Use data to focus on areas needing the most attention (Future Feature).',
  },
  {
    title: 'Centralized Resources',
    Icon: Rocket,
    description:
      'Keep all your teaching materials and student records in one place (Future Feature).',
  },
];

export const schoolFeatures = [
  {
    title: 'Standardized Training Content',
    Icon: FileText,
    description:
      'Ensure consistency across all instructors with centralized curriculum tools (Future Feature).',
  },
  {
    title: 'Compliance & Reporting',
    Icon: CheckCircle,
    description: 'Simplify record-keeping and reporting requirements (Future Feature).',
  },
  {
    title: 'Instructor Performance Overview',
    Icon: BarChart2,
    description: 'Gain insights into instructor activity and student outcomes (Future Feature).',
  },
  {
    title: 'Scalable Training Operations',
    Icon: Rocket,
    description: 'Tools designed to grow with your flight school (Future Feature).',
  },
];

export const pricing = {
  title: 'Simple, Transparent Pricing',
  betaTitle: 'Currently Free in Beta!',
  betaDescription:
    'All features of CFIPros are completely free to use while we are in Beta. Help us shape the future of flight training!',
  postBetaTeaser:
    'Future pricing will be designed to be affordable for individual CFIs and scalable for flight schools. Stay tuned for updates.',
};

export const cta = {
  title: 'Ready to Elevate Your Flight Instruction?',
  description:
    "Join the CFIPros beta today and experience the next generation of flight training tools. It's free, powerful, and built for you.",
  buttonText: 'Sign Up for Free Beta Access',
  buttonLink: '/auth/signup', // Or your actual signup page
};

export const footerLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  // { label: "Contact Us", href: "/contact" },
];

export const socialLinks = [
  // { label: "Twitter", href: "#", Icon: TwitterIcon }, // Add actual icons
  // { label: "LinkedIn", href: "#", Icon: LinkedInIcon },
];
