-- Seed Data SQL
-- Helper for generating CUID-like IDs (we will use simple random strings or just let PostgreSQL gen if possible, but schema uses CUID default which is client-side. Supabase Postgres defaults to random string if not provided? No, schema says @default(cuid()) which is Prisma client side.
-- For raw SQL, we must provide IDs or assume defaults if DB has functions. cuid() is not a standard PG function.
-- I will use gen_random_uuid() which returns UUID, hoping the text field accepts it (it should).
-- 1. Create Super Admin
-- Password hash for 'password123' (bcrypt) - just a placeholder, real one in env.
-- We'll use a fixed ID for reference.
INSERT INTO "User" (
        "id",
        "email",
        "passwordHash",
        "fullName",
        "position",
        "status",
        "isClassTeacher",
        "isSubjectTeacher",
        "createdAt",
        "updatedAt"
    )
VALUES (
        'cm6dfv1a0000008l4g8j5d4x1',
        'admin@edugrade.com',
        '$2a$12$eX6.w6.w6.w6.w6.w6.w6.w6.w6.w6.w6.w6.w6.w6.w6.w6',
        -- Placeholder hash
        'Super Administrator',
        'SUPER_ADMIN',
        'APPROVED',
        false,
        false,
        NOW(),
        NOW()
    ) ON CONFLICT ("email") DO NOTHING;
-- 2. Create Academic Session
INSERT INTO "AcademicSession" (
        "id",
        "name",
        "startDate",
        "endDate",
        "isCurrent",
        "createdAt"
    )
VALUES (
        'cm6dfv1a0000008l4g8j5d4x2',
        '2024/2025',
        '2024-09-01T00:00:00Z',
        '2025-07-31T00:00:00Z',
        true,
        NOW()
    ) ON CONFLICT ("name") DO NOTHING;
-- 3. Create Terms
INSERT INTO "Term" (
        "id",
        "name",
        "sessionId",
        "startDate",
        "endDate",
        "nextTermBegins",
        "isActive",
        "isLocked",
        "createdAt"
    )
VALUES (
        'cm6dfv1a0000008l4g8j5d4x3',
        'FIRST_TERM',
        'cm6dfv1a0000008l4g8j5d4x2',
        '2024-09-01T00:00:00Z',
        '2024-12-15T00:00:00Z',
        '2025-01-06T00:00:00Z',
        true,
        false,
        NOW()
    ),
    (
        'cm6dfv1a0000008l4g8j5d4x4',
        'SECOND_TERM',
        'cm6dfv1a0000008l4g8j5d4x2',
        '2025-01-06T00:00:00Z',
        '2025-04-05T00:00:00Z',
        '2025-04-21T00:00:00Z',
        false,
        false,
        NOW()
    ),
    (
        'cm6dfv1a0000008l4g8j5d4x5',
        'THIRD_TERM',
        'cm6dfv1a0000008l4g8j5d4x2',
        '2025-04-21T00:00:00Z',
        '2025-07-31T00:00:00Z',
        '2025-09-07T00:00:00Z',
        false,
        false,
        NOW()
    ) ON CONFLICT ("sessionId", "name") DO NOTHING;
-- 4. Create School Settings
INSERT INTO "SchoolSettings" (
        "id",
        "schoolName",
        "schoolEmail",
        "schoolPhone",
        "schoolMotto",
        "updatedAt"
    )
VALUES (
        'cm6dfv1a0000008l4g8j5d4x6',
        'EduGrade High School',
        'info@edugrade.com',
        '+234-800-000-0000',
        'Knowledge is Power',
        NOW()
    );
-- 5. Subjects (Primary)
INSERT INTO "Subject" (
        "id",
        "name",
        "code",
        "section",
        "isCore",
        "createdAt"
    )
VALUES (
        gen_random_uuid()::text,
        'Mathematics',
        'MAT',
        'PRIMARY',
        true,
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'English Language',
        'ENG',
        'PRIMARY',
        true,
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'Basic Science',
        'BSC',
        'PRIMARY',
        false,
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'Social Studies',
        'SOS',
        'PRIMARY',
        false,
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'Christian Religious Knowledge',
        'CRK',
        'PRIMARY',
        false,
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'Islamic Religious Knowledge',
        'IRK',
        'PRIMARY',
        false,
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'Home Economics',
        'HEC',
        'PRIMARY',
        false,
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'Civic Education',
        'CVE',
        'PRIMARY',
        false,
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'Phonics',
        'PHO',
        'PRIMARY',
        false,
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'Handwriting',
        'HAN',
        'PRIMARY',
        false,
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'Verbal Reasoning',
        'VER',
        'PRIMARY',
        false,
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'Quantitative Reasoning',
        'QUR',
        'PRIMARY',
        false,
        NOW()
    ) ON CONFLICT ("name") DO NOTHING;
-- 6. Subjects (Secondary)
INSERT INTO "Subject" (
        "id",
        "name",
        "code",
        "section",
        "isCore",
        "createdAt"
    )
VALUES (
        gen_random_uuid()::text,
        'Mathematics (Sec)',
        'MTS',
        'SECONDARY',
        true,
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'English Language (Sec)',
        'ENS',
        'SECONDARY',
        true,
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'Civic Education (Sec)',
        'CVS',
        'SECONDARY',
        true,
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'Biology',
        'BIO',
        'SECONDARY',
        false,
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'Chemistry',
        'CHE',
        'SECONDARY',
        false,
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'Physics',
        'PHY',
        'SECONDARY',
        false,
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'Further Mathematics',
        'FMT',
        'SECONDARY',
        false,
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'Basic Science (Sec)',
        'BSS',
        'SECONDARY',
        false,
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'Basic Technology',
        'BTE',
        'SECONDARY',
        false,
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'Literature in English',
        'LIT',
        'SECONDARY',
        false,
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'Government',
        'GOV',
        'SECONDARY',
        false,
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'Economics',
        'ECO',
        'SECONDARY',
        false,
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'Commerce',
        'CMR',
        'SECONDARY',
        false,
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'Accounting',
        'ACC',
        'SECONDARY',
        false,
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'Business Studies',
        'BUS',
        'SECONDARY',
        false,
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'Agricultural Science',
        'AGR',
        'SECONDARY',
        false,
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'Computer Studies',
        'CPS',
        'SECONDARY',
        false,
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'French',
        'FRE',
        'SECONDARY',
        false,
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'Geography',
        'GEO',
        'SECONDARY',
        false,
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'History',
        'HIS',
        'SECONDARY',
        false,
        NOW()
    ) ON CONFLICT ("name") DO NOTHING;
-- 7. Classes
INSERT INTO "Class" (
        "id",
        "name",
        "level",
        "section",
        "daysSchoolOpened",
        "createdAt",
        "updatedAt"
    )
VALUES (
        gen_random_uuid()::text,
        'Pre-KG',
        'PRE_KG',
        'PRIMARY',
        0,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'Nursery 1',
        'NURSERY_1',
        'PRIMARY',
        0,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'Nursery 2',
        'NURSERY_2',
        'PRIMARY',
        0,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'Basic 1',
        'BASIC_1',
        'PRIMARY',
        0,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'Basic 2',
        'BASIC_2',
        'PRIMARY',
        0,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'Basic 3',
        'BASIC_3',
        'PRIMARY',
        0,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'Basic 4',
        'BASIC_4',
        'PRIMARY',
        0,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'Basic 5',
        'BASIC_5',
        'PRIMARY',
        0,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'Basic 6',
        'BASIC_6',
        'PRIMARY',
        0,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'JSS 1A',
        'JSS_1',
        'SECONDARY',
        0,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'JSS 1B',
        'JSS_1',
        'SECONDARY',
        0,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'JSS 2A',
        'JSS_2',
        'SECONDARY',
        0,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'JSS 2B',
        'JSS_2',
        'SECONDARY',
        0,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'JSS 3A',
        'JSS_3',
        'SECONDARY',
        0,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'JSS 3B',
        'JSS_3',
        'SECONDARY',
        0,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'SS 1 Science',
        'SS_1',
        'SECONDARY',
        0,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'SS 1 Arts',
        'SS_1',
        'SECONDARY',
        0,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'SS 1 Commercial',
        'SS_1',
        'SECONDARY',
        0,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'SS 2 Science',
        'SS_2',
        'SECONDARY',
        0,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'SS 2 Arts',
        'SS_2',
        'SECONDARY',
        0,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'SS 2 Commercial',
        'SS_2',
        'SECONDARY',
        0,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'SS 3 Science',
        'SS_3',
        'SECONDARY',
        0,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'SS 3 Arts',
        'SS_3',
        'SECONDARY',
        0,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid()::text,
        'SS 3 Commercial',
        'SS_3',
        'SECONDARY',
        0,
        NOW(),
        NOW()
    ) ON CONFLICT ("name") DO NOTHING;