// app/business-dashboard/how-it-works/page.tsx
import { 
  Briefcase, CheckCircle, Clock, UserCheck, Mail, 
  Award, ArrowRight, Info, ShieldCheck, Zap, HelpCircle, Users, Search, FileText
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Briefcase,
    title: "1. Create Your Campaign",
    description: "Set up your barter campaign with details about your product or service offering and what you're looking for in return."
  },
  {
    icon: Search,
    title: "2. Review Applications",
    description: "Creators interested in your campaign will submit their applications through our platform."
  },
  {
    icon: CheckCircle,
    title: "3. Admin Review",
    description: "Our admin team will review all applications for quality and relevance before they reach you."
  },
  {
    icon: Users,
    title: "4. Select Creators",
    description: "Review pre-vetted creator profiles and select the best matches for your brand from the approved applications."
  },
  {
    icon: FileText,
    title: "5. Review Content",
    description: "Creators will submit their content for your review before posting. Provide feedback or request revisions if needed."
  },
  {
    icon: Award,
    title: "6. Fulfill Barter",
    description: "Once content is approved, fulfill your end of the barter agreement by providing the agreed-upon products or services."
  }
];

const additionalInfo = [
  {
    title: "Quality Control",
    text: "Our admin team pre-screens all creator applications to ensure they meet quality standards before they reach you, saving you time.",
    icon: ShieldCheck
  },
  {
    title: "Barter-Only Platform",
    text: "Byberr is exclusively for product and service exchanges, connecting you with creators who are genuinely interested in your offerings.",
    icon: Zap
  },
  {
    title: "Dedicated Support",
    text: "Our support team is here to help mediate any issues and ensure smooth collaborations between you and creators.",
    icon: HelpCircle
  }
];

export default function BusinessHowItWorksPage() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      {/* Header Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">How Barter Collaborations Work for Businesses</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Leverage the power of barter collaborations to grow your brand with authentic content from quality creators.
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

      {/* Additional Information Section */}
      <div className="mb-16">
        <div className="flex items-center gap-2 mb-8">
          <Info className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Key Benefits</h2>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {additionalInfo.map((info, i) => (
            <div key={i} className="flex flex-col gap-3 p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <info.icon className="h-5 w-5 text-slate-600" />
                <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-700">{info.title}</h4>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {info.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-primary text-primary-foreground p-8 rounded-3xl shadow-xl shadow-primary/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2">Ready to Launch Your Campaign?</h3>
            <p className="text-primary-foreground/80 max-w-xl">
              Create your first barter campaign and connect with creators who are excited about your brand.
            </p>
          </div>
          <Button asChild size="lg" variant="secondary" className="rounded-full px-8">
            <Link href="/business-dashboard/campaigns/new" className="gap-2 font-bold">
              Create Campaign
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
