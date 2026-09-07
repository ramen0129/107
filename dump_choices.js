const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadScenarioFile(fileName) {
  const content = fs.readFileSync(path.join(__dirname, fileName), 'utf8');
  const m = content.match(/<script>([\s\S]*?)<\/script>/i);
  return (m ? m[1] : content).replace(/const\s+(SCENARIO_[A-Z]+|TIPS_MASTER)/g, 'var $1');
}

const context = {};
vm.createContext(context);
vm.runInContext(loadScenarioFile('scenario_ren.html'), context);
vm.runInContext(loadScenarioFile('scenario_elena.html'), context);
vm.runInContext(loadScenarioFile('scenario_daniel.html'), context);
vm.runInContext(loadScenarioFile('scenario_climax.html'), context);

const scenarios = [
  { key: 'A', name: 'シナリオA（レン：自由権）', data: context.SCENARIO_REN },
  { key: 'B', name: 'シナリオB（エレナ：平等権）', data: context.SCENARIO_ELENA }
];

scenarios.forEach(sc => {
  console.log(`\n========================================`);
  console.log(`### ${sc.name}`);
  console.log(`========================================`);
  Object.keys(sc.data).forEach(id => {
    const node = sc.data[id];
    if (node.isBadEnd || node.isKeepOut) return;
    if (!node.choices || node.choices.length === 0) return;
    console.log(`\n【${node.time || ''}】${node.id}：「${node.title || ''}」`);
    node.choices.forEach((ch, idx) => {
      let dest = ch.next || '';
      if (ch.checkJump) {
        dest = 'checkJump(' + ch.checkJump.slotKey + ')';
        if (ch.checkJump.branches) {
          dest += ' branches: ' + JSON.stringify(ch.checkJump.branches);
        }
        if (ch.checkJump.defaultNext) dest += ' def:' + ch.checkJump.defaultNext;
        if (ch.checkJump.onPass) dest += ' pass:' + ch.checkJump.onPass;
        if (ch.checkJump.onBlock) dest += ' block:' + ch.checkJump.onBlock;
      }
      if (ch.checkSecret) dest = 'checkSecret(3relics)';
      if (ch.checkTripleSync) dest = 'checkTripleSync(A,B,C)';
      const flagInfo = ch.slot ? ` [slot:${ch.slot}=${ch.flagValue}]` : '';
      const setF = ch.setFlags ? ` [setFlags:${ch.setFlags.join(',')}]` : '';
      console.log(`  - 選択肢${idx + 1}: ${ch.text}`);
      console.log(`      ➔ 遷移先: ${dest}${flagInfo}${setF}`);
    });
  });
});
