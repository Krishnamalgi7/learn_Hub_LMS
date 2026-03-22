import { motion } from "framer-motion";

export function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`relative h-2 w-full rounded-full bg-secondary overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full gradient-primary"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      <div className="absolute inset-0 overflow-hidden rounded-full">
        <div className="h-full w-full animate-shimmer bg-gradient-to-r from-transparent via-primary-foreground/10 to-transparent" />
      </div>
    </div>
  );
}
