"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
import { Toggle } from "../../components/ui/toggle";

export function ToggleThemeButton() {
  const { theme, setTheme } = useTheme();

  const isDarkMode = theme === "dark";

  return (
    <Toggle
      aria-label="Toggle theme"
      pressed={isDarkMode}
      onClick={() => setTheme(isDarkMode ? "light" : "dark")}
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5 text-white" />
      ) : (
        <Moon className="h-5 w-5 text-black" />
      )}
    </Toggle>
  );
}
