import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@/components/sign-out-button';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect('/auth/login');
    }

    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
            <div className="w-full flex-none md:w-64 bg-slate-900 text-white p-4">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold">EduGrade</h1>
                </div>
                <nav className="flex flex-col space-y-2">
                    {/* Navigation links will go here */}
                    <div className="flex-grow"></div>
                    <SignOutButton />
                </nav>
            </div>
            <div className="flex-grow p-6 md:overflow-y-auto md:p-12">
                {children}
            </div>
        </div>
    );
}
