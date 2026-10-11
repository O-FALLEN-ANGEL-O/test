export const profile = {
  name: 'Prajwal D L',
  role: 'Full Stack Developer',
  location: 'Mangalore, India',
  email: 'contact@praxel.space',
  phone: '+91 8105561638',
  phoneHref: 'tel:+918105561638',
  linkedin: 'https://www.linkedin.com/in/prajwal-d-l-118198370/',
  resume: '/resume.pdf',
};

export const about =
  'I build web products end to end — interfaces people enjoy, backends that hold up, and the debugging in between. Hosting and support work taught me how software actually breaks in production, so I write code that is easy to reason about and easy to fix.';

export const journey = [
  { year: '2022', title: 'Started coding', text: 'Programming fundamentals and the web.' },
  { year: '2023', title: 'Went full stack', text: 'React on the front, PHP and MySQL on the back.' },
  { year: '2024', title: 'Shipping for real', text: 'Internship, support engineering and client work.' },
];

export type Job = {
  role: string;
  company: string;
  period: string;
  place: string;
  points: string[];
};

export const experience: Job[] = [
  {
    role: 'Web Advisor',
    company: 'UnifyCX',
    period: 'Jun 2025 — Present',
    place: 'Mangalore, Karnataka',
    points: [
      'Website migrations, SSL installations, email configuration and hosting control panel issues.',
      'Technical support for WordPress, CMS platforms, DNS and email in shared hosting environments.',
      'Documented support interactions and resolved issues with the wider team.',
    ],
  },
  {
    role: 'Full Stack Developer',
    company: 'Freelance',
    period: 'Dec 2024 — Jun 2025',
    place: 'Mangalore',
    points: [
      'Designed and built custom websites and web apps to client requirements.',
      'Delivered responsive, performance-focused solutions, iterating on user feedback.',
      'Maintained a live portfolio across multiple technology stacks.',
    ],
  },
  {
    role: 'Junior Support Engineer',
    company: 'Glowtouch Technologies',
    period: 'Aug 2024 — Dec 2024',
    place: 'Mangalore',
    points: [
      'Live chat support for hosting, domain and website issues.',
      'Troubleshot WordPress, PHP, MySQL, server, DNS, email and migration problems.',
      'Documented common issues to improve team support efficiency.',
    ],
  },
  {
    role: 'Web Developer Intern',
    company: 'Vitvara Technologies',
    period: 'Jan 2024 — May 2024',
    place: 'Mangalore',
    points: [
      'Built responsive web apps with HTML, CSS, JavaScript and React.js.',
      'Designed and implemented API functionality optimised for performance and security.',
      'Debugged and tested applications, reducing reported bugs.',
    ],
  },
];

export const skillGroups = [
  { title: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind', 'Framer Motion'] },
  { title: 'Backend', items: ['PHP', 'MySQL', 'PostgreSQL', 'Supabase', 'REST APIs', 'Row Level Security'] },
  { title: 'Tools & Ops', items: ['Git', 'VS Code', 'Postman', 'WordPress', 'DNS', 'Debugging'] },
];

export type Project = {
  title: string;
  tag: string;
  text: string;
  stack: string[];
  url: string;
  image: string;
};

export const projects: Project[] = [
  {
    title: 'HR+ Platform',
    tag: 'In progress',
    text: 'Internal HRMS covering leave, payroll, recruitment, helpdesk and OKRs, with role-based permissions enforced by Postgres row level security and AI-assisted resume matching.',
    stack: ['React', 'Supabase', 'PostgreSQL', 'SQL RLS', 'Tailwind', 'Framer Motion'],
    url: 'https://hrms-five-alpha.vercel.app/',
    image: '/projects/hrms.webp',
  },
  {
    title: 'SmartTracker+',
    tag: 'Client work',
    text: 'Role-based fee management for schools: track student payments, manage schools and courses, and export Excel reports.',
    stack: ['Next.js', 'TypeScript', 'Supabase', 'PostgreSQL', 'shadcn/ui'],
    url: 'https://client1-mu.vercel.app/',
    image: '/projects/smarttracker.webp',
  },
  {
    title: 'Sparkle',
    tag: 'Frontend',
    text: 'Online jewellery storefront with collection browsing and a gold exchange programme — a rebuild of Sparkling Gem Bazaar.',
    stack: ['Next.js', 'React', 'CSS'],
    url: 'https://sparky-lilac.vercel.app/',
    image: '/projects/sparkle.webp',
  },
];
