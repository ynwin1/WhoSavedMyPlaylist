"use client";
import { lusitana } from "@/app/component/Fonts/fonts";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lusitana.className} antialiased`}
      >
      <SessionProvider>
          {children}
      </SessionProvider>
      </body>
    </html>
  );
}
