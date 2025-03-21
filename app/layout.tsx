import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "worth-calculator",
  description: "worth-calculator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <div className="pb-16"></div>
        <footer className="w-full py-4 border-t bg-gray-50 dark:bg-gray-900 dark:border-gray-800 fixed bottom-0 left-0 shadow-sm">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex flex-col items-center">
              
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
