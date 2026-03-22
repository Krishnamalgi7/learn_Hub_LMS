import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { enrollInSubject, getEnrollmentsByUserId, getSubjects, type Subject } from "@/api/lms";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserRole } from "@/utils/auth";

export default function CoursesPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [enrolledSubjectIds, setEnrolledSubjectIds] = useState<number[]>([]);

  const decodeUserIdFromAccessToken = () => {
    try {
      const token = window.localStorage.getItem("lms_access_token");
      if (!token) return null;
      const [, payload] = token.split(".");
      if (!payload) return null;
      const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
      const data = JSON.parse(json) as { sub?: string };
      const id = data.sub ? Number(data.sub) : NaN;
      return Number.isFinite(id) ? id : null;
    } catch {
      return null;
    }
  };

  const userRole = getUserRole();
  const userId = useMemo(() => decodeUserIdFromAccessToken(), []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setError(null);
        setLoading(true);
        const res = await getSubjects();
        if (alive) setSubjects(res);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : "Failed to load subjects");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!userId) return;
      try {
        const res = await getEnrollmentsByUserId(userId);
        if (!alive) return;
        setEnrolledSubjectIds(res.map((e) => e.subject_id));
      } catch {
        // Ignore enrollment fetch errors; the user can still browse courses.
      }
    })();
    return () => {
      alive = false;
    };
  }, [userId, userRole]);

  const visible = useMemo(() => subjects, [subjects]);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Explore <span className="gradient-text">Courses</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {userRole === "instructor" ? "Create and manage your courses." : "Pick a course to start learning."}
          </p>

          {userRole === "instructor" ? (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => navigate("/instructor")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                Create Course
              </button>
            </div>
          ) : null}
        </motion.div>

        {error && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-5 rounded-2xl bg-card border border-border shadow-card">
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-4 w-5/6 mb-6" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((subject, i) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.04 }}
                whileHover={{ y: -4 }}
                className="group"
              >
                <div className="block h-full rounded-2xl bg-card border border-border shadow-card hover:shadow-elevated transition-shadow duration-300">
                  <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-xl gradient-hero flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-6 w-6 text-primary-foreground/70" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-card-foreground leading-tight line-clamp-2">{subject.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {subject.description ? subject.description : "No description yet."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-sm text-muted-foreground">Pricing</span>
                      <span className="text-sm font-semibold text-primary">
                        {subject.is_paid === 1 || subject.is_paid === true ? `$${subject.price ?? 0}` : "FREE"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {userId != null && subject.instructor_id != null && Number(subject.instructor_id) === userId ? (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                          Your Course
                        </span>
                      ) : null}
                      {enrolledSubjectIds.includes(subject.id) ? (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-500">
                          Enrolled
                        </span>
                      ) : null}
                    </div>

                    <div className="pt-2 border-t border-border text-sm text-muted-foreground flex items-center justify-between">
                      {userId != null && subject.instructor_id != null && Number(subject.instructor_id) === userId ? (
                        <>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => navigate("/instructor")}
                              className="text-foreground font-medium hover:underline"
                            >
                              Manage
                            </button>
                            <Link to={`/learn/${subject.id}`} className="text-foreground font-medium hover:underline">
                              Preview
                            </Link>
                          </div>
                          <span className="text-primary font-medium">→</span>
                        </>
                      ) : enrolledSubjectIds.includes(subject.id) ? (
                        <>
                          <Link to={`/learn/${subject.id}`} className="text-foreground font-medium hover:underline">
                            Continue
                          </Link>
                          <span className="text-primary font-medium">→</span>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await enrollInSubject(subject.id);
                                setEnrolledSubjectIds((prev) => [...new Set([...prev, subject.id])]);
                                navigate(`/learn/${subject.id}`);
                              } catch {
                                // auth client will redirect on 401
                              }
                            }}
                            className="text-foreground font-medium hover:underline"
                          >
                            Enroll
                          </button>
                          <span className="text-primary font-medium">→</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && visible.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <p className="text-muted-foreground text-lg">No courses found.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
