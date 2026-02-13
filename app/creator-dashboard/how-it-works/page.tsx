// app/creator-dashboard/how-it-works/page.tsx
import { 
  Briefcase, CheckCircle, Clock, UserCheck, Mail, 
  Award, ArrowRight, Info, ShieldCheck, Zap, HelpCircle,
  Search, FileText, BarChart, Gift, Star, Users, Calendar
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Search,
    title: "1. Discover Opportunities",
    description: "Browse through available barter collaborations that match your niche and audience. Filter by category, product type, or brand."
  },
  {
    icon: FileText,
    title: "2. Submit Your Application",
    description: "Complete the application form with your details, portfolio links, and why you'd be a great fit for the collaboration."
  },
  {
    icon: Clock,
    title: "3. Await Approval",
    description: "Our team reviews applications within 2-3 business days. You'll be notified as soon as there's an update on your application."
  },
  {
    icon: UserCheck,
    title: "4. Get Matched",
    description: "Once approved, you'll receive all the details about the collaboration, including product info, requirements, and deadlines."
  },
  {
    icon: BarChart,
    title: "5. Track Performance",
    description: "Monitor your application status, track your collaborations, and view your earnings all in one place."
  },
  {
    icon: Gift,
    title: "6. Enjoy Rewards",
    description: "Receive your products or services as agreed, and get recognized for your creative work with top brands."
  }
];

const creatorBenefits = [
  {
    title: "Quality Control",
    text: "All brand collaborations are vetted by our team to ensure they meet our quality standards and provide fair value to creators.",
    icon: ShieldCheck
  },
  {
    title: "Exclusive Opportunities",
    text: "Get access to brand partnerships and product collaborations not available elsewhere, curated specifically for your content style.",
    icon: Star
  },
  {
    title: "Support System",
    text: "Dedicated support to help you navigate collaborations, resolve issues, and make the most of your partnerships.",
    icon: HelpCircle
  }
];

export default function HowItWorksPage() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      {/* Header Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">How Creator Collaborations Work</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Turn your creativity into valuable partnerships. Here's how you can grow your brand with Byberr's barter collaborations.
        </p>
      </div>

      {/* Steps Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
        {steps.map((step, index) => (
          <div key={index} className="group p-6 border rounded-2xl bg-card hover:border-primary/50 transition-all duration-300 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <step.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-3">{step.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>

      {/* Benefits Section */}
      <div className="mb-16">
        <div className="flex items-center gap-2 mb-8">
          <Info className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Benefits for Creators</h2>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {creatorBenefits.map((benefit, i) => (
            <div key={i} className="flex flex-col gap-3 p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <benefit.icon className="h-5 w-5 text-slate-600" />
                <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-700">{benefit.title}</h4>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {benefit.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-primary text-primary-foreground p-8 rounded-3xl shadow-xl shadow-primary/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2">Ready to Get Started?</h3>
            <p className="text-primary-foreground/80 max-w-xl">
              Discover exciting brand collaborations and start growing your portfolio with quality products and services.
            </p>
          </div>
          <Button asChild size="lg" variant="secondary" className="rounded-full px-8">
            <Link href="/creator-dashboard/discover" className="gap-2 font-bold">
              Browse Collaborations
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}