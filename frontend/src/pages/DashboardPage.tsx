import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Play, BookOpen, Clock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getEnrollmentsByUserId, type EnrollmentWithProgress } from "@/api/lms";
import { ProgressBar } from "@/components/ProgressBar";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentWithProgress[]>([]);

  const decodeUserIdFromAccessToken = () => {
    try {
      const token = window.localStorage.getItem("lms_access_token");
      if (!token) return null;
      const [, payload] = token.split(".");
      if (!payload) return null;
      const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
      const data = JSON.parse(json) as { sub?: string };
      if (!data.sub) return null;
      const id = Number(data.sub);
      return Number.isFinite(id) ? id : null;
    } catch {
      return null;
    }
  };

  const userId = useMemo(() => decodeUserIdFromAccessToken(), []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        if (!userId) {
          setError("You must be logged in to view your dashboard.");
          return;
        }
        const res = await getEnrollmentsByUserId(userId);
        if (alive) setEnrollments(res);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : "Failed to load dashboard");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [userId]);

  const totalEnrolledCourses = enrollments.length;
  const averageProgress = totalEnrolledCourses
    ? Math.round(enrollments.reduce((acc, e) => acc + (e.percentage ?? 0), 0) / totalEnrolledCourses)
    : 0;
  const totalWatchedSeconds = enrollments.reduce((acc, e) => acc + (e.watchedSeconds ?? 0), 0);
  const totalWatchedHours = totalWatchedSeconds / 3600;
  const formattedHours = totalWatchedHours < 1 ? "<1h" : `${Math.round(totalWatchedHours * 10) / 10}h`;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">
            My <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-muted-foreground text-lg">Track your learning journey</p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
        >
          {[
            { label: "Enrolled Courses", value: loading ? "..." : totalEnrolledCourses, icon: BookOpen },
            { label: "Total Hours", value: loading ? "..." : formattedHours, icon: Clock },
            {
              label: "Avg. Progress",
              value: loading ? "..." : `${averageProgress}%`,
              icon: Play,
            },
          ].map((stat, i) => (
            <div key={stat.label} className="p-5 rounded-2xl bg-card border border-border shadow-card flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                <stat.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-card-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {error ? (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-destructive">{error}</div>
        ) : null}

        {/* Enrolled courses */}
        <h2 className="font-display text-2xl font-bold mb-6 text-foreground">Continue Learning</h2>
        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="p-5 rounded-2xl bg-card border border-border shadow-card">
                <div className="h-6 w-1/2 bg-muted/60 rounded mb-4" />
                <div className="h-4 w-full bg-muted/40 rounded mb-3" />
                <div className="h-4 w-4/5 bg-muted/30 rounded mb-6" />
                <div className="h-10 w-28 bg-muted/30 rounded" />
              </div>
            ))}
          </div>
        ) : totalEnrolledCourses === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <p className="text-muted-foreground text-lg mb-4">You haven't enrolled in any courses yet.</p>
            <Link to="/courses" className="inline-flex px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold">
              Browse Courses
            </Link>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {enrollments.map((enrollment, i) => {
              const progress = enrollment;
              const resumeLabel = (progress.lastPositionSeconds ?? 0) > 0 ? "Resume" : "Start";
              return (
                <motion.div
                  key={enrollment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  whileHover={{ y: -4 }}
                  className="group p-5 rounded-2xl bg-card border border-border shadow-card hover:shadow-elevated transition-shadow"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-14 w-14 rounded-xl gradient-hero flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-7 w-7 text-primary-foreground/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-card-foreground truncate">{enrollment.title}</h3>
                      <p className="text-sm text-muted-foreground">{progress.completedVideos} completed</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span>
                        {progress.completedVideos} / {progress.totalVideos} videos
                      </span>
                      <span>{progress.percentage ?? 0}%</span>
                    </div>
                    <ProgressBar value={progress.percentage ?? 0} />
                  </div>

                  <Link
                    to={`/learn/${enrollment.subject_id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <Play className="h-3.5 w-3.5" />
                    {resumeLabel}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
