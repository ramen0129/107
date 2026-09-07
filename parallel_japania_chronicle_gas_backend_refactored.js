/**
 * 『パラレル・ジャパニア：クロニクル 〜失われた人権の180分〜』
 * 428型 タイムライン群像劇 バックエンドAPIシステム (コード.gs)
 * 
 * 【完全版マスターデータ内包】
 * - 11カラム構成（スロット状態JSON完全永続化）
 * - LockService（30秒）による排他制御
 * - 通過ノード・解放結末の非破壊集合論マージ
 * - 全シナリオノード（A/B/C・合流・全6結末・逆照射TIPS）完全収録
 */

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index')
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
  const ss = SpreadsheetApp.getActiveSpreadsheet();
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
    const initialVisited = ["A_1000", "B_1000", "C_1000"];
    const initialEndings = {};
    const initialSlots = {};

    sheet.appendRow([
      new Date(),
      katakanaName,
      `'${passcode}`,
      "A: レン（自由権）",
      "10:00 首輪の火花",
      "0 / 6 結末解明",
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

    // 非破壊集合マージ
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
      `${unlockedCount} / 6 結末解明`,
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

function getMasterScenario() {
  return MASTER_DATABASE;
}

const MASTER_DATABASE = {
  tips: {
    "身体の自由": {
      term: "身体の自由・居住移転の自由",
      law: "日本国憲法 第18条・第22条・第31条",
      desc: "💡【本来言いたいこと】：誰の許可もいらず、自分の行きたい場所へ行き、住む場所を選べる権利です。正当な法の手続きなしに人を縛ったり、意に反して奴隷のように働かせることを永久に禁じる、すべての自由の原点です。"
    },
    "表現の自由": {
      term: "表現の自由・検閲の禁止",
      law: "日本国憲法 第21条",
      desc: "💡【本来言いたいこと】：思ったことを叫び、ビラを配り、電波やネットで意見を発信できる権利です。政府が事前に言論を取り締まる『検閲』を禁じ、多様な批判や議論によって社会を正しく保つための盾です。"
    },
    "法の下の平等": {
      term: "法の下の平等（門地・身分差別の禁止）",
      law: "日本国憲法 第14条",
      desc: "💡【本来言いたいこと】：生まれた家柄や親の血統、人種、性別によって人生の価値や扱いを分けられてはならないという鉄則です。現代社会において貴族などの特権階級の存在を永久に認めない防壁です。"
    },
    "生存権": {
      term: "生存権（健康で文化的な最低限度の生活）",
      law: "日本国憲法 第25条",
      desc: "💡【本来言いたいこと】：『働けぬ者は飢えて死ね』という弱肉強食を許さず、人間である限り、社会全体で健康で文化的な生活を支え合う権利です。医療保険、年金、生活保護などの公的制度の土台です。"
    },
    "労働基本権": {
      term: "勤労権・労働三権",
      law: "日本国憲法 第27条・第28条",
      desc: "💡【本来言いたいこと】：過酷労働や使い捨てから命を守るため、働く者が団結して労働組合をつくり、労働時間や賃金などの改善を対等に交渉する権利です。"
    },
    "公共の福祉": {
      term: "公共の福祉による権利の調整",
      law: "日本国憲法 第12条・第13条",
      desc: "💡【本来言いたいこと】：自分の自由を振りかざして他人の生命や尊厳を奪ってはならないという『社会全体の調和ルール』です。人権は絶対ですが、他人の人権と衝突した時にはお互いに譲り合わなければなりません。"
    }
  },

  nodes: {
    "A_1000": {
      id: "A_1000", char: "A", charName: "レン（自由権）", time: "10:00",
      stage: "10:00 スラム地下工場", title: "首輪の火花",
      paragraphs: [
        "首に取り付けられた電磁首輪が、赤い警告音をピピピと響かせている。",
        "ここは地下100メートルの軍需工場。外へ出ることは掟で禁じられ、逆らう者は即座に電流で気絶させられる。",
        "あなたはスラムの少年レン。今日こそ、この見えない檻を脱出すると決めた。"
      ],
      choices: [
        { text: "非常用レンチで首輪のロックを力づくで叩き割る！", next: "A_1015", slot: "A_1000", flagValue: "A_BROKE_COLLAR", fx: "flash" }
      ]
    },

    "A_1015": {
      id: "A_1015", char: "A", charName: "レン（自由権）", time: "10:15",
      stage: "10:15 地上検問路地", title: "検問ゲートの選択",
      paragraphs: [
        "火花とともに首輪が砕け散り、首を締め付ける鉄の冷たさが消えた！ 息ができる。<span class='tip-link' data-tip='身体の自由'>自分の足で、どこへだって走っていける</span>んだ！",
        "だが非常警報が鳴り響き、警備ドローンが路地を塞ぎに来る。",
        "目の前の壁には「街全体の配電盤」と、ドローンを制御する「警察の通信アンテナ」がある。"
      ],
      choices: [
        {
          text: "配電盤をショートさせて街路灯を消し、闇に紛れて逃げる",
          next: "A_1030_DARK",
          slot: "A_1015",
          flagValue: "A_BLACKOUT",
          fx: "flash"
        },
        {
          text: "通信アンテナを壊し、ドローンの追跡電波だけを狂わせる",
          next: "A_1030_SIGNAL",
          slot: "A_1015",
          flagValue: "A_SIGNAL_BROKEN",
          fx: "none"
        }
      ]
    },

    "A_1030_DARK": {
      id: "A_1030_DARK", char: "A", charName: "レン（自由権）", time: "10:30",
      stage: "10:30 静まり返るスラム", title: "闇の中の逃亡",
      paragraphs: [
        "バチバチと火花が散り、スラム一帯の明かりが一斉に消え去った。",
        "追跡ドローンは暗闇の中で見失い、逃走には成功した。",
        "しかし遠くの地下診療所の方角から、非常電源のアラームと悲痛な叫び声が響いた気がした……。"
      ],
      choices: [
        { text: "胸騒ぎを覚えながらも、先を急ぐ", next: "A_1045_WATERGATE" }
      ]
    },

    "A_1030_SIGNAL": {
      id: "A_1030_SIGNAL", char: "A", charName: "レン（自由権）", time: "10:30",
      stage: "10:30 地下水路の泥板", title: "泥の中の幾何学板",
      paragraphs: [
        "アンテナを鉄パイプでへし折ると、ドローンは旋回を狂わせてビルの壁に激突した。",
        "地上ゲートの方角でも、上空のドローンが狂乱し、警備兵たちが慌てて空を見上げているのが見えた。",
        "足元に泥に埋もれた「青い長方形の金属板」が転がっていた。厚みは3ミリほどあり、叩くと硬質な音が返ってくる。表面には白く掠れた角ばった直線が描かれている。"
      ],
      choices: [
        { text: "こんなガラクタに構っている暇はない。先を急ごう", next: "A_1045_WATERGATE" },
        {
          text: "頑丈そうだ。防弾板として上着の胸元に差し込んでおこう",
          next: "A_1045_WATERGATE",
          setFlags: ["PIECE_A"],
          fx: "none"
        }
      ]
    },

    "A_1045_WATERGATE": {
      id: "A_1045_WATERGATE", char: "A", charName: "レン（自由権）", time: "10:45",
      stage: "10:45 地下水路・境界水門", title: "濁流の水門扉",
      keepOut: {
        requireFlag: "C_PUMP_ACTIVATED",
        jumpChar: "C",
        jumpTime: "10:25",
        reason: "地下水路が激しい濁流で水没しており、水門の扉へ近づくことができない！",
        hint: "10:25 地下診療所のダニエル（C）が、手術を成功させて排水ポンプを動かせば水位が下がるはずだ。"
      },
      paragraphs: [
        "ゴオオオ……と地下のどこかで巨大な排水ポンプが唸りを上げ、水路の濁流が一気に引き始めた！",
        "「水が引いた……？ 理由はわからないが、天が味方してくれたんだ！」",
        "露出した水門扉を押し開け、レンは中央印刷所へと続くダクトへ駆け込んだ！"
      ],
      choices: [
        { text: "中央印刷所に潜入し、全都市への告発放送を行う！", next: "A_1100" }
      ]
    },

    "A_1100": {
      id: "A_1100", char: "A", charName: "レン（自由権）", time: "11:00",
      stage: "11:00 中央印刷所", title: "鳴り響く火災報知器",
      paragraphs: [
        "印刷所の放送ブースへ滑り込もうとしたレンだったが、通路には武装した検閲警備兵が立ち塞がっていた！",
        "「くそっ、このままじゃブースに入る前に射殺される……一か八かだ！」",
        "レンは壁の非常用スプリンクラー起動レバーを力任せに引き倒し、火災ベルを叩き割った！",
        "ウーウーと全館サイレンが鳴り響き、滝のような水が噴き出して印刷所は大パニックに陥った！",
        "「火事だ！ 大規模火災だ！ 貴族街の本部へ応援を要請しろ！」と警備兵たちが慌てふためいて逃げ出していく！"
      ],
      choices: [
        {
          text: "パニックに乗じて放送室へ飛び込み、全都市へ演説を流す！",
          next: "A_1130",
          slot: "A_1100",
          flagValue: "A_ALARM_RING"
        }
      ]
    },

    "A_1130": {
      id: "A_1130", char: "A", charName: "レン（自由権）", time: "11:30",
      stage: "11:30 印刷所マイク前", title: "生きた声と防弾板",
      paragraphs: [
        "全都市のスピーカーを占拠したレンは、胸の底から湧き上がる怒りをマイクへ叩きつけた。",
        "「目を覚ませ！ 怯えて黙り込むのはもう終わりだ！ <span class='tip-link' data-tip='表現の自由'>思ったことを叫んで</span>、どこへでも自分の足で歩いていく……俺たちは誰かの飼い犬じゃない、生きてる人間だ！！」",
        "突入してきた警備ドローンがレンの胸元へ電磁テーザー弾を放つ！",
        "バチィンッ！！ 鋭い金属音が響いた。胸ポケットに差し込んでいた青い鉄板が、弾丸を見事に跳ね返したのだ！",
        "だが印刷所の出口は完全封鎖された。「下へ逃げる道はない……上だ！ 塔の点検ハッチから屋上へ逃げて、あそこの主アンテナから放送を続けるしかない！」"
      ],
      choices: [
        {
          text: "追っ手を振り切り、時計塔頂上の主アンテナを目指して階段を駆け上がる！",
          next: "CLIMAX_HUB",
          slot: "A_1130",
          flagValue: "A_FREEDOM_DONE"
        },
        {
          text: "言論など無意味だ。マイクを捨て、首輪の解除コードだけを奪って身を潜める",
          next: "BAD_04",
          slot: "A_1130",
          flagValue: "A_GIVEUP_SPEECH"
        }
      ]
    },

    "B_1000": {
      id: "B_1000", char: "B", charName: "エレナ（平等権）", time: "10:00",
      stage: "10:00 特権監査局", title: "純白の制服",
      paragraphs: [
        "エレナは特権階級「大歯車」の紋章が刻まれた純白の制服に身を包んでいた。",
        "手元の極秘ファイルには、家柄や血統だけで市民の階級を固定する不当な改ざん記録が記されていた。"
      ],
      choices: [
        { text: "実態を確かめるため、境界ゲートの現場監査へ向かう", next: "B_1020" }
      ]
    },

    "B_1020": {
      id: "B_1020", char: "B", charName: "エレナ（平等権）", time: "10:20",
      stage: "10:20 境界ゲート", title: "境界線の銃口",
      paragraphs: [
        "貴族区とスラムを隔てる巨大な鉄の境界ゲート。",
        "身分証を持たないスラムの少年が、警備兵に銃口を突きつけられていた。"
      ],
      choices: [
        {
          text: "「銃を下ろしなさい！ 生まれた血筋だけで命の価値を決める掟など、私が絶対に認めません！」と割り込む",
          next: "B_1040_SAVE",
          slot: "B_1020",
          flagValue: "B_SAVED_BOY",
          fx: "flash"
        },
        {
          text: "職務権限を越えるトラブルを避け、冷徹に見過ごす",
          next: "BAD_02",
          slot: "B_1020",
          flagValue: "B_IGNORED_BOY",
          fx: "none"
        }
      ]
    },

    "B_1040_SAVE": {
      id: "B_1040_SAVE", char: "B", charName: "エレナ（平等権）", time: "10:40",
      stage: "10:40 境界ゲート裏", title: "託された使命",
      paragraphs: [
        "エレナの一喝に怯んだ警備兵は銃を収め、少年は「ありがとう監査官さん！ 母ちゃんの薬を持ってスラムへ逃げなきゃ！」と地下の抜け穴へ脱兎のごとく駆け去っていった。",
        "エレナは拳を強く握りしめた。門地や血統による差別の根源を断つため、貴族街の中央公文書保管庫（特権薬品庫の地下）にある身分制度マスターサーバーへ潜入することを決意した。"
      ],
      choices: [
        { text: "貴族薬品庫・地下公文書庫へ向かう", next: "B_1100" }
      ]
    },

    "B_1100": {
      id: "B_1100", char: "B", charName: "エレナ（平等権）", time: "11:00",
      stage: "11:00 貴族街・特権薬品庫前", title: "重警備の鉄扉",
      keepOut: {
        requireFlag: "A_ALARM_RING",
        jumpChar: "A",
        jumpTime: "11:00",
        reason: "貴族薬品庫の周囲に重装備の警備兵が密集しており、近づけない！",
        hint: "11:00 中央印刷所にいるレン（A）が、警備兵の目を逸らす火災報知器を鳴らせるはずだ。"
      },
      paragraphs: [
        "突如として、中央印刷所の方角からけたたましい火災報知サイレンが響き渡った！",
        "「印刷所でテロ発生！ 全員直ちに応援へ向かえ！」と叫び、薬品庫を守っていた警備兵たちが一斉に走り去っていく！",
        "「……何が起きたのか知らないけれど、天が味方してくれたわ。」",
        "もぬけの殻となった扉へ滑り込み、エレナは身分制撤廃マスターコードを手に入れた！"
      ],
      choices: [
        {
          text: "崩壊金庫の残骸を調べる",
          next: "B_1120_VAULT",
          slot: "B_1100",
          flagValue: "B_GOT_CODE"
        }
      ]
    },

    "B_1120_VAULT": {
      id: "B_1120_VAULT", char: "B", charName: "エレナ（平等権）", time: "11:20",
      stage: "11:20 爆破解体された古代金庫", title: "瓦礫の真鍮銘板",
      paragraphs: [
        "ふと横を見ると、爆破された古代金庫の瓦礫に鈍い金色を放つ真鍮プレートが落ちていた。",
        "煤を払うと、水平の溝の下に十字交差があり、四角が縦に並んだ緻密な溝が刻まれている。"
      ],
      choices: [
        { text: "煙が充満する前に、放送バルコニーへ急ぐ", next: "B_1130" },
        {
          text: "強い意志を感じる銘板だ。制服のポケットに大切にしまおう",
          next: "B_1130",
          setFlags: ["PIECE_B"],
          fx: "none"
        }
      ]
    },

    "B_1130": {
      id: "B_1130", char: "B", charName: "エレナ（平等権）", time: "11:30",
      stage: "11:30 議事堂大バルコニー", title: "平等の叫び",
      paragraphs: [
        "バルコニーに立ったエレナは、胸の貴族章を引きちぎって群衆の前へ投げ捨てた！",
        "「生まれついた家柄が何だというの！？ <span class='tip-link' data-tip='法の下の平等'>流れる血の色は、貴族もスラムの民も同じ赤</span>よ！ 誰一人として、生まれた瞬間に踏みつけられていい命なんてないわ！！」",
        "広場が地鳴りのような歓声に包まれたその時、保安局の全セキュリティからエレナへ抹殺プロトコルが発令される！",
        "「現場の端末では地方局レベルしか解除できない……！ 身分認証サーバーを物理的に落とせるのは、統治AIが置かれた時計塔最上階の【原本管理室】だけよ！」"
      ],
      choices: [
        {
          text: "私の家族が築いた偽りの支配を止めるため、時計塔最上階へ突入する！",
          next: "CLIMAX_HUB",
          slot: "B_1130",
          flagValue: "B_EQUALITY_DONE"
        }
      ]
    },

    "C_1000": {
      id: "C_1000", char: "C", charName: "ダニエル（社会権）", time: "10:00",
      stage: "10:00 スラム地下診療所", title: "命の選別",
      paragraphs: [
        "地下診療所には、工場の有害ガスで肺を侵された労働者たちが折り重なるように倒れていた。",
        "医師ダニエルは私財を投げ打って無償治療を続けていたが、薬品も電力も底をつきかけていた。"
      ],
      choices: [
        { text: "運ばれてきた重症労働者の緊急手術を開始する", next: "C_1025" }
      ]
    },

    "C_1025": {
      id: "C_1025", char: "C", charName: "ダニエル（社会権）", time: "10:25",
      stage: "10:25 手術室", title: "薄氷の生命維持",
      trap: {
        triggerFlag: "A_BLACKOUT",
        badEndNode: "BAD_01"
      },
      keepOut: {
        requireFlag: "B_SAVED_BOY",
        jumpChar: "B",
        jumpTime: "10:20",
        reason: "患者の血圧が急低下！止血用の特殊抗凝固剤が手元になく、執刀を続けられない！",
        hint: "10:20 境界ゲートのエレナ（B）が少年を救っていれば、少年が薬を持って診療所へ駆け込むはずだ。"
      },
      paragraphs: [
        "「先生！ 助けてくれ、母ちゃんの手術に使ってくれ！」 境界ゲートの検問を命からがら逃げ延びてきた少年が、胸ポケットから貴重な止血用アンプルを差し出した！",
        "無影灯の明かりの下、ダニエルのメスが正確に患部を捉える。生命維持装置が力強い脈動を刻み、手術は見事に成功した。",
        "だがその瞬間、足元から冷たい水が押し寄せてきた。非常警報の赤ランプが点滅する！",
        "「まずい！ 地下水路が氾濫して、この診療所まで水没しかけている！ 電力が回復している今なら、主配電盤の第4大型排水ポンプを動かせるはずだ！」"
      ],
      choices: [
        {
          text: "浸水を防ぐため大型排水ポンプを全開にし、旧防空壕跡へ薬品調達に向かう",
          next: "C_1100",
          slot: "C_1025",
          flagValue: "C_PUMP_ACTIVATED"
        }
      ]
    },

    "C_1100": {
      id: "C_1100", char: "C", charName: "ダニエル（社会権）", time: "11:00",
      stage: "11:00 崩落防空壕跡", title: "奇跡の救急木箱",
      paragraphs: [
        "手術を終えたダニエルは、旧防空壕跡を掘り起こした。",
        "瓦礫の下から引っ張り出したのは、奇跡的に腐食を免れていた重い樫の木の箱だった。"
      ],
      choices: [
        { text: "中身の抗生物質だけを掴み、工場前へ急ぐ", next: "C_1130" },
        {
          text: "この木箱ごと運ぼう。誰かの祈りがこもっている気がする",
          next: "C_1130",
          setFlags: ["PIECE_C"],
          fx: "none"
        }
      ]
    },

    "C_1130": {
      id: "C_1130", char: "C", charName: "ダニエル（社会権）", time: "11:30",
      stage: "11:30 工場前広場", title: "生存の叫びとストライキ",
      paragraphs: [
        "街中には「自由だ！」「平等だ！」と歓喜の声が響いている。",
        "だが工場主たちは冷笑を浮かべて腕を組んだ。「自由に休め。だが働かない奴には一銭も払わん。飢えて死ね」",
        "ダニエルは薬品を配りながら、労働者たちの先頭に立って叫んだ！",
        "「首輪を外して自由になれば、それで腹が膨れるとでも思っているのか！？ 働いても働いても薬一粒買えず、<span class='tip-link' data-tip='労働基本権'>病気になればゴミのように捨てられる</span>……そんな生き地獄を許していいはずがない！ <span class='tip-link' data-tip='生存権'>人間らしく飯を食い、眠り、生き抜くための命の分け前</span>を寄こせ！！」",
        "激怒した支配層は報復としてスラム全域の生命維持ライフライン（電力・送水・医療用酸素）の元栓を強制遮断した！",
        "「先生！ 診療所の酸素ボンベが尽きかけ、患者たちが呼吸停止に陥っています！ 元栓があるのは時計塔最上階の環境統括ブロックです！」",
        "「目の前で数百人の命を見殺しにできるか！ 私が行く！！」"
      ],
      choices: [
        {
          text: "スラムの生命維持ラインを復旧させるため、時計塔最上階へ駆け上がる！",
          next: "CLIMAX_HUB",
          slot: "C_1130",
          flagValue: "C_SOCIAL_DONE"
        },
        {
          text: "これ以上の反抗は危険だ。ストライキを解散し、配給を乞う",
          next: "BAD_03",
          slot: "C_1130",
          flagValue: "C_GIVEUP_STRIKE"
        }
      ]
    },

    "CLIMAX_HUB": {
      id: "CLIMAX_HUB", char: "ALL", charName: "運命の交差点", time: "12:00",
      stage: "12:00 時計塔最上階", title: "人権の調停スキャナ",
      paragraphs: [
        "バタンッ！！ 銃創を押さえ、息を切らした少年レンが部屋へ転がり込んできた。「ハァ、ハァ……ここまで登れば……追っ手は……！」",
        "カチャリと金属音が鳴り、反対側の通路から白の制服を血と煤で汚したエレナが銃を構える。「動かないで！ ……えっ、スラムの子供！？ なぜこんな場所に！？」",
        "「うわっ、貴族の監査官！？ 待ち伏せか！？」 レンが胸の青い鉄板を盾にして身構える。",
        "そこへ、ドカドカと階段を駆け上がってきたダニエルが、泥だらけの救急箱を抱えて防護扉を蹴破った。「どいてくれ！ ライフラインの強制解除コンソールはどこだ！？ 下層区の患者たちが息絶えてしまうんだ！！」",
        "レン：「あんた……地下診療所のダニエル先生か！？ なんでここに！？」",
        "エレナ：「待ちなさい、あなたたち！ 争っている場合じゃないわ。この部屋のシステムそのものが、侵入者を感知して防衛プロトコルを起動している！」",
        "ウィーーン……と冷たい電子音が響き、部屋の中央にあるガラス張りの平らなスキャナが、青いレーザー光を放ち始める。"
      ],
      choices: [
        { text: "スキャン台の前に立ち、システムの最終判定を受ける！", next: "FINAL_EVALUATE" }
      ]
    },

    "FINAL_EVALUATE": {
      id: "FINAL_EVALUATE", char: "ALL", charName: "歴史の審判", time: "12:15",
      stage: "12:15 統治プロトコル・オメガ", title: "人間性の証明",
      paragraphs: [
        "システム音声：『統治プロトコル・オメガ、最終判定を開始。』",
        "『警告。本システムはこれより、あなたたちが統治されるべき家畜か、あるいは主権を持つ人間であるかを判定します。』",
        "『あなたたちが自らの尊厳のために戦ってきたというなら、その手にある【命の痕跡】をスキャナへ提示してください。』"
      ],
      choices: [
        { text: "手にあるすべての遺物をスキャナの上へ並べる！", next: "FINAL_BRANCH" }
      ]
    },

    "BAD_01": {
      id: "BAD_01", type: "BAD", no: "01",
      char: "C", charName: "ダニエル（社会権）", time: "10:25",
      title: "暗闇の心停止 〜他者の命を奪った自由〜",
      paragraphs: [
        "プツン……と突然、手術室の無影灯が消え去り、生命維持装置の電子音が途絶えた！",
        "「停電だと！？ 非常用バッテリーはなぜ動かない！？」",
        "ダニエルは暗闇の中で必死に人工呼吸を続けたが、手元の患者の体温は刻一刻と冷たくなっていく。スラム一帯の電源を何者かが強制ショートさせたのだ。目の前の命を救うことすらできず、ダニエルは暗闇で膝から崩れ落ちた……。",
        "【原因】10:15 レン（A）が自分の逃亡のために配電盤を爆破し、スラムを大停電させたため。"
      ],
      lesson: "自分の自由（身体・移動の自由）を行使するあまり、他人の生存権（命）を奪ってはならないという『公共の福祉』の原則を学ぶ結末です。"
    },

    "BAD_02": {
      id: "BAD_02", type: "BAD", no: "02",
      char: "B", charName: "エレナ（平等権）", time: "10:20",
      title: "広場の処刑台 〜平等なき世界の圧殺〜",
      paragraphs: [
        "エレナが境界ゲートで目を背けた直後、背後で乾いた銃声が響いた。振り返ると、少年は冷たい石畳に倒れ、薬の小瓶は泥にまみれて踏みにじられていた。",
        "「職務を守っただけよ……」そう自分に言い聞かせるエレナだったが、身分差別を肯定した社会の刃は、やがてエレナ自身へと向けられる。",
        "特権監査局の内部抗争により、エレナは「スラム出身の血が混ざっている」という根拠のない密告で拘束された。門地による差別が正当化された世界では、抗弁の機会すら与えられない。",
        "かつて目を背けた少年と同じように、エレナ自身もまた、誰からも助けられることなく冷たい処刑台へと送られた……。",
        "【原因】10:20 エレナ（B）がゲートでの身分差別と少年の命を見過ごしたため。"
      ],
      lesson: "『法の下の平等』が保障されていない社会では、弱者を見捨てた特権階級自身もまた、より強大な権力や理不尽な差別の暴力によって容易に処刑・圧殺されてしまいます。"
    },

    "BAD_03": {
      id: "BAD_03", type: "BAD", no: "03",
      char: "C", charName: "ダニエル（社会権）", time: "11:30",
      title: "自由という名の飢餓 〜社会権なき市場の地獄〜",
      paragraphs: [
        "これ以上の対立を恐れたダニエルはストライキを断念し、労働者たちと共に再び工場主の前へ頭を下げた。",
        "首輪こそ形式的に外されたものの、労働条件の改善や医療補償は一切認められず、「働けぬ者は勝手に飢えて死ね」という冷酷な弱肉強食が街を支配した。",
        "診療所には治療費の払えない病人と行き倒れが溢れ返り、やがて飢餓に耐えかねた暴徒たちが診療所へ雪崩れ込んできた。",
        "ダニエルは空っぽの薬箱を抱きしめたまま、理不尽な略奪の嵐に呑み込まれていった……。",
        "【原因】11:30 ダニエル（C）が『社会権（生存権・労働基本権）』の確立を諦めたため。"
      ],
      lesson: "18〜19世紀の自由権・平等権だけでは資本主義の格差や貧困を解決できませんでした。20世紀に『社会権（人間らしい生活の保障）』が生まれた歴史的必然性を教える結末です。"
    },

    "BAD_04": {
      id: "BAD_04", type: "BAD", no: "04",
      char: "A", charName: "レン（自由権）", time: "11:30",
      title: "パンと首輪の飼育場 〜自由なき配給社会〜",
      paragraphs: [
        "レンは放送マイクを捨て、奪い取った首輪の解除コードだけを使って下水道の奥深くへ身を潜めた。",
        "言論の狼煙が上がらなかった印刷所は保安部隊に即座に奪還され、情報統制はより強固なものとなった。",
        "反乱を恐れた支配層は、全市民に最低限の合成パンと粗悪な薬品を均等に配給したが、移動と言論の自由は完全に剥奪された。",
        "首輪の電流の恐怖は消えた。だが人々は何も考えず、ただ生き永らえるためだけに配給の列に並ぶ、冷たい家畜の群れへと成り果てた……。",
        "【原因】11:30 レン（A）が『表現の自由』を行使せず、保身を選んだため。"
      ],
      lesson: "社会権（生活保障）のために自由権を放棄すれば、待っているのは全体主義・独裁国家です。"
    },

    "NORMAL_CLEAR": {
      id: "NORMAL_CLEAR", type: "CLEAR", no: "01",
      title: "人権統合の夜明け 〜嵐の中の暫定船出〜",
      paragraphs: [
        "3人は中枢コンソールへ飛び込み、非常停止キーを叩き込んだ！ けたたましい警報が止まり、スラムへの医療用酸素と電力が勢いよく逆流していく！",
        "首輪の強制電流も停止し、銃撃の雨は止んだ。当面の虐殺と酸欠死という【最悪の危機】は、3人の決断によって間一髪で回避されたのだ。",
        "だが……光学スキャナは冷たい警告音を鳴らし、手元のガラクタを『未登録の異物』として吐き出した。統治AIは最高法規のロックを解除せず、ただ最低限の【緊急暫定自治モード】で再起動したに過ぎなかった。",
        "時計塔のバルコニーから広場を見下ろした3人を待ち受けていたのは、平和なユートピアなどではなく、吹き荒れる【混沌と怒号】だった。",
        "【自由の暴走】「首輪が外れたんだ！ 誰の命令も聞く必要はねえ、富裕層の屋敷を略奪しろ！」と叫ぶ武装グループに対し、レンは必死に立ちはだかる。「<span class='tip-link' data-tip='公共の福祉'>他人の命や家を奪うのは自由じゃねえ</span>！ そんなの前の支配者と同じじゃねえか！」だが、ルールなき群衆の熱狂を止める言葉が見つからない。",
        "【平等の反発】「法的な根拠のない暴徒の暫定ルールなど認めん！」旧特権層は私兵を雇って邸宅街にバリケードを築き、物資と食料の囲い込みを始めた。エレナは「生まれた家柄で命を差別するな！」と銃を構えて対峙するが、私有財産と平等の境界線を巡って広場は一触即発の内戦前夜と化す。",
        "【福祉の限界】ダニエルの診療所には数千人の病人が押し寄せるが、薬品も食料も瞬く間に底をつきかける。「誰がこの医療費を負担するんだ？」「働けない者を誰が養うんだ？」と、急造の市民評議会は連日罵倒と責任転嫁の嵐で紛糾し、何一つ決まらない。",
        "エレナは乾いた笑みを漏らし、額の汗を拭った。「……暴政を倒すことより、倒した後にみんなが納得する『正義の背骨』を打ち立てることのほうが、何百倍も難しいわね」",
        "ダニエルは疲れ果てた眼差しで、それでも往診カバンを握り直した。「ああ。だが、少なくとも私たちは『自分たちの頭で考え、対立を乗り越えるスタートライン』に立ったんだ。誰かの奴隷として決められるのではなく、自分たちで苦しむ権利を手に入れた」",
        "レンは青い鉄板を胸に抱き、朝日が差し込む混沌の街を睨み据えた。「問題は山積みだ。明日にも街が真っ二つに割れるかもしれねえ。……上等だ！ 誰かの家畜に戻るくらいなら、この泥沼を仲間と切り拓いてやるよ！」",
        "最高法規なき街の船出は、暗雲立ち込める嵐の海へ漕ぎ出すようなものだった。だが3人の瞳には、二度と屈しない人間の光が宿っていた。"
      ],
      lesson: "独裁者を倒して首輪を外しても、それだけでは安定した社会は生まれません。自由の暴走を防ぎ、差別を排し、弱者を支えるための『社会全体の共通の規範＝憲法（最高法規）』が欠けていれば、社会は容易に対立と内戦へ逆戻りします。『人権を保障する確固たる法典』がいかに社会の背骨として不可欠かを痛感させる結末です。（※3つの遺物をすべて揃えることで、この混沌を乗り越える「真の最高規範」に到達できます）"
    },

    "TRUE_SECRET_END": {
      id: "TRUE_SECRET_END", type: "TRUE", no: "SECRET",
      title: "永久の信託 〜トウキョウの夜明け〜",
      paragraphs: [
        "光学スキャナから立ち上った青い光が、3つの遺物の掠れた幾何学模様を空中で漢字へと結像させた。",
        "【レンの胸を守った鉄板 ────► 『東 京 都 新 宿 区』】",
        "【エレナの真鍮銘板 ──────► 『日 本 国 憲 法 第 三 章』】",
        "【ダニエルが背負った木箱 ──► 『厚 生 労 働 省』】",
        "システム音声：『……照合完了。国家最高法規「日本国憲法 第3章」のロックを全解除。都市全域の統治プロトコルを、主権者による自治規範へ書き換えます。』",
        "それは単なる暗号解読ではなかった。この瞬間から、街を支配していた「不条理なルール」が、法制度の根底から音を立てて崩壊を始めたのだ。",
        "【自由権の確立】電磁首輪による強制労働プログラムが恒久停止。軍需工場は閉鎖され、地下に幽閉されていた数万人の労働者が、誰の許可証もいらずに地上へ歩き出した。言論統制局は解体され、広場の壁には市民が自らの声で未来を語り合う壁新聞が次々と貼り出された。",
        "【法の下の平等の施行】貴族階級「大歯車」の免税特権・世襲身分が全廃。スラムと貴族街を分断していた巨大な鉄の境界ゲートはクレーンで撤去され、出自による身分証は広場で公的に焼却された。すべての市民が等しく一票を持つ、法の下の代表者議会が招集された。",
        "【社会権の制度化】「働けぬ者は飢えて死ね」という弱肉強食が法律で禁止された。ダニエルの地下診療所は市立総合医療センターとして公設化され、公費による無償治療と食料配給制度が開始。労働者には人間らしい労働時間と団結して交渉する権利が法的に義務付けられた。",
        "遮蔽壁が完全に開き、200年ぶりの潮風と朝日が東京湾を黄金色に染め上げる。レンは青い標識板を抱えて笑い、エレナは新しい法案の草案を握りしめ、ダニエルは往診カバンを手に新しい街へと踏み出した。"
      ],
      lesson: "『日本国憲法 第97条：この憲法が日本国民に保障する基本的人権は、人類の多年にわたる自由獲得の努力の成果であつて、現在及び将来の国民に対し、侵すことのできない永久の権利として信託されたものである。』人権とはただ涙を流すための言葉ではなく、理不尽な権力から人々の日常と命を守り抜くために、先人が血を流して築き上げた社会の具体的な防壁です。"
    }
  }
};