'use client';

import { useState, useEffect } from 'react';
import { createStudent, deleteStudent, getStudentsByClass } from '@/lib/student-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, UserPlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Gender } from '@prisma/client';
import { format } from 'date-fns';

export function StudentManagement({ classId, className }: { classId: string, className: string }) {
    const [students, setStudents] = useState<any[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [otherNames, setOtherNames] = useState('');
    const [gender, setGender] = useState<Gender>('MALE'); // Default, needs select
    const [dob, setDob] = useState(''); // YYYY-MM-DD
    const [regNo, setRegNo] = useState('');

    const loadStudents = async () => {
        setLoading(true);
        const data = await getStudentsByClass(classId);
        setStudents(data);
        setLoading(false);
    };

    useEffect(() => {
        if (classId) loadStudents();
    }, [classId]);

    const handleCreate = async () => {
        if (!firstName || !lastName || !regNo || !dob) {
            toast.error('Please fill required fields');
            return;
        }

        const res = await createStudent({
            firstName,
            lastName,
            otherNames,
            gender,
            dateOfBirth: new Date(dob),
            classId,
            registrationNo: regNo
        });

        if (res.success) {
            toast.success('Student added successfully');
            setIsCreating(false);
            setFirstName('');
            setLastName('');
            setOtherNames('');
            setRegNo('');
            setDob('');
            loadStudents();
        } else {
            toast.error(res.error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This deletes all grades and records for this student!')) return;
        const res = await deleteStudent(id);
        if (res.success) {
            toast.success('Student deleted');
            loadStudents();
        } else {
            toast.error(res.error);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Students in {className} ({students.length})</h3>
                <Button size="sm" onClick={() => setIsCreating(!isCreating)}>{isCreating ? 'Cancel' : 'Add Student'}</Button>
            </div>

            {isCreating && (
                <div className="border p-4 rounded-md bg-slate-50 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>First Name <span className="text-red-500">*</span></Label>
                            <Input value={firstName} onChange={e => setFirstName(e.target.value)} />
                        </div>
                        <div>
                            <Label>Last Name <span className="text-red-500">*</span></Label>
                            <Input value={lastName} onChange={e => setLastName(e.target.value)} />
                        </div>
                        <div>
                            <Label>Other Names</Label>
                            <Input value={otherNames} onChange={e => setOtherNames(e.target.value)} />
                        </div>
                        <div>
                            <Label>Registration No <span className="text-red-500">*</span></Label>
                            <Input value={regNo} onChange={e => setRegNo(e.target.value)} />
                        </div>
                        <div>
                            <Label>Gender <span className="text-red-500">*</span></Label>
                            <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MALE">Male</SelectItem>
                                    <SelectItem value="FEMALE">Female</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Date of Birth <span className="text-red-500">*</span></Label>
                            <Input type="date" value={dob} onChange={e => setDob(e.target.value)} />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleCreate}>Save Student</Button>
                    </div>
                </div>
            )}

            <div className="border rounded-md overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Reg No</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Gender</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.map(s => (
                            <TableRow key={s.id}>
                                <TableCell className="font-medium">{s.registrationNo}</TableCell>
                                <TableCell>{s.lastName}, {s.firstName} {s.otherNames}</TableCell>
                                <TableCell>{s.gender}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(s.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {students.length === 0 && !loading && (
                            <TableRow><TableCell colSpan={4} className="text-center py-4 text-gray-500">No students found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
