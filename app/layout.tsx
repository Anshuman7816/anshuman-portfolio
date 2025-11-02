import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Code Review System",
  description: "AI-powered code review system for analyzing bugs, security, performance, and code quality",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
