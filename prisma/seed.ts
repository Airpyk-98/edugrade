import { PrismaClient, UserStatus, UserPosition } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@lmk.com';
    const password = 'LandmarkAcademy2026';
    const hashedPassword = await hash(password, 12);

    const existing = await prisma.user.findUnique({ where: { email } });

    if (!existing) {
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                fullName: 'Super Admin',
                phoneNumber: '0000000000',
                status: 'APPROVED',
                position: 'SUPER_ADMIN',
                // Super Admin doesn't necessarily belong to a section, or access both? 
                // Our logic usually checks position first.
                section: null,
                managedSection: null
            }
        });
        console.log('Super Admin created');
    } else {
        // Ensure credentials are up to date logic if needed, or skip
        console.log('Super Admin already exists');
        // Force update password just in case
        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                position: 'SUPER_ADMIN',
                status: 'APPROVED'
            }
        });
        console.log('Super Admin updated');
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
