import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VeloCast - Your Cycling Weather Companion",
  description:
    "VeloCast scores the weather for your next bike ride. Get an hourly ride score, see the best ride window of the day, and see a full breakdown of what's affecting your score — all based on your local forecast.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("font-sans", inter.variable)}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const ua = navigator.userAgent.toLowerCase();
                const platform = navigator.platform.toLowerCase();
                const html = document.documentElement;
                if (platform.includes('mac') || ua.includes('mac')) {
                  html.classList.add('os-macos');
                } else if (platform.includes('win') || ua.includes('win')) {
                  html.classList.add('os-windows');
                } else if (ua.includes('android')) {
                  html.classList.add('os-android');
                } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
                  html.classList.add('os-ios');
                } else {
                  html.classList.add('os-other');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      >
        {children}
        <footer className="py-6 text-muted-foreground text-xs text-center">
          © {new Date().getFullYear()} Tomke Blach. All rights reserved.
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
