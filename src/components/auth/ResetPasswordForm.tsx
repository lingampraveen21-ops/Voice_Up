"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GradientButton } from "@/components/ui/GradientButton";
import { Lock, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

const resetPasswordSchema = z.object({
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { password: "", confirmPassword: "" },
    });

    const onSubmit = async (data: ResetPasswordFormValues) => {
        setIsLoading(true);

        const { error } = await supabase.auth.updateUser({
            password: data.password,
        });

        setIsLoading(false);

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Password updated successfully!");
            router.push("/dashboard");
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="flex flex-col space-y-2 text-center mb-8">
                <h1 className="text-3xl font-bold font-heading text-white tracking-tight">
                    Reset Password
                </h1>
                <p className="text-muted-foreground text-sm">
                    Enter your new password below.
                </p>
            </div>

            <AnimatePresence>
                <motion.form
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <div className="space-y-1 relative">
                        <label className="text-sm font-medium text-zinc-300 ml-1">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                            <input
                                {...form.register("password")}
                                disabled={isLoading}
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
                            />
                        </div>
                        {form.formState.errors.password && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-error text-xs ml-1">
                                {form.formState.errors.password.message}
                            </motion.p>
                        )}
                    </div>

                    <div className="space-y-1 relative">
                        <label className="text-sm font-medium text-zinc-300 ml-1">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                            <input
                                {...form.register("confirmPassword")}
                                disabled={isLoading}
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
                            />
                        </div>
                        {form.formState.errors.confirmPassword && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-error text-xs ml-1">
                                {form.formState.errors.confirmPassword.message}
                            </motion.p>
                        )}
                    </div>

                    <GradientButton
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-6 mt-4 rounded-xl text-base group relative overflow-hidden"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Update Password"}
                        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                    </GradientButton>
                </motion.form>
            </AnimatePresence>

            <div className="mt-6 text-center text-sm text-zinc-500">
                <Link href="/login" className="flex items-center justify-center gap-2 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>
            </div>
        </div>
    );
}
