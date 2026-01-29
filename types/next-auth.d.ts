import { UserPosition, Section, UserStatus } from '@prisma/client';
import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            fullName: string;
            status: UserStatus;
            position: UserPosition;
            section?: Section | null;
            managedSection?: Section | null;
            isClassTeacher: boolean;
            isSubjectTeacher: boolean;
        } & DefaultSession['user'];
    }

    interface User {
        fullName: string;
        status: UserStatus;
        position: UserPosition;
        section?: Section | null;
        managedSection?: Section | null;
        isClassTeacher: boolean;
        isSubjectTeacher: boolean;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        fullName: string;
        status: UserStatus;
        position: UserPosition;
        section?: Section | null;
        managedSection?: Section | null;
        isClassTeacher: boolean;
        isSubjectTeacher: boolean;
    }
}
