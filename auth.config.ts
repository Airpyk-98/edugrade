// Define types locally to avoid importing @prisma/client in Edge Runtime (Middleware)
export enum UserPosition {
    SUPER_ADMIN = 'SUPER_ADMIN',
    HEADMASTER = 'HEADMASTER',
    PRINCIPAL = 'PRINCIPAL',
    STAFF = 'STAFF',
}

export enum UserStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    SUSPENDED = 'SUSPENDED',
}

export enum Section {
    PRIMARY = 'PRIMARY',
    SECONDARY = 'SECONDARY',
}

// import { UserPosition, Section, UserStatus } from '@prisma/client';

export const authConfig = {
    pages: {
        signIn: '/auth/login',
        newUser: '/auth/signup', // Redirect here after signup if needed, or just use it as part of flow
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }: any) {
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
                token.assignedClassId = (user as any).assignedClassId;
            }
            return token;
        },
        session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.fullName = token.fullName as string;
                session.user.status = token.status as UserStatus;
                session.user.position = token.position as UserPosition;
                session.user.section = token.section as Section | null;
                session.user.managedSection = token.managedSection as Section | null;
                session.user.isClassTeacher = token.isClassTeacher as boolean;
                session.user.isSubjectTeacher = token.isSubjectTeacher as boolean;
                session.user.assignedClassId = token.assignedClassId as string | null;
            }
            return session;
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
