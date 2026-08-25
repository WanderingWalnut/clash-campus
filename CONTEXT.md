# ClashCampus Product Context

ClashCampus turns Clash Royale performance into campus identity. A **student** verifies a **university email**, links and verifies one **Clash account**, and can then appear in **Royale Rankings**.

## Ubiquitous Language

- **Student**: a ClashCampus user with a confirmed email from a known university domain.
- **University identity**: the university matched from the student's normalized email domain.
- **Clash account**: the Clash Royale player tag linked to a student.
- **Verified Clash account**: a Clash account whose required in-game deck was confirmed by ClashCampus.
- **Campus Rankings**: the public university-versus-university Royale Rankings.
- **Player Rankings**: verified student rankings visible only to verified students from the same university.

## V1 Behaviour Contract

- Signup accepts only normalized email domains mapped to a university in the database.
- Signup and password reset require matching passwords with at least eight characters.
- Confirmed students without a verified Clash account go to `/verify`; verified students go to `/rankings`.
- A safe local `next` path can override the default after login. External and protocol-relative destinations are rejected.
- Campus Rankings stay public for signed-out, unverified, and verified visitors.
- Player Rankings require an authenticated, verified Clash account and stay scoped to the student's university.
- `/profile` requires authentication and shows incomplete setup states. `/verify` requires authentication and redirects verified students to `/rankings`.
- A student can correct a linked player tag before Clash account verification. A verified Clash account stays locked.
- Confirmation resend and password recovery use neutral responses for valid email syntax. Supabase supplies request limits; the UI supplies a 60-second resend cooldown.
- Password reset requires a current recovery session. Success updates the password, signs out all sessions, and returns to login.
- Logout keeps public pages available. Private pages return to login.

## V1 Non-goals

Email changes, account deletion, university transfers, replacement of a verified Clash account, and administration tools are future work.

## Safety Invariants

- Do not expose raw authentication provider errors to students.
- Do not reveal whether a valid email address has an account during resend or recovery.
- Do not mark an email or Clash account as verified after a partial failure.
- Keep individual player data protected by server checks and database row-level security.
