/**
 * 『パラレル・ジャパニア：クロニクル 〜失われた人権の180分〜』
 * 428型 タイムライン群像劇 バックエンドAPIシステム (Code.js)
 * 
 * 【モジュール構成・スプレッドシート完全永続化】
 * - スプレッドシートID: 1c_b9hAlH2virJOQnm8pfEZfcsGykoZBQbBlUgB6ruEY
 * - doGet での HtmlService.createTemplateFromFile テンプレート評価
 * - 11カラム構成のプレイ記録永続化・LockService排他制御
 * - exportScenarioToSpreadsheet による全シナリオ一括スプレッドシート書き出し
 */

const SPREADSHEET_ID = "1c_b9hAlH2virJOQnm8pfEZfcsGykoZBQbBlUgB6ruEY";

function doGet(e) {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('パラレル・ジャパニア：クロニクル 〜失われた人権の180分〜')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const result = saveProgress(data);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet() {
  let ss = null;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {}
  if (!ss) {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  }

  const sheetName = 'プレイ記録';
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow([
      '最終更新日時',
      '名前（カタカナ）',
      'パスコード',
      '現在主人公',
      '現在地（シーン名）',
      '達成度',
      '復帰キー',
      '【システム用】獲得フラグJSON',
      '【システム用】通過ノードJSON',
      '【システム用】解放結末JSON',
      '【システム用】スロット状態JSON'
    ]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function registerStudent(katakanaName) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (e) {
    return { status: "error", message: "アクセスが集中しています。少々お待ちください。" };
  }

  try {
    const sheet = getOrCreateSheet();
    const passcode = String(Math.floor(1000 + Math.random() * 9000));
    
    const initialFlags = [];
    const initialVisited = ["A_1000"];
    const initialEndings = {};
    const initialSlots = {};

    sheet.appendRow([
      new Date(),
      katakanaName,
      `'${passcode}`,
      "A: レン（自由権）",
      "10:00 首輪の火花",
      "0 / 11 結末解明",
      "A_1000",
      JSON.stringify(initialFlags),
      JSON.stringify(initialVisited),
      JSON.stringify(initialEndings),
      JSON.stringify(initialSlots)
    ]);

    return { status: "success", passcode: passcode };
  } catch (err) {
    return { status: "error", message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

function loadStudentProgress(katakanaName, passcode) {
  try {
    const sheet = getOrCreateSheet();
    const rows = sheet.getDataRange().getValues();
    const searchName = String(katakanaName).trim();
    const searchPass = String(passcode).trim();

    for (let i = rows.length - 1; i >= 1; i--) {
      const rName = String(rows[i][1]).trim();
      const rPass = String(rows[i][2]).replace("'", "").trim();

      if (rName === searchName && rPass === searchPass) {
        return {
          status: "success",
          data: {
            studentName: rName,
            passcode: rPass,
            currentChar: rows[i][3],
            lastSceneTitle: rows[i][4],
            lastNodeKey: rows[i][6] || "A_1000",
            userFlagsJSON: rows[i][7] || "[]",
            visitedNodesJSON: rows[i][8] || "[]",
            unlockedEndingsJSON: rows[i][9] || "{}",
            slotsJSON: rows[i][10] || "{}"
          }
        };
      }
    }
    return { status: "not_found", message: "名前またはパスコードが一致しません。" };
  } catch (err) {
    return { status: "error", message: err.toString() };
  }
}

function saveProgress(data) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (e) {
    return { status: "busy", message: "サーバー混雑中" };
  }

  try {
    const sheet = getOrCreateSheet();
    const rows = sheet.getDataRange().getValues();
    const inputKey = `${String(data.studentName).trim()}_${String(data.passcode).trim()}`;

    let targetRow = -1;
    let existingVisited = [];
    let existingEndings = {};

    for (let i = 1; i < rows.length; i++) {
      const rowKey = `${String(rows[i][1]).trim()}_${String(rows[i][2]).replace("'", "").trim()}`;
      if (rowKey === inputKey) {
        targetRow = i + 1;
        try { existingVisited = JSON.parse(rows[i][8] || "[]"); } catch (e) { existingVisited = []; }
        try { existingEndings = JSON.parse(rows[i][9] || "{}"); } catch (e) { existingEndings = {}; }
        break;
      }
    }

    const incomingVisited = data.visitedNodes || [];
    const mergedVisited = Array.from(new Set([...existingVisited, ...incomingVisited]));

    const incomingEndings = data.unlockedEndings || {};
    const mergedEndings = Object.assign({}, existingEndings, incomingEndings);

    const unlockedCount = Object.keys(mergedEndings).length;

    const rowData = [
      new Date(),
      data.studentName,
      `'${String(data.passcode)}`,
      data.currentCharName || "未選択",
      data.currentSceneTitle || "進行中",
      `${unlockedCount} / 11 結末解明`,
      data.currentNodeKey || "A_1000",
      JSON.stringify(data.userFlags || []),
      JSON.stringify(mergedVisited),
      JSON.stringify(mergedEndings),
      JSON.stringify(data.slots || {})
    ];

    if (targetRow > 0) {
      sheet.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }

    return { 
      status: "success", 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unlockedCount: unlockedCount
    };
  } catch (error) {
    return { status: "error", message: error.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * 全シナリオをスプレッドシートへタブ別に一括エクスポートする管理関数
 */
function exportScenarioToSpreadsheet() {
  let ss = null;
  try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (e) {}
  if (!ss) ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // 1. 各主人公シートの準備
  const sheetConfigs = [
    { name: "【レン】自由権タイムライン", char: "A" },
    { name: "【エレナ】平等権タイムライン", char: "B" },
    { name: "【ダニエル】社会権タイムライン", char: "C" },
    { name: "【クライマックス＆全結末】", char: "CLIMAX" },
    { name: "【逆照射TIPS法条文】", char: "TIPS" }
  ];

  sheetConfigs.forEach(function(cfg) {
    let sheet = ss.getSheetByName(cfg.name);
    if (!sheet) {
      sheet = ss.insertSheet(cfg.name);
    } else {
      sheet.clear();
    }

    if (cfg.char === "TIPS") {
      sheet.appendRow(["用語キー", "正式憲法用語", "根拠法条文", "逆照射解説（本来言いたいこと）"]);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, 4).setBackground("#0284c7").setFontColor("#ffffff").setFontWeight("bold");
    } else {
      sheet.appendRow([
        "ノードID", "時間", "シーン名", "ステージ", "本文内容",
        "選択肢1（テキスト）", "選択肢1（遷移先）",
        "選択肢2（テキスト）", "選択肢2（遷移先）", "特殊判定・フラグ"
      ]);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, 10).setBackground("#1e293b").setFontColor("#ffffff").setFontWeight("bold");
    }
  });

  return { status: "success", message: "スプレッドシートへのエクスポート枠組みを構築しました。" };
}
