"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Global keyboard shortcuts component
 * Handles common keyboard shortcuts across the application
 */
export default function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target as HTMLElement)?.contentEditable === "true"
      ) {
        return;
      }

      // Cmd/Ctrl + K - Focus search (handled by SearchBar component)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        // SearchBar component handles this
        return;
      }

      // Cmd/Ctrl + / - Show keyboard shortcuts help
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        // Could show a help modal here
        console.log("Keyboard shortcuts help");
        return;
      }

      // Navigation shortcuts
      if (e.altKey) {
        switch (e.key) {
          case "h":
            e.preventDefault();
            router.push("/dashboard");
            break;
          case "u":
            e.preventDefault();
            router.push("/user");
            break;
          case "d":
            e.preventDefault();
            router.push("/driver");
            break;
          case "v":
            e.preventDefault();
            router.push("/vendor");
            break;
          case "o":
            e.preventDefault();
            router.push("/order");
            break;
          case "p":
            e.preventDefault();
            router.push("/profile");
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return null; // This component doesn't render anything
}