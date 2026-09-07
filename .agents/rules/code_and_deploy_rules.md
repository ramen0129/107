# コード設計＆デプロイルール (.agents/rules/code_and_deploy_rules.md)

<code_and_deploy_rules version="2.0">

<meta>
  <description>
    『パラレル・ジャパニア：クロニクル』におけるコードアーキテクチャ、
    静的検証、ローカルビルド、およびGASデプロイに関する技術・運用規定。
  </description>
</meta>

<architecture>
  <modular_system>
    <entry_point>index.html</entry_point>
    <inlining_pattern><![CDATA[<?!= HtmlService.createHtmlOutputFromFile('xxx').getContent(); ?>]]></inlining_pattern>
    <manifest>
      <module name="css.html" type="style" />
      <module name="js_assets.html" type="assets" />
      <module name="js_tips.html" type="data" />
      <module name="scenario_ren.html" type="scenario" />
      <module name="scenario_elena.html" type="scenario" />
      <module name="scenario_daniel.html" type="scenario" />
      <module name="scenario_climax.html" type="scenario" />
      <module name="js_audio.html" type="logic" />
      <module name="js_state.html" type="logic" />
      <module name="js_ui.html" type="logic" />
      <module name="js_engine.html" type="logic" />
    </manifest>
  </modular_system>

  <deployment_protection>
    <file>.claspignore</file>
    <policy>
      ホワイトリスト方式により、上記のGAS実行に必要なファイル群のみを転送対象とする。
      仕様書、テストスクリプト、エージェント設定ファイル（.agents/）はGASへアップロードしない。
    </policy>
  </deployment_protection>
</architecture>

<verification_protocol mandatory="true">
  <command>node simulate_all_paths.js</command>
  <timing>シナリオファイルまたはエンジンロジックを変更した直後</timing>
  <pass_criteria>
    <criterion id="BROKEN_LINKS_ZERO">Broken link count が厳密に 0 であること</criterion>
    <criterion id="BAD_END_JUMP_INTEGRITY">BAD_01 から BAD_19 までの全JUMP先ノードが実在すること</criterion>
    <criterion id="CLEAR_END_REACHABILITY">NORMAL_CLEAR および TRUE_SECRET_END への到達経路が存在すること</criterion>
  </pass_criteria>
</verification_protocol>

<build_protocol mandatory="true">
  <command>node build_preview.js</command>
  <timing>コード・シナリオの検証完了後</timing>
  <output>local_preview.html</output>
  <preview_server>
    <command>node server.js</command>
    <url>http://localhost:8080/local_preview.html</url>
  </preview_server>
</build_protocol>

<agent_operational_constraints priority="P0">
  <constraint id="CST_01_NO_UNSOLICITED_BROWSER">
    <directive>browser_subagent の自発的起動は完全禁止。</directive>
    <condition>ユーザーから明示的に「ブラウザで確認して」「画面を見て」等の指示があった場合のみ起動を許可する。</condition>
  </constraint>

  <constraint id="CST_02_NO_UNSOLICITED_DEPLOY">
    <directive>勝手な clasp push および clasp deploy は完全禁止。</directive>
    <condition>
      コードやシナリオの修正後は、必ずテスト結果と修正内容をユーザーに報告し、
      「pushしてください」「デプロイして」等の明確な承認指示を得てから実行すること。
    </condition>
  </constraint>
</agent_operational_constraints>

</code_and_deploy_rules>
