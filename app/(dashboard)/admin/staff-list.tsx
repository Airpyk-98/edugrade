'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function StaffList({ staff }: { staff: any[] }) {
    if (staff.length === 0) {
        return (
            <Card>
                <CardHeader><CardTitle>No Staff Found</CardTitle></CardHeader>
                <CardContent>No active staff members found.</CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>All Staff Directory</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Section</TableHead>
                            <TableHead>Roles</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {staff.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.fullName}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.phone || 'N/A'}</TableCell>
                                <TableCell><Badge variant="outline">{user.position}</Badge></TableCell>
                                <TableCell>
                                    {user.section ? <Badge>{user.section}</Badge> : <span className="text-gray-400">-</span>}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 flex-wrap">
                                        {user.isClassTeacher && <Badge variant="secondary">Class Teacher</Badge>}
                                        {user.isSubjectTeacher && <Badge variant="secondary">Subject Teacher</Badge>}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
