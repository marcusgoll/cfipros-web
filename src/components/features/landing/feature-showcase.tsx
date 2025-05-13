"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  Users,
  FileText,
  Clock,
  LayoutDashboard,
  Gauge,
  GraduationCap,
  BookOpen,
  PieChartIcon,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

// Define the feature categories and items
const categories = [
  { id: "all", label: "All features" },
  { id: "analytics", label: "Analytics" },
  { id: "training", label: "Training" },
  { id: "management", label: "Management" },
]

const features = [
  {
    id: "test-analysis",
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Knowledge Test Analysis",
    description:
      "Understand student performance with event-based analytics, cohorts, and conversion funnels. Includes auto capture & SQL access.",
    categories: ["analytics"],
    content: {
      title: "Knowledge Test Analysis",
      description: "Identify weak areas and track improvement over time",
      metrics: [
        { label: "Average score", value: "82.5%" },
        { label: "Improvement rate", value: "14.7%" },
        { label: "Completion rate", value: "94.2%" },
      ],
      chart: {
        type: "bar",
        data: [65, 78, 86, 92],
        labels: ["Initial", "Week 2", "Week 4", "Final"],
      },
    },
  },
  {
    id: "student-tracking",
    icon: <Users className="h-5 w-5" />,
    title: "Student Tracking",
    description: "Monitor student progress through their training program with detailed metrics and milestones.",
    categories: ["management"],
    content: {
      title: "Student Tracking",
      description: "Comprehensive student management and progress tracking",
      metrics: [
        { label: "Active students", value: "24" },
        { label: "Avg. completion", value: "87%" },
        { label: "Retention rate", value: "93%" },
      ],
      chart: {
        type: "line",
        data: [10, 15, 22, 24],
        labels: ["Q1", "Q2", "Q3", "Q4"],
      },
    },
  },
  {
    id: "study-materials",
    icon: <FileText className="h-5 w-5" />,
    title: "Custom Study Materials",
    description: "Generate personalized study guides based on individual performance data.",
    categories: ["training"],
    content: {
      title: "Custom Study Materials",
      description: "AI-generated study materials tailored to each student's needs",
      metrics: [
        { label: "Materials created", value: "156" },
        { label: "Topics covered", value: "42" },
        { label: "Effectiveness", value: "91%" },
      ],
      chart: {
        type: "pie",
        data: [35, 25, 20, 20],
        labels: ["Weather", "Navigation", "Regulations", "Other"],
      },
    },
  },
  {
    id: "training-schedule",
    icon: <Clock className="h-5 w-5" />,
    title: "Training Schedule",
    description: "Optimize training schedules based on student availability and learning patterns.",
    categories: ["management", "training"],
    content: {
      title: "Training Schedule",
      description: "Intelligent scheduling to optimize learning and resource utilization",
      metrics: [
        { label: "Utilization rate", value: "94.2%" },
        { label: "Instructor hours", value: "128/mo" },
        { label: "Student satisfaction", value: "4.8/5" },
      ],
      chart: {
        type: "bar",
        data: [28, 32, 36, 32],
        labels: ["Mon", "Tue", "Wed", "Thu"],
      },
    },
  },
  {
    id: "instructor-dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    title: "Instructor Dashboard",
    description: "Comprehensive overview of all students, classes, and performance metrics.",
    categories: ["analytics", "management"],
    content: {
      title: "Instructor Dashboard",
      description: "All your training data in one place with actionable insights",
      metrics: [
        { label: "Students", value: "24" },
        { label: "Pass rate", value: "92%" },
        { label: "Avg. training time", value: "45 days" },
      ],
      chart: {
        type: "line",
        data: [75, 82, 88, 94],
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      },
    },
  },
  {
    id: "performance-metrics",
    icon: <Gauge className="h-5 w-5" />,
    title: "Performance Metrics",
    description: "Track key performance indicators for students and instructors.",
    categories: ["analytics"],
    content: {
      title: "Performance Metrics",
      description: "Comprehensive analytics to measure and improve training effectiveness",
      metrics: [
        { label: "Knowledge retention", value: "86%" },
        { label: "Skill proficiency", value: "92%" },
        { label: "Time efficiency", value: "+24%" },
      ],
      chart: {
        type: "radar",
        data: [85, 90, 78, 92, 88],
        labels: ["Knowledge", "Skills", "Attitude", "Communication", "Decision-making"],
      },
    },
  },
  {
    id: "certification-tracking",
    icon: <GraduationCap className="h-5 w-5" />,
    title: "Certification Tracking",
    description: "Monitor progress toward certification requirements and deadlines.",
    categories: ["management"],
    content: {
      title: "Certification Tracking",
      description: "Stay on top of certification requirements and deadlines",
      metrics: [
        { label: "Certifications issued", value: "156" },
        { label: "Avg. completion time", value: "42 days" },
        { label: "First-time pass rate", value: "89%" },
      ],
      chart: {
        type: "bar",
        data: [12, 18, 24, 32],
        labels: ["Q1", "Q2", "Q3", "Q4"],
      },
    },
  },
  {
    id: "lesson-plans",
    icon: <BookOpen className="h-5 w-5" />,
    title: "Lesson Plans",
    description: "Create and manage structured lesson plans based on student needs.",
    categories: ["training"],
    content: {
      title: "Lesson Plans",
      description: "Data-driven lesson planning for more effective training",
      metrics: [
        { label: "Plans created", value: "342" },
        { label: "Effectiveness score", value: "4.7/5" },
        { label: "Time saved", value: "4.2 hrs/week" },
      ],
      chart: {
        type: "pie",
        data: [40, 30, 20, 10],
        labels: ["Ground", "Flight", "Simulator", "Briefing"],
      },
    },
  },
  {
    id: "analytics-reports",
    icon: <PieChartIcon className="h-5 w-5" />,
    title: "Analytics Reports",
    description: "Generate comprehensive reports on student and school performance.",
    categories: ["analytics"],
    content: {
      title: "Analytics Reports",
      description: "Comprehensive reporting for students, instructors, and management",
      metrics: [
        { label: "Reports generated", value: "256/mo" },
        { label: "Data points", value: "12,450" },
        { label: "Insights delivered", value: "86/mo" },
      ],
      chart: {
        type: "line",
        data: [42, 56, 68, 82],
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      },
    },
  },
]

// Chart components (simplified for demo)
const BarChart = ({ data, labels }: { data: number[]; labels: string[] }) => (
  <div className="h-48 w-full">
    <div className="flex h-40 items-end justify-between gap-2">
      {data.map((value, i) => (
        <div key={i} className="relative flex w-full flex-col items-center">
          <div className="w-full rounded-t bg-primary" style={{ height: `${(value / 100) * 160}px` }}></div>
          <span className="mt-2 text-xs text-muted-foreground">{labels[i]}</span>
        </div>
      ))}
    </div>
  </div>
)

const LineChart = ({ data, labels }: { data: number[]; labels: string[] }) => (
  <div className="h-48 w-full">
    <svg viewBox="0 0 300 100" className="h-40 w-full overflow-visible">
      <polyline
        points={data.map((value, i) => `${(i / (data.length - 1)) * 300},${100 - (value / 100) * 100}`).join(" ")}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
      />
      {data.map((value, i) => (
        <circle
          key={i}
          cx={(i / (data.length - 1)) * 300}
          cy={100 - (value / 100) * 100}
          r="3"
          fill="hsl(var(--primary))"
        />
      ))}
    </svg>
    <div className="mt-2 flex justify-between">
      {labels.map((label, i) => (
        <span key={i} className="text-xs text-muted-foreground">
          {label}
        </span>
      ))}
    </div>
  </div>
)

const PieChart = ({ data }: { data: number[]; labels: string[] }) => {
  let cumulativePercent = 0
  const total = data.reduce((acc, val) => acc + val, 0)

  return (
    <div className="flex h-48 items-center justify-center">
      <svg width="150" height="150" viewBox="0 0 100 100">
        {data.map((value, i) => {
          const startPercent = cumulativePercent
          const percent = value / total
          cumulativePercent += percent

          const startX = Math.cos(2 * Math.PI * startPercent) * 50 + 50
          const startY = Math.sin(2 * Math.PI * startPercent) * 50 + 50
          const endX = Math.cos(2 * Math.PI * cumulativePercent) * 50 + 50
          const endY = Math.sin(2 * Math.PI * cumulativePercent) * 50 + 50

          const largeArcFlag = percent > 0.5 ? 1 : 0

          const pathData = [
            `M 50 50`,
            `L ${startX} ${startY}`,
            `A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            `Z`,
          ].join(" ")

          const colors = [
            "hsl(var(--primary))",
            "hsl(var(--primary) / 0.8)",
            "hsl(var(--primary) / 0.6)",
            "hsl(var(--primary) / 0.4)",
          ]

          return <path key={i} d={pathData} fill={colors[i % colors.length]} />
        })}
      </svg>
    </div>
  )
}

const RadarChart = ({ data }: { data: number[]; labels: string[] }) => (
  <div className="flex h-48 items-center justify-center">
    <div className="h-36 w-36 rounded-full border border-border"></div>
    <div className="absolute h-24 w-24 rounded-full border border-border"></div>
    <div className="absolute h-12 w-12 rounded-full border border-border"></div>
    <div className="absolute h-36 w-36">
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <polygon
          points={data
            .map((value, i) => {
              const angle = (i / data.length) * 2 * Math.PI - Math.PI / 2
              const radius = (value / 100) * 50
              return `${50 + radius * Math.cos(angle)},${50 + radius * Math.sin(angle)}`
            })
            .join(" ")}
          fill="hsla(var(--primary) / 0.2)"
          stroke="hsl(var(--primary))"
          strokeWidth="1"
        />
      </svg>
    </div>
  </div>
)

export function FeatureShowcase() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [activeFeature, setActiveFeature] = useState(features[0].id)

  // Filter features based on active category
  const filteredFeatures =
    activeCategory === "all" ? features : features.filter((feature) => feature.categories.includes(activeCategory))

  const selectedFeature = features.find((f) => f.id === activeFeature) || features[0]

  // Render the appropriate chart based on the chart type
  const renderChart = (chartType: string, data: number[], labels: string[]) => {
    switch (chartType) {
      case "bar":
        return <BarChart data={data} labels={labels} />
      case "line":
        return <LineChart data={data} labels={labels} />
      case "pie":
        return <PieChart data={data} labels={labels} />
      case "radar":
        return <RadarChart data={data} labels={labels} />
      default:
        return <BarChart data={data} labels={labels} />
    }
  }

  return (
    <div className="mt-12 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
        <div className="border-b border-border bg-secondary/30">
          <div className="container-custom">
            <TabsList className="bg-transparent">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="data-[state=active]:bg-background data-[state=active]:shadow-none"
                >
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        <div className="grid md:grid-cols-3">
          {/* Feature selection sidebar */}
          <div className="border-r border-border md:col-span-1">
            <div className="h-[500px] overflow-auto p-2">
              {filteredFeatures.map((feature) => (
                <Button
                  key={feature.id}
                  variant="ghost"
                  className={cn(
                    "mb-1 flex w-full justify-start gap-3 px-3 py-3 text-left",
                    activeFeature === feature.id && "bg-secondary",
                  )}
                  onClick={() => setActiveFeature(feature.id)}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                    {feature.icon}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{feature.title}</span>
                    <span className="line-clamp-1 text-xs text-muted-foreground">
                      {feature.description.substring(0, 45)}...
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Feature content display */}
          <div className="md:col-span-2 p-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                {selectedFeature.icon}
              </div>
              <div>
                <h3 className="text-2xl font-bold">{selectedFeature.content.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedFeature.content.description}</p>
              </div>
              <div className="ml-auto flex">
                <Button variant="ghost" size="icon" className="rounded-r-none border-r border-border">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-l-none">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              {selectedFeature.content.metrics.map((metric, i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-3">
                  <div className="text-sm text-muted-foreground">{metric.label}</div>
                  <div className="text-2xl font-bold">{metric.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-lg border border-border bg-card p-4">
              {renderChart(
                selectedFeature.content.chart.type,
                selectedFeature.content.chart.data,
                selectedFeature.content.chart.labels,
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button className="button-primary">
                Learn more
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  )
}
