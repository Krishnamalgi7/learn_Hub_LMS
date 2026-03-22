import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, BookOpen, Users, Star, CheckCircle2, Play } from "lucide-react";
import { courses, courseSections } from "@/data/mockData";
import { useCourseStore } from "@/store/useCourseStore";

const learnings = [
  "Build production-ready applications from scratch",
  "Master advanced patterns and best practices",
  "Understand architecture and design decisions",
  "Write clean, maintainable, and testable code",
  "Deploy and scale applications in production",
  "Work with real-world APIs and databases",
];

export default function CourseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const course = courses.find((c) => c.id === id) || courses[0];
  const { enrollInCourse, enrolledCourses } = useCourseStore();
  const isEnrolled = enrolledCourses.includes(course.id);
  const totalLessons = courseSections.reduce((acc, s) => acc + s.lessons.length, 0);

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Link to="/courses" className="inline-flex items-center gap-1 text-primary-foreground/70 hover:text-primary-foreground mb-6 text-sm">
              <ArrowLeft className="h-4 w-4" /> Back to Courses
            </Link>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-primary-foreground/20 text-primary-foreground text-xs font-semibold">{course.category}</span>
              <span className="px-3 py-1 rounded-full bg-primary-foreground/20 text-primary-foreground text-xs font-semibold">{course.level}</span>
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-4 max-w-3xl">{course.title}</h1>
            <p className="text-primary-foreground/80 text-lg max-w-2xl mb-6">{course.description}</p>
            <div className="flex flex-wrap items-center gap-6 text-primary-foreground/80 text-sm">
              <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber text-amber" /> {course.rating} rating</span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {course.students.toLocaleString()} students</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {course.duration}</span>
              <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {course.lessons} lessons</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What you'll learn */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-2xl bg-card border border-border shadow-card"
            >
              <h2 className="font-display text-xl font-bold mb-4 text-card-foreground">What you'll learn</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {learnings.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Curriculum */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-2xl bg-card border border-border shadow-card"
            >
              <h2 className="font-display text-xl font-bold mb-4 text-card-foreground">Curriculum</h2>
              <div className="space-y-4">
                {courseSections.map((section) => (
                  <div key={section.id}>
                    <h3 className="font-semibold text-sm text-foreground mb-2">{section.title}</h3>
                    <div className="space-y-1">
                      {section.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors">
                          <Play className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground flex-1">{lesson.title}</span>
                          <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Instructor */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-2xl bg-card border border-border shadow-card"
            >
              <h2 className="font-display text-xl font-bold mb-4 text-card-foreground">Instructor</h2>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                  {course.instructor.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{course.instructor}</h3>
                  <p className="text-sm text-muted-foreground">Senior Engineer & Course Creator</p>
                  <p className="text-xs text-muted-foreground mt-1">15+ years of industry experience</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sticky sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="sticky top-24 p-6 rounded-2xl bg-card border border-border shadow-elevated space-y-4"
            >
              <div className="text-center">
                <span className="font-display text-4xl font-bold text-foreground">${course.price}</span>
                <span className="text-muted-foreground ml-1">USD</span>
              </div>

              {isEnrolled ? (
                <Link
                  to={`/learn/${course.id}`}
                  className="block w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-semibold text-center hover:opacity-90 transition-opacity"
                >
                  Continue Learning
                </Link>
              ) : (
                <button
                  onClick={() => enrollInCourse(course.id, totalLessons)}
                  className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
                >
                  Enroll Now
                </button>
              )}

              <div className="space-y-3 pt-4 border-t border-border text-sm text-muted-foreground">
                <div className="flex justify-between"><span>Duration</span><span className="text-foreground font-medium">{course.duration}</span></div>
                <div className="flex justify-between"><span>Lessons</span><span className="text-foreground font-medium">{course.lessons}</span></div>
                <div className="flex justify-between"><span>Level</span><span className="text-foreground font-medium">{course.level}</span></div>
                <div className="flex justify-between"><span>Certificate</span><span className="text-foreground font-medium">Yes</span></div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
