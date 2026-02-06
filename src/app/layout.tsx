import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
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
  title: "MuchLove — Much love. Shared effortlessly.",
  description: "Turn your happiest customers into video testimonials that publish automatically on Trustpilot, Google Reviews, and LinkedIn — in under 3 minutes.",
  keywords: ["video testimonials", "customer reviews", "social proof", "B2B", "trustpilot", "google reviews"],
  openGraph: {
    title: "MuchLove — Much love. Shared effortlessly.",
    description: "Turn your happiest customers into video testimonials that publish automatically on Trustpilot, Google Reviews, and LinkedIn.",
    url: "https://muchlove.vercel.app",
    siteName: "MuchLove",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "MuchLove — Much love. Shared effortlessly.",
    description: "Collect and share genuine video testimonials in under 3 minutes.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://muchlove.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
