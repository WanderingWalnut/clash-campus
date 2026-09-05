#!/usr/bin/env bash
set -euo pipefail

# Uses a fresh local PostgreSQL cluster, never DATABASE_URL or the live Supabase DB.
repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
pg_bin="${PG_BIN:-$(dirname "$(command -v initdb)")}"
for command_name in initdb pg_ctl psql; do
  if [[ ! -x "$pg_bin/$command_name" ]]; then
    echo "Install PostgreSQL and set PG_BIN to its bin directory." >&2
    exit 1
  fi
done
db_dir="$(mktemp -d "${TMPDIR:-/tmp}/clash-security-db.XXXXXX")"
cleanup() {
  "$pg_bin/pg_ctl" -D "$db_dir/data" -m fast stop >/dev/null 2>&1 || true
  rm -rf "$db_dir"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

"$pg_bin/initdb" -D "$db_dir/data" -A trust -U postgres --no-locale --encoding=UTF8 >"$db_dir/init.log" 2>&1 || {
  cat "$db_dir/init.log" >&2
  exit 1
}
# Empty listen_addresses disables TCP; the socket is inside the private temp directory.
"$pg_bin/pg_ctl" -D "$db_dir/data" -l "$db_dir/server.log" \
  -o "-h '' -k '$db_dir' -p 55439" start >/dev/null
psql=("$pg_bin/psql" -X -h "$db_dir" -p 55439 -U postgres -d postgres -v ON_ERROR_STOP=1)

# Minimal Supabase identities/roles for testing actual PostgreSQL grants and RLS.
# These objects are created only in this disposable cluster.
"${psql[@]}" >"$db_dir/migrations.log" <<'SQL'
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;
CREATE SCHEMA auth;
CREATE TABLE auth.users (id uuid PRIMARY KEY, email text, email_confirmed_at timestamptz);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.role', true), '') $$;
CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$ SELECT coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb) $$;
GRANT USAGE ON SCHEMA public, auth TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
SQL
for migration in "$repo_dir"/supabase/migrations/*.sql; do
  "${psql[@]}" -f "$migration" >>"$db_dir/migrations.log" 2>&1 || {
    cat "$db_dir/migrations.log" >&2
    exit 1
  }
done
"${psql[@]}" -f "$repo_dir/supabase/tests/verification_security.sql"
echo "Security database tests passed on a fresh local PostgreSQL cluster."
