/* Rewrites every <symbol> in the workbench sprite from the Lucide SVGs, verbatim.
 *   npm install lucide-static@latest --no-save --prefix tools/screenshots
 *   node tools/screenshots/apply-lucide.js
 * Reads icons-map.json (symbol id -> Lucide icon name). Path data is copied unchanged from
 * node_modules/lucide-static/icons/<name>.svg; nothing is drawn by hand. A symbol id missing
 * from the sprite is appended to src/partI3.svg. Safe to run twice. See ICONS.md. */
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const LUCIDE = path.join(__dirname, "node_modules", "lucide-static");
const map = JSON.parse(fs.readFileSync(path.join(__dirname, "icons-map.json"), "utf8"));
const files = ["src/partC3.html", "src/partShell.html", "src/partI3.svg"].map(f => path.join(ROOT, f));
const WRAP = '<g fill="none" stroke="currentColor" style="stroke-width:var(--sw,2)" stroke-linecap="round" stroke-linejoin="round">';
function glyph(name){
  const f = path.join(LUCIDE, "icons", name + ".svg");
  if(!fs.existsSync(f)) throw new Error("No Lucide icon named " + name);
  const svg = fs.readFileSync(f, "utf8");
  const inner = svg.replace(/<!--[\s\S]*?-->/g, "").replace(/^[\s\S]*?<svg[\s\S]*?>/, "").replace(/<\/svg>\s*$/, "");
  return inner.replace(/\s*\n\s*/g, "").trim();
}
const done = new Set(), src = {};
for(const f of files) src[f] = fs.readFileSync(f, "utf8");
for(const [id, name] of Object.entries(map)){
  const sym = `<symbol id="${id}" viewBox="0 0 24 24">${WRAP}${glyph(name)}</g></symbol>`;
  const re = new RegExp(String.raw`<symbol id="${id}" viewBox="0 0 24 24">[\s\S]*?</symbol>`);
  for(const f of files){ if(re.test(src[f])){ src[f] = src[f].replace(re, () => sym); done.add(id); } }
  if(!done.has(id)){
    const f = files[2]; src[f] = src[f].replace(/\n<\/svg>/, () => `\n  ${sym}\n</svg>`); done.add(id);
  }
}
const left = [];
for(const f of files){
  fs.writeFileSync(f, src[f]);
  for(const m of src[f].matchAll(/<symbol id="([a-z0-9-]+)"/g)) if(!map[m[1]]) left.push(m[1]);
}
console.log("symbols written:", done.size, "| symbols not in the map:", left.join(", ") || "none");
