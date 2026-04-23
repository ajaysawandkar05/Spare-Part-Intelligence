import React, { useEffect, useState } from "react";

export default function ThemeToggle() {
  const getInitialTheme = () => {
    // 1. Check localStorage first
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";

    // 2. Fallback to system preference
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  const [dark, setDark] = useState(getInitialTheme);

  useEffect(() => {
    const theme = dark ? "dark" : "light";

    // Apply theme to root
    document.documentElement.setAttribute("data-theme", theme);

    // Save preference
    localStorage.setItem("theme", theme);

    // Optional: cleaner than inline styles if you use CSS variables
    document.body.style.background = dark ? "#0d0d0d" : "#fff";
    document.body.style.color = dark ? "#f0ece3" : "#222";
  }, [dark]);

  return (
    <button
      className="theme-toggle"
      aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
      aria-pressed={dark}
      onClick={() => setDark((d) => !d)}
      title={`Switch to ${dark ? "light" : "dark"} mode`}
    >
      <span aria-hidden="true">{dark ? "🌙" : "☀️"}</span>
    </button>
  );
}