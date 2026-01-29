import { UserPosition, Section } from '@prisma/client';

export type Permission =
    | 'manage_staff'        // Approve, Reject
    | 'manage_classes'      // Create, Edit, Delete Classes
    | 'manage_subjects'     // Create, Edit, Delete Subjects
    | 'view_all'            // View all data (Super Admin)
    | 'assign_staff'        // Assign staff to roles/classes/subjects
    | 'manage_students'     // Add/Edit Students in class
    | 'input_grades'        // Input grades for subjects
    | 'view_my_class'       // View assigned class
    | 'view_my_subjects';   // View assigned subjects

interface UserContext {
    position: UserPosition;
    section?: Section | null; // For Headmaster/Principal/Staff
    managedSection?: Section | null; // Legacy field, same as section for Head/Principal ideally
    isClassTeacher: boolean;
    isSubjectTeacher: boolean;
}

export function hasPermission(
    user: UserContext,
    permission: Permission,
    targetSection?: Section | null // Optional: relevant if managing resources in a specific section
): boolean {

    switch (permission) {
        case 'manage_staff':
            // Only Super Admin can approve/reject staff initially
            return user.position === 'SUPER_ADMIN';

        case 'assign_staff':
            // Super Admin assigns to section
            if (user.position === 'SUPER_ADMIN') return true;
            // Headmaster/Principal assign roles within their section
            if (user.position === 'HEADMASTER' && user.section === 'PRIMARY' && targetSection === 'PRIMARY') return true;
            if (user.position === 'PRINCIPAL' && user.section === 'SECONDARY' && targetSection === 'SECONDARY') return true;
            return false;

        case 'manage_classes':
            // Only Headmaster/Principal can create/edit classes in their section
            if (user.position === 'HEADMASTER' && user.section === 'PRIMARY' && targetSection === 'PRIMARY') return true;
            if (user.position === 'PRINCIPAL' && user.section === 'SECONDARY' && targetSection === 'SECONDARY') return true;
            return false; // Super Admin cannot create/edit classes

        case 'manage_subjects':
            // Only Headmaster/Principal can create/edit subjects in their section
            if (user.position === 'HEADMASTER' && user.section === 'PRIMARY' && targetSection === 'PRIMARY') return true;
            if (user.position === 'PRINCIPAL' && user.section === 'SECONDARY' && targetSection === 'SECONDARY') return true;
            return false; // Super Admin cannot

        case 'view_all':
            // Super Admin sees everything
            return user.position === 'SUPER_ADMIN';

        case 'manage_students':
            // Class Teachers manage their own students
            // Headmaster/Principal can also manage students in their section
            if (user.position === 'HEADMASTER' && user.section === 'PRIMARY' && targetSection === 'PRIMARY') return true;
            if (user.position === 'PRINCIPAL' && user.section === 'SECONDARY' && targetSection === 'SECONDARY') return true;
            if (user.isClassTeacher) return true; // Checks done at component level for *specific* class
            return false;

        case 'input_grades':
            // Subject Teachers input grades
            if (user.isSubjectTeacher) return true;
            // Also Head/Principal might need override access? (Let's assume yes for now based on previous PDF)
            if (user.position === 'HEADMASTER' && user.section === 'PRIMARY') return true;
            if (user.position === 'PRINCIPAL' && user.section === 'SECONDARY') return true;
            return false;

        default:
            return false;
    }
}

export function canAccessClass(user: UserContext, classSection: Section, classId?: string, assignedClassId?: string): boolean {
    if (user.position === 'SUPER_ADMIN') return true; // View only mostly, but access allowed

    // Headmaster/Principal section check
    if (user.position === 'HEADMASTER' && classSection === 'PRIMARY') return true;
    if (user.position === 'PRINCIPAL' && classSection === 'SECONDARY') return true;

    // Class Teacher
    if (user.isClassTeacher && assignedClassId === classId) return true;

    // Subject Teacher - needs more granular check against SubjectAssignment usually, but generally "can acccess" might mean view list
    // Detailed check usually done with DB query
    return false;
}
