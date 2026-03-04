import { GlassCard } from "@/components/ui/GlassCard";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
    return (
        <div className="flex min-h-[calc(100vh-80px)] w-full items-center justify-center p-4">
            <GlassCard className="w-full max-w-md p-8 pt-10 border-white/10 bg-[#0f0f1a]/60 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
                {/* Decorative blobs inside exactly for the auth page */}
                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary/20 to-transparent -z-10 blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-secondary/20 to-transparent -z-10 blur-[100px] pointer-events-none" />

                <LoginForm />
            </GlassCard>
        </div>
    );
}
