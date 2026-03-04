import { ArrowLeft } from 'lucide-react';
import { Link } from '@/navigation';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#080810] text-white py-20 px-4">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-12 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                <h1 className="text-4xl font-bold font-heading mb-8">Terms of Service</h1>

                <div className="space-y-8 text-zinc-400 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using VoiceUp, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">2. Description of Service</h2>
                        <p>
                            VoiceUp provides AI-powered language learning tools, including voice conversation practice, lessons, and assessment tests. We reserve the right to modify or discontinue any aspect of the service at any time.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">3. User Accounts</h2>
                        <p>
                            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must be at least 13 years old to use the platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">4. Acceptable Use</h2>
                        <p>
                            You agree not to use VoiceUp for any unlawful purpose or to distribute harmful content. Abuse of the AI system or attempts to reverse-engineer the platform are strictly prohibited.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">5. Limitation of Liability</h2>
                        <p>
                            VoiceUp is provided &quot;as is&quot; without warranties of any kind. We are not liable for any damages arising from your use of the platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">6. Changes to Terms</h2>
                        <p>
                            We may update these terms from time to time. Your continued use of the platform after changes are posted constitutes acceptance of the new terms.
                        </p>
                    </section>
                </div>

                <div className="mt-20 pt-8 border-t border-white/10 text-sm text-zinc-500">
                    Last updated: March 2026
                </div>
            </div>
        </div>
    );
}
