'use server';

import prisma from './prisma';
import { revalidatePath } from 'next/cache';
import { UserPosition, Section, UserStatus } from '@prisma/client';
import { auth } from '@/auth';

// --- Super Admin Actions ---

export async function getPendingStaff() {
    const session = await auth();
    if (session?.user.position !== 'SUPER_ADMIN') {
        throw new Error('Unauthorized');
    }

    return await prisma.user.findMany({
        where: {
            status: 'PENDING',
            position: 'STAFF' // Only fetch staff pending approval (initially everyone registers as staff)
        },
        orderBy: { createdAt: 'desc' }
    });
}

export async function approveStaff(userId: string, section: Section, position: UserPosition = 'STAFF') {
    const session = await auth();
    if (session?.user.position !== 'SUPER_ADMIN') {
        throw new Error('Unauthorized');
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                status: 'APPROVED',
                section: section, // Super Admin assigns the SECTION (Primary/Secondary)
                position: position, // Super Admin can also promote to HEADMASTER/PRINCIPAL directly if needed
                managedSection: position === 'HEADMASTER' ? 'PRIMARY' : position === 'PRINCIPAL' ? 'SECONDARY' : null,
                approvedById: session.user.id,
                approvedAt: new Date()
            }
        });
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error('Failed to approve staff:', error);
        return { error: 'Failed to approve staff' };
    }
}

export async function rejectStaff(userId: string) {
    const session = await auth();
    if (session?.user.position !== 'SUPER_ADMIN') {
        throw new Error('Unauthorized');
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                status: 'REJECTED'
            }
        });
        revalidatePath('/admin');
        return { success: true };
    } catch (_error) {
        return { error: 'Failed to reject staff' };
    }
}

export async function getAllStaff() {
    const session = await auth();
    if (!['SUPER_ADMIN', 'HEADMASTER', 'PRINCIPAL'].includes(session?.user.position || '')) {
        throw new Error('Unauthorized');
    }

    const where: { status: UserStatus; section?: Section } = {
        status: 'APPROVED',
    };

    if (session?.user.position === 'HEADMASTER') {
        where.section = 'PRIMARY';
    } else if (session?.user.position === 'PRINCIPAL') {
        where.section = 'SECONDARY';
    }

    return await prisma.user.findMany({
        where,
        orderBy: { fullName: 'asc' }
    });
}
