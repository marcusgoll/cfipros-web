"use client"

import { usePostHog } from "posthog-js/react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const roadmapItems = {
  underConsideration: [
    {
      id: "product-tours",
      title: "Product tours"
    },
    {
      id: "analytics",
      title: "End-user facing analytics (B2B2B/B2B2C)"
    },
    {
      id: "cookie-banner",
      title: "Cookie banner product"
    },
    {
      id: "surveys-emails",
      title: "Surveys in emails"
    },
    {
      id: "customer-support",
      title: "Customer support product"
    },
    {
      id: "gtm-alternative",
      title: "Alternative to Google Tag Manager"
    },
    {
      id: "product-roadmaps",
      title: "Product roadmaps"
    }
  ],
  inProgress: [
    {
      id: "messaging",
      title: "Messaging"
    },
    {
      id: "ab-testing",
      title: "No-code A/B testing"
    },
    {
      id: "error-tracking",
      title: "Error tracking"
    },
    {
      id: "crm",
      title: "CRM"
    },
    {
      id: "webhook-destination",
      title: "Webhook destination"
    },
    {
      id: "revenue-analytics",
      title: "Revenue Analytics"
    },
    {
      id: "surveys-mobile",
      title: "Surveys for Mobile"
    }
  ]
}

export function RoadmapSection() {
  const posthog = usePostHog()

  const trackRoadmapInteraction = (itemId: string, status: string) => {
    posthog?.capture("landing_roadmap_item_clicked", {
      item_id: itemId,
      status
    })
  }

  const trackExploreRoadmap = () => {
    posthog?.capture("landing_explore_roadmap_clicked")
  }
  
  return (
    <section id="roadmap" className="py-20 border-b border-border bg-card">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-2">
              The future of CFIPros <span className="text-highlight block">depends on you</span>
            </h2>
            <p className="text-xl text-muted-foreground mt-4 mb-6">
              We publish our product roadmap. Tell us what we should build next – and get early access.
            </p>
            <Link href="/roadmap" onClick={trackExploreRoadmap}>
              <Button 
                variant="outline" 
                className="border-highlight text-highlight hover:bg-highlight/10"
              >
                Explore our roadmap
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-border rounded-lg overflow-hidden">
            {/* Header Row */}
            <div className="bg-muted/20 p-4 border-b border-r border-border">
              <h3 className="font-medium">Under consideration</h3>
            </div>
            <div className="bg-muted/20 p-4 border-b border-border">
              <h3 className="font-medium">In progress</h3>
            </div>
            
            {/* Content */}
            <div className="border-r border-border">
              <ul className="list-none p-0 m-0">
                {roadmapItems.underConsideration.map((item) => (
                  <li key={item.id} className="border-b border-border">
                    <button
                      type="button"
                      className="p-4 w-full text-left hover:bg-muted/5 transition-colors focus:outline-none focus:bg-muted/10"
                      onClick={() => trackRoadmapInteraction(item.id, "under-consideration")}
                      aria-label={`Roadmap item: ${item.title} (under consideration)`}
                    >
                      {item.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <ul className="list-none p-0 m-0">
                {roadmapItems.inProgress.map((item) => (
                  <li key={item.id} className="border-b border-border">
                    <button
                      type="button"
                      className="p-4 w-full text-left hover:bg-muted/5 transition-colors focus:outline-none focus:bg-muted/10"
                      onClick={() => trackRoadmapInteraction(item.id, "in-progress")}
                      aria-label={`Roadmap item: ${item.title} (in progress)`}
                    >
                      {item.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 