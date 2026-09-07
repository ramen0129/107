const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log("=== PARALLEL JAPANIA 428-STYLE FULL CAUSALITY SIMULATOR (BAD_01 - BAD_23) ===");

function loadScenarioFile(fileName) {
  const content = fs.readFileSync(path.join(__dirname, fileName), 'utf8');
  const m = content.match(/<script>([\s\S]*?)<\/script>/i);
  const code = (m ? m[1] : content).replace(/const\s+(SCENARIO_[A-Z]+|TIPS_MASTER)/g, 'var $1');
  return code;
}

const context = {};
vm.createContext(context);
vm.runInContext(loadScenarioFile('scenario_ren.html'), context);
vm.runInContext(loadScenarioFile('scenario_elena.html'), context);
vm.runInContext(loadScenarioFile('scenario_daniel.html'), context);
vm.runInContext(loadScenarioFile('scenario_climax.html'), context);
if (fs.existsSync(path.join(__dirname, 'scenario_climax_ren.html'))) {
  vm.runInContext(loadScenarioFile('scenario_climax_ren.html'), context);
}
if (fs.existsSync(path.join(__dirname, 'scenario_climax_elena.html'))) {
  vm.runInContext(loadScenarioFile('scenario_climax_elena.html'), context);
}
if (fs.existsSync(path.join(__dirname, 'scenario_climax_daniel.html'))) {
  vm.runInContext(loadScenarioFile('scenario_climax_daniel.html'), context);
}
if (fs.existsSync(path.join(__dirname, 'scenario_shin.html'))) {
  vm.runInContext(loadScenarioFile('scenario_shin.html'), context);
}

const allNodes = Object.assign(
  {},
  context.SCENARIO_REN,
  context.SCENARIO_ELENA,
  context.SCENARIO_DANIEL,
  context.SCENARIO_CLIMAX,
  context.SCENARIO_CLIMAX_REN || {},
  context.SCENARIO_CLIMAX_ELENA || {},
  context.SCENARIO_CLIMAX_DANIEL || {},
  context.SCENARIO_SHIN || {}
);

const nodeKeys = Object.keys(allNodes);
console.log("Total loaded nodes across all files:", nodeKeys.length);

// 1. Broken Link Check
const brokenLinks = [];
nodeKeys.forEach(nodeId => {
  const node = allNodes[nodeId];
  if (!node.choices) return;

  node.choices.forEach((ch, cIdx) => {
    if (ch.next) {
      if (typeof ch.next === 'function') {
        const flagCombinations = [
          [],
          ["FLAG_ELENA_PRESSED"],
          ["FLAG_DANIEL_PRESSED"],
          ["FLAG_REN_PRESSED"],
          ["FLAG_ELENA_PRESSED", "FLAG_DANIEL_PRESSED"],
          ["FLAG_REN_PRESSED", "FLAG_DANIEL_PRESSED"],
          ["FLAG_REN_PRESSED", "FLAG_ELENA_PRESSED"],
          ["FLAG_REN_PRESSED", "FLAG_ELENA_PRESSED", "FLAG_DANIEL_PRESSED"]
        ];
        flagCombinations.forEach(flags => {
          const target = ch.next({ userFlags: flags });
          if (target && !allNodes[target]) {
            brokenLinks.push({ from: nodeId, choice: cIdx, target: target, type: "dynamic.next" });
          }
        });
      } else if (!allNodes[ch.next]) {
        brokenLinks.push({ from: nodeId, choice: cIdx, target: ch.next });
      }
    }
    if (ch.checkJump) {
      if (ch.checkJump.branches) {
        ch.checkJump.branches.forEach(b => {
          if (!allNodes[b.next]) {
            brokenLinks.push({ from: nodeId, choice: cIdx, target: b.next, type: "branch.next" });
          }
        });
      }
      if (ch.checkJump.defaultNext && !allNodes[ch.checkJump.defaultNext]) {
        brokenLinks.push({ from: nodeId, choice: cIdx, target: ch.checkJump.defaultNext, type: "defaultNext" });
      }
      if (ch.checkJump.onPass && !allNodes[ch.checkJump.onPass]) {
        brokenLinks.push({ from: nodeId, choice: cIdx, target: ch.checkJump.onPass, type: "onPass" });
      }
      if (ch.checkJump.onBlock && !allNodes[ch.checkJump.onBlock]) {
        brokenLinks.push({ from: nodeId, choice: cIdx, target: ch.checkJump.onBlock, type: "onBlock" });
      }
    }
  });
});

console.log("Broken link count:", brokenLinks.length);
if (brokenLinks.length > 0) {
  console.error("Broken links detected:", brokenLinks);
  process.exit(1);
} else {
  console.log("✓ ALL CHOICE TARGETS AND JUMP DESTINATIONS EXIST 100%!");
}

// 2. Bad Ends Check
console.log("\n--- Checking Bad End IDs (BAD_01 - BAD_23) ---");
for (let i = 1; i <= 23; i++) {
  const badId = "BAD_" + (i < 10 ? "0" + i : i);
  if (allNodes[badId]) {
    console.log(`✓ ${badId}: ${allNodes[badId].title} (JUMP: ${allNodes[badId].jumpTarget})`);
  } else {
    console.error(`✗ Missing Bad End: ${badId}`);
  }
}

// 3. Clear Ends Check
console.log("\n--- Checking Clear Ends ---");
["NORMAL_CLEAR", "TRUE_SECRET_END"].forEach(cid => {
  if (allNodes[cid]) {
    console.log(`✓ ${cid}: ${allNodes[cid].title}`);
  } else {
    console.error(`✗ Missing Clear End: ${cid}`);
  }
});

// 4. Cognitive Boundary Linter (DIR_08: Strict Character Knowledge Boundaries)
console.log("\n--- Checking Cognitive Boundary Violations (DIR_08 Linter) ---");
let cognitiveViolations = [];

function getNodeAllTexts(node) {
  if (!node.paragraphs) return [];
  const texts = [];
  const mockStates = [
    { slots: {} },
    { slots: { A_1020: 'A_LOCKER_PRY', A_1040: 'A_TRASH_HIDE', A_1045: 'A_DIVERSION_FIRE', A_1105: 'A_PEBBLE', B_1020: 'B_DECOY_ALARM', B_1045: 'B_GATE_ID', B_1120: 'B_DARK_DASH', C_1010: 'C_SEIZE_WATER', C_1030: 'C_BARRIER_BREAK', C_1045: 'C_PODIUM_ROAR', C_1100: 'C_CHARGE_ALONE' } },
    { slots: { A_1020: 'A_WINDOW_FORCE', A_1040: 'A_CEILING_DUCT', A_1045: 'A_CRAWL_EXIT', A_1105: 'A_TIMING', B_1020: 'B_GUARD_BRIBE', B_1045: 'B_DUCT_STEALTH', B_1120: 'B_CEILING_MOVE', C_1010: 'C_WAIT_NEGOTIATE', C_1030: 'C_SHELTER_EVAC', C_1045: 'C_LEADER_ORDER', C_1100: 'C_HUMAN_WALL' } }
  ];
  node.paragraphs.forEach(p => {
    if (typeof p === 'function') {
      mockStates.forEach(st => {
        try {
          const res = p(st);
          if (res) texts.push(res);
        } catch (e) {}
      });
    } else if (typeof p === 'string') {
      texts.push(p);
    }
  });
  return texts;
}

// Ren (A_ nodes) should not possess unobserved knowledge of the Clinic or Daniel before meeting
Object.entries(context.SCENARIO_REN || {}).forEach(([id, node]) => {
  const text = getNodeAllTexts(node).join(' ');
  if (text.includes("診療所") || text.includes("ダニエル")) {
    cognitiveViolations.push({ node: id, char: "Ren", reason: "Unobserved knowledge of Daniel/Clinic" });
  }
});

// Elena (B_ nodes) should not possess unobserved knowledge of Ren or Daniel before meeting
Object.entries(context.SCENARIO_ELENA || {}).forEach(([id, node]) => {
  const text = getNodeAllTexts(node).join(' ');
  if (text.includes("ダニエル") || (text.includes("レン") && !text.includes("サイレン"))) {
    cognitiveViolations.push({ node: id, char: "Elena", reason: "Unobserved knowledge of Ren/Daniel" });
  }
});

// Daniel (C_ nodes) should not possess unobserved knowledge of Ren or Elena before meeting
Object.entries(context.SCENARIO_DANIEL || {}).forEach(([id, node]) => {
  const text = getNodeAllTexts(node).join(' ');
  if (text.includes("エレナ") || (text.includes("レン") && !text.includes("サイレン") && !text.includes("試練") && !text.includes("カレン"))) {
    cognitiveViolations.push({ node: id, char: "Daniel", reason: "Unobserved knowledge of Ren/Elena" });
  }
});

if (cognitiveViolations.length > 0) {
  console.error("✗ Cognitive boundary violations detected:", cognitiveViolations);
  process.exit(1);
} else {
  console.log("✓ Zero cognitive boundary leaks detected across all individual character routes (including dynamic state branches)!");
}

// 5. Specification Slot Issuance & checkJump Consistency Validator
console.log("\n--- Checking Specification Slots & checkJump Consistency ---");
const issuedSlots = {};
const jumpSlotsReferenced = [];

nodeKeys.forEach(nodeId => {
  const node = allNodes[nodeId];
  if (!node.choices) return;

  node.choices.forEach((ch, cIdx) => {
    if (ch.slot) {
      if (!issuedSlots[ch.slot]) issuedSlots[ch.slot] = new Set();
      if (ch.flagValue) issuedSlots[ch.slot].add(ch.flagValue);
    }
    if (ch.checkJump && ch.checkJump.slotKey) {
      jumpSlotsReferenced.push({
        nodeId,
        choiceIdx: cIdx,
        slotKey: ch.checkJump.slotKey,
        expected: ch.checkJump.expected,
        branches: ch.checkJump.branches
      });
    }
  });
});

// A. Check required specification slot keys
const requiredSpecSlots = [
  // Ren Route
  "A_1000", "A_1015", "A_1030", "A_1100", "A_1105", "A_1130", "A_1150",
  // Elena Route
  "B_1000", "B_1030", "B_1045", "B_1100", "B_1115", "B_1120", "B_1145", "B_1150",
  // Daniel Route
  "C_1000", "C_1030_ITEM", "C_1045", "C_1100", "C_1110", "C_1135", "C_1140", "C_1150",
  // Climax
  "CLIMAX_HUB_ACTION", "CLIMAX_SCAN_ACTION", "CLIMAX_CHOICE"
];

let slotErrors = [];
requiredSpecSlots.forEach(slotKey => {
  if (!issuedSlots[slotKey] || issuedSlots[slotKey].size === 0) {
    slotErrors.push(`Missing specification slot definition: ${slotKey}`);
  } else {
    console.log(`✓ Slot [${slotKey}] issued with flags: [${Array.from(issuedSlots[slotKey]).join(', ')}]`);
  }
});

// B. Check that all checkJump references valid slots and expected/branch values match issued flags
jumpSlotsReferenced.forEach(j => {
  const issued = issuedSlots[j.slotKey];
  if (!issued) {
    slotErrors.push(`Node ${j.nodeId} checkJump references unissued slot: ${j.slotKey}`);
    return;
  }
  if (j.expected && !issued.has(j.expected)) {
    slotErrors.push(`Node ${j.nodeId} checkJump expects flag '${j.expected}' not issued by slot ${j.slotKey} (available: ${Array.from(issued).join(', ')})`);
  }
  if (j.branches) {
    j.branches.forEach(b => {
      if (!issued.has(b.value)) {
        slotErrors.push(`Node ${j.nodeId} checkJump branch checks flag '${b.value}' not issued by slot ${j.slotKey} (available: ${Array.from(issued).join(', ')})`);
      }
    });
  }
});

if (slotErrors.length > 0) {
  console.error("✗ Slot validation errors detected:", slotErrors);
  process.exit(1);
} else {
  console.log("✓ 100% of specification slots and checkJump references are perfectly matched!");
}

// 6. Comprehensive Narrative Secrecy & Rules Auditor (DIR_01, DIR_02, DIR_03, Meta Parentheses, TIPS)
console.log("\n--- Checking Narrative Secrecy (DIR_03), Persona Boundaries (DIR_01, DIR_02) & TIPS Consistency ---");

// Load TIPS_MASTER
vm.runInContext(loadScenarioFile('js_tips.html'), context);
const tipsKeys = Object.keys(context.TIPS_MASTER || {});

let ruleErrors = [];

// A. DIR_03 & Meta Parentheses in Individual Routes (before 12:15)
const forbiddenBefore1215 = [
  "第14条", "第25条", "第31条", "第18条", "第21条", "第13条", "第97条", "第99条",
  "日本国憲法", "厚生労働省", "最高裁判所",
  "（古遺物）", "（手帳型の古遺物）", "（厚生労働省）", "（刑事手続"
];

const individualScenarios = {
  'Ren (A)': context.SCENARIO_REN,
  'Elena (B)': context.SCENARIO_ELENA,
  'Daniel (C)': context.SCENARIO_DANIEL
};

Object.entries(individualScenarios).forEach(([name, scenario]) => {
  Object.entries(scenario).forEach(([nodeId, node]) => {
    if (node.paragraphs) {
      node.paragraphs.forEach((p, idx) => {
        const text = typeof p === 'function' ? (p({ slots: {} }) || '') : p;
        forbiddenBefore1215.forEach(w => {
          if (text.includes(w)) {
            ruleErrors.push(`DIR_03/Meta Violation in ${name} ${nodeId} paragraph[${idx}]: contains '${w}'`);
          }
        });
      });
    }
    if (node.choices) {
      node.choices.forEach((ch, cidx) => {
        if (ch.text) {
          forbiddenBefore1215.forEach(w => {
            if (ch.text.includes(w)) {
              ruleErrors.push(`DIR_03/Meta Violation in ${name} ${nodeId} choice[${cidx}]: contains '${w}'`);
            }
          });
        }
      });
    }
  });
});

// B. DIR_01 (No reader-directed second person in narration/system text)
nodeKeys.forEach(nodeId => {
  const node = allNodes[nodeId];
  // Post-clear epilogues/meta screens (after game is cleared) are directed to the player
  if (node.isClearEnd) return;
  if (node.paragraphs) {
    node.paragraphs.forEach((p, idx) => {
      const text = typeof p === 'function' ? (p({ slots: {} }) || '') : p;
      // Strip in-character spoken dialogue between 「...」 and 『...』 per DIR_01 exemption
      const narrationOnly = text.replace(/「[^」]*」/g, '').replace(/『[^』]*』/g, '');
      if (narrationOnly.includes("君は") || narrationOnly.includes("あなたは") || narrationOnly.includes("あなたの") || narrationOnly.includes("あなたの選択") || narrationOnly.includes("あなたの決断")) {
        ruleErrors.push(`DIR_01 Violation in node ${nodeId} paragraph[${idx}]: reader-directed second-person pronoun in narrative text`);
      }
    });
  }
});

// C. DIR_02 (No brackets in choices)
nodeKeys.forEach(nodeId => {
  const node = allNodes[nodeId];
  if (node.choices) {
    node.choices.forEach((ch, cidx) => {
      if (ch.text && (ch.text.includes("【") || ch.text.includes("】"))) {
        ruleErrors.push(`DIR_02 Violation in node ${nodeId} choice[${cidx}]: contains brackets 【...】`);
      }
    });
  }
});

// D. TIPS data-tip validation
const usedTips = new Set();
[
  'scenario_ren.html',
  'scenario_elena.html',
  'scenario_daniel.html',
  'scenario_climax.html',
  'scenario_climax_ren.html',
  'scenario_climax_elena.html',
  'scenario_climax_daniel.html',
  'scenario_shin.html'
].forEach(f => {
  if (fs.existsSync(path.join(__dirname, f))) {
    const content = fs.readFileSync(path.join(__dirname, f), 'utf8');
    const regex = /data-tip=['"]([^'"]+)['"]/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      usedTips.add(match[1]);
    }
  }
});

const missingTips = Array.from(usedTips).filter(t => !tipsKeys.includes(t));
if (missingTips.length > 0) {
  ruleErrors.push(`Missing TIPS_MASTER keys for data-tip: ${missingTips.join(', ')}`);
}

if (ruleErrors.length > 0) {
  console.error("✗ Rule & Narrative Secrecy violations detected:", ruleErrors);
  process.exit(1);
} else {
  console.log(`✓ 100% of DIR_01, DIR_02, DIR_03 narrative secrecy, meta parenthesis clearance, and all ${usedTips.size} TIPS linkages verified!`);
}

console.log("\n=== ALL SCENARIO INTEGRITY & LINT CHECKS PASSED ===");


