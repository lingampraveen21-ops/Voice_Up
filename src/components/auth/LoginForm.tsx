"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { GradientButton } from "@/components/ui/GradientButton";
import { LogIn, Phone, Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";

const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [authMethod, setAuthMethod] = useState<"email" | "otp">("email");
    const router = useRouter();
    const supabase = createClient();
    const setGuest = useAuthStore((state) => state.setGuest);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        });

        setIsLoading(false);

        if (error) {
            toast.error(error.message);
        } else {
            router.push("/dashboard");
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });

        if (error) {
            toast.error(error.message);
            setIsLoading(false);
        }
    };

    const handleGuestLogin = () => {
        setGuest(true);
        toast.success("Continuing as Free Guest. Progress will not be saved permanently.");
        router.push("/learn/lesson-1");
    };

    return (
        <div className="w-full max-w-md">
            <div className="flex flex-col space-y-2 text-center mb-8">
                <h1 className="text-3xl font-bold font-heading text-white tracking-tight">
                    Welcome back
                </h1>
                <p className="text-muted-foreground text-sm">
                    Enter your details to sign in to your VoiceUp account 🎙️
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl py-2.5 transition-colors disabled:opacity-50"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                </button>
                <button
                    onClick={() => { setAuthMethod(authMethod === "otp" ? "email" : "otp"); form.reset(); }}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl py-2.5 transition-colors disabled:opacity-50"
                >
                    {authMethod === "otp" ? <Mail className="w-5 h-5 text-zinc-400" /> : <Phone className="w-5 h-5 text-zinc-400" />}
                    {authMethod === "otp" ? "Email" : "Phone"}
                </button>
            </div>

            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#080810] px-2 text-muted-foreground">
                        Or continue with
                    </span>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.form
                    key={authMethod}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    {authMethod === "email" ? (
                        <>
                            <div className="space-y-1 relative">
                                <label className="text-sm font-medium text-zinc-300 ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                    <input
                                        {...form.register("email")}
                                        disabled={isLoading}
                                        type="email"
                                        placeholder="praveen@example.com"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
                                    />
                                </div>
                                {form.formState.errors.email && (
                                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-error text-xs ml-1">
                                        {form.formState.errors.email.message}
                                    </motion.p>
                                )}
                            </div>

                            <div className="space-y-1 relative">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-sm font-medium text-zinc-300">Password</label>
                                    <Link href="/auth/reset-password" className="text-xs text-primary hover:text-primary/80 transition-colors">
                                        Forgot Password?
                                    </Link>
                                </div>
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
                                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-error text-xs ml-1">
                                        {form.formState.errors.password.message}
                                    </motion.p>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="space-y-1 relative text-center py-4 text-muted-foreground">
                            OTP Login is not yet wired to a live SMS provider. Please use Email for now!
                        </div>
                    )}

                    <GradientButton
                        type="submit"
                        disabled={isLoading || authMethod === "otp"}
                        className="w-full py-6 mt-4 rounded-xl text-base group relative overflow-hidden"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                            <span className="flex items-center justify-center gap-2">
                                Login to Account <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                    </GradientButton>
                </motion.form>
            </AnimatePresence>

            <div className="mt-6 text-center text-sm text-zinc-500 space-y-4">
                <p>
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">
                        Sign up free
                    </Link>
                </p>

                <p>
                    Want to try first?{" "}
                    <button onClick={handleGuestLogin} className="text-white hover:text-zinc-300 font-medium underline underline-offset-4 transition-colors">
                        Continue as Guest
                    </button>
                </p>
            </div>
        </div>
    );
}
