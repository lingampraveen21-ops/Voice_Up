'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { motion } from "framer-motion";

const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
];

export function LanguageSwitcher() {
    const t = useTranslations('Common');
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    function onLanguageChange(newLocale: string) {
        router.replace(pathname, { locale: newLocale });
    }

    const currentLang = languages.find(l => l.code === locale) || languages[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 px-2 text-white/80 hover:text-white hover:bg-white/10">
                    <Languages className="w-4 h-4" />
                    <span className="hidden sm:inline">{currentLang.flag} {currentLang.name}</span>
                    <span className="sm:hidden">{currentLang.flag}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-900/90 backdrop-blur-xl border-white/10 text-white">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        className={`flex items-center gap-2 cursor-pointer transition-colors ${locale === lang.code ? 'bg-white/10 text-violet-400' : 'hover:bg-white/5'
                            }`}
                        onClick={() => onLanguageChange(lang.code)}
                    >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
