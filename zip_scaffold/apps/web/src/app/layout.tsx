import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DMF Music Platform",
  description: "Distribute, monetize, and manage your music with AI-powered tools",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-dmf-primary text-white">
        {children}
      </body>
    </html>
  );
}
