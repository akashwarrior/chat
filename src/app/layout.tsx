import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { cookies } from "next/headers";
import {
  Poppins,
  Fira_Code,
  Pixelify_Sans,
  JetBrains_Mono,
  M_PLUS_1_Code,
} from "next/font/google";
import "./globals.css";

const pixelify_Sans = Pixelify_Sans({
  subsets: ["latin"],
  variable: "--font-pixelify-sans",
  preload: true,
});

const fira_Code = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
  preload: true,
});

const jetBrains_Mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetBrains-mono",
  preload: true,
});

const m_PLUS_1_Code = M_PLUS_1_Code({
  subsets: ["latin"],
  variable: "--font-m-PLUS-1-Code",
  preload: true,
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  preload: true,
});

export const metadata: Metadata = {
  title: "Chat - AI Assistant",
  description: "Experience intelligent conversations with our AI assistant. Features real-time messaging, markdown support, and seamless user experience.",
  keywords: ["chat", "AI", "conversation", "messaging", "artificial intelligence", "real-time"],
  icons: {
    icon: "/logo.svg",
  },
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const mainTextFont = cookieStore.get('mainTextFont')?.value || 'pixelify-sans';
  const codeFont = cookieStore.get('codeFont')?.value || 'jetBrains-mono';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                document.documentElement.setAttribute('data-main-font', '${mainTextFont}')
                document.documentElement.setAttribute('data-code-font', '${codeFont}')
              }())
            `,
          }}
        />
      </head>
      <body
        className={
          `${pixelify_Sans.variable}
          ${fira_Code.variable}
          ${jetBrains_Mono.variable}
          ${m_PLUS_1_Code.variable}
          ${poppins.variable}
            antialiased`
        }>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >

          {children}

          <Toaster
            position="top-right"
            expand={false}
            richColors
            closeButton
          />

        </ThemeProvider>
      </body>
    </html>
  );
}
