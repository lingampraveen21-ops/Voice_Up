"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Edit2, Upload, CalendarIcon, X } from "lucide-react"
import Image from "next/image"

import { Skeleton } from "@/components/ui/Skeleton"
import { Calendar } from "@/components/ui/Calendar"

const profileSchema = z.object({
    full_name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters"),
    daily_goal_minutes: z.number().int(),
    interview_date: z.string().nullable()
})

type ProfileFormValues = z.infer<typeof profileSchema>

const DAILY_GOALS = [
    { value: 10, label: "10 min", icon: "⚡" },
    { value: 20, label: "20 min", icon: "🔥" },
    { value: 30, label: "30 min", icon: "💪" },
    { value: 60, label: "1 hour", icon: "🚀" }
]

export default function ProfileTab() {
    const supabase = createClient()
    const queryClient = useQueryClient()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [email, setEmail] = useState("")
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    const [cefrLevel, setCefrLevel] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [showCalendar, setShowCalendar] = useState(false)

    const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: { full_name: "", daily_goal_minutes: 10, interview_date: null }
    })

    const formDailyGoal = watch("daily_goal_minutes")
    const formInterviewDate = watch("interview_date")

    const { data: profile, isLoading } = useQuery({
        queryKey: ["profile"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("No user found")

            setEmail(user.email || "")

            const { data, error } = await supabase
                .from("profiles")
                .select("full_name, avatar_url, cefr_level, daily_goal_minutes, interview_date")
                .eq("id", user.id)
                .single()

            // Profile exists — return it
            if (data) return { id: user.id, ...data }

            // No profile row yet (PGRST116) — auto-create from auth metadata
            if (error && error.code === "PGRST116") {
                const newProfile = {
                    id: user.id,
                    full_name: user.user_metadata?.full_name || user.user_metadata?.name || "",
                    avatar_url: user.user_metadata?.avatar_url || null,
                    daily_goal_minutes: 10,
                    interview_date: null,
                    cefr_level: null,
                }
                const { data: created, error: upsertErr } = await supabase
                    .from("profiles")
                    .upsert(newProfile)
                    .select("full_name, avatar_url, cefr_level, daily_goal_minutes, interview_date")
                    .single()

                if (upsertErr) throw upsertErr
                return { id: user.id, ...(created || newProfile) }
            }

            if (error) throw error
            return { id: user.id }
        }
    })

    useEffect(() => {
        if (profile) {
            reset({
                full_name: profile.full_name || "",
                daily_goal_minutes: profile.daily_goal_minutes || 10,
                interview_date: profile.interview_date || null
            })
            setAvatarUrl(profile.avatar_url || null)
            setCefrLevel(profile.cefr_level || null)
        }
    }, [profile, reset])

    const updateProfileMutation = useMutation({
        mutationFn: async (values: ProfileFormValues) => {
            if (!profile?.id) throw new Error("Missing user profile")
            const { error } = await supabase
                .from("profiles")
                .upsert({
                    id: profile.id,
                    full_name: values.full_name,
                    daily_goal_minutes: values.daily_goal_minutes,
                    interview_date: values.interview_date
                })

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] })
            toast.success("Profile updated! ✅")
        },
        onError: (error) => {
            toast.error("Something went wrong. Try again ❌")
            console.error(error)
        }
    })

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) return
            const file = event.target.files[0]
            const fileExt = file.name.split('.').pop()
            const filePath = `${profile?.id}-${Math.random()}.${fileExt}`

            setIsUploading(true)

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile?.id)

            setAvatarUrl(publicUrl)
            queryClient.invalidateQueries({ queryKey: ["profile"] })
            toast.success("Avatar updated!")
        } catch (error) {
            toast.error("Error uploading avatar. Please make sure the 'avatars' storage bucket exists.")
            console.error(error)
        } finally {
            setIsUploading(false)
        }
    }

    const onSubmit = (values: ProfileFormValues) => {
        updateProfileMutation.mutate(values)
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-[200px] w-full rounded-2xl bg-white/5" />
                <Skeleton className="h-[300px] w-full rounded-2xl bg-white/5" />
            </div>
        )
    }

    let remainingDaysStr = ""
    if (formInterviewDate) {
        // Only calculate using UTC to avoid timezone shifts
        const targetDate = new Date(formInterviewDate)
        const today = new Date()
        const diffTime = targetDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        remainingDaysStr = diffDays > 0 ? `Interview in ${diffDays} days` : diffDays === 0 ? "Interview is today!" : "Interview has passed"
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-24">

            {/* Avatar & Basic Info Card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0f0f1a]/80 backdrop-blur-xl border border-[#6c63ff]/12 rounded-2xl p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">

                    <div className="relative group mx-auto md:mx-0">
                        <div className="w-20 h-20 rounded-full bg-[#6c63ff]/20 border border-[#6c63ff]/30 overflow-hidden flex items-center justify-center text-[#6c63ff] font-bold text-2xl shadow-[0_0_20px_rgba(108,99,255,0.2)]">
                            {avatarUrl ? (
                                <Image src={avatarUrl} alt="Avatar" width={80} height={80} className="w-full h-full object-cover" />
                            ) : (
                                profile?.full_name?.charAt(0).toUpperCase() || "?"
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-sm cursor-pointer"
                        >
                            {isUploading ? <Upload className="w-6 h-6 animate-bounce" /> : <Edit2 className="w-6 h-6" />}
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
                    </div>

                    <div className="flex-1 space-y-4 w-full">
                        <div>
                            <label className="text-zinc-400 text-sm font-medium mb-1.5 block">Full Name</label>
                            <input
                                {...register("full_name")}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 outline-none focus:border-[#6c63ff] transition-colors"
                                placeholder="Enter your name"
                            />
                            {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name.message}</p>}
                        </div>

                        <div>
                            <label className="text-zinc-400 text-sm font-medium mb-1.5 block">Email Address <span className="text-xs opacity-50">(Read-Only)</span></label>
                            <input
                                value={email}
                                disabled
                                readOnly
                                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-zinc-500 outline-none cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="text-zinc-400 text-sm font-medium mb-1.5 block">CEFR Level</label>
                            <div className="inline-flex items-center px-4 py-2 rounded-lg bg-[#6c63ff]/10 border border-[#6c63ff]/20 text-[#6c63ff] font-medium text-sm">
                                {cefrLevel ? `${cefrLevel} Level` : "Not Assessed Yet"}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Target & Routine Card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#0f0f1a]/80 backdrop-blur-xl border border-[#6c63ff]/12 rounded-2xl p-6 md:p-8">

                <div className="mb-8">
                    <h3 className="text-lg font-bold text-white mb-4">Daily Goal</h3>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
                        {DAILY_GOALS.map((goal) => {
                            const isSelected = formDailyGoal === goal.value
                            return (
                                <button
                                    key={goal.value}
                                    type="button"
                                    onClick={() => setValue("daily_goal_minutes", goal.value, { shouldDirty: true })}
                                    className={`min-w-[100px] p-4 rounded-xl border flex flex-col items-center gap-2 transition-all snap-center shrink-0 ${isSelected
                                        ? "border-[#6c63ff] bg-[#6c63ff]/20 text-white shadow-[0_0_15px_rgba(108,99,255,0.2)]"
                                        : "border-white/10 hover:bg-white/5 hover:border-white/20 text-zinc-400"
                                        }`}
                                >
                                    <span className="text-xl">{goal.icon}</span>
                                    <span className="font-bold text-sm">{goal.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-end mb-4">
                        <h3 className="text-lg font-bold text-white">Target Interview Date</h3>
                        {formInterviewDate && (
                            <button type="button" onClick={() => setValue("interview_date", null, { shouldDirty: true })} className="text-sm text-zinc-400 hover:text-red-400 transition-colors flex items-center gap-1">
                                <X className="w-3 h-3" /> Clear
                            </button>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowCalendar(!showCalendar)}
                            className="w-full md:w-auto bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white flex items-center justify-between gap-4 hover:border-[#6c63ff]/50 transition-colors focus:outline-none"
                        >
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-[#6c63ff]" />
                                <span>{formInterviewDate ? new Date(formInterviewDate).toLocaleDateString() : "Select Date"}</span>
                            </div>
                        </button>

                        <AnimatePresence>
                            {showCalendar && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute z-50 top-14 left-0"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={formInterviewDate ? new Date(formInterviewDate) : undefined}
                                        onSelect={(date) => {
                                            // Fix timezone issues by preserving local date intent
                                            if (!date) {
                                                setValue("interview_date", null, { shouldDirty: true })
                                            } else {
                                                const offset = date.getTimezoneOffset()
                                                const adjDate = new Date(date.getTime() - (offset * 60 * 1000))
                                                setValue("interview_date", adjDate.toISOString().split('T')[0], { shouldDirty: true })
                                            }
                                            setShowCalendar(false)
                                        }}
                                        className="rounded-xl border border-white/10 bg-[#0f0f1a] shadow-[0_0_40px_rgba(0,0,0,0.5)]"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <p className="mt-3 text-sm font-medium text-[#4ecca3]">
                        {formInterviewDate ? remainingDaysStr : "No interview date set"}
                    </p>
                </div>

            </motion.div>


            <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#080810]/80 backdrop-blur-md border-t border-white/5 flex justify-center z-10 pointer-events-none">
                <div className="w-full max-w-4xl px-4 pointer-events-auto">
                    <button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="w-full py-4 bg-gradient-to-r from-[#6c63ff] to-[#ff6584] hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(108,99,255,0.3)] disabled:opacity-50 text-lg"
                    >
                        {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
                    </button>
                </div>
            </div>

        </form>
    )
}
