import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAllStaff } from '@/lib/admin-actions';
import { getClasses } from '@/lib/class-actions';
import { getSubjects } from '@/lib/subject-actions';
import { StaffList } from '../admin/staff-list';
import { ClassManagement } from '@/components/academic/class-management';
import { SubjectManagement } from '@/components/academic/subject-management';
import { getActiveTerm } from '@/lib/term-actions';

export default async function HeadmasterDashboardPage() {
    const session = await auth();

    if (session?.user.position !== 'HEADMASTER') {
        redirect('/dashboard');
    }

    const primaryStaff = await getAllStaff();
    const classes = await getClasses('PRIMARY');
    const subjects = await getSubjects('PRIMARY');
    const activeTerm = await getActiveTerm();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Headmaster Dashboard (Primary)</h1>
            </div>

            {/* Cards ... */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Primary Staff</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{primaryStaff.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Classes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{classes.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Subjects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{subjects.length}</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="staff" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="staff">Staff Management</TabsTrigger>
                    <TabsTrigger value="classes">Classes</TabsTrigger>
                    <TabsTrigger value="subjects">Subjects</TabsTrigger>
                </TabsList>
                <TabsContent value="staff" className="space-y-4">
                    <StaffList staff={primaryStaff} />
                </TabsContent>
                <TabsContent value="classes">
                    <ClassManagement
                        classes={classes}
                        staff={primaryStaff}
                        subjects={subjects}
                        section="PRIMARY"
                        currentTermId={activeTerm?.id}
                        userRole={session.user.position}
                    />
                </TabsContent>
                <TabsContent value="subjects">
                    <SubjectManagement subjects={subjects} section="PRIMARY" />
                </TabsContent>
            </Tabs>
        </div>
    );
}
