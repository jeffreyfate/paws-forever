// components/Header.tsx
"use client" // ← make client component for theme hook

import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react" // icons from lucide-react
import { useEffect, useState } from "react"

export function Header() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null // or a placeholder

  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-semibold">
          Paws Forever
        </Link>

        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-6">
            <Link href="/gallery" className="text-muted-foreground hover:text-foreground">Gallery</Link>
            <Link href="/videos" className="text-muted-foreground hover:text-foreground">Videos</Link>
            <Link href="/memories" className="text-muted-foreground hover:text-foreground">Memories</Link>
          </nav>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}