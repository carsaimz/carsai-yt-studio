import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Carsai YT Studio — Plataforma para Criadores YouTube com IA",
  description:
    "Analytics avançada, SEO, comunidade, automação, YouTube Data API v3 completa e agentes de IA multi-provedor para o seu canal. Web, Android, iOS e Desktop. Open-source (MIT) e local-first.",
  keywords: ["YouTube", "Studio", "Analytics", "SEO", "IA", "Creators", "Automation", "PWA", "Open Source"],
  authors: [{ name: "Carsai" }],
  applicationName: "Carsai YT Studio",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Carsai YT Studio",
    description: "O estúdio open-source e local-first para criadores YouTube.",
    url: "https://carsaiytstudio.vercel.app",
    siteName: "Carsai YT Studio",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0d12",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
