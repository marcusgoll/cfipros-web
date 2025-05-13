"use client"

import { useEffect, useRef } from "react"
import { usePostHog } from "posthog-js/react"

interface SectionObserverProps {
  sectionId: string
  sectionName: string
  children: React.ReactNode
  threshold?: number
}

export function SectionObserver({ 
  sectionId, 
  sectionName, 
  children, 
  threshold = 0.3 
}: SectionObserverProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const observedRef = useRef(false)
  const posthog = usePostHog()

  useEffect(() => {
    if (!sectionRef.current || !posthog) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Only trigger once when the section first becomes visible
          if (entry.isIntersecting && !observedRef.current) {
            observedRef.current = true
            
            // Track the section view in PostHog
            posthog.capture("landing_section_viewed", {
              section_id: sectionId,
              section_name: sectionName
            })
            
            // Once tracked, we can disconnect the observer
            observer.disconnect()
          }
        }
      },
      { threshold }
    )

    observer.observe(sectionRef.current)

    return () => {
      observer.disconnect()
    }
  }, [sectionId, sectionName, posthog, threshold])

  return (
    <div id={sectionId} ref={sectionRef}>
      {children}
    </div>
  )
} 