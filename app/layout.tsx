// app/layout.tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";  // ← this now resolves after install
import "./globals.css";
import { cn } from "@/lib/utils"; // assuming shadcn created this

export const metadata: Metadata = {
  title: "Paws Forever – In Loving Memory",
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
        GeistSans.variable,          // ← apply variable font
        "min-h-screen bg-gradient-to-b from-slate-50 to-white antialiased"
      )}>
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}