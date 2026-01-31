"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Prevent hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-lg backdrop-blur-sm bg-white/10 dark:bg-gray-800/10 border border-gray-200/20 dark:border-gray-700/20 hover:bg-white/20 dark:hover:bg-gray-800/20 transition-all duration-200"
        disabled
      >
        <Sun className="h-5 w-5" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-lg backdrop-blur-sm bg-white/10 dark:bg-gray-800/10 border border-gray-200/20 dark:border-gray-700/20 hover:bg-white/20 dark:hover:bg-gray-800/20 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Toggle theme"
        >
          {theme === "light" && (
            <Sun className="h-5 w-5 text-gray-700 dark:text-gray-200 transition-all" />
          )}
          {theme === "dark" && (
            <Moon className="h-5 w-5 text-gray-700 dark:text-gray-200 transition-all" />
          )}
          {theme === "system" && (
            <Monitor className="h-5 w-5 text-gray-700 dark:text-gray-200 transition-all" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[160px] backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={`flex items-center gap-2 cursor-pointer ${
            theme === "light"
              ? "bg-primary/10 text-primary font-medium"
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <Sun className="h-4 w-4" />
          <span>Light</span>
          {theme === "light" && (
            <span className="ml-auto text-xs text-primary">Active</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={`flex items-center gap-2 cursor-pointer ${
            theme === "dark"
              ? "bg-primary/10 text-primary font-medium"
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <Moon className="h-4 w-4" />
          <span>Dark</span>
          {theme === "dark" && (
            <span className="ml-auto text-xs text-primary">Active</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={`flex items-center gap-2 cursor-pointer ${
            theme === "system"
              ? "bg-primary/10 text-primary font-medium"
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <Monitor className="h-4 w-4" />
          <span>System</span>
          {theme === "system" && (
            <span className="ml-auto text-xs text-primary">Active</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Alternative simpler toggle button version (toggle between light/dark only)
export function ThemeToggleSimple() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-lg backdrop-blur-sm bg-white/10 dark:bg-gray-800/10 border border-gray-200/20 dark:border-gray-700/20"
        disabled
      >
        <Sun className="h-5 w-5" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light")
    } else if (theme === "light") {
      setTheme("dark")
    } else {
      // If system, toggle to light
      setTheme("light")
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-10 w-10 rounded-lg backdrop-blur-sm bg-white/10 dark:bg-gray-800/10 border border-gray-200/20 dark:border-gray-700/20 hover:bg-white/20 dark:hover:bg-gray-800/20 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
