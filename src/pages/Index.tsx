import { useNavigate } from "react-router-dom";
import { BusIcon } from "@/components/icons/BusIcon";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Bell, Shield, ChevronRight, Smartphone } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: MapPin,
      title: "Live Tracking",
      description: "See your bus location in real-time on an interactive map",
    },
    {
      icon: Clock,
      title: "Accurate ETA",
      description: "Get precise arrival times updated every few seconds",
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      description: "Receive notifications when your bus is approaching",
    },
    {
      icon: Shield,
      title: "Secure Access",
      description: "Private and secure access for your organization only",
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-hero opacity-95" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-ocean/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-sky/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full" />

        {/* Content */}
        <div className="relative z-10 container px-4 py-20 lg:py-32">
          {/* Header */}
          <nav className="flex items-center justify-between mb-16 lg:mb-24">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm">
                <BusIcon size={24} className="text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-primary-foreground">Bus Bay</span>
            </div>
            <Button
              variant="hero-outline"
              onClick={() => navigate("/login")}
              className="text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10"
            >
              Sign In
              <ChevronRight className="w-4 h-4" />
            </Button>
          </nav>

          {/* Hero Content */}
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium animate-fade-in">
              <Smartphone className="w-4 h-4" />
              <span>Real-time bus tracking for organizations</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-slide-up">
              Know Exactly When
              <br />
              <span className="text-gradient bg-gradient-to-r from-ocean to-sky bg-clip-text text-transparent">
                Your Ride Arrives
              </span>
            </h1>
            
            <p className="text-lg lg:text-xl opacity-90 mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Track campus buses in real-time, get accurate ETAs, and never miss your ride again. 
              Built for colleges, companies, and organizations.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Button
                variant="sunset"
                size="xl"
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto"
              >
                Get Started
                <ChevronRight className="w-5 h-5" />
              </Button>
              <Button
                variant="hero-outline"
                size="xl"
                onClick={() => navigate("/student")}
                className="w-full sm:w-auto text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10"
              >
                View Demo
              </Button>
            </div>
          </div>

          {/* Floating bus animation */}
          <div className="hidden lg:block absolute bottom-10 right-20 animate-float">
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm shadow-lg">
              <BusIcon size={40} className="text-primary-foreground" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 bg-background">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to make your daily commute stress-free
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-ocean/50 hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-center w-14 h-14 mb-5 rounded-xl bg-gradient-accent shadow-md group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-accent-foreground" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container px-4 text-center text-primary-foreground">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Transform Your Commute?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Join organizations that have modernized their transportation management
          </p>
          <Button
            variant="sunset"
            size="xl"
            onClick={() => navigate("/login")}
          >
            Start Tracking Now
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-navy-dark text-primary-foreground/60">
        <div className="container px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BusIcon size={20} className="text-ocean" />
            <span className="font-semibold text-primary-foreground">Bus Bay</span>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} Bus Bay. Built with Lovable.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
