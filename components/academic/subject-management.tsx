'use client';

import { useState } from 'react';
import { createSubject, deleteSubject } from '@/lib/subject-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Section } from '@prisma/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2 } from 'lucide-react';

interface SubjectInfo {
    id: string;
    name: string;
    code: string | null;
    section: string;
    isCore: boolean;
}

export function SubjectManagement({ subjects, section }: { subjects: SubjectInfo[], section: Section }) {
    const [isCreating, setIsCreating] = useState(false);
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [isCore, setIsCore] = useState(false);

    const handleCreate = async () => {
        if (!name || !code) {
            toast.error('Please fill in name and code');
            return;
        }

        const res = await createSubject({
            name,
            code,
            section,
            isCore
        });

        if (res.success) {
            toast.success('Subject created successfully');
            setIsCreating(false);
            setName('');
            setCode('');
            setIsCore(false);
        } else {
            toast.error(res.error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        const res = await deleteSubject(id);
        if (res.success) toast.success('Subject deleted');
        else toast.error(res.error);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Subjects ({section})</h2>
                <Button onClick={() => setIsCreating(!isCreating)}>{isCreating ? 'Cancel' : 'Add Subject'}</Button>
            </div>

            {isCreating && (
                <Card className="bg-slate-50">
                    <CardHeader><CardTitle className="text-base">New Subject</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Subject Name</Label>
                                <Input placeholder="e.g. Mathematics" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Code</Label>
                                <Input placeholder="e.g. MTH101" value={code} onChange={(e) => setCode(e.target.value)} />
                            </div>
                            <div className="flex items-center space-x-2 pt-8">
                                <Checkbox id="isCore" checked={isCore} onCheckedChange={(c) => setIsCore(!!c)} />
                                <Label htmlFor="isCore">Core Subject?</Label>
                            </div>
                        </div>
                        <Button onClick={handleCreate}>Create Subject</Button>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {subjects.map((sub) => (
                                <TableRow key={sub.id}>
                                    <TableCell className="font-medium">{sub.code}</TableCell>
                                    <TableCell>{sub.name}</TableCell>
                                    <TableCell>{sub.isCore ? 'Core' : 'Elective'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(sub.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {subjects.length === 0 && (
                                <TableRow><TableCell colSpan={4} className="text-center py-4">No subjects found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
