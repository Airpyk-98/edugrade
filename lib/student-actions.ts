'use server';

import prisma from './prisma';
import { revalidatePath } from 'next/cache';
import { Gender } from '@prisma/client';
import { auth } from '@/auth';

export async function createStudent(data: {
    firstName: string;
    lastName: string;
    otherNames?: string;
    gender: Gender;
    dateOfBirth: Date;
    classId: string;
    registrationNo: string;
    guardianName?: string;
    guardianPhone?: string;
    address?: string; // Add address field
}) {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    // Verify permissions
    // 1. Head/Principal of the section can create.
    // 2. Class Teacher of THAT class can create.

    const cls = await prisma.class.findUnique({ where: { id: data.classId } });
    if (!cls) return { error: 'Class not found' };

    if (session.user.position === 'HEADMASTER') {
        if (cls.section !== 'PRIMARY') return { error: 'Unauthorized: Class is not in Primary' };
    } else if (session.user.position === 'PRINCIPAL') {
        if (cls.section !== 'SECONDARY') return { error: 'Unauthorized: Class is not in Secondary' };
    } else if (session.user.isClassTeacher) {
        if (session.user.assignedClassId !== data.classId) return { error: 'Unauthorized: Not the class teacher' };
    } else if (session.user.position !== 'SUPER_ADMIN') {
        return { error: 'Unauthorized' };
    }

    try {
        // Check RegNo unique
        const existing = await prisma.student.findUnique({ where: { registrationNo: data.registrationNo } });
        if (existing) return { error: 'Registration Number already exists' };

        await prisma.student.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                otherNames: data.otherNames,
                gender: data.gender,
                dateOfBirth: data.dateOfBirth,
                classId: data.classId,
                registrationNo: data.registrationNo,
                guardianName: data.guardianName,
                guardianPhone: data.guardianPhone,
                address: data.address
            }
        });

        revalidatePath('/headmaster');
        revalidatePath('/principal');
        // Also revalidate class teacher dashboard path (to be created)
        return { success: true };
    } catch (_error) {
        console.error('Failed to create student:', _error);
        return { error: 'Failed to create student' };
    }
}

export async function updateStudent(studentId: string, data: Partial<{
    firstName: string;
    lastName: string;
    otherNames: string;
    gender: Gender;
    dateOfBirth: Date;
    registrationNo: string;
    guardianName: string;
    guardianPhone: string;
    address: string;
}>) {
    // Similar auth checks...
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    // Quick check logic... simplified
    try {
        await prisma.student.update({
            where: { id: studentId },
            data
        });
        revalidatePath('/headmaster');
        revalidatePath('/principal');
        return { success: true };
    } catch (_e) {
        return { error: 'Update failed' };
    }
}

export async function deleteStudent(studentId: string) {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    // Add check to ensure user has permission to delete from this section
    try {
        await prisma.student.delete({ where: { id: studentId } });
        revalidatePath('/headmaster');
        revalidatePath('/principal');
        return { success: true };
    } catch (_e) {
        return { error: 'Delete failed' };
    }
}

export async function getStudentsByClass(classId: string) {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    return await prisma.student.findMany({
        where: { classId },
        orderBy: { lastName: 'asc' }
    });
}
