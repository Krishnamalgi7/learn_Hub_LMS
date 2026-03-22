export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorAvatar: string;
  thumbnail: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  lessons: number;
  rating: number;
  students: number;
  price: number;
  tags: string[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoId: string;
  isLocked: boolean;
  order: number;
}

export interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

export const categories = [
  "All", "Web Development", "Data Science", "Design", "Mobile", "AI & ML", "DevOps"
];

export const courses: Course[] = [
  {
    id: "1",
    title: "Modern React & TypeScript Masterclass",
    description: "Build production-ready applications with React 18, TypeScript, and modern tooling. Learn hooks, context, patterns, and best practices.",
    instructor: "Sarah Chen",
    instructorAvatar: "",
    thumbnail: "",
    category: "Web Development",
    level: "Intermediate",
    duration: "24h 30m",
    lessons: 142,
    rating: 4.9,
    students: 12400,
    price: 89,
    tags: ["React", "TypeScript", "Hooks"],
  },
  {
    id: "2",
    title: "Python for Data Science & Machine Learning",
    description: "Master Python, NumPy, Pandas, Matplotlib, Scikit-Learn, and TensorFlow for data science and machine learning projects.",
    instructor: "James Rodriguez",
    instructorAvatar: "",
    thumbnail: "",
    category: "Data Science",
    level: "Beginner",
    duration: "36h 15m",
    lessons: 198,
    rating: 4.8,
    students: 28300,
    price: 99,
    tags: ["Python", "ML", "TensorFlow"],
  },
  {
    id: "3",
    title: "UI/UX Design System with Figma",
    description: "Learn to create stunning design systems, component libraries, and interactive prototypes using Figma from scratch.",
    instructor: "Emma Wilson",
    instructorAvatar: "",
    thumbnail: "",
    category: "Design",
    level: "Beginner",
    duration: "18h 45m",
    lessons: 96,
    rating: 4.7,
    students: 8900,
    price: 69,
    tags: ["Figma", "UI/UX", "Design Systems"],
  },
  {
    id: "4",
    title: "Full-Stack Next.js & Prisma",
    description: "Build full-stack applications with Next.js 14, Prisma, PostgreSQL, and deploy to production with CI/CD.",
    instructor: "Alex Kumar",
    instructorAvatar: "",
    thumbnail: "",
    category: "Web Development",
    level: "Advanced",
    duration: "32h 00m",
    lessons: 168,
    rating: 4.9,
    students: 15700,
    price: 119,
    tags: ["Next.js", "Prisma", "PostgreSQL"],
  },
  {
    id: "5",
    title: "React Native Mobile Development",
    description: "Create cross-platform mobile apps with React Native, Expo, and integrate with native APIs and services.",
    instructor: "Maria Santos",
    instructorAvatar: "",
    thumbnail: "",
    category: "Mobile",
    level: "Intermediate",
    duration: "28h 20m",
    lessons: 134,
    rating: 4.6,
    students: 9200,
    price: 94,
    tags: ["React Native", "Expo", "Mobile"],
  },
  {
    id: "6",
    title: "Deep Learning & Neural Networks",
    description: "Dive deep into neural networks, CNNs, RNNs, GANs, and transformers using PyTorch and cutting-edge research.",
    instructor: "Dr. Wei Zhang",
    instructorAvatar: "",
    thumbnail: "",
    category: "AI & ML",
    level: "Advanced",
    duration: "40h 10m",
    lessons: 210,
    rating: 4.8,
    students: 6800,
    price: 149,
    tags: ["PyTorch", "Deep Learning", "NLP"],
  },
];

export const courseSections: Section[] = [
  {
    id: "s1",
    title: "Getting Started",
    lessons: [
      { id: "l1", title: "Welcome & Course Overview", duration: "5:30", videoId: "dQw4w9WgXcQ", isLocked: false, order: 1 },
      { id: "l2", title: "Setting Up Your Environment", duration: "12:45", videoId: "dQw4w9WgXcQ", isLocked: false, order: 2 },
      { id: "l3", title: "Project Structure Explained", duration: "8:20", videoId: "dQw4w9WgXcQ", isLocked: false, order: 3 },
    ],
  },
  {
    id: "s2",
    title: "Core Fundamentals",
    lessons: [
      { id: "l4", title: "Components & JSX Deep Dive", duration: "18:30", videoId: "dQw4w9WgXcQ", isLocked: false, order: 4 },
      { id: "l5", title: "State Management Patterns", duration: "22:10", videoId: "dQw4w9WgXcQ", isLocked: false, order: 5 },
      { id: "l6", title: "Hooks: useState & useEffect", duration: "25:00", videoId: "dQw4w9WgXcQ", isLocked: true, order: 6 },
      { id: "l7", title: "Custom Hooks & Composition", duration: "19:45", videoId: "dQw4w9WgXcQ", isLocked: true, order: 7 },
    ],
  },
  {
    id: "s3",
    title: "Advanced Patterns",
    lessons: [
      { id: "l8", title: "Context API & Provider Pattern", duration: "20:15", videoId: "dQw4w9WgXcQ", isLocked: true, order: 8 },
      { id: "l9", title: "Performance Optimization", duration: "28:30", videoId: "dQw4w9WgXcQ", isLocked: true, order: 9 },
      { id: "l10", title: "Testing React Components", duration: "35:00", videoId: "dQw4w9WgXcQ", isLocked: true, order: 10 },
    ],
  },
];

export const testimonials = [
  {
    id: "1",
    name: "David Park",
    role: "Frontend Engineer at Google",
    content: "This platform completely transformed my career. The course quality is unmatched and the learning experience feels premium.",
    avatar: "",
  },
  {
    id: "2",
    name: "Lisa Thompson",
    role: "Product Designer at Stripe",
    content: "The scrollytelling approach to learning keeps me engaged for hours. Best investment I've made in my professional development.",
    avatar: "",
  },
  {
    id: "3",
    name: "Marcus Johnson",
    role: "Full-Stack Developer",
    content: "I went from junior to senior in 8 months. The hands-on projects and community support are incredible.",
    avatar: "",
  },
  {
    id: "4",
    name: "Aisha Patel",
    role: "Data Scientist at Meta",
    content: "The AI/ML courses here are better than any university program I've seen. Practical, modern, and beautifully presented.",
    avatar: "",
  },
];
