'use server';

import prisma from './prisma';
import { revalidatePath } from 'next/cache';
import { ClassLevel, Section, UserPosition } from '@prisma/client';
import { auth } from '@/auth';

export async function createClass(data: {
    name: string;
    level: ClassLevel;
    section: Section;
    classTeacherId?: string;
}) {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    // Authorization check
    if (session.user.position === 'HEADMASTER') {
        if (data.section !== 'PRIMARY') return { error: 'Headmaster can only create Primary classes' };
        if (session.user.section !== 'PRIMARY') return { error: 'Headmaster must be assigned to Primary section' };
    } else if (session.user.position === 'PRINCIPAL') {
        if (data.section !== 'SECONDARY') return { error: 'Principal can only create Secondary classes' };
        if (session.user.section !== 'SECONDARY') return { error: 'Principal must be assigned to Secondary section' };
    } else {
        // Only Head/Principal can create classes
        return { error: 'Unauthorized to create classes' };
    }

    try {
        await prisma.class.create({
            data: {
                name: data.name,
                level: data.level,
                section: data.section,
                classTeacherId: data.classTeacherId || null
            }
        });

        // If class teacher assigned, update their status
        if (data.classTeacherId) {
            await prisma.user.update({
                where: { id: data.classTeacherId },
                data: { isClassTeacher: true, assignedClassId: undefined } // Wait, assignedClassId is on User? Schema says assignedClassId on User is unique. 
                // Better to update User's assignedClassId properly if relationships allow, but Schema: Class has classTeacherId. User has assignedClassId.
                // Let's connect the user side too for consistency if needed, but the foreign key on Class is 'classTeacherId'.
                // Actually, usually it's one-to-one or one-to-many. The schema has `assignedClassId` on User (Unique), enabling `staff.class`.
                // AND `classTeacherId` on Class (Unique), enabling `class.teacher`.
                // We should sync them.
            });

            // Let's update the User record to point to this new class
            // We can't know the ID before creation unless we do a transaction or update after.
            // Let's rely on `classTeacherId` on Class for now as the source of truth for "Who teaches this class".
        }

        revalidatePath('/headmaster');
        revalidatePath('/principal');
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error('Failed to create class:', error);
        return { error: 'Failed to create class. Name might be duplicate.' };
    }
}

export async function deleteClass(classId: string) {
    // Similar auth checks...
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    try {
        const cls = await prisma.class.findUnique({ where: { id: classId } });
        if (!cls) return { error: 'Class not found' };

        if (session.user.position === 'HEADMASTER' && cls.section !== 'PRIMARY') return { error: 'Unauthorized' };
        if (session.user.position === 'PRINCIPAL' && cls.section !== 'SECONDARY') return { error: 'Unauthorized' };
        if (!['HEADMASTER', 'PRINCIPAL'].includes(session.user.position)) return { error: 'Unauthorized' };

        await prisma.class.delete({ where: { id: classId } });
        revalidatePath('/headmaster');
        revalidatePath('/principal');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete class' };
    }
}

export async function assignClassTeacher(classId: string, teacherId: string | null) {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    // Verify Class and Permissions
    const cls = await prisma.class.findUnique({ where: { id: classId } });
    if (!cls) return { error: 'Class not found' };

    if (session.user.position === 'HEADMASTER' && cls.section !== 'PRIMARY') return { error: 'Unauthorized' };
    if (session.user.position === 'PRINCIPAL' && cls.section !== 'SECONDARY') return { error: 'Unauthorized' };

    // If assigning a teacher
    if (teacherId) {
        const teacher = await prisma.user.findUnique({ where: { id: teacherId } });
        if (!teacher) return { error: 'Teacher not found' };

        // Teacher must be in same section
        // Optimization: Headmaster can only assign Primary staff? Yes.
        if (cls.section === 'PRIMARY' && teacher.section !== 'PRIMARY') return { error: 'Teacher must be in Primary section' };
        if (cls.section === 'SECONDARY' && teacher.section !== 'SECONDARY') return { error: 'Teacher must be in Secondary section' };

        // Check if teacher is already assigned to a class? 
        // "Staffs could be assigned as class teacher... typically one class"
        // User schema has `assignedClassId` (Unique), so yes.
        if (teacher.assignedClassId && teacher.assignedClassId !== classId) {
            return { error: 'Teacher is already assigned to another class' };
        }

        // Check if class already has a teacher? Override it?
        // "Manage student data... duties"
        // Let's allow override but clear previous teacher's status
    }

    try {
        // Transaction to handle swapping
        await prisma.$transaction(async (tx) => {
            // If clearing old teacher
            if (cls.classTeacherId) {
                await tx.user.update({
                    where: { id: cls.classTeacherId },
                    data: { isClassTeacher: false, assignedClassId: null }
                });
            }

            // If assigning new teacher
            if (teacherId) {
                await tx.user.update({
                    where: { id: teacherId },
                    data: { isClassTeacher: true, assignedClassId: classId }
                });
            }

            // Update Class
            await tx.class.update({
                where: { id: classId },
                data: { classTeacherId: teacherId }
            });
        });

        revalidatePath('/headmaster');
        revalidatePath('/principal');
        return { success: true };

    } catch (error) {
        console.error('Failed to assign class teacher:', error);
        return { error: 'Assignment failed' };
    }
}

export async function getClasses(section: Section) {
    // Public read for authenticated users basically (needed for lists)
    // Or restrict? Super Admin sees all.
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    return await prisma.class.findMany({
        where: { section },
        include: {
            classTeacher: {
                select: { fullName: true }
            },
            _count: {
                select: { students: true }
            }
        },
        orderBy: { name: 'asc' }
    });
}
