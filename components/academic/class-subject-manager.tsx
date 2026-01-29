'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    getClassSubjects,
    addSubjectToClass,
    removeSubjectFromClass,
    assignSubjectTeacher,
    removeSubjectTeacher
} from '@/lib/grad-subject-actions';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, UserPlus, BookOpen, X } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export function ClassSubjectManager({ classId, className, availableSubjects, staff }:
    { classId: string, className: string, availableSubjects: any[], staff: any[] }) {

    const [classSubjects, setClassSubjects] = useState<any[]>([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [loading, setLoading] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        const data = await getClassSubjects(classId);
        setClassSubjects(data);
        setLoading(false);
    }, [classId]);

    useEffect(() => {
        if (classId) loadData();
    }, [classId, loadData]);

    const handleAddSubject = async () => {
        if (!selectedSubjectId) return;
        const res = await addSubjectToClass(classId, selectedSubjectId);
        if (res.success) {
            toast.success('Subject added');
            loadData();
            setSelectedSubjectId('');
        } else {
            toast.error(res.error);
        }
    };

    const handleRemoveSubject = async (id: string) => {
        if (!confirm('Remove subject from this class?')) return;
        const res = await removeSubjectFromClass(id);
        if (res.success) {
            toast.success('Subject removed');
            loadData();
        } else {
            toast.error(res.error);
        }
    };

    const handleAssignTeacher = async (classSubjectId: string, teacherId: string) => {
        const res = await assignSubjectTeacher(classSubjectId, teacherId);
        if (res.success) {
            toast.success('Teacher assigned');
            loadData();
        } else {
            toast.error(res.error);
        }
    };

    const handleRemoveTeacher = async (assignmentId: string) => {
        const res = await removeSubjectTeacher(assignmentId);
        if (res.success) {
            toast.success('Teacher removed');
            loadData();
        } else {
            toast.error(res.error);
        }
    };

    // Filter subjects already added
    const unaddedSubjects = availableSubjects.filter(
        s => !classSubjects.some(cs => cs.subjectId === s.id)
    );

    return (
        <div className="space-y-6">
            <div className="flex gap-2 items-end">
                <div className="w-full">
                    <label className="text-sm font-medium mb-1 block">Add Subject to {className}</label>
                    <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                        <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
                        <SelectContent>
                            {unaddedSubjects.map(s => (
                                <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleAddSubject} disabled={!selectedSubjectId}>Add</Button>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Subject</TableHead>
                            <TableHead>Teachers</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {classSubjects.map(cs => (
                            <TableRow key={cs.id}>
                                <TableCell className="font-medium">
                                    {cs.subject.name}
                                    <div className="text-xs text-gray-500">{cs.subject.code}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap gap-1">
                                            {cs.teachers.map((t: any) => (
                                                <Badge key={t.id} variant="secondary" className="flex items-center gap-1">
                                                    {t.teacher.fullName}
                                                    <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => handleRemoveTeacher(t.id)} />
                                                </Badge>
                                            ))}
                                            {cs.teachers.length === 0 && <span className="text-sm text-gray-400 italic">No teachers assigned</span>}
                                        </div>

                                        <div className="flex gap-1 items-center">
                                            <Select onValueChange={(val) => handleAssignTeacher(cs.id, val)}>
                                                <SelectTrigger className="h-8 w-[180px] text-xs">
                                                    <SelectValue placeholder="+ Assign Teacher" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {staff.map(s => (
                                                        <SelectItem key={s.id} value={s.id}>{s.fullName}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleRemoveSubject(cs.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {classSubjects.length === 0 && !loading && (
                            <TableRow><TableCell colSpan={3} className="text-center py-4 text-gray-500">No subjects registered for this class.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
