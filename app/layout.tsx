// app/layout.tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Paws Forever – Forever Wagging Tails",
  description: "A tribute to the dogs who filled our lives with joy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        GeistSans.variable,
        "min-h-screen antialiased"
      )}>
        <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"     // respects OS preference
          enableSystem
          disableTransitionOnChange // smoother toggles
        >
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}