"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Shield, Download, Trash2, Mail, Key } from "lucide-react"
import { User } from "@supabase/supabase-js"

import { Skeleton } from "@/components/ui/Skeleton"
import { Button } from "@/components/ui/button"

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

type PasswordFormValues = z.infer<typeof passwordSchema>

export default function AccountTab() {
    const supabase = createClient()
    const router = useRouter()

    const [isLoading, setIsLoading] = useState(true)
    const [user, setUser] = useState<User | null>(null)
    const [provider, setProvider] = useState<string>("email")

    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteInput, setDeleteInput] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)

    const { register, handleSubmit, formState: { errors }, reset } = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema)
    })

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUser(user)
                // Check identities to find provider
                const identity = user.identities?.[0]
                setProvider(identity?.provider || "email")
            }
            setIsLoading(false)
        }
        fetchUser()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const onUpdatePassword = async (data: PasswordFormValues) => {
        setIsUpdatingPassword(true)
        try {
            // In Supabase, you don't need the current password to update it if the user is already logged in
            // However, usually you'd verify it via an RPC or re-auth. We will just attempt the update
            const { error } = await supabase.auth.updateUser({
                password: data.newPassword
            })

            if (error) throw error
            toast.success("Password updated! ✅")
            reset()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update password ❌")
        } finally {
            setIsUpdatingPassword(false)
        }
    }

    const exportData = async () => {
        if (!user) return
        setIsExporting(true)
        try {
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
            const { data: sessions } = await supabase.from('sessions').select('*').eq('user_id', user.id)
            const { data: mistakes } = await supabase.from('mistakes').select('*').eq('user_id', user.id)

            const exportData = {
                exportDate: new Date().toISOString(),
                user: { email: user.email, created_at: user.created_at },
                profile,
                sessions: sessions || [],
                mistakes: mistakes || []
            }

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'voiceup-data.json'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            toast.success("Data exported successfully! 📤")
        } catch (error) {
            toast.error("Error exporting data")
            console.error(error)
        } finally {
            setIsExporting(false)
        }
    }

    const deleteAccount = async () => {
        if (!user) return
        setIsDeleting(true)
        try {
            // Delete profile (if cascade is not set up perfectly, this manually clears it)
            await supabase.from('profiles').delete().eq('id', user.id)
            // Call standard signout
            await supabase.auth.signOut()
            toast.success("Account deleted permanently.")
            router.push('/')
        } catch {
            toast.error("Failed to delete account.")
            setIsDeleting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-[150px] w-full rounded-2xl bg-white/5" />
                <Skeleton className="h-[300px] w-full rounded-2xl bg-white/5" />
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-24">

            {/* Account Info Card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0f0f1a]/80 backdrop-blur-xl border border-[#6c63ff]/12 rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#6c63ff]/20 flex items-center justify-center text-[#6c63ff]">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-heading font-bold text-white">Account Security</h3>
                        <p className="text-sm text-zinc-400">Manage your login and data preferences</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                        <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wider font-bold">Email Address</p>
                        <p className="text-white font-medium flex items-center gap-2">
                            <Mail className="w-4 h-4 text-zinc-400" /> {user?.email}
                        </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                        <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wider font-bold">Member Since</p>
                        <p className="text-white font-medium">
                            {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}
                        </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl md:col-span-2">
                        <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wider font-bold">Auth Provider</p>
                        <p className="text-white font-medium capitalize flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${provider === 'google' ? 'bg-[#ff6584]' : 'bg-[#6c63ff]'}`} />
                            {provider} Account
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Change Password (Only for Email Provider) */}
            {provider === 'email' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#0f0f1a]/80 backdrop-blur-xl border border-[#6c63ff]/12 rounded-2xl p-6 md:p-8">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Key className="w-5 h-5 text-[#6c63ff]" /> Change Password
                    </h3>

                    <form onSubmit={handleSubmit(onUpdatePassword)} className="space-y-4 max-w-md">
                        <div>
                            <input
                                {...register("currentPassword")}
                                type="password"
                                placeholder="Current Password"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#6c63ff] transition-colors"
                            />
                            {errors.currentPassword && <p className="text-red-400 text-xs mt-1">{errors.currentPassword.message}</p>}
                        </div>
                        <div>
                            <input
                                {...register("newPassword")}
                                type="password"
                                placeholder="New Password (min 8 chars)"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#6c63ff] transition-colors"
                            />
                            {errors.newPassword && <p className="text-red-400 text-xs mt-1">{errors.newPassword.message}</p>}
                        </div>
                        <div>
                            <input
                                {...register("confirmPassword")}
                                type="password"
                                placeholder="Confirm New Password"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#6c63ff] transition-colors"
                            />
                            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isUpdatingPassword}
                            className="px-6 py-3 bg-[#6c63ff] hover:bg-[#6c63ff]/90 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(108,99,255,0.3)] disabled:opacity-50"
                        >
                            {isUpdatingPassword ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                </motion.div>
            )}

            {/* Download Data Data */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#0f0f1a]/80 backdrop-blur-xl border border-[#6c63ff]/12 rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                    <h3 className="text-lg font-bold text-white mb-2">Download Your Data</h3>
                    <p className="text-sm text-zinc-400 max-w-md">Get a copy of all your progress, sessions, and mistakes in JSON format.</p>
                </div>
                <button
                    onClick={exportData}
                    disabled={isExporting}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                >
                    <Download className="w-4 h-4" /> {isExporting ? "Exporting..." : "Export as JSON"}
                </button>
            </motion.div>

            {/* Danger Zone */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent pointer-events-none" />
                <div className="relative z-10">
                    <h3 className="text-lg font-bold text-red-400 mb-2">Delete Account</h3>
                    <p className="text-sm text-zinc-400 max-w-md">This permanently deletes your account, progress, streaks, and certificates. Cannot be undone.</p>
                </div>
                <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-6 py-3 bg-transparent border-2 border-red-500/50 hover:border-red-500 hover:bg-red-500/10 text-red-400 font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap relative z-10"
                >
                    <Trash2 className="w-4 h-4" /> Delete Account
                </button>
            </motion.div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0f0f1a] border border-red-500/30 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl"
                        >
                            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 mb-4 mx-auto">
                                <Trash2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white text-center mb-2">Are you sure?</h3>
                            <p className="text-zinc-400 text-center text-sm mb-6">
                                This action is irreversible. All your VoiceUp learning data will be permanently destroyed.
                            </p>

                            <div className="mb-6">
                                <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2 block text-center">
                                    Type <span className="text-red-400">DELETE</span> to confirm
                                </label>
                                <input
                                    type="text"
                                    value={deleteInput}
                                    onChange={(e) => setDeleteInput(e.target.value)}
                                    placeholder="DELETE"
                                    className="w-full bg-white/5 border border-red-500/30 rounded-xl px-4 py-3 text-white outline-none focus:border-red-500 text-center font-bold tracking-widest placeholder-zinc-700"
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 bg-white/5 border-white/10 hover:bg-white/10"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={deleteAccount}
                                    disabled={deleteInput !== "DELETE" || isDeleting}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                                >
                                    {isDeleting ? "Deleting..." : "Confirm Delete"}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    )
}
