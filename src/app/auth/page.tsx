import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function AuthPage() {
    return (
        <div className="flex flex-col h-screen items-center justify-center">
            <Link href="/" className="absolute left-4 top-4 z-10">
                <Button
                    variant="ghost"
                    className="justify-center items-center gap-4 !p-4"
                >
                    <ArrowLeft />
                    Back to Chat
                </Button>
            </Link>
            <h1 className="mb-5 h-5 text-xl font-bold text-foreground">
                Welcome to <span className="text-primary">Chat</span>
            </h1>
            <p className="mb-8 text-center text-muted-foreground">Sign in below (we'll increase your message limits if you do 😉)</p>
            <Button className="w-full max-w-sm py-6 text-lg hover:shadow-lg">
                <svg className="mr-3 h-6 w-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"></path>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path>
                </svg>
                Continue with Google
            </Button>
            <p className="mt-6 text-center text-sm text-muted-foreground/60">
                By continuing, you agree to our{" "}
                <Link
                    target="_blank"
                    prefetch={false}
                    href="/terms-of-service"
                    className="text-muted-foreground hover:text-accent-foreground"
                >
                    Terms of Service
                </Link>
                {" "}and{" "}
                <Link
                    target="_blank"
                    prefetch={false}
                    href="/privacy-policy"
                    className="text-muted-foreground hover:text-accent-foreground"
                >
                    Privacy Policy
                </Link>
            </p>
        </div>
    )
}