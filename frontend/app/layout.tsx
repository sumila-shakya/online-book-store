import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "../lib/providers/providers";
import { Navbar } from "../components/navigation/navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Online Book Store",
  description: "Buy and sell books easily with secure authentication and phone verification",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans">
        <AppProviders>
          <Navbar />
          <div className="flex-1">{children}</div>
        </AppProviders>
      </body>
    </html>
  );
}
