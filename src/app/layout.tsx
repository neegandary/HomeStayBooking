import type { Metadata, Viewport } from "next";
import { Manrope, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#19192e",
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
    <html lang="en" className="light">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${manrope.variable} ${geistMono.variable} font-sans antialiased min-h-screen flex flex-col bg-background-light text-foreground`}
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