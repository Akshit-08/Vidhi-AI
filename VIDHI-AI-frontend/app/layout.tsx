import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VIDHI AI - Courtroom Intelligence",
  description: "Multi-Agent RAG-Based Courtroom Analysis and Judicial Assessment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}
