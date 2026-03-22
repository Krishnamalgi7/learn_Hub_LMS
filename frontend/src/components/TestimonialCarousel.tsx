import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { testimonials } from "@/data/mockData";

export function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative max-w-3xl mx-auto">
      <div className="overflow-hidden rounded-2xl glass p-8 md:p-12">
        <Quote className="h-10 w-10 text-primary/30 mb-6" />
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-lg md:text-xl text-foreground leading-relaxed mb-6">
              "{testimonials[current].content}"
            </p>
            <div>
              <p className="font-display font-semibold text-foreground">{testimonials[current].name}</p>
              <p className="text-sm text-muted-foreground">{testimonials[current].role}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={() => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)}
          className="p-2 rounded-full bg-secondary hover:bg-primary/10 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => setCurrent((c) => (c + 1) % testimonials.length)}
          className="p-2 rounded-full bg-secondary hover:bg-primary/10 transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
