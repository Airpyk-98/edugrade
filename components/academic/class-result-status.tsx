'use client';

import { useState, useEffect } from 'react';
import { ResultStatus } from '@prisma/client';
import { getClassResultStatus, updateClassResultStatus } from '@/lib/result-actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Unlock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function ClassResultStatusBadge({ classId, termId, userRole }: { classId: string, termId: string, userRole: string }) {
    const [status, setStatus] = useState<ResultStatus>('OPEN');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getClassResultStatus(classId, termId).then(s => setStatus(s as ResultStatus));
    }, [classId, termId]);

    const handleUpdate = async (newStatus: ResultStatus) => {
        if (!confirm(`Are you sure you want to ${newStatus}?`)) return;
        setLoading(true);
        const res = await updateClassResultStatus(classId, termId, newStatus);
        if (res.success) {
            setStatus(newStatus);
            toast.success(`Class results ${newStatus}`);
        } else {
            toast.error(res.error);
        }
        setLoading(false);
    };

    const isAdmin = userRole === 'HEADMASTER' || userRole === 'PRINCIPAL' || userRole === 'SUPER_ADMIN';

    // Badge Color
    const getBadgeVariant = (s: ResultStatus) => {
        switch (s) {
            case 'LOCKED': return 'destructive'; // Red
            case 'APPROVED': return 'default'; // Blue?
            case 'SUBMITTED': return 'secondary'; // Yellow-ish usually but secondary is grey. Let's stick to default colors or custom.
            default: return 'outline';
        }
    };

    // Custom colors for better visibility
    const badgeClass =
        status === 'LOCKED' ? 'bg-red-500 text-white hover:bg-red-600' :
            status === 'APPROVED' ? 'bg-green-500 text-white hover:bg-green-600' :
                status === 'SUBMITTED' ? 'bg-yellow-500 text-white hover:bg-yellow-600' :
                    'bg-slate-200 text-slate-800 hover:bg-slate-300';

    return (
        <div className="flex items-center gap-2">
            <Badge className={badgeClass}>{status}</Badge>

            {isAdmin && (
                <>
                    {(status === 'SUBMITTED' || status === 'OPEN') && (
                        <Button variant="ghost" size="icon" title="Lock Results" onClick={() => handleUpdate('LOCKED')} disabled={loading}>
                            <Lock className="h-4 w-4 text-green-600" />
                        </Button>
                    )}
                    {status === 'LOCKED' && (
                        <Button variant="ghost" size="icon" title="Unlock Results" onClick={() => handleUpdate('OPEN')} disabled={loading}>
                            <Unlock className="h-4 w-4 text-red-600" />
                        </Button>
                    )}
                </>
            )}
        </div>
    );
}
