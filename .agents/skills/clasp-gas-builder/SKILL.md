---
name: clasp-gas-builder
description: >-
  Builds local_preview.html by inlining modular GAS HTML files, tests local preview server,
  and deploys to Google Apps Script using @google/clasp when instructed by the user.
---

# Clasp & GAS Builder Skill

<skill_definition name="clasp-gas-builder" version="2.0">

<context>
  HTML/CSS/JS ファイル群を結合してローカルプレビュー（local_preview.html）を生成し、
  ユーザーからの明示的な指示があった場合のみ本番GAS環境へのデプロイを実行するスキル。
</context>

<critical_constraints priority="P0">
  <constraint id="NO_AUTONOMOUS_DEPLOY">
    ユーザーからの明示的な指示（「pushして」「デプロイして」等）がない限り、
    `clasp push` や `clasp deploy` を勝手に実行してはならない。
  </constraint>
</critical_constraints>

<execution_protocol>
  <phase id="PHASE_1" name="ローカルプレビューの生成">
    <command>node build_preview.js</command>
    <validation>
      `✓ Generated .../local_preview.html successfully!` の出力を確認する。
      10個のモジュール（css, js_assets, js_tips, scenario_ren, scenario_elena, scenario_daniel, scenario_climax, js_audio, js_state, js_ui, js_engine）が漏れなくインライン化されていることを確認する。
    </validation>
  </phase>

  <phase id="PHASE_2" name="ローカルサーバーでの動作確認（任意）">
    <url>http://localhost:8080/local_preview.html</url>
    <note>ローカルサーバーが停止している場合は `node server.js` で起動可能。</note>
  </phase>

  <phase id="PHASE_3" name="GAS本番デプロイ（ユーザー指示時のみ）">
    <step id="1" name="Clasp Push">
      <command>npx @google/clasp push --force</command>
    </step>
    <step id="2" name="Clasp Deploy">
      <command>npx @google/clasp deploy --description "Version update"</command>
    </step>
    <step id="3" name="結果報告">
      デプロイ完了後のバージョン番号およびウェブアプリURLをユーザーに報告する。
    </step>
  </phase>
</execution_protocol>

</skill_definition>
