'use client';

import { useFormStatus } from 'react-dom';
import { registerUser } from '@/lib/user-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { useActionState } from 'react';

const subjects = [
    'Mathematics', 'English Language', 'Basic Science', 'Social Studies', 'Civic Education',
    'Biology', 'Chemistry', 'Physics', 'Further Mathematics', 'Literature in English',
    'Government', 'Economics', 'Commerce', 'Accounting'
];

export default function SignupPage() {
    const [state, dispatch] = useActionState(registerUser, null);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 py-10">
            <Card className="w-[600px]">
                <CardHeader>
                    <CardTitle>EduGrade Staff Registration</CardTitle>
                    <CardDescription>Join the staff to manage classes and subjects.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={dispatch} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input id="fullName" name="fullName" required placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" name="email" required placeholder="john@example.com" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" name="password" required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" name="phone" placeholder="+234..." />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gender">Gender</Label>
                                <Select name="gender" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MALE">Male</SelectItem>
                                        <SelectItem value="FEMALE">Female</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dateOfBirth">Date of Birth</Label>
                            <Input id="dateOfBirth" type="date" name="dateOfBirth" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="qualification">Qualification</Label>
                            <Input id="qualification" name="qualification" placeholder="B.Ed, B.Sc, etc." required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="preferredLevel">Preferred Teaching Level</Label>
                            <Select name="preferredLevel" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PRIMARY">Primary</SelectItem>
                                    <SelectItem value="SECONDARY">Secondary</SelectItem>
                                    <SelectItem value="BOTH">Both</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Subject Specializations</Label>
                            <p className="text-xs text-gray-500">Hold Ctrl/Cmd to select multiple (implemented as comma separated in backend for simplicity here)</p>
                            <div className="grid grid-cols-3 gap-2">
                                {subjects.map(sub => (
                                    <div key={sub} className="flex items-center space-x-2">
                                        <input type="checkbox" name="specializations" value={sub} id={`spec-${sub}`} className="h-4 w-4 rounded border-gray-300" />
                                        <label htmlFor={`spec-${sub}`} className="text-sm">{sub}</label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {state?.error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{state.error}</AlertDescription>
                            </Alert>
                        )}

                        {state?.success && (
                            <Alert className="bg-green-50 border-green-200 text-green-800">
                                <AlertTitle>Success</AlertTitle>
                                <AlertDescription>Registration successful! Please wait for admin approval.</AlertDescription>
                            </Alert>
                        )}

                        <SignupButton />
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center text-sm text-gray-500">
                    Already have an account? <Link href="/auth/login" className="ml-1 text-blue-600 hover:underline">Login</Link>
                </CardFooter>
            </Card>
        </div>
    );
}

function SignupButton() {
    const { pending } = useFormStatus();
    return (
        <Button className="w-full" type="submit" disabled={pending}>
            {pending ? 'Registering...' : 'Register as Staff'}
        </Button>
    );
}
