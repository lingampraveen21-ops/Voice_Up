"use client"

import { useEffect, useState } from 'react'
import { Award, CheckCircle2, Copy, Download, Linkedin, Loader2, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

interface CertificateData {
    created_at: string;
    score: number;
    profiles: {
        full_name: string;
        cefr_level: string;
    };
}

export default function CertificateVerificationPage({ params }: { params: { uuid: string } }) {
    const supabase = createClient()
    const [certData, setCertData] = useState<CertificateData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        const fetchCert = async () => {
            // For this phase demo, assuming the UUID is a session_id of a passed level_up test
            const { data, error } = await supabase
                .from('sessions')
                .select('*, profiles(full_name, cefr_level)')
                .eq('id', params.uuid)
                .eq('type', 'test_levelup')
                .gte('score', 85)
                .single()

            if (error || !data) {
                setError(true)
            } else {
                setCertData(data)
                setTimeout(() => confetti({ particleCount: 150, zIndex: 100 }), 500)
            }
            setLoading(false)
        }

        fetchCert()
    }, [params.uuid, supabase])

    const handleCopy = () => {
        navigator.clipboard.writeText(window.location.href)
        toast.success("Validation link copied!")
    }

    if (loading) return (
        <div className="min-h-screen bg-[#080810] flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
    )

    if (error || !certData) return (
        <div className="min-h-screen bg-[#080810] text-center flex flex-col items-center justify-center p-4">
            <ShieldCheck className="w-20 h-20 text-zinc-700 mb-6" />
            <h1 className="text-3xl font-bold text-white mb-2">Invalid Certificate</h1>
            <p className="text-zinc-400">This certificate ID does not exist or did not pass the requirement.</p>
        </div>
    )

    const date = new Date(certData.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    return (
        <div className="min-h-screen bg-[#080810] flex flex-col items-center p-4 md:p-12 font-sans">
            <div className="max-w-4xl w-full mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Award className="w-8 h-8 text-primary" />
                    <span className="text-xl font-bold text-white tracking-widest">VOICEUP</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-full text-sm font-bold border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" /> Verified Credential
                </div>
            </div>

            {/* Certificate Canvas */}
            <div id="certificate-print" className="w-full max-w-4xl bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-2xl md:rounded-[40px] p-8 md:p-20 relative overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.1)] group">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 blur-[100px] pointer-events-none" />

                <div className="relative z-10 text-center flex flex-col items-center">
                    <p className="text-primary font-bold uppercase tracking-[0.3em] mb-4">Certificate of Achievement</p>
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-10 leading-tight">
                        English Proficiency <br className="hidden md:block" /> Level-Up
                    </h2>

                    <p className="text-zinc-400 text-lg mb-4">This certifies that</p>
                    <h3 className="text-4xl font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-white mb-10 border-b border-white/10 pb-4 inline-block px-8">
                        {certData.profiles?.full_name || 'VoiceUp Scholar'}
                    </h3>

                    <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-16 leading-relaxed">
                        has successfully passed the comprehensive assessment and demonstrated fluency aligning with the <strong className="text-white">CEFR {certData.profiles?.cefr_level || 'B2'}</strong> framework, achieving a passing score of <strong className="text-emerald-400">{certData.score}%</strong>.
                    </p>

                    <div className="w-full flex justify-between items-end border-t border-white/10 pt-8 mt-12 text-left">
                        <div>
                            <p className="text-white font-bold text-lg mb-1">NOVA AI Supervisor</p>
                            <p className="text-zinc-500 text-xs uppercase tracking-widest">Lead Assessor</p>
                        </div>
                        <div className="text-right">
                            <p className="text-white font-bold text-lg mb-1">{date}</p>
                            <p className="text-zinc-500 text-xs uppercase tracking-widest">Date Issued</p>
                            <p className="text-[10px] text-zinc-600 mt-2 font-mono">ID: {params.uuid}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="max-w-4xl w-full mt-8 flex flex-wrap gap-4 justify-center print:hidden">
                <button
                    onClick={() => window.print()}
                    className="flex-1 md:flex-none px-6 py-4 bg-white hover:bg-zinc-200 text-black font-bold flex items-center justify-center gap-2 rounded-xl transition-colors"
                >
                    <Download className="w-5 h-5" /> Download PDF
                </button>
                <button
                    onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                    className="flex-1 md:flex-none px-6 py-4 bg-[#0a66c2] hover:bg-[#004182] text-white font-bold flex items-center justify-center gap-2 rounded-xl transition-colors"
                >
                    <Linkedin className="w-5 h-5 fill-current" /> Share to LinkedIn
                </button>
                <div className="w-full md:w-auto flex bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden p-1">
                    <input
                        type="text"
                        readOnly
                        value={window.location.href}
                        className="bg-transparent border-none text-zinc-400 text-sm px-4 focus:outline-none w-full md:w-64 font-mono"
                    />
                    <button
                        onClick={handleCopy}
                        className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        <Copy className="w-4 h-4" /> Copy Link
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .print\\:hidden { display: none !important; }
                    #certificate-print { border: 12px solid #a855f7 !important; border-radius: 0 !important; background: white !important; padding: 60px !important; }
                    #certificate-print * { color: black !important; }
                }
            `}} />
        </div>
    )
}
