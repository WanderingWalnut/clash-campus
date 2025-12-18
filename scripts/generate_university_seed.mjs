// scripts/generate-university-seed.mjs
import fs from "node:fs";

const URL = "https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json";

const res = await fetch(URL);
if (!res.ok) throw new Error(`Failed to fetch dataset: ${res.status}`);
const data = await res.json();

// choose the countries you want
const countries = new Set(["Canada", "United States"]);

const rows = data
  .filter(u => countries.has(u.country))
  .map(u => ({
    name: u.name,
    country: u.country,
    domains: (u.domains ?? []).map(d => d.toLowerCase()),
    web_pages: u.web_pages ?? [],
  }))
  .filter(u => u.domains.length > 0);

// You can later add a "major" filter step here if you want (R1 list, etc.)
console.log(`-- Generated ${rows.length} universities (CA + US)`);

for (const u of rows) {
  // basic short_code heuristic (optional; you can improve)
  const short = u.name
    .replace(/[^A-Za-z0-9 ]/g, "")
    .split(" ")
    .slice(0, 3)
    .join("");

  console.log(`
insert into public.universities (name, short_code, email_domain)
values (${sql(u.name)}, ${sql(short)}, ${sql(u.domains[0])})
on conflict (email_domain) do update
set name = excluded.name, short_code = excluded.short_code;
`.trim());
}

function sql(s) {
  return `'${String(s).replaceAll("'", "''")}'`;
}
