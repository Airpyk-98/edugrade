'use server';

import prisma from './prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { redirect } from 'next/navigation';

const SignupSchema = z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    phone: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE']),
    dateOfBirth: z.string().transform((str) => new Date(str)),
    qualification: z.string().min(2),
    preferredLevel: z.string(),
    specializations: z.array(z.string()).optional()
});

export async function registerUser(prevState: any, formData: FormData) {
    const rawData = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        password: formData.get('password'),
        phone: formData.get('phone'),
        gender: formData.get('gender'),
        dateOfBirth: formData.get('dateOfBirth'),
        qualification: formData.get('qualification'),
        preferredLevel: formData.get('preferredLevel'),
        specializations: formData.getAll('specializations'),
    };

    const validatedFields = SignupSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return { error: 'Invalid fields. Please check your input.' };
    }

    const { email, password, ...rest } = validatedFields.data;

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return { error: 'Email already exists.' };
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                email,
                passwordHash,
                ...rest,
                position: 'STAFF',
                status: 'PENDING',
            },
        });

        // In a real app, send email to Super Admin here

    } catch (error) {
        console.error(error);
        return { error: 'Database error: Failed to register user.' };
    }

    return { success: true };
}
