import fs from "node:fs";
const w = fs.readFileSync("workers/api/src/worker.js", "utf8");
const h = fs.readFileSync("web/index.html", "utf8");
function ok(v, m) { if (!v) { console.error("FAIL:", m); process.exit(1); } }
ok(w.includes("const potentialScore = Math.min(100, overall + 9)"), "Glow Potential uses the same displayed score as the client");
ok(w.includes('k !== "improvement_potential"'), "conflicting model improvement_potential is excluded from Glow metric context");
ok(w.includes('Displayed Potential score: ${potentialScore}'), "prompt explicitly supplies displayed Potential score");
ok(w.includes('["Potential", potentialScore]'), "Potential chip score is sourced from displayed Potential");
ok(w.includes('label === "Potential"'), "Potential prose has a score-consistency repair guard");
ok(!h.includes("streak secured"), "Home/Glow UI no longer contains secured streak copy");
ok(!h.includes("hs-streak-secured"), "green secured streak state is removed");
ok(h.includes('streakTile.classList.add("hs-streak-active")'), "normal active streak uses stable yellow state");
ok(h.includes('streakTxt.textContent = "🔥 " + streakCount + " day streak"'), "Glow header uses plain day streak copy");
console.log("PASS: Potential score and Home streak state are synchronized");
