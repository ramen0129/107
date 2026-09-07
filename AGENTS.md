# 『パラレル・ジャパニア：クロニクル』AI開発ガイドライン (AGENTS.md)

<agent_guidelines version="2.0">

<project_overview>
  <title>パラレル・ジャパニア：クロニクル 〜失われた人権の180分〜</title>
  <description>
    428型サウンドノベルのゲームメカニクス（因果交錯タイムライン、バタフライ・エフェクト、BAD END JUMP）と、
    中学校・高等学校公民科（日本国憲法・三大基本的人権：自由権・平等権・社会権）を融合させた、
    世界初の教育的タイムライン・アドベンチャーゲーム。
  </description>
</project_overview>

<critical_directives priority="P0">
  <directive id="DIR_01_NO_PLAYER_SECOND_PERSON">
    読者・プレイヤーに向けた二人称「あなたは」「あなたの」は地の文・システム文において完全禁止。主人公の一人称（オレ／私）または客観三人称視点で統一すること。
    ※作中登場人物同士が相手を呼ぶ自然な会話セリフ（例：娘エレナが父に語りかける「あなた」、妻が夫を呼ぶ「あなた」等）はキャラクター表現・人間関係として完全に許容される。
  </directive>
  <directive id="DIR_02_CHOICE_NO_BRACKETS">
    選択肢ボタンから角括弧【...】を排除し、主人公の主観的・具体的な決断行動の文章とすること。
  </directive>
  <directive id="DIR_03_NARRATIVE_TRICK_PROTECTION">
    12:15の「古遺物スキャン」まで、本編テキスト（セリフ・地の文）内で「第25条」「第14条」等の条文番号を絶対に出さないこと。
    教育的条文解説はすべて TIPS（js_tips.html）側に集約し、本編はディストピアサスペンスとして描くこと。
  </directive>
  <directive id="DIR_04_BAD_END_DRAMA_SEQUENCE">
    BAD END時は選択直後にリザルトを出さず、ノベル本文で絶望と足掻きのドラマを描写 ➔ 0.5s黒画面暗転 ➔ 重低音＆赤閃光カットインで専用カードへ移行すること。
  </directive>
  <directive id="DIR_05_NO_UNSOLICITED_BROWSER">
    ユーザーからの明示的な指示がない限り、browser_subagent は絶対に起動しないこと。
  </directive>
  <directive id="DIR_06_NO_UNSOLICITED_PUSH">
    ユーザーからの明示的な指示（「push」「deploy」等）があるまで、clasp push / clasp deploy は勝手に実行しないこと。
  </directive>
  <directive id="DIR_07_MANDATORY_SIMULATION">
    シナリオやロジック変更後は、必ず `node simulate_all_paths.js`（破損リンク0件確認）と `node build_preview.js`（プレビュー生成）を実行すること。
  </directive>
  <directive id="DIR_08_STRICT_COGNITIVE_BOUNDARY">
    【作中キャラクターの認知境界の厳守】
    シナリオ本文（地の文・セリフ・心理描写）における神視点・メタ的記述を完全禁止する。
    主人公はその場の五感・直接知覚・合理的推測によって知り得る事象のみを認識・発言し、別視点のキャラクターの行動や遠隔地の事象など「知る由もない因果」を語ってはならない。
    時間軸の交錯や他者起因の因果関係（バタフライ・エフェクトの解説）は、作中テキストではなくシステム側のリザルト表示（BAD ENDカード等のdesc/hint）側でのみ提示すること。
  </directive>
  <directive id="DIR_09_GRADUAL_FORESHADOWING_PACING">
    【伏線・宿命関係の段階的開示（漸進的プロット）】
    重要アイテム・血縁関係・過去の因縁などの重要伏線を、序盤で唐突・性急に明かすことを厳禁とする。
    ① 不自然な所持品（過酷な境遇にそぐわない品）を持たせず、世界観に溶け込んだ自然な生活物品・装飾品として導入する。
    ② 関係者は初期段階で重大な秘密に触れず、物語の進行に応じたモノローグや回想を通じて断片的に情報を開示する。
    ③ クライマックスの合流や対峙において、各視点の断片が自然に符合するよう伏線の時間的距離を保つこと。
  </directive>
  <directive id="DIR_10_SPATIAL_TRANSIT_RIGOR">
    【地理的トポロジー・移動時間の物理的整合性】
    428型サウンドノベルの真髄である「同時多発的サスペンス」と「12:00合流」のリアリズムを担保するため、
    各主人公の移動（水平距離・垂直昇降・梯子・リフト・瓦礫突破）および因果波及（音波・煙幕・水流・停電）は、
    『パラレル・ジャパニア_地理・都市空間完全設計仕様書.md』の諸元（分速基準・伝播速度）に100%合致させ、時間軸ワープを厳禁とする。
  </directive>
  <directive id="DIR_11_DISCOVERY_CURVE_NO_UNSOLICITED_HINTS">
    【発見の快感・アハ体験を守るノーヒント原則】
    因果波及を明かす安易なHUDインジケーター等の親切演出は完全禁止。
    第1アワーはチュートリアルとして導線を示し、第2アワーはほぼノーヒントでプレイヤーに自力試行錯誤と推理を行わせること。
    BAD ENDカードでは直接の正解指示ではなく「あの時、別の場所で〇〇していた者はいなかったか？」等の思考を促す問いかけにとどめること。
  </directive>
</critical_directives>

<project_structure>
  <specifications>
    <file path="パラレル・ジャパニア_キャラクター完全設計仕様書.md">
      キャラクター生い立ち、知能指数、嗜好、トラウマ、宿命の糸（マーサ、シン、オーガスト卿、エマ、ゴードン）
    </file>
    <file path="パラレル・ジャパニア_地理・都市空間完全設計仕様書.md">
      ネオ・ジャパニア全エリア規模（km²）、高低差（-100m〜+243m）、移動速度・所要時間マトリクス、音響/因果干渉半径
    </file>
    <file path="パラレル・ジャパニア_全選択肢・因果波及完全設計仕様書.md">
      全選択肢バタフライエフェクト・因果波及マトリクス（シナリオA・B・C相関、スロット/フラグ連携仕様）
    </file>
  </specifications>

  <scenario_modules>
    <file path="scenario_ren.html" character="Ren" theme="自由権" time="10:00-11:50" />
    <file path="scenario_elena.html" character="Elena" theme="平等権" time="10:00-11:50" />
    <file path="scenario_daniel.html" character="Daniel" theme="社会権" time="10:00-11:50" />
    <file path="scenario_climax.html" character="Joint" theme="クライマックス＆全19BAD END" time="12:00-13:00" />
  </scenario_modules>

  <engine_and_ui>
    <file path="js_engine.html" role="状態遷移、Hour管理、BAD END暗転・遷移処理、JUMP制御" />
    <file path="js_ui.html" role="画面切替、ロック演出、時間軸図鑑、TIPSモーダル" />
    <file path="js_state.html" role="ローカルストレージ永続化、進行フラグ、GAS同期" />
    <file path="js_tips.html" role="公民科教育TIPSマスターデータ（憲法条文・判例解説）" />
    <file path="js_assets.html" role="Base64画像・アイコンアセット" />
    <file path="js_audio.html" role="Web Audio API シンセサイザー効果音エンジン" />
    <file path="css.html" role="ダークサイバーパンク基調のVanilla CSSデザインシステム" />
    <file path="index.html" role="GAS親コンテナ（HtmlServiceインライン結合親ファイル）" />
  </engine_and_ui>

  <build_and_validation>
    <file path="simulate_all_paths.js" role="全66ノード・全選択肢・全BAD ENDリンク整合性静的チェッカー" />
    <file path="build_preview.js" role="GASインライン構文を結合し local_preview.html を出力するビルダー" />
    <file path="server.js" role="ローカル検証用HTTPサーバー (http://localhost:8080)" />
  </build_and_validation>

  <agent_configurations root=".agents/">
    <rules path=".agents/rules/">428作劇ルール、コード＆デプロイルール</rules>
    <workflows path=".agents/workflows/">シナリオ制作・更新標準ワークフロー</workflows>
    <skills path=".agents/skills/">scenario-path-validator, clasp-gas-builder, cross-persona-reviewer</skills>
  </agent_configurations>
</project_structure>

</agent_guidelines>
