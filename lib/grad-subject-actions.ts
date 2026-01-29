'use server';

import prisma from './prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function getClassSubjects(classId: string) {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    return await prisma.classSubject.findMany({
        where: { classId },
        include: {
            subject: true,
            teachers: {
                include: {
                    teacher: { select: { id: true, fullName: true } }
                }
            }
        }
    });
}

export async function addSubjectToClass(classId: string, subjectId: string) {
    const session = await auth();
    // Auth checks...
    if (!session?.user) throw new Error('Unauthorized');

    try {
        await prisma.classSubject.create({
            data: {
                classId,
                subjectId
            }
        });
        revalidatePath('/headmaster');
        revalidatePath('/principal');
        return { success: true };
    } catch (error) {
        // likely duplicate
        return { error: 'Subject already added to this class' };
    }
}

export async function removeSubjectFromClass(classSubjectId: string) {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    try {
        await prisma.classSubject.delete({ where: { id: classSubjectId } });
        revalidatePath('/headmaster');
        revalidatePath('/principal');
        return { success: true };
    } catch (error) {
        return { error: 'Failed' };
    }
}

export async function assignSubjectTeacher(classSubjectId: string, teacherId: string) {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    try {
        // Check if assignment exists, if so update/delete? 
        // Schema: SubjectAssignment has ID. Many-to-many logically (Multiple teachers per subject? Usually one main one).
        // Let's assume one teacher per subject per class for simplicity first, or widely allowing multiple.
        // User request: "Subject teachers... assigned to teach specific subjects in specific classes"
        // Schema: `SubjectAssignment` table links `teacherId` and `classSubjectId`. Unique constraint on `teacherId, classSubjectId`.
        // But can multiple teachers teach the same ClassSubject? Yes, based on schema (only unique pair is constrained).
        // However, usually we want to replace the teacher or add them.
        // Let's just create the assignment.

        await prisma.subjectAssignment.create({
            data: {
                classSubjectId,
                teacherId,
                assignedBy: session.user.id
            }
        });

        // Also ensure user is marked as isSubjectTeacher?
        await prisma.user.update({
            where: { id: teacherId },
            data: { isSubjectTeacher: true }
        });

        revalidatePath('/headmaster');
        revalidatePath('/principal');
        return { success: true };

    } catch (error) {
        return { error: 'Assignment failed or already exists' };
    }
}

export async function removeSubjectTeacher(assignmentId: string) {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    try {
        await prisma.subjectAssignment.delete({ where: { id: assignmentId } });
        revalidatePath('/headmaster');
        revalidatePath('/principal');
        return { success: true };
    } catch (e) {
        return { error: 'Failed' };
    }
}
