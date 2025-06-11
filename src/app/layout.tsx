import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { authOptions } from "@/lib/auth";
import Providers from "@/app/providers";
import { getServerSession } from "next-auth";
import HeaderOptions from "@/components/HeaderOptions";
import SideBar from "@/components/Sidebar";
import SearchModal from "@/components/SearchModal";
import ChatTextArea from "@/components/ChatTextArea";
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
  icons: {
    icon: "/logo.svg",
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers session={session}>
          <HeaderOptions />
          <SearchModal />
          <div className="flex flex-1 overflow-hidden">
            <SideBar />
            <main className="flex-1 rounded-tl-xl bg-background flex flex-col relative px-4 items-center justify-center">
              {children}
              <ChatTextArea />
            </main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
