"use client";

import { Mic, BookOpen, Trophy, Map, LayoutDashboard, BarChart2, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Learn", href: "/learn", icon: BookOpen },
    { name: "Speak", href: "/practice/speaking", icon: Mic, isAction: true },
    { name: "Challenges", href: "/challenges", icon: Trophy },
    { name: "Roadmap", href: "/roadmap", icon: Map },
    { name: "Progress", href: "/progress", icon: BarChart2 },
];

const SETTINGS_ITEMS = [
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Profile", href: "/profile", icon: User },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <>
            <div className="hidden md:flex flex-col w-[240px] h-screen bg-surface-raised border-r border-white/5 p-4 sticky top-0">
                <div className="text-2xl font-bold font-heading text-primary mb-8 px-4">VoiceUp</div>
                <nav className="flex-1 space-y-2">
                    {NAV_ITEMS.map((item) => (
                        <Link key={item.name} href={item.href}>
                            <div
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                    pathname === item.href
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-white/5"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.name}
                            </div>
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto border-t border-white/5 pt-4 space-y-2">
                    {SETTINGS_ITEMS.map((item) => (
                        <Link key={item.name} href={item.href}>
                            <div
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                    pathname === item.href
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-white/5"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.name}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-raised border-t border-white/5 flex items-center justify-around z-50">
                {NAV_ITEMS.slice(0, 5).map((item) => (
                    <Link key={item.name} href={item.href} className="flex flex-col items-center">
                        <div
                            className={cn(
                                "p-2 rounded-full transition-colors",
                                item.isAction ? "bg-secondary text-white -mt-5 h-12 w-12 flex items-center justify-center shadow-lg" : pathname === item.href ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="h-6 w-6" />
                        </div>
                        {!item.isAction && <span className="text-[10px] text-muted-foreground mt-1">{item.name}</span>}
                    </Link>
                ))}
            </div>
        </>
    );
}
