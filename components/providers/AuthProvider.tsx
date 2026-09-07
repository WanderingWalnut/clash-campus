'use client';

/**
 * AuthProvider - Centralized authentication state management
 * 
 * This provider wraps the entire application and provides:
 * - Single source of truth for auth state across all client components
 * - Centralized redirect logic when auth state changes
 * - Real-time UI updates on login/logout
 * 
 * Architecture:
 * - Server-side middleware (proxy.ts) handles security-critical route protection
 * - This client-side provider handles reactive UX and post-auth-change navigation
 * 
 * @see https://nextjs.org/docs/app/building-your-application/authentication
 */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  startTransition,
  type ReactNode,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User, AuthChangeEvent } from '@supabase/supabase-js';

// ============================================================================
// Route Configuration
// ============================================================================

/**
 * Routes that require authentication.
 * When user logs out from these routes, they'll be redirected.
 */
const PROTECTED_ROUTES = ['/verify', '/profile', '/settings'];

/**
 * Where to redirect after logout, based on current route.
 * If route not found, uses 'default' key.
 */
const LOGOUT_REDIRECTS: Record<string, string> = {
  '/verify': '/login',
  '/profile': '/login',
  '/settings': '/login',
  default: '/',
};

/**
 * Auth events that should trigger a server state refresh.
 */
const REFRESH_EVENTS: AuthChangeEvent[] = [
  'SIGNED_IN',
  'SIGNED_OUT',
  'TOKEN_REFRESHED',
  'USER_UPDATED',
];

// Auth Context Definition

export interface AuthContextType {
  /** The authenticated user, or null if not authenticated */
  user: User | null;
  /** True while initial session is being fetched */
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// useAuth Hook

/**
 * Hook to access auth state from the AuthProvider context.
 * 
 * Must be used within an AuthProvider. Throws error if used outside.
 * 
 * @returns { user, isLoading } - Current user and loading state
 * 
 * @example
 * ```tsx
 * const { user, isLoading } = useAuth();
 * if (isLoading) return <Spinner />;
 * if (!user) return <LoginButton />;
 * return <UserProfile user={user} />;
 * ```
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// AuthProvider Component

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider - Wraps the application with authentication context.
 * 
 * Features:
 * - Fetches initial session on mount
 * - Subscribes to Supabase auth state changes
 * - Handles client-side redirects when auth state changes
 * - Triggers server state refresh on meaningful auth events
 * 
 * @param children - The application components to wrap
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Avoid stale closures in auth callbacks.
  const userRef = useRef<User | null>(null);
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const handleLogoutRedirect = useMemo(() => {
    return (currentPathname: string) => {
      const isProtectedRoute = PROTECTED_ROUTES.some(
        (route) => currentPathname === route || currentPathname.startsWith(route + '/')
      );

      if (!isProtectedRoute) {
        return;
      }

      const redirectTo =
        LOGOUT_REDIRECTS[currentPathname] ?? LOGOUT_REDIRECTS.default;

      startTransition(() => {
        router.push(redirectTo);
      });
    };
  }, [router]);

  useEffect(() => {
    // Create single Supabase client instance (singleton pattern)
    const supabase = createClient();

    // 1. Fetch initial session to avoid loading flash
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const nextUser = session?.user ?? null;
        userRef.current = nextUser;
        setUser(nextUser);
      } catch (error) {
        console.error('[AuthProvider] Error fetching session:', error);
        userRef.current = null;
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();

    // 2. Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const previousUser = userRef.current;
        const newUser = session?.user ?? null;

        // Update user state
        userRef.current = newUser;
        setUser(newUser);
        setIsLoading(false);

        // Handle logout: redirect from protected routes
        if (event === 'SIGNED_OUT' && previousUser && !newUser) {
          handleLogoutRedirect(pathnameRef.current);
        }

        // Trigger server state refresh on meaningful auth events
        if (REFRESH_EVENTS.includes(event)) {
          startTransition(() => {
            router.refresh();
          });
        }
      }
    );

    // 3. Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [handleLogoutRedirect, router]); // Only run on mount - we handle pathname separately

  // Re-check session when pathname changes (catches redirects from server-side login)
  // When login happens server-side via signInWithPassword(), the server redirects,
  // but the client-side auth state might not update immediately. This ensures we
  // check for the session after the redirect completes.
  useEffect(() => {
    const supabase = createClient();
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const nextUser = session?.user ?? null;
        userRef.current = nextUser;
        setUser(nextUser);
      } catch (error) {
        console.error('[AuthProvider] Error fetching session on pathname change:', error);
      }
    };
    
    // Small delay to ensure cookies are available after redirect
    const timeoutId = setTimeout(checkSession, 50);
    
    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

