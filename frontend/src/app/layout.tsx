import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "./globals.css";

const onest = Onest({
  subsets: ["latin"],
  variable: "--font-onest",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BaroBadi",
  description:
    "AI learning platform that converts lecture videos into structured Somali study notes.",
  icons: {
    icon: [{ url: "/barobadi-logo.png", type: "image/png" }],
    shortcut: "/barobadi-logo.png",
    apple: "/barobadi-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={onest.variable} suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}
