# Manual Browser-flow Matrix

Live Supabase email delivery and Clash Royale API end-to-end testing is deferred. Run this matrix later with configured test accounts.

| Journey | Starting state | Expected result |
| --- | --- | --- |
| Signup | Signed out, known university email | Confirmation message appears; resend is neutral and has a 60-second cooldown. |
| Signup rejection | Signed out, unknown email domain | Account is not created; the university-domain error is shown. |
| Email confirmation | Valid confirmation link | Unverified student goes to `/verify`; verified student goes to `/rankings`. |
| Expired confirmation | Expired or used link | Error page gives one resend-confirmation action. |
| Login | Unverified student | Login goes to `/verify`, unless a safe local `next` path was supplied. |
| Login | Verified student | Login goes to `/rankings`, unless a safe local `next` path was supplied. |
| Open redirect defense | Login with `next=//example.com` | Login uses the account-state default and stays on ClashCampus. |
| Password recovery | Valid or unknown email | The same neutral success message appears. |
| Password reset | Valid recovery link | Matching 8+ character password is accepted; all sessions sign out; login shows success. |
| Password reset failure | Missing or expired recovery session | No password changes; one retry link goes to `/forgot-password`. |
| Campus Rankings | Signed out, unverified, or verified | Campus Rankings load publicly. |
| Player Rankings | Signed out | Login prompt links to `/login?next=/rankings`. |
| Player Rankings | Signed in, unverified | Verification prompt links to `/verify`; no player data request succeeds. |
| Player Rankings | Signed in, verified | Only students from the same university appear. |
| Profile | Signed in, unverified | Own profile and incomplete setup action are visible. |
| Clash verification correction | Unverified linked account | A new player tag replaces the old unverified link and starts a new session. |
| Verified Clash account lock | Verified linked account | `/verify` and link actions do not replace it; navigation goes to `/rankings`. |
| Logout | `/` or `/rankings` | The public page remains available. |
| Logout | `/profile` or `/verify` | Navigation goes to `/login`. |
