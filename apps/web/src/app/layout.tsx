import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Create your account | DataForge",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-ambient font-sans text-slate-900 antialiased">{children}</body>
    </html>
  );
}
