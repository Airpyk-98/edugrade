'use server';

import prisma from './prisma';

export async function getActiveTerm() {
    const term = await prisma.term.findFirst({
        where: { isActive: true }
    });
    return term;
}
