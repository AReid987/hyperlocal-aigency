import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "The Void Reactor | Hyperlocal.Aigency",
    template: "%s | The Void Reactor",
  },
  description: "Navigate the digital void. Autonomous infrastructure discovery, real-time verification, and AI-powered system mapping at the edge of what's possible.",
  keywords: ["AI infrastructure", "autonomous systems", "infrastructure discovery", "network scanning", "cybersecurity"],
  authors: [{ name: "Hyperlocal.Aigency" }],
  creator: "Hyperlocal.Aigency",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "The Void Reactor | Hyperlocal.Aigency",
    description: "Navigate the digital void. Autonomous infrastructure discovery, real-time verification, and AI-powered system mapping.",
    type: "website",
    locale: "en_US",
    siteName: "The Void Reactor",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Void Reactor | Hyperlocal.Aigency",
    description: "Navigate the digital void. Autonomous infrastructure discovery at the edge of what's possible.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jetbrainsMono.variable} ${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
