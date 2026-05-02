import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DevIntel | AI-Powered Tech Career Mentorship",
    template: "%s | DevIntel"
  },
  description: "DevIntel uses advanced AI to analyze your code, optimize your resume for ATS, and create personalized learning roadmaps to accelerate your software engineering career.",
  keywords: ["AI mentor", "code analysis", "resume optimizer", "ATS score", "developer roadmap", "career growth", "software engineering"],
  authors: [{ name: "DevIntel Team" }],
  creator: "DevIntel",
  publisher: "DevIntel",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "DevIntel | Elevate Your Coding Career",
    description: "Personalized AI mentorship, code analysis, and career growth for developers.",
    url: "https://devintel.ai",
    siteName: "DevIntel",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DevIntel AI Mentorship",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevIntel | AI-Powered Career Growth",
    description: "Scale your coding career with AI code reviews and resume optimization.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </body>
    </html>
  );
}
