'use server';

import prisma from './prisma';
import { revalidatePath } from 'next/cache';
import { Section } from '@prisma/client';
import { auth } from '@/auth';

export async function createSubject(data: {
    name: string;
    code: string;
    section: Section;
    isCore: boolean;
}) {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    // Authorization check
    if (session.user.position === 'HEADMASTER') {
        if (data.section !== 'PRIMARY') return { error: 'Headmaster can only create Primary subjects' };
    } else if (session.user.position === 'PRINCIPAL') {
        if (data.section !== 'SECONDARY') return { error: 'Principal can only create Secondary subjects' };
    } else {
        return { error: 'Unauthorized to create subjects' };
    }

    try {
        // Check duplication (Name or Code in same section? Schema says Name/Code unique globally... wait.)
        // Schema: UNIQUE INDEX "Subject_name_key" ON "Subject"("name");
        // Schema: UNIQUE INDEX "Subject_code_key" ON "Subject"("code");
        // This implies "Mathematics" cannot exist in both Primary and Secondary if they share the name.
        // Optimization: Usually "Mathematics" exists in both. We might need to prefix or check schema.
        // The current schema enforces global uniqueness.
        // Workaround: "Mathematics (Primary)" vs "Mathematics (Secondary)" OR adjust schema later.
        // For now, let's assume users will verify codes/names are unique.

        await prisma.subject.create({
            data: {
                name: data.name,
                code: data.code,
                section: data.section,
                isCore: data.isCore
            }
        });

        revalidatePath('/headmaster');
        revalidatePath('/principal');
        return { success: true };
    } catch (_error) {
        console.error('Failed to create subject:', _error);
        return { error: 'Failed to create subject. Name or Code might be duplicate.' };
    }
}

export async function deleteSubject(subjectId: string) {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    try {
        const sub = await prisma.subject.findUnique({ where: { id: subjectId } });
        if (!sub) return { error: 'Subject not found' };

        if (session.user.position === 'HEADMASTER' && sub.section !== 'PRIMARY') return { error: 'Unauthorized' };
        if (session.user.position === 'PRINCIPAL' && sub.section !== 'SECONDARY') return { error: 'Unauthorized' };

        await prisma.subject.delete({ where: { id: subjectId } });
        revalidatePath('/headmaster');
        revalidatePath('/principal');
        return { success: true };
    } catch (_error) {
        return { error: 'Failed to delete subject' };
    }
}

export async function getSubjects(section: Section) {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    return await prisma.subject.findMany({
        where: { section },
        orderBy: { name: 'asc' }
    });
}
