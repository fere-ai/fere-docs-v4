// Mintlify's export stores seo.organization in the page payload and does not
// print a JSON-LD script. Insert Organization on every page and FAQPage on
// /faq so the tags are in the HTML crawlers fetch. FAQ questions are the
// Accordion titles in faq.mdx, which is what the page renders.
import fs from "node:fs";
import path from "node:path";

const siteRoot = path.resolve(process.argv[2] || "_site");
const docs = JSON.parse(fs.readFileSync(new URL("./docs.json", import.meta.url), "utf8"));
const org = docs.seo && docs.seo.organization;
if (!org || !org.id || !org.name || !org.url || !org.logo) {
  console.error("docs.json seo.organization is missing id, name, url, or logo");
  process.exit(1);
}

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": org.id,
  name: org.name,
  url: org.url,
  logo: { "@type": "ImageObject", url: org.logo },
  sameAs: org.sameAs || [],
};

function plain(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
      const url = href.startsWith("/") ? "https://docs.fereai.xyz" + href : href;
      return label + " (" + url + ")";
    })
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function faqPage() {
  const source = fs.readFileSync(new URL("./faq.mdx", import.meta.url), "utf8");
  const items = [];
  const pattern = /<Accordion\s+title="([^"]+)">([\s\S]*?)<\/Accordion>/g;
  for (const match of source.matchAll(pattern)) {
    const name = match[1].trim();
    const text = plain(match[2]);
    if (!name || !text) continue;
    items.push({
      "@type": "Question",
      name,
      acceptedAnswer: { "@type": "Answer", text },
    });
  }
  if (!items.length) {
    console.error("faq.mdx has no Accordion questions");
    process.exit(1);
  }
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://docs.fereai.xyz/faq#faq",
    url: "https://docs.fereai.xyz/faq",
    publisher: { "@id": org.id },
    mainEntity: items,
  };
}

function scriptTag(data) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return '<script type="application/ld+json">' + json + "</script>";
}

function hasType(html, type) {
  const blocks = html.matchAll(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
  );
  const compact = '"@type":"' + type + '"';
  const spaced = '"@type": "' + type + '"';
  for (const block of blocks) {
    if (block[1].includes(compact) || block[1].includes(spaced)) return true;
  }
  return false;
}

function isFaqHtml(file, html) {
  const rel = path.relative(siteRoot, file).split(path.sep).join("/");
  if (rel === "faq.html" || rel === "faq/index.html") return true;
  return html.includes('rel="canonical" href="https://docs.fereai.xyz/faq"');
}

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

if (!fs.existsSync(siteRoot)) {
  console.error("export directory not found: " + siteRoot);
  process.exit(1);
}

const faq = faqPage();
const files = walk(siteRoot, []);
if (!files.length) {
  console.error("no HTML files in " + siteRoot);
  process.exit(1);
}

let faqPages = 0;
for (const file of files) {
  let html = fs.readFileSync(file, "utf8");
  const at = html.indexOf("</head>");
  if (at < 0) {
    console.error("no </head> in " + file);
    process.exit(1);
  }
  const tags = [];
  if (!hasType(html, "Organization")) tags.push(scriptTag(organization));
  if (isFaqHtml(file, html)) {
    faqPages += 1;
    if (!hasType(html, "FAQPage")) tags.push(scriptTag(faq));
  }
  if (tags.length) {
    html = html.slice(0, at) + tags.join("") + html.slice(at);
    fs.writeFileSync(file, html);
  }
}

if (faqPages !== 1) {
  console.error("expected one FAQ HTML file, found " + faqPages);
  process.exit(1);
}

console.log(
  "json-ld: Organization on " +
    files.length +
    " pages, FAQPage (" +
    faq.mainEntity.length +
    " questions) on /faq"
);
