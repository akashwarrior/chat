import { cookies } from "next/headers";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Header from "@/components/header";

export default async function Layout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies()
    const isCollapsed = cookieStore.get("sidebar_state")?.value !== "true";

    return (
        <SidebarProvider
            defaultOpen={!isCollapsed}
            className="flex-col max-h-screen h-full overflow-hidden"
        >
            <Header />
            <div className="flex bg-sidebar flex-1">
                <AppSidebar />
                {children}
            </div>
        </SidebarProvider>
    );
}