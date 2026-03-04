import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/hero/HeroSection";
import { StatsBar } from "@/components/stats/StatsBar";
import { ProblemSolutionSection } from "@/components/marketing/ProblemSolutionSection";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { FeaturesBentoSection } from "@/components/marketing/FeaturesBentoSection";
import { NovaDemoSection } from "@/components/marketing/NovaDemoSection";
import { TestimonialsSection } from "@/components/marketing/TestimonialsSection";
import { CTASection } from "@/components/marketing/CTASection";

export default function MarketingPage() {
    return (
        <>
            <Navbar />
            <div className="flex flex-col min-h-screen">
                <HeroSection />
                <StatsBar />
                <ProblemSolutionSection />
                <HowItWorksSection />
                <FeaturesBentoSection />
                <NovaDemoSection />
                <TestimonialsSection />
                <CTASection />
            </div>
            <Footer />
        </>
    );
}
