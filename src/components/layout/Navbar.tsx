"use client";

import { GhostButton } from "@/components/ui/GhostButton";
import { GradientButton } from "@/components/ui/GradientButton";
import { cn } from "@/lib/utils";
import { useLenis } from "lenis/react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, usePathname } from "@/navigation";
import { useState } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "../shared/ThemeToggle";
import { useTranslations } from "next-intl";

export function Navbar() {
    const t = useTranslations("Navbar");
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const NAV_LINKS = [
        { name: t("features"), href: "#features" },
        { name: t("howItWorks"), href: "#how-it-works" },
        { name: t("forTeams"), href: "#teams" },
    ];

    useLenis(({ scroll }) => {
        setIsScrolled(scroll > 50);
    });

    return (
        <>
            <motion.nav
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                    isScrolled ? "glass py-4 shadow-lg" : "bg-transparent py-6"
                )}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl">🎙️</span>
                        <span className="text-2xl font-bold font-heading text-foreground">VoiceUp</span>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-8">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Range & Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        <ThemeToggle />
                        <LanguageSwitcher />
                        <Link href="/login">
                            <GhostButton className="h-10 px-4 py-2 text-sm border-white/20 text-white hover:bg-white/10 hover:border-white/40">
                                {t("login")}
                            </GhostButton>
                        </Link>
                        <Link href="/signup">
                            <GradientButton className="h-10 px-4 py-2 text-sm">
                                {t("signUp")}
                            </GradientButton>
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="flex items-center gap-4 md:hidden">
                        <ThemeToggle />
                        <LanguageSwitcher />
                        <button
                            className="text-white"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-24 px-4 flex flex-col gap-6 md:hidden"
                    >
                        <div className="flex flex-col gap-4">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-xl font-heading font-semibold text-white/90"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                        <div className="h-px w-full bg-white/10 my-4" />
                        <div className="flex flex-col gap-4">
                            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                <GhostButton className="w-full justify-center">{t("login")}</GhostButton>
                            </Link>
                            <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                                <GradientButton className="w-full justify-center">{t("signUp")}</GradientButton>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
