import { Settings as SettingsComponent } from "@/components/settings";
import { SettingsAside } from "@/components/settings/settings-aside";
import { auth } from "@/lib/auth/auth";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Settings() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.isAnonymous) {
    redirect("/auth");
  }

  const cookieStore = await cookies();
  const mainTextFont =
    cookieStore.get("mainTextFont")?.value || "pixelify-sans";
  const codeFont = cookieStore.get("codeFont")?.value || "jetBrains-mono";
  const statsForNerds =
    cookieStore.get("statsForNerds")?.value === "true" || false;

  return (
    <div className="flex min-h-screen bg-card/50 flex-col md:flex-row overflow-hidden md:h-full md:max-h-screen justify-center">
      <SettingsAside user={session.user} />
      <SettingsComponent
        codeFont={codeFont}
        mainTextFont={mainTextFont}
        statsForNerds={statsForNerds}
      />
    </div>
  );
}
