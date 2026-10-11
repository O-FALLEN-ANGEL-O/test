export const profile = {
  name: 'Prajwal D L',
  role: 'Full Stack Developer',
  location: 'Mangalore, India',
  email: 'contact@praxel.space',
  phone: '+91 8105561638',
  phoneHref: 'tel:+918105561638',
  linkedin: 'https://www.linkedin.com/in/prajwal-d-l-118198370/',
  resume: '/resume.pdf',
  /** Stats from every account are added together. */
  github: ['O-FALLEN-ANGEL-O', 'smhrimmy'],
  codingSince: 2022,
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
  /** YYYY-MM; `end` omitted means current. Used for the duration label. */
  start: string;
  end?: string;
  type: string;
  place: string;
  points: string[];
};

export const experience: Job[] = [
  {
    role: 'Web Advisor',
    company: 'UnifyCX',
    period: 'Jun 2025 — Present',
    start: '2025-06',
    type: 'Full-time',
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
    start: '2024-12',
    end: '2025-06',
    type: 'Freelance',
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
    start: '2024-08',
    end: '2024-12',
    type: 'Full-time',
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
    start: '2024-01',
    end: '2024-05',
    type: 'Internship',
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
  url?: string;
  image?: string;
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

/** Shown as a compact index below the featured cards. */
export const moreProjects: Project[] = [
  {
    title: 'TermiAI',
    tag: 'Frontend complete',
    text: 'Offline AI terminal assistant that turns natural language into CMD / PowerShell commands and runs them locally.',
    stack: ['PyQt5', 'FastAPI', 'Ollama', 'LLM'],
    url: 'https://termi-ai-scribe.vercel.app/',
    image: '/projects/termiai.webp',
  },
  {
    title: 'Remote PC Control',
    tag: 'System stats done',
    text: 'Dashboard to monitor and control a PC remotely — live system stats, file explorer, screenshots and commands.',
    stack: ['React', 'Tailwind', 'Axios', 'FastAPI'],
    url: 'https://remote-pc1.onrender.com/',
    image: '/projects/remote-pc.webp',
  },
  {
    title: 'AI To-Do Hub',
    tag: 'Web app',
    text: 'To-do app blending AI with Notion- and Google Keep-style notes.',
    stack: ['React', 'PHP', 'MySQL', 'Chart.js'],
    url: 'https://noti-keep-ai-hub.vercel.app/',
    image: '/projects/ai-todo.webp',
  },
  {
    title: 'Next.js AI Chatbot',
    tag: 'Web app',
    text: 'AI-powered chatbot with a modern conversational UI.',
    stack: ['Next.js', 'TypeScript', 'AI'],
    url: 'https://ai-chatbot-mu-brown.vercel.app/',
    image: '/projects/chatbot.webp',
  },
  {
    title: 'Sparkling Gem Bazaar',
    tag: 'Frontend',
    text: 'Jewellery storefront with product browsing and a gold exchange programme.',
    stack: ['Next.js', 'React', 'CSS'],
    url: 'https://sparkling-gem-bazaar.vercel.app/',
    image: '/projects/gem-bazaar.webp',
  },
  {
    title: 'Real Estate Website',
    tag: 'Frontend',
    text: 'Real estate platform with property listings.',
    stack: ['React', 'CSS'],
    url: 'https://real-estate1-virid.vercel.app/',
    image: '/projects/real-estate.webp',
  },
  {
    title: 'Tech Chat App',
    tag: 'In progress',
    text: 'Real-time messaging for tech communities with group chat, file sharing and emoji reactions.',
    stack: ['React', 'JavaScript', 'API'],
  },
  {
    title: 'Portfolio Dashboard',
    tag: 'In progress',
    text: 'Portfolio management with analytics, project tracking and client tools.',
    stack: ['React', 'PHP', 'MySQL', 'Chart.js'],
  },
];
