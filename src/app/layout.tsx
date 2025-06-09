import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/app/providers";
import HeaderOptions from "@/components/HeaderOptions";
import SideBar from "@/components/Sidebar";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import "@/app/globals.css";
import SearchModal from "@/components/SearchModal";

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
  icons: {
    icon: "/logo.svg",
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased relative bg-sidebar h-screen flex flex-col`}>
        <Providers session={session}>
          <HeaderOptions />
          <SearchModal />
          <div className="flex flex-1">
            <SideBar />
            <main className="flex-1 rounded-tl-xl bg-background flex">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
