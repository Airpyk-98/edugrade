// scripts/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Super Admin
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL!;
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD!;

  if (!superAdminEmail || !superAdminPassword) {
    console.error('Missing SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD');
    return;
  }

  const superAdminHash = await bcrypt.hash(superAdminPassword, 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {},
    create: {
      email: superAdminEmail,
      passwordHash: superAdminHash,
      fullName: 'Super Administrator',
      position: 'SUPER_ADMIN',
      status: 'APPROVED',
      isClassTeacher: false,
      isSubjectTeacher: false
    }
  });
  console.log('✅ Super Admin created');

  // 2. Create Academic Session
  const currentSession = await prisma.academicSession.create({
    data: {
      name: '2024/2025',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-07-31'),
      isCurrent: true
    }
  });
  console.log('✅ Academic Session created');

  // 3. Create Terms
  const firstTerm = await prisma.term.create({
    data: {
      name: 'FIRST_TERM',
      sessionId: currentSession.id,
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-12-15'),
      nextTermBegins: new Date('2025-01-06'),
      isActive: true,
      isLocked: false
    }
  });

  const secondTerm = await prisma.term.create({
    data: {
      name: 'SECOND_TERM',
      sessionId: currentSession.id,
      startDate: new Date('2025-01-06'),
      endDate: new Date('2025-04-05'),
      nextTermBegins: new Date('2025-04-21'),
      isActive: false,
      isLocked: false
    }
  });

  const thirdTerm = await prisma.term.create({
    data: {
      name: 'THIRD_TERM',
      sessionId: currentSession.id,
      startDate: new Date('2025-04-21'),
      endDate: new Date('2025-07-31'),
      nextTermBegins: new Date('2025-09-07'),
      isActive: false,
      isLocked: false
    }
  });
  console.log('✅ Terms created');

  // 4. Create School Settings
  await prisma.schoolSettings.create({
    data: {
      schoolName: process.env.SCHOOL_NAME || 'Sample School',
      schoolEmail: process.env.SCHOOL_EMAIL,
      schoolPhone: process.env.SCHOOL_PHONE,
      schoolMotto: 'Knowledge is Power'
    }
  });
  console.log('✅ School Settings created');

  // 5. Create Primary Section Subjects
  const primarySubjects = [
    'Mathematics',
    'English Language',
    'Basic Science',
    'Social Studies',
    'Christian Religious Knowledge',
    'Islamic Religious Knowledge',
    'Home Economics',
    'Civic Education',
    'Phonics',
    'Handwriting',
    'Verbal Reasoning',
    'Quantitative Reasoning'
  ];

  for (const name of primarySubjects) {
    await prisma.subject.create({
      data: {
        name,
        code: name.substring(0, 3).toUpperCase(),
        section: 'PRIMARY',
        isCore: ['Mathematics', 'English Language'].includes(name)
      }
    });
  }
  console.log('✅ Primary subjects created');

  // 6. Create Secondary Section Subjects
  const secondarySubjects = [
    // Core
    'Mathematics',
    'English Language',
    'Civic Education',
    // Sciences
    'Biology',
    'Chemistry',
    'Physics',
    'Further Mathematics',
    'Basic Science',
    'Basic Technology',
    // Arts/Commercial
    'Literature in English',
    'Government',
    'Economics',
    'Commerce',
    'Accounting',
    'Business Studies',
    // Others
    'Agricultural Science',
    'Computer Studies',
    'French',
    'Christian Religious Knowledge',
    'Islamic Religious Knowledge',
    'Geography',
    'History'
  ];

  for (const name of secondarySubjects) {
    await prisma.subject.create({
      data: {
        name,
        code: name.substring(0, 3).toUpperCase(),
        section: 'SECONDARY',
        isCore: ['Mathematics', 'English Language', 'Civic Education'].includes(name)
      }
    });
  }
  console.log('✅ Secondary subjects created');

  // 7. Create Sample Classes
  const classes = [
    // Primary
    { name: 'Pre-KG', level: 'PRE_KG', section: 'PRIMARY' },
    { name: 'Nursery 1', level: 'NURSERY_1', section: 'PRIMARY' },
    { name: 'Nursery 2', level: 'NURSERY_2', section: 'PRIMARY' },
    { name: 'Basic 1', level: 'BASIC_1', section: 'PRIMARY' },
    { name: 'Basic 2', level: 'BASIC_2', section: 'PRIMARY' },
    { name: 'Basic 3', level: 'BASIC_3', section: 'PRIMARY' },
    { name: 'Basic 4', level: 'BASIC_4', section: 'PRIMARY' },
    { name: 'Basic 5', level: 'BASIC_5', section: 'PRIMARY' },
    { name: 'Basic 6', level: 'BASIC_6', section: 'PRIMARY' },
    // Secondary
    { name: 'JSS 1A', level: 'JSS_1', section: 'SECONDARY' },
    { name: 'JSS 1B', level: 'JSS_1', section: 'SECONDARY' },
    { name: 'JSS 2A', level: 'JSS_2', section: 'SECONDARY' },
    { name: 'JSS 2B', level: 'JSS_2', section: 'SECONDARY' },
    { name: 'JSS 3A', level: 'JSS_3', section: 'SECONDARY' },
    { name: 'JSS 3B', level: 'JSS_3', section: 'SECONDARY' },
    { name: 'SS 1 Science', level: 'SS_1', section: 'SECONDARY' },
    { name: 'SS 1 Arts', level: 'SS_1', section: 'SECONDARY' },
    { name: 'SS 1 Commercial', level: 'SS_1', section: 'SECONDARY' },
    { name: 'SS 2 Science', level: 'SS_2', section: 'SECONDARY' },
    { name: 'SS 2 Arts', level: 'SS_2', section: 'SECONDARY' },
    { name: 'SS 2 Commercial', level: 'SS_2', section: 'SECONDARY' },
    { name: 'SS 3 Science', level: 'SS_3', section: 'SECONDARY' },
    { name: 'SS 3 Arts', level: 'SS_3', section: 'SECONDARY' },
    { name: 'SS 3 Commercial', level: 'SS_3', section: 'SECONDARY' }
  ];

  for (const classData of classes) {
    // @ts-ignore
    await prisma.class.create({
      data: {
        ...classData,
        daysSchoolOpened: 0
      }
    });
  }
  console.log('✅ Classes created');

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
