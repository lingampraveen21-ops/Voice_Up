import { GlassCard } from "@/components/ui/GlassCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
    return (
        <div className="flex min-h-[calc(100vh-80px)] w-full items-center justify-center p-4">
            <GlassCard className="w-full max-w-md p-8 pt-10 border-white/10 bg-[#0f0f1a]/60 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-l from-primary/10 to-transparent -z-10 blur-[80px] pointer-events-none" />
                <ResetPasswordForm />
            </GlassCard>
        </div>
    );
}
