import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Menu, X, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { logoutUser } from "@/api/client";
import { getUserRole } from "@/utils/auth";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Courses", to: "/courses" },
  { label: "Dashboard", to: "/dashboard" },
];

export function Header() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return !!window.localStorage.getItem("lms_access_token");
    } catch {
      return false;
    }
  });
  const [role, setRole] = useState<"learner" | "instructor" | null>(() => getUserRole());

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const syncAuthState = () => {
      try {
        setIsLoggedIn(!!window.localStorage.getItem("lms_access_token"));
        setRole(getUserRole());
      } catch {
        setIsLoggedIn(false);
        setRole(null);
      }
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    return () => window.removeEventListener("storage", syncAuthState);
  }, [location.pathname]);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 30 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass shadow-card" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">Lumina</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
                {location.pathname === link.to && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-primary"
                  />
                )}
              </Link>
            ))}
            {role === "instructor" ? (
              <Link
                to="/instructor"
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === "/instructor"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Instructor Dashboard
                {location.pathname === "/instructor" && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-primary"
                  />
                )}
              </Link>
            ) : null}
          </nav>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun className="h-4 w-4 text-muted-foreground" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
            </button>
            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  className="hidden md:inline-flex px-4 py-2 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="hidden md:inline-flex px-5 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/courses"
                  className="hidden md:inline-flex px-5 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Start Learning
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    await logoutUser();
                    window.location.href = "/login";
                  }}
                  className="hidden md:inline-flex px-4 py-2 rounded-lg bg-destructive text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Logout
                </button>
                {role === "instructor" ? (
                  <Link
                    to="/instructor"
                    className="hidden md:inline-flex px-3 py-2 rounded-lg border border-primary/40 bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/15 transition-colors"
                  >
                    Instructor Mode
                  </Link>
                ) : null}
              </>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatedMobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        pathname={location.pathname}
        isLoggedIn={isLoggedIn}
        role={role}
      />
    </motion.header>
  );
}

function AnimatedMobileMenu({
  open,
  onClose,
  pathname,
  isLoggedIn,
  role,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
  isLoggedIn: boolean;
  role: "learner" | "instructor" | null;
}) {
  if (!open) return null;
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="md:hidden glass border-t border-border"
    >
      <div className="container mx-auto px-4 py-4 space-y-1">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            onClick={onClose}
            className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              pathname === link.to ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            {link.label}
          </Link>
        ))}
        {role === "instructor" ? (
          <Link
            to="/instructor"
            onClick={onClose}
            className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              pathname === "/instructor"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            Instructor Dashboard
          </Link>
        ) : null}
        {!isLoggedIn ? (
          <>
            <Link
              to="/login"
              onClick={onClose}
              className="block px-4 py-3 rounded-xl border border-border text-sm font-semibold text-center mt-2 text-foreground hover:bg-secondary"
            >
              Login
            </Link>
            <Link
              to="/signup"
              onClick={onClose}
              className="block px-4 py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold text-center mt-2"
            >
              Get Started
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/courses"
              onClick={onClose}
              className="block px-4 py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold text-center mt-2"
            >
              Start Learning
            </Link>
            <button
              type="button"
              onClick={async () => {
                onClose();
                await logoutUser();
                window.location.href = "/login";
              }}
              className="w-full px-4 py-3 rounded-xl bg-destructive text-white text-sm font-semibold text-center mt-2 hover:opacity-90 transition-opacity"
            >
              Logout
            </button>
            {role === "instructor" ? (
              <Link
                to="/instructor"
                onClick={onClose}
                className="block px-4 py-3 rounded-xl border border-primary/40 bg-primary/10 text-primary text-sm font-semibold text-center mt-2"
              >
                Instructor Mode
              </Link>
            ) : null}
          </>
        )}
      </div>
    </motion.div>
  );
}
