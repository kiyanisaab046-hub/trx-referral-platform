"use client";

import { useEffect } from "react";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Enable browser-native smooth scrolling
    try {
      document.documentElement.style.scrollBehavior = "smooth";
    } catch (e) {}
    return () => {
      try {
        document.documentElement.style.scrollBehavior = "";
      } catch (e) {}
    };
  }, []);

  return <>{children}</>;
}
