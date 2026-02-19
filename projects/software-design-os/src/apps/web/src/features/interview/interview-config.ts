import type { StageInterviewConfig } from './types'

export const STAGE_INTERVIEWS: Record<number, StageInterviewConfig> = {
  1: {
    stageNumber: 1,
    label: 'Product Definition',
    interviewTitle: "Let's define your product",
    questions: [
      {
        id: 'elevator-pitch',
        question: 'What are you building?',
        subtext: 'Describe your product in 1-3 sentences. Think of it as your elevator pitch.',
        inputType: 'textarea',
        placeholder:
          'e.g., A personal dashboard for managing AI agents. It shows what each agent is doing, tracks costs, and lets me schedule recurring tasks.',
        required: true,
        minLength: 20,
      },
      {
        id: 'target-users',
        question: 'Who is this for?',
        subtext:
          "Describe who will use this product. Be specific about their role, technical skill level, and what they're currently doing without your tool.",
        inputType: 'textarea',
        placeholder:
          "e.g., Solo developers who use AI coding agents like Claude Code and Cursor. They're technical but don't have time to build monitoring tools from scratch.",
        required: true,
      },
      {
        id: 'pain-points',
        question: 'What problems does this solve?',
        subtext:
          "List the specific frustrations, inefficiencies, or gaps your users face today. What's painful or broken about their current workflow?",
        inputType: 'multi-input',
        placeholder: "e.g., I have no idea how much I'm spending on AI API calls each month",
        minItems: 1,
        maxItems: 8,
        addButtonLabel: '+ Add another problem',
        required: true,
      },
      {
        id: 'key-features',
        question: 'What are the must-have features?',
        subtext:
          "List the core features your product needs to have on day one. Don't worry about nice-to-haves — focus on what makes this product useful.",
        inputType: 'multi-input',
        placeholder: 'e.g., Real-time dashboard showing all agent activity',
        minItems: 1,
        maxItems: 12,
        addButtonLabel: '+ Add another feature',
        required: true,
      },
      {
        id: 'alternatives',
        question: 'What do people use today instead?',
        subtext:
          'What existing tools, workarounds, or manual processes do your target users rely on? This helps position your product.',
        inputType: 'textarea',
        placeholder:
          "e.g., People check their API provider dashboards manually, use spreadsheets to track costs, or just don't monitor at all.",
        required: false,
      },
      {
        id: 'differentiator',
        question: 'What makes your approach different?',
        subtext: "Why would someone choose your product over the alternatives? What's the unique angle?",
        inputType: 'textarea',
        placeholder:
          "e.g., It's the only tool that combines agent monitoring, cost tracking, and task scheduling in one place — built specifically for solo AI builders, not enterprise teams.",
        required: false,
      },
      {
        id: 'constraints',
        question: 'Any constraints or preferences?',
        subtext:
          'Is there anything the AI should know about scope, technical constraints, timeline, or design preferences?',
        inputType: 'checkbox-and-textarea',
        options: [
          'Solo project — keep it simple',
          'MVP first — minimal viable features only',
          'Must work offline / locally',
          'Needs authentication / multi-user',
          'Mobile-responsive required',
          'Real-time / WebSocket features',
          'Heavy data visualization',
        ],
        textareaLabel: 'Anything else the AI should know?',
        placeholder:
          'e.g., I want this to feel like a NASA mission control dashboard. Dark theme preferred.',
        required: false,
      },
    ],
  },

  2: {
    stageNumber: 2,
    label: 'Data Model',
    interviewTitle: "Let's map out your data",
    preContext:
      'Based on your product definition, the AI already has context. These questions help refine the data model.',
    questions: [
      {
        id: 'core-objects',
        question: 'What are the main things your app tracks?',
        subtext:
          'Think of these as the nouns in your product. Each becomes a database table.',
        inputType: 'multi-input',
        placeholder: 'e.g., Users, Projects, Tasks, Invoices, Messages',
        required: true,
      },
      {
        id: 'relationships',
        question: 'How do these things relate to each other?',
        subtext:
          'Describe the connections. Use plain language — the AI will formalize it.',
        inputType: 'textarea',
        placeholder:
          'e.g., A User has many Projects. Each Project has many Tasks. Tasks can be assigned to Users.',
        required: true,
      },
      {
        id: 'key-attributes',
        question: 'What important details does each thing have?',
        subtext: 'List the key fields or properties for your main objects.',
        inputType: 'textarea',
        placeholder:
          'e.g., Projects need a name, description, status (active/archived), and creation date. Tasks need title, priority, due date, and assigned user.',
        required: false,
      },
      {
        id: 'special-data',
        question: 'Any special data needs?',
        subtext: 'Check any that apply to your product.',
        inputType: 'checkbox',
        options: [
          'File uploads / media',
          'Real-time data / WebSockets',
          'Geolocation / maps',
          'Time series / analytics',
          'Rich text / markdown',
          'Versioning / audit trail',
          'Multi-tenancy',
          'Soft deletes',
        ],
        required: false,
      },
    ],
  },

  3: {
    stageNumber: 3,
    label: 'Database Design',
    interviewTitle: 'Database preferences',
    preContext:
      'The AI will generate a full schema from your data model. These questions capture your preferences.',
    questions: [
      {
        id: 'engine-preference',
        question: 'Do you have a database preference?',
        subtext: 'Pick one, or let the AI recommend based on your data model.',
        inputType: 'single-select',
        options: [
          { label: 'PostgreSQL', description: 'Best all-around choice. JSON support, full-text search, rock solid.' },
          { label: 'MySQL', description: 'Widely supported. Good for straightforward relational data.' },
          { label: 'SQLite', description: 'Zero-config, file-based. Great for local-first or embedded apps.' },
          { label: 'MongoDB', description: 'Document store. Good for flexible/nested data structures.' },
          { label: 'Supabase', description: 'Postgres with built-in auth, real-time, and REST API.' },
          { label: 'Let AI decide', description: 'The AI will recommend based on your data model and use case.' },
        ],
        required: true,
      },
      {
        id: 'scale-expectations',
        question: 'How much data do you expect?',
        subtext: 'This helps the AI plan indexing and optimization.',
        inputType: 'single-select',
        options: [
          { label: 'Small', description: 'Hundreds to thousands of records. Personal tool or small team.' },
          { label: 'Medium', description: 'Tens of thousands to hundreds of thousands. Growing startup.' },
          { label: 'Large', description: 'Millions of records. Need to think about partitioning and caching.' },
        ],
        required: false,
      },
      {
        id: 'hosting-preference',
        question: 'Where will the database run?',
        inputType: 'single-select',
        options: [
          { label: 'Local Docker', description: 'Run locally during development, decide hosting later.' },
          { label: 'Managed service', description: 'Cloud-hosted (Supabase, Neon, PlanetScale, RDS).' },
          { label: 'Self-hosted', description: 'VPS or bare metal.' },
          { label: 'Not sure yet', description: 'Let the AI suggest options.' },
        ],
        required: false,
      },
    ],
  },

  4: {
    stageNumber: 4,
    label: 'API Design',
    interviewTitle: 'How will your app communicate?',
    preContext:
      'The AI generates API endpoints from your data model and features. These questions shape the API style.',
    questions: [
      {
        id: 'api-style',
        question: 'What style of API?',
        inputType: 'single-select',
        options: [
          { label: 'REST', description: 'Standard HTTP endpoints. Most common, easy to understand.' },
          { label: 'GraphQL', description: 'Flexible queries. Good for complex frontends with varied data needs.' },
          { label: 'tRPC', description: 'End-to-end type safety with TypeScript. No separate API layer.' },
          { label: 'Let AI decide', description: 'Recommend based on the product type and data model.' },
        ],
        required: true,
      },
      {
        id: 'auth-strategy',
        question: 'How should users authenticate?',
        inputType: 'multi-select',
        options: [
          { label: 'Email + Password', description: 'Traditional login.' },
          { label: 'OAuth / Social Login', description: 'Google, GitHub, etc.' },
          { label: 'Magic Link', description: 'Passwordless email login.' },
          { label: 'API Key', description: 'For developer/machine access.' },
          { label: 'No auth needed', description: 'Public or single-user tool.' },
          { label: 'Not sure yet', description: 'Let the AI recommend.' },
        ],
        required: true,
      },
      {
        id: 'external-integrations',
        question: 'Any external APIs or services to integrate?',
        subtext: 'List third-party services your app needs to talk to.',
        inputType: 'multi-input',
        placeholder: 'e.g., Stripe for payments, SendGrid for email, OpenAI API',
        required: false,
      },
      {
        id: 'special-endpoints',
        question: 'Any special API requirements?',
        inputType: 'checkbox',
        options: [
          'Webhooks (receive events from external services)',
          'Real-time / WebSocket endpoints',
          'File upload endpoints',
          'Bulk operations (import/export)',
          'Rate limiting',
          'API versioning',
        ],
        required: false,
      },
    ],
  },

  5: {
    stageNumber: 5,
    label: 'Programming Stack',
    interviewTitle: 'Choose your tech stack',
    preContext:
      'The AI will recommend a stack based on your product. Override any choices here.',
    questions: [
      {
        id: 'experience',
        question: "What's your technical background?",
        subtext: "This helps the AI pick tools you'll be comfortable with.",
        inputType: 'multi-select',
        options: [
          { label: 'React / Next.js' },
          { label: 'Vue / Nuxt' },
          { label: 'Svelte / SvelteKit' },
          { label: 'Python / Django / FastAPI' },
          { label: 'Node.js / Express' },
          { label: 'Go' },
          { label: 'Rust' },
          { label: 'New to coding — pick the easiest path' },
        ],
        required: true,
      },
      {
        id: 'frontend-preference',
        question: 'Frontend preference?',
        inputType: 'single-select',
        options: [
          { label: 'React + Vite', description: 'Fast, flexible, huge ecosystem.' },
          { label: 'Next.js', description: 'React with SSR, routing, and API routes built in.' },
          { label: 'Vue + Nuxt', description: 'Progressive framework, great DX.' },
          { label: 'Svelte + SvelteKit', description: 'Compiler-based, minimal boilerplate.' },
          { label: 'Let AI decide', description: 'Recommend based on product needs.' },
        ],
        required: false,
      },
      {
        id: 'styling-preference',
        question: 'How do you want to style it?',
        inputType: 'single-select',
        options: [
          { label: 'Tailwind CSS + shadcn/ui', description: 'Utility-first with beautiful components.' },
          { label: 'CSS Modules', description: 'Scoped CSS, no framework lock-in.' },
          { label: 'Styled Components', description: 'CSS-in-JS for React.' },
          { label: 'Let AI decide' },
        ],
        required: false,
      },
      {
        id: 'deployment-target',
        question: 'Where will you deploy?',
        inputType: 'single-select',
        options: [
          { label: 'Docker (local first)', description: 'Full control, run anywhere.' },
          { label: 'Vercel', description: 'Best for Next.js. Instant deploys.' },
          { label: 'Railway', description: 'Simple container hosting with databases.' },
          { label: 'Fly.io', description: 'Edge deployment, good for APIs.' },
          { label: 'Self-hosted VPS', description: 'Full control on your own server.' },
          { label: 'Not sure yet' },
        ],
        required: false,
      },
    ],
  },

  6: {
    stageNumber: 6,
    label: 'Design System',
    interviewTitle: 'Define the look and feel',
    questions: [
      {
        id: 'mood',
        question: 'What vibe should the app have?',
        subtext:
          'Pick words that describe the feeling. The AI will generate matching colors and typography.',
        inputType: 'multi-select',
        options: [
          { label: 'Professional & clean' },
          { label: 'Bold & modern' },
          { label: 'Warm & friendly' },
          { label: 'Dark & technical' },
          { label: 'Minimal & zen' },
          { label: 'Playful & colorful' },
          { label: 'Corporate & trustworthy' },
          { label: 'Futuristic / sci-fi' },
        ],
        required: true,
      },
      {
        id: 'color-seed',
        question: 'Any brand colors?',
        subtext:
          'Provide a primary color hex code and the AI will generate a full palette. Or skip to let AI choose.',
        inputType: 'textarea',
        placeholder: '#0ea5e9',
        required: false,
      },
      {
        id: 'inspiration',
        question: 'Any apps you want it to look like?',
        subtext:
          'Name 1-3 apps whose design you admire. The AI will draw from their aesthetic.',
        inputType: 'multi-input',
        placeholder: 'e.g., Linear, Notion, Stripe Dashboard',
        required: false,
      },
      {
        id: 'layout',
        question: 'What layout structure?',
        inputType: 'single-select',
        options: [
          { label: 'Sidebar + Main Content', description: 'Classic dashboard layout. Sidebar navigation on the left.' },
          { label: 'Top Navigation + Content', description: 'Horizontal nav bar. Good for simpler apps.' },
          { label: 'Hybrid', description: 'Top bar for global nav, sidebar for section nav.' },
          { label: 'Let AI decide' },
        ],
        required: false,
      },
      {
        id: 'dark-mode',
        question: 'Dark mode?',
        inputType: 'single-select',
        options: [
          { label: 'Light only' },
          { label: 'Dark only' },
          { label: 'Both (with toggle)' },
          { label: 'System preference' },
        ],
        required: false,
      },
    ],
  },

  7: {
    stageNumber: 7,
    label: 'Sections / Pages',
    interviewTitle: 'Map out your screens',
    preContext:
      'The AI will generate page specs from your product features. These questions help structure the UI.',
    questions: [
      {
        id: 'main-screens',
        question: 'What are the main screens or pages?',
        subtext:
          'List every distinct page your app needs. Think of each entry in your navigation.',
        inputType: 'multi-input',
        placeholder: 'e.g., Dashboard, Projects, Settings, User Profile',
        required: true,
      },
      {
        id: 'landing-page',
        question: "What's the first thing users see after login?",
        subtext: 'This is your main dashboard or home screen.',
        inputType: 'textarea',
        placeholder:
          'e.g., A dashboard showing all active projects with progress bars and recent activity.',
        required: true,
      },
      {
        id: 'complex-interactions',
        question: 'Any complex interactions to call out?',
        subtext: 'Drag-and-drop, real-time updates, multi-step wizards, etc.',
        inputType: 'multi-input',
        placeholder: 'e.g., Drag-and-drop kanban board for task management',
        required: false,
      },
      {
        id: 'data-heavy-screens',
        question: 'Which screens display a lot of data?',
        subtext:
          'Tables, charts, feeds — these need special attention for pagination, filtering, and performance.',
        inputType: 'multi-input',
        placeholder: 'e.g., Activity feed with infinite scroll, Usage analytics with charts',
        required: false,
      },
    ],
  },

  8: {
    stageNumber: 8,
    label: 'Infrastructure',
    interviewTitle: 'Deployment & DevOps',
    preContext:
      'The AI generates Docker configs and CI/CD from your stack choices. These questions fine-tune it.',
    questions: [
      {
        id: 'env-complexity',
        question: 'How many environments?',
        inputType: 'single-select',
        options: [
          { label: 'Just local dev', description: "I'll figure out production later." },
          { label: 'Local + Production', description: 'Two environments with deploy pipeline.' },
          { label: 'Local + Staging + Production', description: 'Full pipeline with staging for testing.' },
        ],
        required: true,
      },
      {
        id: 'ci-preference',
        question: 'CI/CD preference?',
        inputType: 'single-select',
        options: [
          { label: 'GitHub Actions', description: 'Built into GitHub. Most common.' },
          { label: 'GitLab CI', description: 'If using GitLab.' },
          { label: 'None for now', description: 'Manual deploys to start.' },
        ],
        required: false,
      },
      {
        id: 'monitoring',
        question: 'Any monitoring needs?',
        inputType: 'checkbox',
        options: [
          'Error tracking (Sentry)',
          'Uptime monitoring',
          'Log aggregation',
          'Performance metrics',
          'Not needed yet',
        ],
        required: false,
      },
    ],
  },
}

export function getStageInterview(stageNumber: number): StageInterviewConfig | null {
  return STAGE_INTERVIEWS[stageNumber] ?? null
}

export function hasInterview(stageNumber: number): boolean {
  return stageNumber >= 1 && stageNumber <= 8
}
