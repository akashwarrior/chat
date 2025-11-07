import type { Metadata } from "next";
import { Pixelify_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import Providers from "@/providers";
import "./globals.css";

const pixelify_Sans = Pixelify_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chat - AI Assistant",
  description: "Experience intelligent conversations with our AI assistant. Features real-time messaging, markdown support, and seamless user experience.",
  keywords: ["chat", "AI", "conversation", "messaging", "artificial intelligence", "real-time"],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${pixelify_Sans.className} antialiased`}>
        <Providers>
          {children}

          <Toaster
            position="top-right"
            expand={false}
            richColors
            closeButton
          />

        </Providers>

      </body>
    </html>
  );
}
