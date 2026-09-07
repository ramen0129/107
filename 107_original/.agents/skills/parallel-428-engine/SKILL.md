---
name: parallel-428-engine
description: >-
  Expert guide and workflow toolkit for developing, extending, validating, and debugging
  GAS-based 428-style multi-sight educational sound novel games. Use when creating or editing
  scenarios, designing timeline causality slots/KEEP OUTs, embedding constitutional TIPS,
  or auditing game state and GAS persistence.
---

# Parallel 428-Engine: 開発・保守・シナリオ拡張スキル

本スキルは、Google Apps Script (GAS) Web Apps 上で稼働する **428型 タイムライン連鎖教育ノベルゲーム**（『パラレル・ジャパニア：クロニクル』等）の設計意図を正確に踏襲し、シナリオ拡張、因果連鎖の追加、公民・公共TIPSの整備、および整合性検証を安全に実行するための総合開発ガイドです。

---

## 🧠 根底にある設計意図（Core Design Intentions）

本プロジェクトを改修・拡張する際は、必ず以下の**5大設計意図**を厳守してください：

1. **教育的「逆照射」アプローチ**:
   - 単なる憲法条文の暗記ではなく、「人権が奪われたディストピアの過酷さ」を主人公たちを通して体験させ、**「なぜその人権や適正手続が必要なのか」を痛感させる**構造を維持する。
2. **428型 タイムライン・マルチサイト因果連鎖**:
   - 主人公A（自由権/レン）、主人公B（平等権/エレナ）、主人公C（社会権/ダニエル）の3人が並行して進行。
   - ある主人公の選択（`slot`）が、他主人公の進行（KEEP OUT やルート分岐）に直接干渉する。
   - 過去へ戻った際は `rollbackFutureSlots` により未来の因果が破棄されるため、循環デッドロックを作らない。
3. **アワー制（Hour 1 / Hour 2 / Climax）による同期制御**:
   - 第1アワー（10:00〜11:00）は3人全員が到達するまで第2アワーへ進めない。
   - 第2アワー（11:00〜12:00）終端で全員が管制室に到達して初めてクライマックス（12:00 タワー最上階）のロックが解除される。
4. **学校教育現場（GIGA・Chromebook）への最適化**:
   - 外部音声ファイルや大容量アセットに依存せず、Web Audio APIによるシンセシス音源を使用。
   - サーバーダウンやWi-Fi途絶時でも、`localStorage` による即時保存で生徒のプレイを中断させない。
   - クリア時には Canvas + `jspdf` による公式修了証（A4 Landscape PDF）を自動発行。
5. **GASスプレッドシート完全永続化**:
   - 生徒の登録名（カタカナ）＋4桁パスコードによるワンタイム/継続ログイン。
   - `LockService`（30秒タイムアウト）によるクラス全員の一斉アクセス排他制御。

---

## 📚 仕様リファレンスへのリンク

作業内容に応じて、以下の詳細ドキュメントを参照してください：

- 📄 **ノード定義・選択肢・TIPS仕様**: [node_schema.md](./references/node_schema.md)
- ⏱️ **タイムブロック進行・因果ロールバック**: [causality_matrix.md](./references/causality_matrix.md)
- 📊 **スプレッドシート11カラム・排他制御仕様**: [gas_persistence.md](./references/gas_persistence.md)

---

## 🛠️ 標準作業ワークフロー（Workflows）

### ワークフロー 1: 新規シナリオノードの追加手順

1. **ノードIDを決定する**:
   - 形式: `[A/B/C]_[時刻]_[任意識別子]` （例: `A_1020_ESCAPE`）
2. **該当のシナリオファイルを開く**:
   - レン編: `scenario_ren.html`
   - エレナ編: `scenario_elena.html`
   - ダニエル編: `scenario_daniel.html`
   - クライマックス: `scenario_climax.html`
3. **ノードオブジェクトを記述する**:
   - [node_schema.md](./references/node_schema.md) に従い、`id`, `char`, `time`, `stage`, `title`, `paragraphs`, `choices` を定義。
4. **遷移先（`next`）との結合**:
   - 直前ノードの `choices[].next` に新ノードIDを指定。
5. **検証スクリプトを実行する**:
   - [validate_scenario.py](./scripts/validate_scenario.py) を実行し、未定義IDエラーが出ないことを確認。

---

### ワークフロー 2: キャラクター間因果連鎖（KEEP OUT ＆ JUMP）の構築

**例：主人公Aが進むために、主人公Bが電算室のロックを解除する必要がある場合**

1. **主人公B側の選択肢にスロット記録を設定**:
   ```javascript
   // scenario_elena.html
   choices: [
     {
       text: "電算端末をハッキングして地下水路のゲートを開放する！",
       next: "B_1035",
       slot: "B_1030",
       value: "UNLOCK_GATE"
     }
   ]
   ```
2. **主人公A側に判定付き選択肢（`checkJump`）を配置**:
   ```javascript
   // scenario_ren.html
   choices: [
     {
       text: "地下水路の重鉄扉を開けようと試みる！",
       slot: "A_1035",
       checkJump: {
         slotKey: "B_1030",
         branches: [
           { value: "UNLOCK_GATE", next: "A_1040_PASS" }
         ],
         defaultNext: "A_1040_KEEPOUT" // まだBが解放していない場合
       }
     }
   ]
   ```
3. **KEEP OUT ノードを用意する**:
   ```javascript
   "A_1040_KEEPOUT": {
     id: "A_1040_KEEPOUT",
     isKeepOut: true,
     time: "10:40",
     title: "KEEP OUT：地下水路の閉鎖ゲート",
     desc: "水路の防壁が閉じている！エレナの時間軸でゲートを開けろ。",
     jumpHint: "10:30 エレナ編へJUMPし、電算室をハッキングせよ。"
   }
   ```

---

### ワークフロー 3: 公民・公共 TIPS の追加手順

1. **`js_tips.html` の `TIPS_MASTER` にエントリを追加**:
   - 💡【本来言いたいこと】と🏛️【探究判例・歴史の知恵】の2段構成フォーマットを維持。
2. **シナリオ本文（`paragraphs`）内でリンクを埋め込む**:
   - `<span class='tip-link' data-tip='完全一致する用語キー'>本文テキスト</span>`
3. **バリデータを実行**:
   - キーのtypoや不一致がないか [validate_scenario.py](./scripts/validate_scenario.py) で検査。

---

## 🧪 整合性検証・デプロイ手順

### 1. 静的整合性テスト（必須）
コード編集後は、必ず本スキルの内蔵バリデータを実行してください：

```bash
python3 .agents/skills/parallel-428-engine/scripts/validate_scenario.py
```

- 全シナリオノードの遷移先存在確認
- 埋め込みTIPSリンクの完全性確認
- BAD END / KEEP OUT / CLEAR END の網羅率確認

### 2. GAS への反映
```bash
clasp push
```
