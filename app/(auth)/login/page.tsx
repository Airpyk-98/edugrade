'use client';

import { useFormStatus } from 'react-dom';
import { authenticate } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { useActionState } from 'react';

export default function LoginPage() {
    const [errorMessage, dispatch] = useActionState(authenticate, undefined);

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>EduGrade Login</CardTitle>
                    <CardDescription>Enter your credentials to access the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={dispatch} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" name="email" placeholder="m@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" name="password" required />
                        </div>
                        {errorMessage && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{errorMessage}</AlertDescription>
                            </Alert>
                        )}
                        <LoginButton />
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center text-sm text-gray-500">
                    Don't have an account? <Link href="/auth/signup" className="ml-1 text-blue-600 hover:underline">Sign up</Link>
                </CardFooter>
            </Card>
        </div>
    );
}

function LoginButton() {
    const { pending } = useFormStatus();
    return (
        <Button className="w-full" type="submit" disabled={pending}>
            {pending ? 'Logging in...' : 'Login'}
        </Button>
    );
}
