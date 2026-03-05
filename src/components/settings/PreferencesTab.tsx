"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLocale } from "next-intl"
import { useRouter, usePathname } from "@/navigation"
import { createClient } from "@/lib/supabase/client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Volume2, Play, Moon, Sun, Clock, EyeOff } from "lucide-react"
import { Skeleton } from "@/components/ui/Skeleton"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
]

export default function PreferencesTab() {
    const supabase = createClient()
    const queryClient = useQueryClient()
    const currentLocale = useLocale()
    const router = useRouter()
    const pathname = usePathname()

    const [theme, setTheme] = useState("dark")
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
    const [selectedVoiceURI, setSelectedVoiceURI] = useState("")
    const [reminderOn, setReminderOn] = useState(false)
    const [reminderTime, setReminderTime] = useState("20:00") // 8:00 PM 24hr format
    const [reduceMotion, setReduceMotion] = useState(false)

    // Fetch profiles
    const { data: profile, isLoading } = useQuery({
        queryKey: ["profile"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("No user found")

            const { data, error } = await supabase
                .from("profiles")
                .select("theme, target_voice, reminder_enabled, reminder_time")
                .eq("id", user.id)
                .single()

            if (error && error.code !== "PGRST116") throw error
            return { id: user.id, ...(data || {}) }
        }
    })

    useEffect(() => {
        if (profile) {
            if (profile.theme) setTheme(profile.theme)
            if (profile.target_voice) setSelectedVoiceURI(profile.target_voice)
            if (profile.reminder_enabled !== undefined) setReminderOn(profile.reminder_enabled)
            if (profile.reminder_time) setReminderTime(profile.reminder_time)
        }
        const motionPref = localStorage.getItem("reduceMotion") === "true"
        setReduceMotion(motionPref)
    }, [profile])

    // Load voices
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices()
            const englishVoices = availableVoices.filter(v => v.lang.startsWith('en'))
            setVoices(englishVoices)
            if (!selectedVoiceURI && englishVoices.length > 0) {
                setSelectedVoiceURI(englishVoices[0].voiceURI)
            }
        }
        loadVoices()
        window.speechSynthesis.onvoiceschanged = loadVoices
    }, [selectedVoiceURI])

    const updatePreferences = useMutation({
        mutationFn: async () => {
            if (!profile?.id) throw new Error("Missing user profile")

            // We save theme, target_voice, reminder_enabled, reminder_time to Supabase
            // If the columns don't exist yet, we will gracefully catch metadata errors 
            // but in a real app these would be in the schema.
            const payload = {
                theme,
                target_voice: selectedVoiceURI,
                reminder_enabled: reminderOn,
                reminder_time: reminderTime
            }

            const { error } = await supabase.from("profiles").update(payload).eq("id", profile.id)
            if (error) throw error

            // LocalStorage for Reduce Motion
            localStorage.setItem("reduceMotion", String(reduceMotion))

            // Apply theme
            if (theme === "light") {
                document.documentElement.classList.remove("dark")
            } else {
                document.documentElement.classList.add("dark")
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] })
            toast.success("Preferences saved! ✅")
        },
        onError: (error) => {
            toast.error("Something went wrong. Try again ❌")
            console.error(error)
        }
    })

    const previewVoice = () => {
        if (!selectedVoiceURI) return
        const voice = voices.find(v => v.voiceURI === selectedVoiceURI)
        if (voice) {
            const utterance = new SpeechSynthesisUtterance("Hi! I am NOVA, your English tutor!")
            utterance.voice = voice
            window.speechSynthesis.cancel() // stop any current speech
            window.speechSynthesis.speak(utterance)
        }
    }

    const changeLanguage = (code: string) => {
        router.replace(pathname, { locale: code })
    }

    const currentLangObj = LANGUAGES.find(l => l.code === currentLocale) || LANGUAGES[0]

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-[200px] w-full rounded-2xl bg-white/5" />
                <Skeleton className="h-[300px] w-full rounded-2xl bg-white/5" />
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-24">
            {/* App Experience Card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0f0f1a]/80 backdrop-blur-xl border border-[#6c63ff]/12 rounded-2xl p-6 md:p-8">
                <h3 className="text-xl font-heading font-bold text-white mb-6">App Experience</h3>

                <div className="space-y-8">
                    {/* Language Selector */}
                    <div>
                        <label className="text-zinc-400 text-sm font-medium mb-2 block">App Language</label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white h-12">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{currentLangObj.flag}</span>
                                        <span>{currentLangObj.name}</span>
                                    </div>
                                    <span className="text-zinc-500 text-xs text-right">Change</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[300px] bg-[#0f0f1a] border-[#6c63ff]/20 text-white">
                                {LANGUAGES.map((lang) => (
                                    <DropdownMenuItem
                                        key={lang.code}
                                        onClick={() => changeLanguage(lang.code)}
                                        className={`cursor-pointer focus:bg-[#6c63ff]/20 focus:text-white flex items-center gap-3 py-3 ${currentLocale === lang.code ? "bg-[#6c63ff]/10 text-[#6c63ff]" : ""}`}
                                    >
                                        <span className="text-xl">{lang.flag}</span>
                                        <span className="font-medium">{lang.name}</span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <p className="text-xs text-zinc-500 mt-2">Note: Lesson content always stays in English.</p>
                    </div>

                    {/* Theme Toggle */}
                    <div>
                        <label className="text-zinc-400 text-sm font-medium mb-3 block">Theme</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setTheme("dark")}
                                className={`p-4 rounded-xl border flex items-center justify-center gap-3 transition-all ${theme === "dark"
                                    ? "border-[#6c63ff] bg-[#6c63ff]/10 text-white shadow-[0_0_15px_rgba(108,99,255,0.2)]"
                                    : "border-white/10 hover:bg-white/5 text-zinc-400"
                                    }`}
                            >
                                <Moon className="w-5 h-5" />
                                <span className="font-bold">Dark (Default)</span>
                            </button>
                            <button
                                onClick={() => setTheme("light")}
                                className={`p-4 rounded-xl border flex items-center justify-center gap-3 transition-all ${theme === "light"
                                    ? "border-[#6c63ff] bg-[#6c63ff]/10 text-white shadow-[0_0_15px_rgba(108,99,255,0.2)]"
                                    : "border-white/10 hover:bg-white/5 text-zinc-400"
                                    }`}
                            >
                                <Sun className="w-5 h-5" />
                                <span className="font-bold">Light</span>
                            </button>
                        </div>
                    </div>

                    {/* Reduce Motion */}
                    <div className="flex items-center justify-between border border-white/5 bg-white/5 p-4 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#ff6584]/10 flex items-center justify-center text-[#ff6584]">
                                <EyeOff className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-white">Reduce Animations</p>
                                <p className="text-xs text-zinc-400">Disable UI transitions for accessibility</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setReduceMotion(!reduceMotion)}
                            className={`w-12 h-6 rounded-full transition-colors relative ${reduceMotion ? "bg-[#ff6584]" : "bg-white/20"}`}
                        >
                            <motion.div animate={{ x: reduceMotion ? 24 : 2 }} className="w-5 h-5 bg-white rounded-full absolute top-[2px] shadow-sm" />
                        </button>
                    </div>
                </div>
            </motion.div>


            {/* Tutor & Learning Settings */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#0f0f1a]/80 backdrop-blur-xl border border-[#6c63ff]/12 rounded-2xl p-6 md:p-8">
                <h3 className="text-xl font-heading font-bold text-white mb-6">Learning Setup</h3>

                <div className="space-y-8">

                    {/* NOVA Voice */}
                    <div>
                        <label className="text-zinc-400 text-sm font-medium mb-2 block">NOVA&apos;s Voice</label>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <select
                                value={selectedVoiceURI}
                                onChange={(e) => setSelectedVoiceURI(e.target.value)}
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#6c63ff] appearance-none"
                            >
                                <option value="" disabled className="bg-[#0f0f1a]">Select a voice...</option>
                                {voices.map((v) => (
                                    <option key={v.voiceURI} value={v.voiceURI} className="bg-[#0f0f1a]">
                                        {v.name} ({v.lang})
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={previewVoice}
                                disabled={!selectedVoiceURI}
                                className="px-6 py-3 bg-[#6c63ff]/20 text-[#6c63ff] hover:bg-[#6c63ff]/30 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 border border-[#6c63ff]/30 shrink-0"
                            >
                                <Play className="w-4 h-4 fill-current" /> Preview
                            </button>
                        </div>
                        {voices.length === 0 && (
                            <p className="text-xs text-amber-400 mt-2 flex items-center gap-1"><Volume2 className="w-3 h-3" /> No English voices found on your device.</p>
                        )}
                    </div>

                    {/* Daily Reminder */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-[#4ecca3]/10 flex items-center justify-center text-[#4ecca3]">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-white">Daily Practice Reminder</p>
                                    <p className="text-xs text-zinc-400">Receive an email to keep your streak</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setReminderOn(!reminderOn)}
                                className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${reminderOn ? "bg-[#4ecca3]" : "bg-white/20"}`}
                            >
                                <motion.div animate={{ x: reminderOn ? 24 : 2 }} className="w-5 h-5 bg-white rounded-full absolute top-[2px] shadow-sm" />
                            </button>
                        </div>

                        <AnimatePresence>
                            {reminderOn && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                    <div className="pt-2">
                                        <input
                                            type="time"
                                            value={reminderTime}
                                            onChange={(e) => setReminderTime(e.target.value)}
                                            className="w-full sm:w-auto bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#4ecca3] appearance-none"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </motion.div>

            {/* Sticky Save Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#080810]/80 backdrop-blur-md border-t border-white/5 flex justify-center z-10 pointer-events-none">
                <div className="w-full max-w-4xl px-4 pointer-events-auto">
                    <button
                        onClick={() => updatePreferences.mutate()}
                        disabled={updatePreferences.isPending}
                        className="w-full py-4 bg-gradient-to-r from-[#6c63ff] to-[#ff6584] hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(108,99,255,0.3)] disabled:opacity-50 text-lg"
                    >
                        {updatePreferences.isPending ? "Saving..." : "Save Preferences"}
                    </button>
                </div>
            </div>
        </div>
    )
}
