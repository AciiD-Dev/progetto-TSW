import { redirect } from 'next/navigation';

/**
 * /register now redirects to the unified auth page.
 * The login page handles both sign-in and sign-up with a mode toggle.
 */
export default function RegisterRedirect() {
  redirect('/login');
}