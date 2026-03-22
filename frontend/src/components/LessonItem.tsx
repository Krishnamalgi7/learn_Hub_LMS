import { motion } from "framer-motion";
import { Play, Lock, CheckCircle2 } from "lucide-react";
import type { Lesson } from "@/data/mockData";

interface LessonItemProps {
  lesson: Lesson;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

export function LessonItem({ lesson, isActive, isCompleted, onClick }: LessonItemProps) {
  return (
    <motion.button
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={lesson.isLocked}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
        isActive
          ? "bg-primary/10 border border-primary/20 text-foreground"
          : lesson.isLocked
          ? "opacity-50 cursor-not-allowed text-muted-foreground"
          : "hover:bg-secondary text-foreground"
      }`}
    >
      <div className="flex-shrink-0">
        {lesson.isLocked ? (
          <Lock className="h-4 w-4 text-muted-foreground" />
        ) : isCompleted ? (
          <CheckCircle2 className="h-4 w-4 text-emerald" />
        ) : isActive ? (
          <div className="h-4 w-4 rounded-full gradient-primary animate-pulse-glow" />
        ) : (
          <Play className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? "text-primary" : ""}`}>
          {lesson.title}
        </p>
      </div>
      <span className="text-xs text-muted-foreground flex-shrink-0">{lesson.duration}</span>
    </motion.button>
  );
}
