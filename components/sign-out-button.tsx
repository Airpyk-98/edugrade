'use client';

import { useFormStatus } from 'react-dom';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function SignOutButton() {
    return (
        <Button
            variant="ghost"
            className="w-full justify-start text-white hover:bg-slate-800 hover:text-white"
            onClick={() => signOut()}
        >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
        </Button>
    );
}
