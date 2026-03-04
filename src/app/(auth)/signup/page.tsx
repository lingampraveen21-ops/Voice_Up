import { GlassCard } from "@/components/ui/GlassCard";
import { SignUpForm } from "@/components/auth/SignUpForm";

export default function SignupPage() {
    return (
        <div className="flex min-h-[calc(100vh-80px)] w-full items-center justify-center p-4">
            <GlassCard className="w-full max-w-md p-8 pt-10 border-white/10 bg-[#0f0f1a]/60 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
                {/* Decorative blobs inside exactly for the auth page */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-br from-primary/20 to-transparent -z-10 blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-secondary/20 to-transparent -z-10 blur-[100px] pointer-events-none" />

                <SignUpForm />
            </GlassCard>
        </div>
    );
}
