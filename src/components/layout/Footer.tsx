"use client"

import Link from "next/link"
import { usePostHog } from "posthog-js/react"
import { Shield, Github, Award } from "lucide-react"

// Define the footer links for each category
const footerLinks = [
  {
    id: "product",
    title: "Product",
    links: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "#pricing" },
      { name: "Integrations", href: "#integrations" },
      { name: "FAQ", href: "#faq" },
      { name: "Roadmap", href: "#roadmap" }
    ]
  },
  {
    id: "resources",
    title: "Resources",
    links: [
      { name: "Documentation", href: "/docs" },
      { name: "API Reference", href: "/api" },
      { name: "Guides", href: "/guides" },
      { name: "Support", href: "/support" },
      { name: "Community", href: "/community" }
    ]
  },
  {
    id: "company",
    title: "Company",
    links: [
      { name: "About", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Careers", href: "/careers" },
      { name: "Press", href: "/press" },
      { name: "Contact", href: "/contact" }
    ]
  },
  {
    id: "legal",
    title: "Legal",
    links: [
      { name: "Terms", href: "/terms" },
      { name: "Privacy", href: "/privacy" },
      { name: "Cookies", href: "/cookies" },
      { name: "Licenses", href: "/licenses" },
      { name: "Settings", href: "/settings" }
    ]
  }
]

// Trust badges
const trustBadges = [
  {
    id: "open-source",
    name: "Open Source",
    icon: <Github className="h-5 w-5" />,
    description: "Parts of our platform are open source and community-driven."
  },
  {
    id: "soc2",
    name: "SOC-2 Compliant",
    icon: <Shield className="h-5 w-5" />,
    description: "We follow strict security and privacy standards."
  },
  {
    id: "faa",
    name: "FAA-Compliant",
    icon: <Award className="h-5 w-5" />,
    description: "Our tools align with FAA regulatory requirements."
  }
]

export function Footer() {
  const posthog = usePostHog()

  const trackFooterLinkClick = (category: string, linkName: string) => {
    posthog?.capture("landing_footer_link_clicked", {
      category,
      link_name: linkName
    })
  }
  
  return (
    <footer className="border-t border-border">
      <div className="container px-4 md:px-6 mx-auto py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Logo and description */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative h-8 w-8">
                <div className="absolute inset-0 flex items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
                  CP
                </div>
              </div>
              <span className="text-lg font-bold">CFIPros</span>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">
              Advanced analytics and training tools to help flight instructors build successful pilots.
            </p>
            
            {/* Social links */}
            <div className="flex gap-4">
              {["twitter", "linkedin", "facebook", "youtube"].map((social) => (
                <Link 
                  key={social}
                  href={`https://${social}.com/cfipros`}
                  className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                  onClick={() => trackFooterLinkClick("social", social)}
                  aria-label={`Visit our ${social} page`}
                >
                  <span className="sr-only">{social}</span>
                  <span className="text-xs uppercase">{social.charAt(0)}</span>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Sitemap columns */}
          {footerLinks.map((category) => (
            <div key={category.id} className="col-span-1">
              <h3 className="font-bold mb-4">{category.title}</h3>
              <ul className="space-y-3">
                {category.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => trackFooterLinkClick(category.id, link.name)}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Trust badges */}
        <div className="border-t border-border pt-8 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            {trustBadges.map((badge) => (
              <div key={badge.id} className="flex items-start gap-3">
                <div className="bg-muted/50 p-2 rounded-full">
                  {badge.icon}
                </div>
                <div>
                  <h4 className="font-medium">{badge.name}</h4>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Copyright and legal links */}
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-border pt-6">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            © {new Date().getFullYear()} CFIPros. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Cookies Settings"].map((item) => (
              <Link 
                key={item}
                href={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => trackFooterLinkClick("legal-footer", item)}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
} 