import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Activity, BarChart3, Shield, Wind, Gauge, TrendingDown, Bell, FileText } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Wind className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">VEM</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </Link>
              <Link href="#impact" className="text-muted-foreground hover:text-foreground transition-colors">
                Impact
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link href="/login">
                <Button variant="ghost">Log In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in-up">
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                Aligned with SDG 11 & 13
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-balance">
                Monitor Your Vehicle Emissions in <span className="text-primary">Real-Time</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
                Track PM2.5, PM10, and harmful gases with our smart sensor system. Make informed decisions to reduce
                your carbon footprint and contribute to a cleaner environment.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/register">
                  <Button size="lg" className="text-base">
                    Start Monitoring <Activity className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline" className="text-base bg-transparent">
                    View Demo Dashboard
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-2xl font-bold text-foreground">10K+</div>
                  <div className="text-sm text-muted-foreground">Active Vehicles</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">95%</div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">24/7</div>
                  <div className="text-sm text-muted-foreground">Monitoring</div>
                </div>
              </div>
            </div>
            <div className="relative lg:h-[500px] animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
              <div className="relative bg-card border border-border rounded-2xl p-6 shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Live Status</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-success rounded-full animate-pulse-soft" />
                      <span className="text-sm text-success">Active</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-success/10 border border-success/20 rounded-xl p-4">
                      <div className="text-xs text-success font-medium mb-1">PM2.5</div>
                      <div className="text-2xl font-bold text-foreground">12 μg/m³</div>
                      <div className="text-xs text-muted-foreground mt-1">Good</div>
                    </div>
                    <div className="bg-success/10 border border-success/20 rounded-xl p-4">
                      <div className="text-xs text-success font-medium mb-1">PM10</div>
                      <div className="text-2xl font-bold text-foreground">25 μg/m³</div>
                      <div className="text-xs text-muted-foreground mt-1">Good</div>
                    </div>
                    <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
                      <div className="text-xs text-warning font-medium mb-1">CO₂</div>
                      <div className="text-2xl font-bold text-foreground">450 ppm</div>
                      <div className="text-xs text-muted-foreground mt-1">Moderate</div>
                    </div>
                    <div className="bg-success/10 border border-success/20 rounded-xl p-4">
                      <div className="text-xs text-success font-medium mb-1">Filter</div>
                      <div className="text-2xl font-bold text-foreground">87%</div>
                      <div className="text-xs text-muted-foreground mt-1">Efficient</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">Comprehensive Emission Monitoring</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Everything you need to track, analyze, and reduce your vehicle emissions
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Activity,
                title: "Real-Time Monitoring",
                description: "Live data from PM2.5, PM10, and gas sensors with instant updates",
                color: "text-primary",
              },
              {
                icon: BarChart3,
                title: "Historical Analytics",
                description: "View trends, patterns, and insights from your emission history",
                color: "text-accent",
              },
              {
                icon: Gauge,
                title: "Filter Performance",
                description: "Track before and after filtration efficiency in real-time",
                color: "text-warning",
              },
              {
                icon: Bell,
                title: "Smart Alerts",
                description: "Get notified when emission levels exceed safe thresholds",
                color: "text-danger",
              },
              {
                icon: TrendingDown,
                title: "Reduction Insights",
                description: "Measure your environmental impact and track improvements",
                color: "text-success",
              },
              {
                icon: FileText,
                title: "Detailed Reports",
                description: "Generate comprehensive reports for compliance and analysis",
                color: "text-primary",
              },
              {
                icon: Shield,
                title: "Secure & Private",
                description: "Your data is encrypted and protected with enterprise security",
                color: "text-accent",
              },
              {
                icon: Wind,
                title: "Multi-Vehicle",
                description: "Monitor multiple vehicles from a single dashboard",
                color: "text-primary",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card border-border"
              >
                <feature.icon className={`h-10 w-10 ${feature.color} mb-4`} />
                <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Simple setup, powerful insights in three easy steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Install Sensor System",
                description:
                  "Our ESP32-based hardware with PMS5003 and MQ-135 sensors is installed on your vehicle exhaust system with the emission filter unit.",
              },
              {
                step: "02",
                title: "Connect & Monitor",
                description:
                  "Sensors automatically transmit real-time data via Wi-Fi to our cloud platform. Watch your emission levels live on the dashboard.",
              },
              {
                step: "03",
                title: "Analyze & Improve",
                description:
                  "Review historical trends, get actionable insights, and track your progress in reducing emissions over time.",
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-primary/10 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Environmental Impact */}
      <section id="impact" className="py-20 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-balance">Contributing to a Sustainable Future</h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Our platform directly supports UN Sustainable Development Goals 11 (Sustainable Cities) and 13 (Climate
                Action) by providing the tools to monitor and reduce vehicle emissions.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                    <TrendingDown className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 text-foreground">Reduce Emissions</h4>
                    <p className="text-sm text-muted-foreground">
                      Filter efficiency tracking helps reduce harmful particulates by up to 70%
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 text-foreground">Data-Driven Decisions</h4>
                    <p className="text-sm text-muted-foreground">
                      Make informed choices based on real emission data and trends
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 text-foreground">Compliance Ready</h4>
                    <p className="text-sm text-muted-foreground">
                      Generate reports for environmental authorities and regulations
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <Card className="p-8 bg-card border-border shadow-xl">
                <div className="space-y-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Total Emissions Reduced</div>
                    <div className="text-4xl font-bold text-foreground mb-2">2.4M kg</div>
                    <div className="text-sm text-success">↓ 68% from baseline</div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-success to-accent w-[68%]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div>
                      <div className="text-2xl font-bold text-foreground">10,487</div>
                      <div className="text-xs text-muted-foreground">Active Vehicles</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">156M</div>
                      <div className="text-xs text-muted-foreground">Data Points</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-balance">Ready to Start Monitoring?</h2>
          <p className="text-lg text-muted-foreground mb-8 text-pretty">
            Join thousands of vehicle owners making a difference in air quality
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="text-base">
                Get Started Free
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="text-base bg-transparent">
                Explore Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Wind className="h-6 w-6 text-primary" />
                <span className="font-bold text-foreground">VEM</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Smart vehicle emission monitoring for a cleaner tomorrow.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/analytics" className="text-muted-foreground hover:text-foreground transition-colors">
                    Analytics
                  </Link>
                </li>
                <li>
                  <Link href="/reports" className="text-muted-foreground hover:text-foreground transition-colors">
                    Reports
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 VEM Platform. Supporting SDG 11 & 13 for sustainable development.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
