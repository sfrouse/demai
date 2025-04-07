// import { Inter } from "next/font/google";
import "./globals.css";
import React from "react";
// import DesignSystemEmbed from "@/components/DesignSystemEmbed/DesignSystemEmbed";

// const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body>
        {/* <body className={inter.className}> */}
        {/* <DesignSystemEmbed /> */}
        {children}
      </body>
    </html>
  );
}
