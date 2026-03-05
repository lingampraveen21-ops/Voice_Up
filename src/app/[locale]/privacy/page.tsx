import { ArrowLeft } from 'lucide-react';
import { Link } from '@/navigation';

export default function PrivacyPage() {

    return (
        <div className="min-h-screen bg-[#080810] text-white py-20 px-4">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-12 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                <h1 className="text-4xl font-bold font-heading mb-8">Privacy Policy</h1>

                <div className="space-y-8 text-zinc-400 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">1. Data Collection</h2>
                        <p>
                            VoiceUp collects minimal personal data necessary to provide our language learning services. This includes your email address for account management and your learning goals and progress to personalize your experience.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">2. Voice Data Handling</h2>
                        <p>
                            Your voice recordings are processed in real-time by artificial intelligence to provide feedback on pronunciation and fluency. Voice data is processed transiently and is <strong>not stored permanently</strong> on our servers. Once the analysis is complete, the raw audio is discarded.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">3. Data Usage</h2>
                        <p>
                            We use your data strictly to:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-2">
                            <li>Track your learning progress and streaks.</li>
                            <li>Generate personalized lesson recommendations (NOVA Suggestions).</li>
                            <li>Analyze platform performance and improve our AI models.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">4. Your Rights</h2>
                        <p>
                            You have the right to access, export, or delete your personal data at any time through your profile settings. If you choose to delete your account, all associated data will be permanently removed from our systems.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">5. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at <span className="text-primary hover:underline cursor-pointer">privacy@voiceup.ai</span>.
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
