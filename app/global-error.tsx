'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('GLOBAL ERROR CAUGHT:', error);
    }, [error]);

    return (
        <html>
            <body>
                <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
                    <h2>Global Application Error</h2>
                    <p>The application crashed with the following message:</p>
                    <pre style={{ background: '#f0f0f0', padding: '1rem', overflow: 'auto' }}>
                        {error.message}
                    </pre>
                    {error.digest && (
                        <p><strong>Digest:</strong> {error.digest}</p>
                    )}
                    <button onClick={() => reset()} style={{ padding: '0.5rem 1rem', marginTop: '1rem' }}>
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
