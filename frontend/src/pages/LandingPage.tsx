import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, TrendingUp, Users, Award, Zap, BookOpen, Globe, Shield } from "lucide-react";
import { courses, categories } from "@/data/mockData";
import { CourseCard } from "@/components/CourseCard";
import { TestimonialCarousel } from "@/components/TestimonialCarousel";

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.7 },
};

const stagger = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const stats = [
  { icon: Users, label: "Active Learners", value: "120K+" },
  { icon: BookOpen, label: "Expert Courses", value: "500+" },
  { icon: Award, label: "Completion Rate", value: "94%" },
  { icon: Globe, label: "Countries", value: "150+" },
];

const features = [
  { icon: Zap, title: "AI-Powered Learning", desc: "Personalized paths that adapt to your pace and style." },
  { icon: Shield, title: "Industry Certified", desc: "Certificates recognized by top tech companies worldwide." },
  { icon: TrendingUp, title: "Career Growth", desc: "85% of graduates report significant career advancement." },
  { icon: Sparkles, title: "Premium Content", desc: "Created by senior engineers from Google, Meta, and Stripe." },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Animated bg orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/10 blur-3xl"
          />
          <motion.div
            animate={{ x: [0, 15, 0], y: [0, 15, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-cyan/10 blur-3xl"
          />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Trusted by 120,000+ learners worldwide</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-6"
          >
            Master the skills
            <br />
            <span className="gradient-text">that matter</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Premium courses crafted by industry experts. Learn at your pace with
            interactive content, real-world projects, and a community that lifts you up.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap"
          >
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl gradient-primary text-primary-foreground font-semibold text-lg shadow-glow hover:opacity-90 transition-all"
            >
              Explore Courses <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl glass text-foreground font-semibold text-lg border border-border hover:bg-secondary transition-all"
            >
              Get Started <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
            <div className="w-1 h-3 rounded-full bg-muted-foreground/50" />
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-20 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="font-display text-3xl md:text-4xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features scrollytelling */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Why learners <span className="gradient-text">choose us</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Everything you need to accelerate your career in tech.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                whileHover={{ y: -8 }}
                className="group p-6 rounded-2xl glass hover:shadow-glow transition-shadow duration-300"
              >
                <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2 text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Course categories */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Popular <span className="gradient-text">courses</span>
            </h2>
            <p className="text-muted-foreground text-lg">Hand-picked courses from world-class instructors</p>
          </motion.div>

          <motion.div {...fadeUp} className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.slice(0, 5).map((cat) => (
              <span key={cat} className="px-4 py-2 rounded-full glass text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                {cat}
              </span>
            ))}
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 3).map((course, i) => (
              <CourseCard key={course.id} course={course} index={i} />
            ))}
          </div>

          <motion.div {...fadeUp} className="text-center mt-12">
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-secondary transition-colors"
            >
              View All Courses <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Loved by <span className="gradient-text">thousands</span>
            </h2>
            <p className="text-muted-foreground text-lg">See what our learners have to say</p>
          </motion.div>
          <motion.div {...fadeUp}>
            <TestimonialCarousel />
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            {...fadeUp}
            className="relative overflow-hidden rounded-3xl gradient-cta p-12 md:p-20 text-center"
          >
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary/20 rounded-full blur-3xl"
              />
            </div>
            <div className="relative z-10">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
                Start your journey today
              </h2>
              <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto mb-8">
                Join 120,000+ learners who are building their future with premium courses.
              </p>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary-foreground text-primary font-semibold text-lg hover:opacity-90 transition-opacity"
              >
                Get Started Free <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-7 w-7 rounded-lg gradient-primary flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">Lumina</span>
          </div>
          <p>© 2026 Lumina. Premium learning for ambitious minds.</p>
        </div>
      </footer>
    </div>
  );
}
