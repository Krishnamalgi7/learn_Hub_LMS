import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CourseProgress {
  courseId: string;
  completedLessons: string[];
  lastWatchedLessonId: string;
  progressPercent: number;
}

interface CourseStore {
  currentVideoId: string;
  currentLessonId: string;
  currentCourseId: string;
  enrolledCourses: string[];
  courseProgress: Record<string, CourseProgress>;

  setCurrentVideo: (videoId: string, lessonId: string) => void;
  setCurrentCourse: (courseId: string) => void;
  enrollInCourse: (courseId: string, totalLessons: number) => void;
  completeLesson: (courseId: string, lessonId: string, totalLessons: number) => void;
  isLessonCompleted: (courseId: string, lessonId: string) => boolean;
  getCourseProgress: (courseId: string) => number;
}

export const useCourseStore = create<CourseStore>()(
  persist(
    (set, get) => ({
      currentVideoId: "",
      currentLessonId: "",
      currentCourseId: "",
      enrolledCourses: ["1"],
      courseProgress: {
        "1": {
          courseId: "1",
          completedLessons: ["l1", "l2"],
          lastWatchedLessonId: "l3",
          progressPercent: 20,
        },
      },

      setCurrentVideo: (videoId, lessonId) =>
        set({ currentVideoId: videoId, currentLessonId: lessonId }),

      setCurrentCourse: (courseId) => set({ currentCourseId: courseId }),

      enrollInCourse: (courseId, totalLessons) =>
        set((state) => ({
          enrolledCourses: [...new Set([...state.enrolledCourses, courseId])],
          courseProgress: {
            ...state.courseProgress,
            [courseId]: state.courseProgress[courseId] || {
              courseId,
              completedLessons: [],
              lastWatchedLessonId: "",
              progressPercent: 0,
            },
          },
        })),

      completeLesson: (courseId, lessonId, totalLessons) =>
        set((state) => {
          const progress = state.courseProgress[courseId] || {
            courseId,
            completedLessons: [],
            lastWatchedLessonId: "",
            progressPercent: 0,
          };
          const completed = [...new Set([...progress.completedLessons, lessonId])];
          return {
            courseProgress: {
              ...state.courseProgress,
              [courseId]: {
                ...progress,
                completedLessons: completed,
                lastWatchedLessonId: lessonId,
                progressPercent: Math.round((completed.length / totalLessons) * 100),
              },
            },
          };
        }),

      isLessonCompleted: (courseId, lessonId) => {
        const progress = get().courseProgress[courseId];
        return progress?.completedLessons.includes(lessonId) || false;
      },

      getCourseProgress: (courseId) => {
        const progress = get().courseProgress[courseId];
        return progress?.progressPercent || 0;
      },
    }),
    { name: "lms-course-store" }
  )
);
