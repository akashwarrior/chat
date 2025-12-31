import { cookies, headers } from "next/headers";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Header from "@/components/header";
import { auth } from "@/lib/auth/auth";

const SIDEBAR_COOKIE_NAME = "sidebar_state";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const [cookieStore, headersList] = await Promise.all([cookies(), headers()]);
  const sidebarCookie = cookieStore.get(SIDEBAR_COOKIE_NAME);
  const isCollapsed = sidebarCookie ? sidebarCookie.value !== "true" : false;

  const session = await auth.api.getSession({ headers: headersList });

  return (
    <SidebarProvider
      defaultOpen={!isCollapsed}
      className="flex-col max-h-screen h-full overflow-hidden"
    >
      <Header />
      <div className="flex bg-sidebar flex-1">
        <AppSidebar user={session?.user} />
        {children}
      </div>
    </SidebarProvider>
  );
}
