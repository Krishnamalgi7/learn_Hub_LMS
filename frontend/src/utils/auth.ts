export const getUserRole = (): "learner" | "instructor" | null => {
  if (typeof window === "undefined") return null;
  const role = window.localStorage.getItem("lms_user_role");
  if (role === "learner" || role === "instructor") return role;
  return null;
};

