# 428-Engine ノードスキーマ & データ仕様リファレンス

本リファレンスは、『パラレル・ジャパニア：クロニクル』および同エンジンにおけるシナリオノード、選択肢、TIPS、および因果連鎖オブジェクトの完全なデータ仕様です。

---

## 1. 通常シナリオノード (Standard Story Node)

各シナリオファイル（`scenario_*.html`）内のオブジェクトに定義します。

```javascript
"A_1000": {
  id: "A_1000",             // [必須] ノード固有ID (大文字英数・アンダースコア)
  char: "A",                // [必須] 主人公コード: "A" (レン), "B" (エレナ), "C" (ダニエル), "ALL" (クライマックス)
  charName: "レン（自由権）", // [必須] ヘッダー表示用主人公名
  time: "10:00",            // [必須] 劇中時刻 (HH:MM形式)
  stage: "10:00 スラム街・配給所裏", // [必須] 画面上部ステージ名
  title: "首輪の火花",       // [必須] ノードタイトル (セーブデータ記録名)
  
  // 本文段落配列 (文字列または state => string の関数)
  paragraphs: [
    "青い火花が、首輪の接続部からパチリと散った。",
    "「ぐっ……また電圧が上がってやがる……」",
    // TIPSリンクの埋め込み形式:
    "<span class='tip-link' data-tip='身体の自由'>奴隷のように首輪で飼い慣らされる</span>筋合いはねえ！"
  ],
  
  // 選択肢配列 (末端ノードの場合は省略または空配列)
  choices: [
    {
      text: "配給所のフェンスを飛び越えて路地へ逃げる！",
      next: "A_1015",
      slot: "A_1000",       // 選択状態を記録するスロットキー
      value: "A",           // スロットに格納する値 (省略時は true)
      setFlags: ["A_FENCE_JUMPED"] // 任意: 付与するフラグ配列
    }
  ]
}
```

---

## 2. 選択肢 (Choices) の特殊バリエーション

### ① 因果チェック選択肢 (`checkJump`)
他主人公の過去の選択（スロット値）によって、合流先を分岐させます。

```javascript
{
  text: "ダニエル医師の地下診療所の扉を叩く！",
  slot: "A_1030",
  value: "VISIT_CLINIC",
  checkJump: {
    slotKey: "C_1015",      // 参照する他キャラのスロットキー
    // パターンA: 複数分岐
    branches: [
      { value: "OPEN_DOOR", next: "A_1035_CLINIC_OPEN" },
      { value: "HIDE_OUT",  next: "A_1035_CLINIC_LOCKED" }
    ],
    defaultNext: "A_1035_BAD_CLINIC_EMPTY" // 一致しない場合の遷移先
  }
}
```

### ② トリプル・シンクロ選択肢 (`checkTripleSync`)
Hour 2 終端（11:50）で、3人の主人公全員が管制室に到達しているかを検証します。

```javascript
{
  text: "中央管制室のメインコンソールにアクセスする！",
  checkTripleSync: true     // A_FREEDOM_DONE, B_EQUALITY_DONE, C_SOCIAL_DONE を一括検証
}
```

### ③ シークレット結末選択肢 (`checkSecret`)
クリア後の周回要素。3つの古遺物（`PIECE_A`, `PIECE_B`, `PIECE_C`）が揃っているかで分岐。

```javascript
{
  text: "父の真意を問いただす",
  checkSecret: true        // 揃っていれば TRUE_SECRET_END、未達なら NORMAL_CLEAR へ遷移
}
```

---

## 3. 特殊ノード

### ① KEEP OUT ノード (進行足止め)
他主人公のタイムラインが進んでおらず、因果が揃っていない場合に表示。

```javascript
"A_1045_KEEPOUT": {
  id: "A_1045_KEEPOUT",
  isKeepOut: true,          // [必須]
  time: "10:45",
  title: "KEEP OUT：地下水路の重鉄扉",
  desc: "地下水路の電子ロックが解除されていない！エレナの時間軸で防衛コードを解析せよ。",
  jumpHint: "10:30 エレナ編へJUMPし、中央電算室の端末を調べろ。"
}
```

### ② BAD END ノード (破滅の結末)
人権侵害による破滅を体験させ、憲法の教訓を伝えるノード。

```javascript
"BAD_A_01": {
  id: "BAD_A_01",
  isBadEnd: true,           // [必須]
  time: "10:15",
  title: "BAD END: 治安警察の即時射殺",
  desc: "警告を無視して検問を強行突破しようとしたレンは、正当な法の手続きを経ることなく即座に射殺された。",
  hint: "💡【公民の教訓：身体の自由・デュープロセス】何人も正当な法の手続きによらなければ刑罰を受けない（憲法第31条）。検問への無謀な突入は避けよ。",
  jumpTarget: "A_1000",     // 1クリックでやり直せる戻り先ノードID
  unlockFlag: "BAD_A_01_SEEN"
}
```

---

## 4. TIPS マスター (`TIPS_MASTER`) スキーマ

`js_tips.html` に定義。本文中の `<span class='tip-link' data-tip='...'>` とキーを1対1で対応させます。

```javascript
"生存権": {
  term: "生存権・健康で文化的な最低限度の生活",
  law: "日本国憲法 第25条",
  category: "social",       // "freedom", "equality", "social", "procedure", "general"
  desc: "💡【本来言いたいこと】：国は国民が飢えや病で野垂れ死ぬことのないよう、社会保障や生活保護、公衆衛生を保障する義務があります。\n\n🏛️【探究判例・歴史の知恵】『朝日訴訟（1967年）』：重度結核患者の朝日茂氏が生活保護費の引き上げを求めた裁判。第25条は国の努力目標を定めたプログラム規定とされつつも、人間たるに値する生活水準を社会全体で維持する重要性を国民に強く訴えかけました。"
}
```
