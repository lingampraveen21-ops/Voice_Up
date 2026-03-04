import Link from "next/link";
import { Github, Linkedin, Twitter } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-background border-t border-white/5 pt-16 pb-8">
            <div className="container mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">🎙️</span>
                            <span className="text-2xl font-bold font-heading text-white">VoiceUp</span>
                        </Link>
                        <p className="text-muted-foreground max-w-sm">
                            The AI-powered, voice-first English learning platform designed to help you speak with confidence and land your dream job.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h4 className="font-heading font-bold text-white mb-2">Platform</h4>
                        <Link href="#features" className="text-muted-foreground hover:text-white transition-colors text-sm">Features</Link>
                        <Link href="#how-it-works" className="text-muted-foreground hover:text-white transition-colors text-sm">How it Works</Link>
                        <Link href="#teams" className="text-muted-foreground hover:text-white transition-colors text-sm">For Teams</Link>
                        <Link href="/login" className="text-muted-foreground hover:text-white transition-colors text-sm">Login</Link>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h4 className="font-heading font-bold text-white mb-2">Legal</h4>
                        <Link href="#" className="text-muted-foreground hover:text-white transition-colors text-sm">About Us</Link>
                        <Link href="#" className="text-muted-foreground hover:text-white transition-colors text-sm">Contact</Link>
                        <Link href="#" className="text-muted-foreground hover:text-white transition-colors text-sm">Privacy Policy</Link>
                        <Link href="#" className="text-muted-foreground hover:text-white transition-colors text-sm">Terms of Service</Link>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 text-sm text-muted-foreground gap-4 text-center md:text-left">
                    <p>Made with ❤️ for learners everywhere.</p>
                    <div className="flex items-center gap-4">
                        <a href="#" className="hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
                        <a href="#" className="hover:text-white transition-colors"><Linkedin className="h-5 w-5" /></a>
                        <a href="#" className="hover:text-white transition-colors"><Github className="h-5 w-5" /></a>
                    </div>
                    <p>© {new Date().getFullYear()} VoiceUp Inc. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
