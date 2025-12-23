/**
 * Client-side authentication hook for reactive auth state.
 * 
 * Use this hook in Client Components that need to:
 * - Display different UI based on auth state (Navigation, buttons)
 * - React to login/logout events in real-time
 * 
 * For server-side auth (data fetching, security), use lib/auth/session.server.ts instead.
 * 
 * This hook re-exports from AuthProvider to maintain backward compatibility
 * with existing imports while centralizing auth state management.
 */

// Re-export from AuthProvider for backward compatibility
export { useAuth } from '@/components/providers/AuthProvider';
export type { AuthContextType as UseAuthResult } from '@/components/providers/AuthProvider';
