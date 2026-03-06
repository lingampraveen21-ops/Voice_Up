import { Link } from "@/navigation";
import { Github, Linkedin, Twitter } from "lucide-react";
import { useTranslations } from "next-intl";

export function Footer() {
    const t = useTranslations("Footer");
    const nt = useTranslations("Navbar");

    return (
        <footer className="bg-background border-t border-white/5 pt-16 pb-8">
            <div className="container mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-16">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">🎙️</span>
                            <span className="text-2xl font-bold font-heading text-white">VoiceUp</span>
                        </Link>
                        <p className="text-muted-foreground max-w-sm">
                            {t("tagline")}
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h4 className="font-heading font-bold text-white mb-2">{t("platform")}</h4>
                        <Link href="#features" className="text-muted-foreground hover:text-white transition-colors text-sm">{nt("features")}</Link>
                        <Link href="#how-it-works" className="text-muted-foreground hover:text-white transition-colors text-sm">{nt("howItWorks")}</Link>
                        <Link href="#teams" className="text-muted-foreground hover:text-white transition-colors text-sm">{nt("forTeams")}</Link>
                        <Link href="/login" className="text-muted-foreground hover:text-white transition-colors text-sm">{nt("login")}</Link>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h4 className="font-heading font-bold text-white mb-2">{t("legal")}</h4>
                        <Link href="#" className="text-muted-foreground hover:text-white transition-colors text-sm">{t("aboutUs")}</Link>
                        <Link href="#" className="text-muted-foreground hover:text-white transition-colors text-sm">{t("contact")}</Link>
                        <Link href="/privacy" className="text-muted-foreground hover:text-white transition-colors text-sm">{t("privacy")}</Link>
                        <Link href="/terms" className="text-muted-foreground hover:text-white transition-colors text-sm">{t("terms")}</Link>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 text-sm text-muted-foreground gap-4 text-center md:text-left">
                    <p>{t("madeWith")}</p>
                    <div className="flex items-center gap-4">
                        <a href="#" className="hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"><Twitter className="h-5 w-5" /></a>
                        <a href="#" className="hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"><Linkedin className="h-5 w-5" /></a>
                        <a href="#" className="hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"><Github className="h-5 w-5" /></a>
                    </div>
                    <p>© {new Date().getFullYear()} VoiceUp Inc. {t("rights")}</p>
                </div>
            </div>
        </footer>
    );
}
