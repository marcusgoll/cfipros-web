"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "../features/landing/ThemeToggle"
import { usePostHog } from "posthog-js/react"

export function TopBar() {
  const posthog = usePostHog()

  const trackNavClick = (item: string) => {
    posthog?.capture("landing_nav_clicked", {
      item
    })
  }

  return (
    <header className="border-b border-border sticky top-0 z-50 bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="relative h-8 w-8">
            <div className="absolute inset-0 flex items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
              CP
            </div>
          </div>
          <span className="text-lg font-bold">CFIPros</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href="#why" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => trackNavClick("why")}
          >
            Why
          </Link>
          <Link 
            href="#products" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => trackNavClick("products")}
          >
            Products
          </Link>
          <Link 
            href="#pricing" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => trackNavClick("pricing")}
          >
            Pricing
          </Link>
          <Link 
            href="#docs" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => trackNavClick("docs")}
          >
            Docs
          </Link>
          <Link 
            href="#community" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => trackNavClick("community")}
          >
            Community
          </Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link 
            href="/dashboard"
            onClick={() => trackNavClick("dashboard")}
          >
            <Button 
              variant="outline"
              className="hidden md:inline-flex"
            >
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
} 