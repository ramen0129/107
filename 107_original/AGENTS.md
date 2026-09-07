# プロジェクト作業規定 (AGENTS.md)

本リポジトリは、Google Apps Script (GAS) Web Apps 上で稼働する428型教育ノベルゲーム『パラレル・ジャパニア：クロニクル』です。

## 開発・改修時の必須ルール

1. **スキルの参照**:
   - シナリオの追加・編集、因果連鎖の設計、TIPSの改定を行う際は、必ずワークスペーススキル `.agents/skills/parallel-428-engine/SKILL.md` の規約とワークフローに従ってください。
2. **因果連鎖・ロールバックの厳守**:
   - 循環依存（Aが進むのにBが必要、かつBが進むのにAが必要）によるデッドロックを作らないでください。
   - `rollbackFutureSlots` による同一主人公の未来スロット破棄の仕組みを念頭に置いて設計してください。
3. **静的検証スクリプトの実行**:
   - シナリオノードやTIPSを変更した後は、必ず以下の検証スクリプトを実行し、遷移先エラーや未定義TIPSがないことを確認してください：
     ```bash
     python3 .agents/skills/parallel-428-engine/scripts/validate_scenario.py
     ```
4. **GASコード・スプレッドシート永続化の保全**:
   - `Code.js` の11カラム仕様および `LockService` 排他制御を破壊しないでください。
   - 変更のデプロイは `clasp push` を使用してください。
