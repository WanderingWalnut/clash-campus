/**
 * Barrel export for custom hooks.
 */
export { useAuth } from '@/components/providers/AuthProvider';
export type { AuthContextType as UseAuthResult } from '@/components/providers/AuthProvider';
export { useScrolled } from './useScrolled';
export { useReveal } from './useReveal';
export { useUniversityEmailValidation } from './useUniversityEmailValidation';
export type { EmailValidationStatus, UniversityEmailValidationResult } from './useUniversityEmailValidation';
export { useCampusRankings, usePlayerRankings } from './useRankingsData';

