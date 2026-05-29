import { Marquee } from "@/components/ui/Marquee";
import { GlassCard } from "@/components/ui/GlassCard";
import { Star } from "lucide-react";
import Image from "next/image";

import { useTranslations } from "next-intl";

export function TestimonialsSection() {
    const t = useTranslations("Testimonials");

    const TESTIMONIALS = [
        { name: "Rahul Sharma", country: "🇮🇳", role: "Software Engineer", quote: t("quote1") },
        { name: "Ana Silva", country: "🇧🇷", role: "UX Designer", quote: t("quote2") },
        { name: "Yuki Tanaka", country: "🇯🇵", role: "Sales Manager", quote: t("quote3") },
        { name: "Carlos Mendoza", country: "🇲🇽", role: "Student", quote: t("quote4") },
        { name: "Sarah Müller", country: "🇩🇪", role: "Marketing Lead", quote: t("quote5") },
        { name: "David Chen", country: "🇹🇼", role: "Frontend Developer", quote: t("quote6") },
        { name: "Emily Kim", country: "🇰🇷", role: "Product Manager", quote: t("quote7") },
        { name: "Omar Hassan", country: "🇪🇬", role: "Cloud Architect", quote: t("quote8") },
    ];

    const row1 = TESTIMONIALS.slice(0, 4);
    const row2 = TESTIMONIALS.slice(4, 8);

    return (
        <section className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-8 mb-16 text-center">
                <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">{t("title")}</h2>
                <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
            </div>

            <div className="flex flex-col gap-8 relative overflow-hidden">
                <Marquee direction="left" speed="slow" pauseOnHover>
                    {row1.map((testimonial, i) => (
                        <TestimonialCard key={i} {...testimonial} idx={i} />
                    ))}
                </Marquee>

                <Marquee direction="right" speed="slow" pauseOnHover>
                    {row2.map((testimonial, i) => (
                        <TestimonialCard key={i} {...testimonial} idx={i + 4} />
                    ))}
                </Marquee>

                {/* Gradient Edges */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background to-transparent z-10" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background to-transparent z-10" />
            </div>
        </section>
    );
}

interface TestimonialCardProps {
    name: string;
    country: string;
    role: string;
    quote: string;
    idx: number;
}

function TestimonialCard({ name, country, role, quote, idx }: TestimonialCardProps) {
    return (
        <GlassCard className="w-[280px] sm:w-[350px] md:w-[400px] flex-shrink-0 mx-2 flex flex-col justify-between h-full bg-surface/50 border-white/5 hover:border-white/20 transition-colors">
            <div className="flex flex-col gap-4">
                <div className="flex text-warning text-sm">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                </div>
                <q className="text-base text-white/90 italic leading-relaxed">&quot;{quote}&quot;</q>
            </div>
            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-white/5">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-surface-raised border border-white/10 relative">
                    <Image src={`https://i.pravatar.cc/150?img=${idx + 20}`} fill sizes="48px" alt={name} className="object-cover" />
                </div>
                <div className="flex flex-col">
                    <span className="font-heading font-bold text-white flex items-center gap-2">
                        {name} <span className="text-lg">{country}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">{role}</span>
                </div>
            </div>
        </GlassCard>
    );
}
