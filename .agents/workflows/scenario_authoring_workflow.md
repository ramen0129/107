# 428型 シナリオ制作・更新ワークフロー (.agents/workflows/scenario_authoring_workflow.md)

<workflow name="scenario_authoring_and_updating" version="2.0">

<meta>
  <description>
    428型サウンドノベルとしての因果交錯、叙述トリック、BAD ENDドラマ演出を担保し、
    静的整合性検証から4大ペルソナによる品質クロスレビューまでを一気通貫で実施する標準ワークフロー。
  </description>
</meta>

<workflow_stages>
  <stage id="STAGE_1" name="必須仕様書の通読＆因果・キャラ設定の確認">
    <action>
      シナリオ操作（ノード追加・テキスト加筆・選択肢修正・分岐変更）に着手する前に、
      必ず以下の3大設計仕様書を通読し、因果関係とキャラクター像を完全把握する。
    </action>
    <mandatory_specifications>
      <spec file="パラレル・ジャパニア_全選択肢・因果波及完全設計仕様書.md" priority="P0">
        【必読】全選択肢バタフライエフェクト・因果波及マトリクス。
        対象ノードの選択肢がシナリオA・B・Cに及ぼす影響、スロット名（slot）、フラグ値（flagValue）、
        および他主人公の環境異変（音響・電力・警備・BAD END/KEEP OUT）の全体連鎖を確認・遵守すること。
      </spec>
      <spec file="パラレル・ジャパニア_キャラクター完全設計仕様書.md" priority="P0">
        【必読】キャラクタープロファイル（生い立ち、口癖、知能指数、トラウマ、宿命の糸）。
      </spec>
      <spec file="パラレル・ジャパニア_地理・都市空間完全設計仕様書.md" priority="P0">
        【必読】高低差、移動速度・所要時間マトリクス、音響/因果干渉半径。
      </spec>
    </mandatory_specifications>
    <checkpoints>
      <check>修正・追加する選択肢が、全選択肢・因果波及マトリクス（仕様書第2章）の他主人公への影響と100%符合しているか</check>
      <check>単なるその場の主観的行動描写で終わらせず、世界や他者へ波及するバタフライ・エフェクトが担保されているか</check>
      <check>口癖、知能指数、トラウマ、弱点などの設定とセリフのトーンが一致しているか</check>
      <check>宿命の糸（マーサ、シン、オーガスト卿、エマ、ゴードン）の因果が背景に息づいているか</check>
    </checkpoints>
  </stage>

  <stage id="STAGE_2" name="ノベル本文と選択肢の作成">
    <action>scenario_*.html のノードを記述・加筆する。</action>
    <guidelines>
      <guideline rule="NO_SECOND_PERSON">二人称「あなたは」は厳禁。一人称（オレ／私）または客観三人称に統一。</guideline>
      <guideline rule="CONCEAL_ARTICLES">条文番号（第25条など）は出さず、魂の叫びとして表現。</guideline>
      <guideline rule="NO_CHOICE_BRACKETS">選択肢ボタンのテキストから角括弧【...】を排除し、主観的決断とする。</guideline>
      <guideline rule="CAUSAL_CONTINUITY">急激な飛躍を避け、状況に応じた中間ノードを配置する。</guideline>
    </guidelines>
  </stage>

  <stage id="STAGE_3" name="因果交錯メッシュとBAD ENDの配線">
    <action>
      『パラレル・ジャパニア_全選択肢・因果波及完全設計仕様書.md』に基づき、
      他主人公の時間軸への影響（バタフライ・エフェクト）とBAD END遷移を設計・配線する。
    </action>
    <requirements>
      <item name="因果波及の整合">選択肢の変更時は、必ず仕様書の因果波及マトリクスを照合し、A/B/C全ルートへの連鎖を維持・更新する。</item>
      <item name="交錯フラグ">一人の選択が他者の時間軸のロックや分岐を左右する構造とする（CAUSALITY_SLOTS定義準拠）。</item>
      <item name="BAD ENDノベル">BAD ENDノードには必ず数段落の必死の足掻きと絶望を描写する。</item>
      <item name="暗転シークエンス">triggerBadEnd() による暗転・静寂・赤閃光演出を適用する。</item>
      <item name="jumpTarget">原因となった過去の特定ノードへJUMPできるように指定する。</item>
    </requirements>
  </stage>

  <stage id="STAGE_4" name="静的パス検証（シミュレーション）">
    <action>全ノードと全選択肢のリンク整合性を検証する（ユーザー指示またはスキル実行時）。</action>
    <execution>
      <skill_reference>scenario-path-validator</skill_reference>
      <command>node simulate_all_paths.js</command>
      <expected_output>Broken link count: 0</expected_output>
    </execution>
    <error_handling>破損リンクが1件でも検出された場合、直ちにノードIDの接続先を修正して再検証する。</error_handling>
  </stage>

  <stage id="STAGE_5" name="プレビュー生成">
    <action>ローカルプレビューを生成する。</action>
    <execution>
      <skill_reference>clasp-gas-builder</skill_reference>
      <command>node build_preview.js</command>
      <target>local_preview.html</target>
    </execution>
  </stage>

  <stage id="STAGE_6" name="4大ペルソナ総合クロスレビュー（実装完了ゲート）">
    <action>
      実装の最後に、4つの専門視点（ゲーム雑誌デスク、公民教育プロ、劇作ディレクター、テクニカルQA）
      から総合クロスレビューを実施し、クオリティと完成度を判定する。
    </action>
    <execution>
      <skill_reference>cross-persona-reviewer</skill_reference>
      <output_format>採点スコアボード（各10点満点）、GOOD/MORE所見、ペルソナ座談会</output_format>
    </execution>
  </stage>

  <stage id="STAGE_7" name="ユーザー報告とデプロイ承認受領">
    <action>
      レビュー結果、検証ログ、変更差分をユーザーに報告する。
      ユーザーから明確な「push」「deploy」の指示があるまで、GAS本番への転送は待機する。
    </action>
  </stage>
</workflow_stages>

</workflow>
