import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/auth/login',
        newUser: '/auth/signup', // Redirect here after signup if needed, or just use it as part of flow
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard') ||
                nextUrl.pathname.startsWith('/admin') ||
                nextUrl.pathname.startsWith('/teacher') ||
                nextUrl.pathname.startsWith('/student');
            const isOnAuth = nextUrl.pathname.startsWith('/auth');

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn && isOnAuth) {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }
            return true;
        },
        jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.fullName = user.fullName;
                token.status = user.status;
                token.position = user.position;
                token.section = user.section;
                token.managedSection = user.managedSection;
                token.isClassTeacher = user.isClassTeacher;
                token.isSubjectTeacher = user.isSubjectTeacher;
            }
            return token;
        },
        session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.fullName = token.fullName as string;
                session.user.status = token.status as any;
                session.user.position = token.position as any;
                session.user.section = token.section as any;
                session.user.managedSection = token.managedSection as any;
                session.user.isClassTeacher = token.isClassTeacher as boolean;
                session.user.isSubjectTeacher = token.isSubjectTeacher as boolean;
            }
            return session;
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
