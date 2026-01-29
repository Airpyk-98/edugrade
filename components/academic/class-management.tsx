'use client';

import { useState } from 'react';
import { createClass, deleteClass, assignClassTeacher } from '@/lib/class-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ClassLevel, Section } from '@prisma/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, UserPlus } from 'lucide-react';
import { ClassSubjectManager } from './class-subject-manager';
import { StudentManagement } from './student-management';
import { BookOpen, GraduationCap } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import { ClassResultStatusBadge } from './class-result-status';

export function ClassManagement({ classes, staff, subjects, section, currentTermId, userRole }: {
    classes: any[],
    staff: any[],
    subjects: any[],
    section: Section,
    currentTermId?: string,
    userRole?: string
}) {
    const [isCreating, setIsCreating] = useState(false);
    const [newClassName, setNewClassName] = useState('');
    const [newClassLevel, setNewClassLevel] = useState<ClassLevel | ''>('');

    // Assignment state
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
    const [isAssigning, setIsAssigning] = useState(false);

    // Subject Management State
    const [managingSubjectsClass, setManagingSubjectsClass] = useState<any | null>(null);
    const [managingStudentsClass, setManagingStudentsClass] = useState<any | null>(null);


    const handleCreate = async () => {
        // ... (same as before)
        if (!newClassName || !newClassLevel) {
            toast.error('Please fill in all fields');
            return;
        }

        const res = await createClass({
            name: newClassName,
            level: newClassLevel as ClassLevel,
            section: section
        });

        if (res.success) {
            toast.success('Class created successfully');
            setIsCreating(false);
            setNewClassName('');
            setNewClassLevel('');
        } else {
            toast.error(res.error);
        }
    };

    const handleDelete = async (id: string) => {
        // ... (same as before)
        if (!confirm('Are you sure? This will delete all students and data in this class!')) return;
        const res = await deleteClass(id);
        if (res.success) toast.success('Class deleted');
        else toast.error(res.error);
    };

    const handleAssignTeacher = async () => {
        if (!selectedClassId) return;
        if (!selectedTeacherId) {
            toast.error('Please select a teacher');
            return;
        }

        const res = await assignClassTeacher(selectedClassId, selectedTeacherId);
        if (res.success) {
            toast.success('Class teacher assigned successfully');
            setIsAssigning(false);
            setSelectedClassId(null);
            setSelectedTeacherId('');
        } else {
            toast.error(res.error);
        }
    };

    const levels: ClassLevel[] = section === 'PRIMARY'
        ? ['PRE_KG', 'NURSERY_1', 'NURSERY_2', 'BASIC_1', 'BASIC_2', 'BASIC_3', 'BASIC_4', 'BASIC_5', 'BASIC_6']
        : ['JSS_1', 'JSS_2', 'JSS_3', 'SS_1', 'SS_2', 'SS_3'];

    // Filter staff for role assignment potential (Available staff in this section)
    // Usually we show all staff in section, or maybe only those not yet assigned?
    // Let's show all and handle error if assigned.

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Classes ({section})</h2>
                <Button onClick={() => setIsCreating(!isCreating)}>{isCreating ? 'Cancel' : 'Add Class'}</Button>
            </div>

            {isCreating && (
                <Card className="bg-slate-50">
                    <CardHeader><CardTitle className="text-base">New Class</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Class Name</Label>
                                <Input placeholder="e.g. JSS 1A Gold" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Level</Label>
                                <Select onValueChange={(v) => setNewClassLevel(v as ClassLevel)}>
                                    <SelectTrigger><SelectValue placeholder="Select Level" /></SelectTrigger>
                                    <SelectContent>
                                        {levels.map(l => <SelectItem key={l} value={l}>{l.replace('_', ' ')}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button onClick={handleCreate}>Create Class</Button>
                    </CardContent>
                </Card>
            )}

            {/* Assignment Dialog */}
            <Dialog open={isAssigning} onOpenChange={setIsAssigning}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Class Teacher</DialogTitle>
                        <DialogDescription>Select a staff member to manage this class.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Select onValueChange={setSelectedTeacherId} value={selectedTeacherId}>
                            <SelectTrigger><SelectValue placeholder="Select Staff" /></SelectTrigger>
                            <SelectContent>
                                {staff.map(s => (
                                    <SelectItem key={s.id} value={s.id} disabled={s.isClassTeacher && s.assignedClassId !== selectedClassId}>
                                        {s.fullName} {s.isClassTeacher && s.assignedClassId !== selectedClassId ? '(Assigned)' : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAssignTeacher}>Assign</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Class Name</TableHead>
                                <TableHead>Level</TableHead>
                                <TableHead>Class Teacher</TableHead>
                                <TableHead>Students</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {classes.map((cls) => (
                                <TableRow key={cls.id}>
                                    <TableCell className="font-medium">{cls.name}</TableCell>
                                    <TableCell>{cls.level.replace('_', ' ')}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {cls.classTeacher?.fullName || <span className="text-gray-400">Unassigned</span>}
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                                                setSelectedClassId(cls.id);
                                                setSelectedTeacherId(cls.classTeacherId || '');
                                                setIsAssigning(true);
                                            }}>
                                                <UserPlus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell>{cls._count?.students || 0}</TableCell>
                                    <TableCell>
                                        {currentTermId && userRole && (
                                            <ClassResultStatusBadge
                                                classId={cls.id}
                                                termId={currentTermId}
                                                userRole={userRole}
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right flex items-center justify-end gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setManagingStudentsClass(cls)}>
                                            <GraduationCap className="h-4 w-4 mr-2" /> Students
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => setManagingSubjectsClass(cls)}>
                                            <BookOpen className="h-4 w-4 mr-2" /> Subjects
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(cls.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {classes.length === 0 && (
                                <TableRow><TableCell colSpan={5} className="text-center py-4">No classes found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Subject Management Dialog */}
            <Dialog open={!!managingSubjectsClass} onOpenChange={(open) => !open && setManagingSubjectsClass(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Manage Subjects: {managingSubjectsClass?.name}</DialogTitle>
                    </DialogHeader>
                    {managingSubjectsClass && (
                        <ClassSubjectManager
                            classId={managingSubjectsClass.id}
                            className={managingSubjectsClass.name}
                            availableSubjects={subjects}
                            staff={staff}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Student Management Dialog */}
            <Dialog open={!!managingStudentsClass} onOpenChange={(open) => !open && setManagingStudentsClass(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Students: {managingStudentsClass?.name}</DialogTitle>
                    </DialogHeader>
                    {managingStudentsClass && (
                        <StudentManagement
                            classId={managingStudentsClass.id}
                            className={managingStudentsClass.name}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
