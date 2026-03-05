"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Settings, User, Palette, Shield } from "lucide-react"

import ProfileTab from "@/components/settings/ProfileTab"
import PreferencesTab from "@/components/settings/PreferencesTab"
import AccountTab from "@/components/settings/AccountTab"

const TABS = [
    { id: "profile", label: "Profile", icon: User },
    { id: "preferences", label: "Preferences", icon: Palette },
    { id: "account", label: "Account", icon: Shield },
]

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState("profile")

    return (
        <div className="min-h-screen bg-[#080810] text-white">
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-[#6c63ff]/20 flex items-center justify-center border border-[#6c63ff]/30 shadow-[0_0_20px_rgba(108,99,255,0.2)]">
                        <Settings className="w-6 h-6 text-[#6c63ff]" />
                    </div>
                    <h1 className="text-3xl font-heading font-bold text-[#e2e2f0]">Settings</h1>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.id
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all whitespace-nowrap relative ${isActive ? "text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabBadge"
                                        className="absolute inset-0 bg-[#6c63ff]/20 border border-[#6c63ff]/30 rounded-full"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <Icon className={`w-4 h-4 relative z-10 ${isActive ? "text-[#6c63ff]" : ""}`} />
                                <span className="relative z-10">{tab.label}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Tab Content */}
                <div className="relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === "profile" && <ProfileTab />}
                            {activeTab === "preferences" && <PreferencesTab />}
                            {activeTab === "account" && <AccountTab />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
