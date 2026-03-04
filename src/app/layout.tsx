import QueryProvider from "@/components/providers/QueryProvider";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { Toaster } from "@/components/ui/sonner";
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { AuthInitializer } from "@/components/auth/AuthInitializer";
import { GuestSignupModal } from "@/components/auth/GuestSignupModal";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-heading",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-mono",
});

export const metadata = {
  title: "VoiceUp - AI English Learning Platform",
  description: "Master English with your AI Tutor NOVA.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans">
        <SmoothScrollProvider>
          <QueryProvider>
            <AuthInitializer />
            {children}
            <GuestSignupModal />
            <Toaster />
          </QueryProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
