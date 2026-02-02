import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DashboardPage() {
    let session;
    try {
        session = await auth();
    } catch (error) {
        console.error('Dashboard page auth check failed:', error);
    }

    if (!session?.user) {
        redirect('/auth/login');
    }

    const { position, fullName, status } = session.user;

    if (status !== 'APPROVED' && position !== 'SUPER_ADMIN') {
        return (
            <div className="flex h-screen items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-yellow-600">Pending Approval</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Welcome, {fullName}. Your account is currently <strong>{status}</strong>.</p>
                        <p className="mt-2">Please wait for the Super Administrator to approve your account and assign your role.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (session.user.position === 'SUPER_ADMIN') {
        redirect('/admin');
    } else if (session.user.position === 'HEADMASTER') {
        redirect('/headmaster');
    } else if (session.user.position === 'PRINCIPAL') {
        redirect('/principal');
    }

    // Staff (Teachers) specific dashboard view
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Welcome, {fullName}</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>My Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500">Position</p>
                        <p className="text-lg font-medium">{position}</p>
                        <p className="text-sm text-gray-500 mt-2">Section</p>
                        <p className="text-lg font-medium">{session.user.section || 'Unassigned'}</p>
                    </CardContent>
                </Card>

                {session.user.isClassTeacher && (
                    <Card className="bg-blue-50 border-blue-200">
                        <CardHeader>
                            <CardTitle className="text-blue-800">Class Teacher</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-blue-600">You are assigned as a Class Teacher.</p>
                            {/* Link to Class Management */}
                        </CardContent>
                    </Card>
                )}

                {session.user.isSubjectTeacher && (
                    <Card className="bg-purple-50 border-purple-200">
                        <CardHeader>
                            <CardTitle className="text-purple-800">Subject Teacher</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-purple-600">You have subject assignments.</p>
                            {/* Link to Grading Portal */}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
