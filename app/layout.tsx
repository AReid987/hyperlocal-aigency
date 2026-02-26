import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';
import { reportWebVitals } from '@/lib/vitals';
import { initErrorTracking } from '@/lib/errorTracking';
import PerformanceMonitor from '@/components/dev/PerformanceMonitor';

// Initialize error tracking on app start
initErrorTracking();

// Report Web Vitals
if (typeof window !== 'undefined') {
  onCLS(reportWebVitals);
  onINP(reportWebVitals);
  onFCP(reportWebVitals);
  onLCP(reportWebVitals);
  onTTFB(reportWebVitals);
}

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
  keywords: [
    "AI infrastructure",
    "autonomous systems",
    "infrastructure discovery",
    "network scanning",
    "cybersecurity",
    "WebGL",
    "3D visualization",
    "React Three Fiber"
  ],
  authors: [{ name: "Hyperlocal.Aigency", url: "https://hyperlocal.aigency" }],
  creator: "Hyperlocal.Aigency",
  publisher: "Hyperlocal.Aigency",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "The Void Reactor | Hyperlocal.Aigency",
    description: "Navigate the digital void. Autonomous infrastructure discovery, real-time verification, and AI-powered system mapping.",
    type: "website",
    locale: "en_US",
    siteName: "The Void Reactor",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "The Void Reactor - Navigate the Digital Void",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Void Reactor | Hyperlocal.Aigency",
    description: "Navigate the digital void. Autonomous infrastructure discovery at the edge of what's possible.",
    images: ["/og-image.png"],
    creator: "@hyperlocal_ai",
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
  verification: {
    // Add your verification codes here
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// JSON-LD Structured Data
function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "The Void Reactor",
    "description": "Navigate the digital void. Autonomous infrastructure discovery, real-time verification, and AI-powered system mapping.",
    "url": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    "author": {
      "@type": "Organization",
      "name": "Hyperlocal.Aigency",
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": process.env.NEXT_PUBLIC_APP_URL
          ? `${process.env.NEXT_PUBLIC_APP_URL}?q={search_term_string}`
          : "http://localhost:3000?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <StructuredData />
      </head>
      <body
        className={`${jetbrainsMono.variable} ${inter.variable} antialiased`}
      >
        {children}
        <PerformanceMonitor />
      </body>
    </html>
  );
}
