"use client"

import { usePostHog } from "posthog-js/react"
import { FileX, TrendingUp, DollarSign } from "lucide-react"

const valueCards = [
  {
    id: "replace-paperwork",
    title: "Replace Paperwork",
    description: "Eliminate manual paperwork and tedious record-keeping with digital solutions that save time and reduce errors.",
    icon: <FileX className="h-12 w-12 text-highlight" />,
    color: "from-highlight/20 to-highlight/5"
  },
  {
    id: "boost-pass-rates",
    title: "Boost Pass Rates",
    description: "Improve student outcomes with data-driven insights that identify knowledge gaps and focus training where it's needed most.",
    icon: <TrendingUp className="h-12 w-12 text-primary" />,
    color: "from-primary/20 to-primary/5"
  },
  {
    id: "grow-revenue",
    title: "Grow Revenue",
    description: "Increase completion rates, optimize resources, and expand your capacity to train more students effectively.",
    icon: <DollarSign className="h-12 w-12 text-secondary" />,
    color: "from-secondary/20 to-secondary/5"
  }
]

export function ValueSection() {
  const posthog = usePostHog()

  const trackCardInteraction = (cardId: string) => {
    posthog?.capture("landing_value_card_clicked", {
      card_id: cardId
    })
  }
  
  return (
    <section id="why" className="py-20 border-b border-border">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why choose <span className="text-highlight">CFIPros</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-[600px]">
            Our platform transforms how flight schools operate, improving outcomes for students and instructors.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {valueCards.map((card) => (
            <button 
              key={card.id}
              type="button"
              className="bg-card rounded-lg border border-border p-8 transition-transform hover:scale-105 relative overflow-hidden cursor-pointer w-full text-left"
              onClick={() => trackCardInteraction(card.id)}
              aria-label={`Learn more about ${card.title}`}
            >
              {/* Background gradient */}
              <div className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-b ${card.color} -z-10`} />
              
              <div className="flex flex-col items-center text-center h-full">
                {/* Icon */}
                <div className="mb-6">
                  {card.icon}
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold mb-4">{card.title}</h3>
                <p className="text-muted-foreground">{card.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
} 