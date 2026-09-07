# Verification security release checks

The security migration and application changes must ship together. Apply migration `20260905035609_secure_verification_trust_boundary.sql` before deploying the new application. Old verification actions will fail safely until the new application is ready.

The migration expires all pending deck challenges because older challenges could have been supplied by a client. Students with unfinished verification must start a new challenge. Existing verified accounts are unchanged; their historical proof was not audited by this change.

The deployment must have the server-only `SUPABASE_SECRET_KEY`, alongside the existing Supabase URL, publishable key and Clash Royale API key. Never expose the secret key to the browser. Challenge creation uses this trusted server client after authentication and player lookup. Approval uses it only after authentication, account ownership checks, and a successful deck match. The database checks confirmed university identity for both operations.

Password recovery uses Supabase-verified JWT claims. A recovery authentication method must be less than ten minutes old and match the current authenticated student. The old UUID cookie has no authority. No new signing secret is required.

Run `npm test`, `npm run lint`, `npm run build`, and `npm run test:db:security` before release. The database test uses a disposable PostgreSQL database with mocked Supabase authentication roles; it does not prove that the live project is reachable or configured correctly.

After deployment, use one isolated test student to check public Campus Rankings, incomplete setup, a corrected Clash tag, profile, same-university Player Rankings, and logout on desktop and mobile. Use administrative verification only for that fixture when the in-game step is unavailable. Check direct database calls still deny student verification writes. Live email delivery and in-game ownership require separate checks.
