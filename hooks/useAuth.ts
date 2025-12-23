'use client';

/**
 * Client-side authentication hook for reactive auth state.
 * 
 * Use this hook in Client Components that need to:
 * - Display different UI based on auth state (Navigation, buttons)
 * - React to login/logout events in real-time
 * 
 * For server-side auth (data fetching, security), use lib/auth/session.server.ts instead.
 * 
 */
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface UseAuthResult {
    /** The authenticated user, or null if not authenticated */
    user: User | null;
    /** True while initial session is being fetched */
    isLoading: boolean;
}

/**
 * Hook to track authentication state reactively.
 * 
 * Fetches initial session immediately, then listens for auth changes.
 * Always cleans up subscription on unmount to prevent memory leaks.
 * 
 * @returns { user, isLoading } - Current user and loading state
 */
export function useAuth(): UseAuthResult {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Create client inside hook to avoid stale closures
        const supabase = createClient();

        // 1. Fetch initial session to avoid loading flash
        const fetchSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setUser(session?.user ?? null);
            } catch (error) {
                console.error('Error fetching session:', error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSession();

        // 2. Set up listener for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                // Update user state on any auth event
                setUser(session?.user ?? null);

                // Ensure loading is false after any auth event
                if (isLoading) {
                    setIsLoading(false);
                }
            }
        );

        // 3. Cleanup: always unsubscribe to prevent memory leaks
        return () => {
            subscription.unsubscribe();
        };
    }, []); // Empty deps - set up once on mount

    return { user, isLoading };
}

