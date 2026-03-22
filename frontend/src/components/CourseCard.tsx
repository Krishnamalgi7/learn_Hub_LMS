import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, Users, Clock, BookOpen } from "lucide-react";
import type { Course } from "@/data/mockData";

const levelColors: Record<string, string> = {
  Beginner: "bg-emerald/10 text-emerald",
  Intermediate: "bg-amber/10 text-amber",
  Advanced: "bg-rose/10 text-rose",
};

export function CourseCard({ course, index = 0 }: { course: Course; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={`/courses/${course.id}`}>
        <motion.div
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="group relative overflow-hidden rounded-2xl bg-card border border-border shadow-card hover:shadow-elevated transition-shadow duration-300"
        >
          {/* Thumbnail */}
          <div className="relative h-48 overflow-hidden gradient-hero">
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="h-16 w-16 text-primary-foreground/30" />
            </div>
            <div className="absolute top-3 right-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${levelColors[course.level]}`}>
                {course.level}
              </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Content */}
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {course.category}
              </span>
            </div>
            <h3 className="font-display font-semibold text-card-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {course.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
            
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-amber text-amber" />
              <span className="font-semibold text-card-foreground">{course.rating}</span>
              <span className="text-muted-foreground">•</span>
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">{(course.students / 1000).toFixed(1)}k</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{course.duration}</span>
                <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{course.lessons} lessons</span>
              </div>
              <span className="font-display font-bold text-lg text-primary">${course.price}</span>
            </div>
          </div>

          {/* Glow effect on hover */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ boxShadow: "var(--shadow-glow)" }} />
        </motion.div>
      </Link>
    </motion.div>
  );
}
