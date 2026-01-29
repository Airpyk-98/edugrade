'use client';

import { useState } from 'react';
import { approveStaff, rejectStaff } from '@/lib/admin-actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { UserPosition, Section } from '@prisma/client';

export function PendingStaffList({ staff }: { staff: any[] }) {
    const [selectedSection, setSelectedSection] = useState<Record<string, Section>>({});
    const [selectedPosition, setSelectedPosition] = useState<Record<string, UserPosition>>({});

    const handleApprove = async (id: string) => {
        const section = selectedSection[id];
        const position = selectedPosition[id] || 'STAFF'; // Default to STAFF if not selected, but section is mandatory? Actually logic says assign to section. Head/Principal assign roles.

        // BUT Super Admin CAN assign Headmaster/Principal roles directly too as per request
        // "Super admin should approve staffs, And also assign them to primary section... or Secondary section"

        if (!section && position === 'STAFF') {
            toast.error('Please assign a section to the staff member.');
            return;
        }

        // Creating Headmaster/Principal implies assigning section too
        if (position === 'HEADMASTER' && section !== 'PRIMARY') {
            toast.error('Headmaster must be in Primary section.');
            return;
        }
        if (position === 'PRINCIPAL' && section !== 'SECONDARY') {
            toast.error('Principal must be in Secondary section.');
            return;
        }

        const result = await approveStaff(id, section, position);
        if (result.success) {
            toast.success('Staff approved successfully.');
        } else {
            toast.error(result.error);
        }
    };

    const handleReject = async (id: string) => {
        const result = await rejectStaff(id);
        if (result.success) {
            toast.success('Staff rejected.');
        } else {
            toast.error(result.error);
        }
    };

    if (staff.length === 0) {
        return (
            <Card>
                <CardHeader><CardTitle>No Pending Approvals</CardTitle></CardHeader>
                <CardContent>All staff registrations have been processed.</CardContent>
            </Card>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {staff.map((user) => (
                <Card key={user.id}>
                    <CardHeader>
                        <CardTitle>{user.fullName}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>Phone:</div><div>{user.phone || 'N/A'}</div>
                            <div>Qualification:</div><div>{user.qualification}</div>
                            <div>Pref. Level:</div><div>{user.preferredLevel}</div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Assign Section</label>
                            <Select onValueChange={(val: Section) => setSelectedSection(prev => ({ ...prev, [user.id]: val }))}>
                                <SelectTrigger><SelectValue placeholder="Select Section" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PRIMARY">Primary</SelectItem>
                                    <SelectItem value="SECONDARY">Secondary</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Assign Role (Optional)</label>
                            <Select onValueChange={(val: UserPosition) => setSelectedPosition(prev => ({ ...prev, [user.id]: val }))}>
                                <SelectTrigger><SelectValue placeholder="Role (Default: Staff)" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="STAFF">Staff</SelectItem>
                                    <SelectItem value="HEADMASTER">Headmaster (Primary)</SelectItem>
                                    <SelectItem value="PRINCIPAL">Principal (Secondary)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={() => handleReject(user.id)}>Reject</Button>
                        <Button onClick={() => handleApprove(user.id)}>Approve</Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
