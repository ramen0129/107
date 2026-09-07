const fs = require("fs");

const indexHtml = fs.readFileSync("index.html", "utf8");

// Extract all id="..." from indexHtml
const idRegex = /id=["']([^"']+)["']/g;
const declaredIds = new Set();
let match;
while ((match = idRegex.exec(indexHtml)) !== null) {
  declaredIds.add(match[1]);
}

const files = [
  "index.html",
  "js_ui.html",
  "js_engine.html",
  "js_state.html",
  "js_audio.html",
  "scenario_ren.html",
  "scenario_elena.html",
  "scenario_daniel.html",
  "scenario_climax.html"
];

console.log("=== CHECKING ALL document.getElementById ===");
let allOk = true;

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  const content = fs.readFileSync(f, "utf8");
  const getElRegex = /document\.getElementById\(["']([^"']+)["']\)/g;
  let m;
  const missing = [];
  while ((m = getElRegex.exec(content)) !== null) {
    const id = m[1];
    if (!declaredIds.has(id)) {
      missing.push(id);
      allOk = false;
    }
  }
  if (missing.length > 0) {
    console.log(`[${f}] Missing IDs:`, Array.from(new Set(missing)));
  } else {
    console.log(`[${f}] ALL IDs found!`);
  }
});
