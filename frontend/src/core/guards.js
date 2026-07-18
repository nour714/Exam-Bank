import { authService } from '../services/auth.service.js';
import { router } from './router.js';

/**
 * Route Guards
 * These return true if allowed, or false (and redirect) if denied.
 */

/**
 * Public routes can be accessed by anyone.
 */
export async function PublicRoute() {
  return true;
}

/**
 * Protected routes require authentication.
 */
export async function ProtectedRoute() {
  if (!authService.isAuthenticated()) {
    router.navigate('/login', { replace: true });
    return false;
  }
  return true;
}

/**
 * Guest-only routes (like Login/Register) redirect to Dashboard if already authenticated.
 */
export async function GuestOnlyRoute() {
  if (authService.isAuthenticated()) {
    router.navigate('/dashboard', { replace: true });
    return false;
  }
  return true;
}

/**
 * Role Guard Factory.
 * @param {string[]} allowedRoles 
 */
export function RoleGuard(allowedRoles = []) {
  return async () => {
    if (!authService.isAuthenticated()) {
      router.navigate('/login', { replace: true });
      return false;
    }
    
    // Using a simplistic role check based on authService
    // In a real scenario, authService.hasRole should support arrays or multiple checks
    const hasRole = allowedRoles.some(role => authService.hasRole(role));
    if (!hasRole) {
      router.navigate('/dashboard', { replace: true });
      return false;
    }
    
    return true;
  };
}
