// app/api/links/route.ts
import { NextRequest, NextResponse } from "next/server";
import rulesJson from "@/json/linkRules.json";

interface SiteRule {
  domain: string[];
  favicon: string;
  rules: Record<string, string>;
}

type LinkRules = {
  movie: SiteRule[];
  tv: SiteRule[];
};

const rules = rulesJson as LinkRules;

/**
 * Slugify titles for URLs
 */
function slugify(input: string): string {
  return input
    .normalize("NFD") // split accents
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // non-alphanum → dash
    .replace(/^-+|-+$/g, ""); // trim dashes
}

/**
 * Replace required [vars] in template
 */
function replaceVars(template: string, vars: Record<string, string>): string | null {
  const missing = [...template.matchAll(/\[([^\]]+)\]/g)].some(
    ([, key]) => vars[key] === undefined
  );
  if (missing) return null;

  return template.replace(/\[([^\]]+)\]/g, (_, key) => vars[key]);
}

/**
 * Expand optional groups (...) into multiple variations.
 * Returns all possible fully resolved URLs.
 */
function buildUrls(template: string, vars: Record<string, string>): string[] {
  const optionals = [...template.matchAll(/\(([^)]+)\)/g)];

  if (optionals.length === 0) {
    const result = replaceVars(template, vars);
    return result ? [result] : [];
  }

  let variations: string[] = [template];

  for (const match of optionals) {
    const group = match[0]; // e.g. "(-[year])"

    const newVariations: string[] = [];
    for (const variant of variations) {
      // Extract variables in the group
      const tokens = [...group.matchAll(/\[([^\]]+)\]/g)].map(m => m[1]);
      const hasAll = tokens.every(key => vars[key] !== undefined);

      // Case 1: keep group (if vars exist)
      if (hasAll) {
        const replaced = replaceVars(group.slice(1, -1), vars); // strip ()
        if (replaced) {
          newVariations.push(variant.replace(group, replaced));
        }
      }

      // Case 2: drop group entirely
      newVariations.push(variant.replace(group, ""));
    }
    variations = newVariations;
  }

  // Replace remaining required vars
  const finalUrls = variations
    .map(v => replaceVars(v, vars))
    .filter((u): u is string => u !== null);

  return [...new Set(finalUrls)];
}

async function isValidLink(url: string, domain: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "GET", redirect: "manual" });

    // 2xx → valid
    if (res.status >= 200 && res.status < 300) {
      // Extra check: make sure it’s not the homepage
      if (res.url === `https://${domain}/`) return false;
      return true;
    }

    // 3xx → check Location header
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      console.log("Redirected to:", location);
      if (!location) return false;

      // Redirected to homepage → invalid
      if (location === `https://${domain}/` || !res.ok) {
        return false;
      }

      // Otherwise consider valid
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

// build favicon url
function getFavicon(domain: string): string {
  return `https://${domain}/favicon.ico`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as "movie" | "tv";
  const linkType = searchParams.get("linkType") || "main";

  // Collect all vars from query params
  const vars: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (["title", "title_cz"].includes(key)) {
      vars[key] = slugify(value);
    } else {
      vars[key] = value;
    }
  });

  const results: { domain: string; url: string, favicon: string }[] = [];

  for (const site of rules[type] || []) {
    const baseRule = site.rules["main"];
    const baseUrls = buildUrls(baseRule, { ...vars, domain: site.domain[0] });

    for (let url of baseUrls) {
      // Handle sub-rule (episode, season, etc.)
      if (linkType !== "main") {
        const subRule = site.rules[linkType];
        if (subRule) {
          if (subRule === "main") {
            console.log("Sub-rule points to main, skipping");
            // already handled
          } else {
            const extras = buildUrls(subRule, { ...vars, domain: site.domain[0] });
            if (extras.length > 0) {
              // append each variation
              url = url + extras[0]; // if multiple, could loop
            }
          }
        }
      }

      try {
        console.log("Checking link:", url);
        if (await isValidLink(url, site.domain[0])) {
          results.push({ domain: site.domain[0], url, favicon: site.favicon });
        }
      } catch {
        // ignore errors
      }
    }
  }

  return NextResponse.json({ results });
}
