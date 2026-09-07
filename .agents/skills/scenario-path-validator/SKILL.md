---
name: scenario-path-validator
description: >-
  Validates the full 428-style branching causality graph, bad end links (BAD_01 to BAD_19),
  clear end conditions, and choice next-node integrity across all scenario files in Parallel Japania.
---

# Scenario Path Validator Skill

<skill_definition name="scenario-path-validator" version="2.0">

<context>
  `scenario_ren.html`, `scenario_elena.html`, `scenario_daniel.html`, または `scenario_climax.html`
  のいずれかを変更・加筆・修正した際に必ず実行する検証スキル。
</context>

<execution_protocol>
  <step id="1" name="シミュレーション実行">
    <command>node simulate_all_paths.js</command>
  </step>

  <step id="2" name="合否基準判定">
    <criteria>
      <criterion id="ZERO_BROKEN_LINKS">
        出力ログに `Broken link count: 0` が表示されていること。
      </criterion>
      <criterion id="BAD_END_JUMP_TARGETS">
        BAD_01 〜 BAD_19 の全バッドエンドノードに実在する jumpTarget が設定されていること。
      </criterion>
      <criterion id="END_REACHABILITY">
        NORMAL_CLEAR および TRUE_SECRET_END への到達経路が正常に認識されていること。
      </criterion>
    </criteria>
  </step>

  <step id="3" name="エラー時のリカバリー">
    <action>
      破損リンクが報告されたノードIDを特定し、シナリオファイルの choice.next または jumpTarget を修正する。
      破損リンクが0になるまで再検証を繰り返す。
    </action>
  </step>
</execution_protocol>

</skill_definition>
