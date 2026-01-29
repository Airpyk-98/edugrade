import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getPendingStaff, getAllStaff } from '@/lib/admin-actions';
import { PendingStaffList } from './pending-staff-list';
import { StaffList } from './staff-list';

export default async function AdminDashboardPage() {
    const session = await auth();

    if (session?.user.position !== 'SUPER_ADMIN') {
        redirect('/dashboard');
    }

    const pendingStaff = await getPendingStaff();
    const allStaff = await getAllStaff();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{allStaff.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{pendingStaff.length}</div>
                    </CardContent>
                </Card>
                {/* Can add more metrics like Total Students, etc. later */}
            </div>

            <Tabs defaultValue="pending" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
                    <TabsTrigger value="staff">All Staff</TabsTrigger>
                </TabsList>
                <TabsContent value="pending" className="space-y-4">
                    <PendingStaffList staff={pendingStaff} />
                </TabsContent>
                <TabsContent value="staff" className="space-y-4">
                    <StaffList staff={allStaff} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
