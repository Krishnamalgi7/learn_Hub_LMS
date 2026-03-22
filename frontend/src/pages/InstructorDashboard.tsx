import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Plus, Video, LayoutList, PlusCircle, ShieldCheck } from "lucide-react";
import {
  createInstructorCourse,
  createInstructorSection,
  createInstructorVideo,
  deleteInstructorCourse,
  deleteInstructorSection,
  deleteInstructorVideo,
  getInstructorCourses,
  getSubjectTree,
  updateInstructorCourse,
  updateInstructorSection,
  updateInstructorVideo,
  type InstructorCourse,
} from "@/api/lms";
import { getUserRole } from "@/utils/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SectionOption = {
  sectionId: number;
  title: string;
  orderIndex: number;
  videos: Array<{
    id: number;
    title: string;
    youtube_id: string;
    order_index: number;
  }>;
};

export default function InstructorDashboard() {
  const navigate = useNavigate();

  const userRole = getUserRole();
  const isInstructor = userRole === "instructor";

  useEffect(() => {
    if (getUserRole() !== "instructor") {
      window.location.href = "/courses";
    }
  }, []);

  const SELECTED_COURSE_KEY = "lms_instructor_selected_course_id";
  const initialSelectedCourseId = useMemo(() => {
    try {
      const raw = window.localStorage.getItem(SELECTED_COURSE_KEY);
      if (!raw) return null;
      const id = Number(raw);
      return Number.isFinite(id) ? id : null;
    } catch {
      return null;
    }
  }, []);

  const [myCourses, setMyCourses] = useState<InstructorCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(initialSelectedCourseId);
  const [selectedCourseTitle, setSelectedCourseTitle] = useState("");
  const [selectedCourseDescription, setSelectedCourseDescription] = useState("");
  const [selectedCourseIsPaid, setSelectedCourseIsPaid] = useState(false);
  const [selectedCoursePrice, setSelectedCoursePrice] = useState(0);
  const [savingCourse, setSavingCourse] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState(false);

  const [sections, setSections] = useState<SectionOption[]>([]);
  const [videoSectionId, setVideoSectionId] = useState<number | null>(null);
  const [sectionsLoading, setSectionsLoading] = useState(false);

  const [creatingCourse, setCreatingCourse] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [courseError, setCourseError] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState<number>(0);

  const [addingSection, setAddingSection] = useState(false);
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionOrderIndex, setSectionOrderIndex] = useState<number>(0);

  const [addingVideo, setAddingVideo] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [youtubeId, setYoutubeId] = useState("");
  const [videoOrderIndex, setVideoOrderIndex] = useState<number>(0);
  const [updatingSectionId, setUpdatingSectionId] = useState<number | null>(null);
  const [deletingSectionId, setDeletingSectionId] = useState<number | null>(null);
  const [updatingVideoId, setUpdatingVideoId] = useState<number | null>(null);
  const [deletingVideoId, setDeletingVideoId] = useState<number | null>(null);

  const refreshCourses = async () => {
    if (!isInstructor) return;
    setLoadingCourses(true);
    setCoursesError(null);
    try {
      const courses = await getInstructorCourses();
      setMyCourses(courses);
      if (!selectedCourseId && courses.length) {
        setSelectedCourseId(courses[0].id);
      } else if (selectedCourseId && !courses.some((c) => c.id === selectedCourseId) && courses.length) {
        setSelectedCourseId(courses[0].id);
      } else if (selectedCourseId && courses.length === 0) {
        setSelectedCourseId(null);
      }
    } catch (e) {
      setCoursesError(e instanceof Error ? e.message : "Failed to load your courses");
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    void refreshCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInstructor]);

  useEffect(() => {
    try {
      if (selectedCourseId == null) window.localStorage.removeItem(SELECTED_COURSE_KEY);
      else window.localStorage.setItem(SELECTED_COURSE_KEY, String(selectedCourseId));
    } catch {
      // ignore storage errors
    }
  }, [selectedCourseId]);

  const refreshSections = async (courseId: number) => {
    setSectionsLoading(true);
    try {
      const tree = await getSubjectTree(courseId);
      setSections(
        tree.sections.map((s) => ({
          sectionId: s.id,
          title: s.title,
          orderIndex: s.order_index,
          videos: s.videos.map((v) => ({
            id: v.id,
            title: v.title,
            youtube_id: v.youtube_id,
            order_index: v.order_index,
          })),
        })),
      );
    } finally {
      setSectionsLoading(false);
    }
  };

  useEffect(() => {
    if (!isInstructor || !selectedCourseId) {
      setSections([]);
      setVideoSectionId(null);
      return;
    }

    refreshSections(selectedCourseId).catch(() => {
      setSections([]);
      setVideoSectionId(null);
    });
  }, [isInstructor, selectedCourseId]);

  useEffect(() => {
    const selected = myCourses.find((c) => c.id === selectedCourseId);
    if (!selected) {
      setSelectedCourseTitle("");
      setSelectedCourseDescription("");
      setSelectedCourseIsPaid(false);
      setSelectedCoursePrice(0);
      return;
    }
    setSelectedCourseTitle(selected.title);
    setSelectedCourseDescription(selected.description ?? "");
    setSelectedCourseIsPaid(selected.is_paid === 1 || (selected.is_paid as unknown as boolean) === true);
    setSelectedCoursePrice(Number(selected.price ?? 0));
  }, [myCourses, selectedCourseId]);

  useEffect(() => {
    if (!sections.length) {
      setVideoSectionId(null);
      return;
    }
    // Keep current selection if it's still valid; otherwise default to first section.
    setVideoSectionId((prev) => (prev != null && sections.some((s) => s.sectionId === prev) ? prev : sections[0].sectionId));
  }, [sections]);

  const resetCreateForm = () => {
    setCourseTitle("");
    setCourseDescription("");
    setIsPaid(false);
    setPrice(0);
  };

  const createCourse = async () => {
    setCourseError(null);
    setCreatingCourse(true);
    try {
      const res = await createInstructorCourse({
        title: courseTitle,
        description: courseDescription,
        is_paid: isPaid,
        price: isPaid ? price : 0,
      });
      setSelectedCourseId(res.subjectId);
      await refreshCourses();
      resetCreateForm();
      setShowCreateModal(false);
    } catch (e) {
      setCourseError(e instanceof Error ? e.message : "Failed to create course");
    } finally {
      setCreatingCourse(false);
    }
  };

  const addSection = async () => {
    if (!selectedCourseId) return;
    setAddingSection(true);
    try {
      await createInstructorSection({
        subject_id: selectedCourseId,
        title: sectionTitle,
        order_index: sectionOrderIndex,
      });

      // Reset just title; then re-fetch sections to include existing ones + new ordering.
      setSectionTitle("");
      await refreshSections(selectedCourseId);
    } catch (e) {
      setCourseError(e instanceof Error ? e.message : "Failed to add section");
    } finally {
      setAddingSection(false);
    }
  };

  const saveCourseEdits = async () => {
    if (!selectedCourseId) return;
    setSavingCourse(true);
    setCourseError(null);
    try {
      await updateInstructorCourse(selectedCourseId, {
        title: selectedCourseTitle,
        description: selectedCourseDescription,
        price: selectedCourseIsPaid ? selectedCoursePrice : 0,
        is_paid: selectedCourseIsPaid,
      });
      await refreshCourses();
    } catch (e) {
      setCourseError(e instanceof Error ? e.message : "Failed to update course");
    } finally {
      setSavingCourse(false);
    }
  };

  const removeCourse = async () => {
    if (!selectedCourseId) return;
    if (!window.confirm("Delete this course and all related sections/videos?")) return;
    setDeletingCourse(true);
    setCourseError(null);
    try {
      await deleteInstructorCourse(selectedCourseId);
      setSelectedCourseId(null);
      setSections([]);
      setVideoSectionId(null);
      await refreshCourses();
    } catch (e) {
      setCourseError(e instanceof Error ? e.message : "Failed to delete course");
    } finally {
      setDeletingCourse(false);
    }
  };

  const editSection = async (section: SectionOption) => {
    const newTitle = window.prompt("Section title", section.title);
    if (!newTitle) return;
    const newOrderRaw = window.prompt("order_index", String(section.orderIndex));
    if (newOrderRaw == null) return;
    const newOrder = Number(newOrderRaw);
    if (!Number.isFinite(newOrder)) return;

    setUpdatingSectionId(section.sectionId);
    setCourseError(null);
    try {
      await updateInstructorSection(section.sectionId, { title: newTitle, order_index: newOrder });
      if (selectedCourseId) await refreshSections(selectedCourseId);
    } catch (e) {
      setCourseError(e instanceof Error ? e.message : "Failed to update section");
    } finally {
      setUpdatingSectionId(null);
    }
  };

  const removeSection = async (sectionId: number) => {
    if (!window.confirm("Delete this section and all videos inside it?")) return;
    setDeletingSectionId(sectionId);
    setCourseError(null);
    try {
      await deleteInstructorSection(sectionId);
      if (selectedCourseId) await refreshSections(selectedCourseId);
    } catch (e) {
      setCourseError(e instanceof Error ? e.message : "Failed to delete section");
    } finally {
      setDeletingSectionId(null);
    }
  };

  const editVideo = async (video: SectionOption["videos"][number]) => {
    const newTitle = window.prompt("Video title", video.title);
    if (!newTitle) return;
    const newYoutube = window.prompt("youtube_id", video.youtube_id);
    if (!newYoutube) return;
    const newOrderRaw = window.prompt("order_index", String(video.order_index));
    if (newOrderRaw == null) return;
    const newOrder = Number(newOrderRaw);
    if (!Number.isFinite(newOrder)) return;

    setUpdatingVideoId(video.id);
    setCourseError(null);
    try {
      await updateInstructorVideo(video.id, {
        title: newTitle,
        youtube_id: newYoutube,
        order_index: newOrder,
      });
      if (selectedCourseId) await refreshSections(selectedCourseId);
    } catch (e) {
      setCourseError(e instanceof Error ? e.message : "Failed to update video");
    } finally {
      setUpdatingVideoId(null);
    }
  };

  const removeVideo = async (videoId: number) => {
    if (!window.confirm("Delete this video?")) return;
    setDeletingVideoId(videoId);
    setCourseError(null);
    try {
      await deleteInstructorVideo(videoId);
      if (selectedCourseId) await refreshSections(selectedCourseId);
    } catch (e) {
      setCourseError(e instanceof Error ? e.message : "Failed to delete video");
    } finally {
      setDeletingVideoId(null);
    }
  };

  const addVideo = async () => {
    if (!videoSectionId) return;
    setAddingVideo(true);
    try {
      await createInstructorVideo({
        section_id: videoSectionId,
        title: videoTitle,
        youtube_id: youtubeId,
        order_index: videoOrderIndex,
      });
      setVideoTitle("");
      setYoutubeId("");
      setVideoOrderIndex((v) => v + 1);
    } catch (e) {
      setCourseError(e instanceof Error ? e.message : "Failed to add video");
    } finally {
      setAddingVideo(false);
    }
  };

  const selectedSection = sections.find((s) => s.sectionId === videoSectionId) ?? null;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6"
        >
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">
              Instructor <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-muted-foreground text-lg">Create courses, sections, and videos.</p>
          </div>
          {isInstructor ? (
            <button
              type="button"
              onClick={() => {
                setCourseError(null);
                setShowCreateModal(true);
              }}
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl px-5 py-2.5 text-sm font-semibold gradient-primary text-primary-foreground shadow-card transition-opacity hover:opacity-90 md:mt-1"
            >
              <Plus className="h-5 w-5" aria-hidden />
              Create Course
            </button>
          ) : null}
        </motion.div>

        {!isInstructor ? (
          <div className="rounded-2xl bg-destructive/5 border border-destructive/30 p-5">
            <p className="text-destructive font-semibold mb-2">Instructor access only</p>
            <p className="text-sm text-muted-foreground">
              You are signed in as a learner. Please log in with an instructor account to manage content.
            </p>
            <button
              type="button"
              onClick={() => navigate("/courses")}
              className="mt-4 inline-flex px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              Back to Courses
            </button>
          </div>
        ) : null}

        {courseError && !showCreateModal ? (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-destructive">
            {courseError}
          </div>
        ) : null}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-8">
            {/* My Courses + Edit selected */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="p-6 rounded-2xl bg-card border border-border shadow-card"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl gradient-hero flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold">My Courses</h2>
                  <p className="text-sm text-muted-foreground">Select a course to manage sections and videos.</p>
                </div>
              </div>

              {coursesError ? (
                <div className="text-sm text-destructive">{coursesError}</div>
              ) : loadingCourses ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
              ) : myCourses.length === 0 ? (
                <div className="text-sm text-muted-foreground">You haven’t created any courses yet.</div>
              ) : (
                <div className="space-y-3">
                  {myCourses.map((c) => (
                    <div
                      key={c.id}
                      className={`flex items-center justify-between gap-3 p-4 rounded-xl border ${
                        selectedCourseId === c.id ? "border-primary/40 bg-primary/5" : "border-border bg-background"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{c.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.is_paid === 1 || c.is_paid === true ? `$${c.price ?? 0}` : "FREE"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedCourseId(c.id)}
                        className={`shrink-0 px-4 py-2 rounded-xl border transition-opacity ${
                          selectedCourseId === c.id
                            ? "gradient-primary text-primary-foreground border-border"
                            : "bg-background text-foreground hover:bg-secondary"
                        }`}
                      >
                        Manage
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {selectedCourseId ? (
                <div className="mt-5 pt-5 border-t border-border space-y-3">
                  <p className="text-sm font-semibold">Edit Selected Course</p>
                  <input
                    value={selectedCourseTitle}
                    onChange={(e) => setSelectedCourseTitle(e.target.value)}
                    placeholder="Course title"
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <textarea
                    value={selectedCourseDescription}
                    onChange={(e) => setSelectedCourseDescription(e.target.value)}
                    placeholder="Course description"
                    className="w-full min-h-[90px] px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedCourseIsPaid(false)}
                      className={`py-2.5 rounded-xl border ${
                        !selectedCourseIsPaid
                          ? "gradient-primary text-primary-foreground border-border"
                          : "bg-background text-foreground hover:bg-secondary"
                      }`}
                    >
                      FREE
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCourseIsPaid(true)}
                      className={`py-2.5 rounded-xl border ${
                        selectedCourseIsPaid
                          ? "gradient-primary text-primary-foreground border-border"
                          : "bg-background text-foreground hover:bg-secondary"
                      }`}
                    >
                      PAID
                    </button>
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={selectedCoursePrice}
                    onChange={(e) => setSelectedCoursePrice(Number(e.target.value))}
                    disabled={!selectedCourseIsPaid}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={savingCourse || !selectedCourseTitle.trim()}
                      onClick={saveCourseEdits}
                      className="py-2.5 rounded-xl gradient-primary text-primary-foreground font-semibold disabled:opacity-50"
                    >
                      {savingCourse ? "Saving..." : "Save Course"}
                    </button>
                    <button
                      type="button"
                      disabled={deletingCourse}
                      onClick={removeCourse}
                      className="py-2.5 rounded-xl bg-destructive text-white font-semibold disabled:opacity-50"
                    >
                      {deletingCourse ? "Deleting..." : "Delete Course"}
                    </button>
                  </div>
                </div>
              ) : null}
            </motion.div>

            {/* Add Sections */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.04 }}
              className="p-6 rounded-2xl bg-card border border-border shadow-card"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl gradient-hero flex items-center justify-center">
                  <LayoutList className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold">Add Sections</h2>
                  <p className="text-sm text-muted-foreground">Create ordered sections for the course.</p>
                </div>
              </div>

              {!selectedCourseId ? (
                <p className="text-sm text-muted-foreground">Select a course from "My Courses" first.</p>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Section Title</label>
                    <input
                      value={sectionTitle}
                      onChange={(e) => setSectionTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="e.g. Getting Started"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">order_index</label>
                    <input
                      type="number"
                      value={sectionOrderIndex}
                      onChange={(e) => setSectionOrderIndex(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={addingSection || !sectionTitle.trim()}
                    onClick={addSection}
                    className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {addingSection ? "Adding..." : "Add Section"}
                  </button>

                  <div className="pt-3 border-t border-border space-y-2">
                    <p className="text-sm font-semibold">Sections</p>
                    {sectionsLoading ? (
                      <p className="text-sm text-muted-foreground">Loading sections...</p>
                    ) : sections.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No sections yet.</p>
                    ) : (
                      sections.map((section) => (
                        <div key={section.sectionId} className="rounded-xl border border-border p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-medium">{section.title}</p>
                              <p className="text-xs text-muted-foreground">order_index: {section.orderIndex}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setVideoSectionId(section.sectionId)}
                                className={`px-3 py-1.5 rounded-lg border text-sm ${
                                  videoSectionId === section.sectionId
                                    ? "gradient-primary text-primary-foreground border-border"
                                    : "bg-background hover:bg-secondary"
                                }`}
                              >
                                Select
                              </button>
                              <button
                                type="button"
                                disabled={updatingSectionId === section.sectionId}
                                onClick={() => editSection(section)}
                                className="px-3 py-1.5 rounded-lg border text-sm hover:bg-secondary disabled:opacity-50"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                disabled={deletingSectionId === section.sectionId}
                                onClick={() => removeSection(section.sectionId)}
                                className="px-3 py-1.5 rounded-lg bg-destructive text-white text-sm disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="p-6 rounded-2xl bg-card border border-border shadow-card"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl gradient-hero flex items-center justify-center">
                  <Video className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold">Add Videos</h2>
                  <p className="text-sm text-muted-foreground">Provide a YouTube ID and ordering.</p>
                </div>
              </div>

              {!selectedCourseId ? (
                <p className="text-sm text-muted-foreground">Select a course first.</p>
              ) : sectionsLoading ? (
                <p className="text-sm text-muted-foreground">Loading sections...</p>
              ) : sections.length === 0 ? (
                <p className="text-sm text-muted-foreground">This course has no sections yet. Add one first.</p>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">section</label>
                    <select
                      value={videoSectionId ?? ""}
                      onChange={(e) => setVideoSectionId(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {sections.map((s) => (
                        <option key={s.sectionId} value={s.sectionId}>
                          #{s.orderIndex} - {s.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Video Title</label>
                    <input
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="e.g. Hooks Overview"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">youtube_id</label>
                    <input
                      value={youtubeId}
                      onChange={(e) => setYoutubeId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="e.g. dQw4w9WgXcQ"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">order_index</label>
                    <input
                      type="number"
                      value={videoOrderIndex}
                      onChange={(e) => setVideoOrderIndex(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={addingVideo || !videoTitle.trim() || !youtubeId.trim() || !videoSectionId}
                    onClick={addVideo}
                    className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {addingVideo ? "Adding..." : "Add Video"}
                  </button>

                  <div className="pt-3 border-t border-border space-y-2">
                    <p className="text-sm font-semibold">Videos in selected section</p>
                    {!selectedSection || selectedSection.videos.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No videos yet.</p>
                    ) : (
                      selectedSection.videos.map((video) => (
                        <div key={video.id} className="rounded-xl border border-border p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-medium truncate">{video.title}</p>
                              <p className="text-xs text-muted-foreground">
                                #{video.order_index} - {video.youtube_id}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                disabled={updatingVideoId === video.id}
                                onClick={() => editVideo(video)}
                                className="px-3 py-1.5 rounded-lg border text-sm hover:bg-secondary disabled:opacity-50"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                disabled={deletingVideoId === video.id}
                                onClick={() => removeVideo(video.id)}
                                className="px-3 py-1.5 rounded-lg bg-destructive text-white text-sm disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </motion.div>

            <div className="p-6 rounded-2xl bg-card border border-border shadow-card text-sm text-muted-foreground">
              <p className="font-semibold text-foreground mb-2 inline-flex items-center gap-2">
                <PlusCircle className="h-4 w-4 text-primary" /> Tip
              </p>
              <p>
                For PAID courses, set a price. For FREE courses, pricing will be stored as <span className="text-foreground font-semibold">$0</span>.
              </p>
            </div>
          </div>
        </div>

        <Dialog
          open={showCreateModal}
          onOpenChange={(open) => {
            setShowCreateModal(open);
            if (!open) {
              resetCreateForm();
              setCourseError(null);
            }
          }}
        >
          <DialogContent className="max-w-lg rounded-2xl border-border sm:rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Create a new course</DialogTitle>
              <DialogDescription>Set the course title, description, and whether it&apos;s free or paid.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {courseError ? (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{courseError}</div>
              ) : null}

              <div className="space-y-2">
                <label htmlFor="create-course-title" className="text-sm text-muted-foreground">
                  Title
                </label>
                <input
                  id="create-course-title"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g. React for Beginners"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="create-course-desc" className="text-sm text-muted-foreground">
                  Description
                </label>
                <textarea
                  id="create-course-desc"
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  className="min-h-[100px] w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Course overview..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsPaid(false)}
                  className={`rounded-xl border py-3.5 transition-opacity ${
                    !isPaid ? "gradient-primary border-border text-primary-foreground" : "bg-background text-foreground hover:bg-secondary"
                  }`}
                >
                  FREE
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaid(true)}
                  className={`rounded-xl border py-3.5 transition-opacity ${
                    isPaid ? "gradient-primary border-border text-primary-foreground" : "bg-background text-foreground hover:bg-secondary"
                  }`}
                >
                  PAID
                </button>
              </div>

              <div className="space-y-2">
                <label htmlFor="create-course-price" className="text-sm text-muted-foreground">
                  Price (USD)
                </label>
                <input
                  id="create-course-price"
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  disabled={!isPaid}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-semibold hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={creatingCourse || !courseTitle.trim()}
                onClick={() => void createCourse()}
                className="inline-flex h-10 items-center justify-center rounded-xl gradient-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {creatingCourse ? "Creating..." : "Create Course"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

