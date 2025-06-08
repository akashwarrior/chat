import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/app/providers";
import HeaderOptions from "@/components/HeaderOptions";
import SideBar from "@/components/Sidebar";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import "@/app/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chat",
  description: "Chat with AI",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers session={session}>
          <HeaderOptions />
          <div className="flex">
            <SideBar />
            <main className="flex-1 min-h-screen p-4">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
