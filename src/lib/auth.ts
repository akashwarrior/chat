import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from 'next-auth';

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        })
    ],
    secret: process.env.NEXTAUTH_SECRET || 'mySecret',
    pages: {
        signIn: '/auth',
    },
} satisfies NextAuthOptions;