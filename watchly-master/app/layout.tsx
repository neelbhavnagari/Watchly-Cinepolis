import type { Metadata } from "next";
import "./globals.css";

import AuthProvider from "@/providers/AuthProvider";
import Navbar from "./ui/Navbar";
import ClickSpark from "@/components/ClickSpark";

export const metadata: Metadata = {
  title: "CineVault",
  description: "Never forget what to watch.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ClickSpark sparkColor="#ffffff"
            sparkSize={10}
            sparkRadius={15}
            sparkCount={8}
            duration={400}
          >
            <Navbar />
            {children}
          </ClickSpark>
        </AuthProvider>
      </body>
    </html>
  );
}