import QueryProvider from "@/components/providers/QueryProvider";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { Toaster } from "@/components/ui/sonner";
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { AuthInitializer } from "@/components/auth/AuthInitializer";
import { GuestSignupModal } from "@/components/auth/GuestSignupModal";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { FeedbackWidget } from "@/components/shared/FeedbackWidget";
import { NPSSurvey } from "@/components/shared/NPSSurvey";
import { BugReporter } from "@/components/shared/BugReporter";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
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
  title: {
    default: "VoiceUp - AI-Powered English for Tech Professionals",
    template: "%s | VoiceUp"
  },
  description: "Stop letting language barriers hold back your engineering potential. Practice with NOVA, your AI English tutor.",
  metadataBase: new URL("https://voiceup.ai"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://voiceup.ai",
    siteName: "VoiceUp",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VoiceUp - Speak with Confidence"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "VoiceUp - AI-Powered English",
    description: "Speak your way into your dream job with AI-powered conversation practice.",
    images: ["/og-image.png"]
  }
};

export const viewport = {
  themeColor: "#080810",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className={`${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <SmoothScrollProvider>
              <QueryProvider>
                <AuthInitializer />
                {children}
                <GuestSignupModal />
                <FeedbackWidget />
                <NPSSurvey />
                <BugReporter />
                <Toaster />
              </QueryProvider>
            </SmoothScrollProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
