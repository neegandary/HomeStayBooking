import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a1a2e",
};

export const metadata: Metadata = {
  title: {
    default: "StayEasy - Homestay Booking",
    template: "%s | StayEasy",
  },
  description: "Book unique homestays and experience local hospitality. Find your perfect stay with StayEasy.",
  keywords: ["homestay", "booking", "travel", "accommodation", "vacation rental"],
  authors: [{ name: "StayEasy Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "StayEasy",
    title: "StayEasy - Homestay Booking",
    description: "Book unique homestays and experience local hospitality.",
  },
  robots: {
    index: true,
    follow: true,
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}