'use server';

import prisma from './prisma';
import { revalidatePath } from 'next/cache';
import { ResultStatus } from '@prisma/client';
import { auth } from '@/auth';

export async function getClassResultStatus(classId: string, termId: string) {
    // This is public-ish for authenticated staff to see status
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    const statusObj = await prisma.classTermStatus.findUnique({
        where: {
            classId_termId: {
                classId,
                termId
            }
        }
    });

    return statusObj?.status || 'OPEN';
}

export async function updateClassResultStatus(classId: string, termId: string, newStatus: ResultStatus) {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    // Auth Check
    const user = session.user;
    const cls = await prisma.class.findUnique({ where: { id: classId } });
    if (!cls) return { error: 'Class not found' };

    // Permissions
    if (newStatus === 'SUBMITTED') {
        // Class Teacher can submit
        if (user.id !== cls.classTeacherId && user.position !== 'HEADMASTER' && user.position !== 'PRINCIPAL' && user.position !== 'SUPER_ADMIN') {
            return { error: 'Only class teacher or admin can submit results' };
        }
    } else if (newStatus === 'LOCKED' || newStatus === 'APPROVED' || newStatus === 'OPEN') { // Unlocking or Locking
        // Only Head/Principal/Admin
        if (cls.section === 'PRIMARY' && user.position !== 'HEADMASTER' && user.position !== 'SUPER_ADMIN') return { error: 'Unauthorized' };
        if (cls.section === 'SECONDARY' && user.position !== 'PRINCIPAL' && user.position !== 'SUPER_ADMIN') return { error: 'Unauthorized' };
    }

    try {
        await prisma.classTermStatus.upsert({
            where: {
                classId_termId: {
                    classId,
                    termId
                }
            },
            update: {
                status: newStatus,
                submittedAt: newStatus === 'SUBMITTED' ? new Date() : undefined,
                lockedAt: newStatus === 'LOCKED' ? new Date() : undefined
            },
            create: {
                classId,
                termId,
                status: newStatus,
                submittedAt: newStatus === 'SUBMITTED' ? new Date() : undefined
            }
        });

        revalidatePath('/headmaster');
        revalidatePath('/principal');
        return { success: true };
    } catch (_e) {
        return { error: 'Failed to update status' };
    }
}
