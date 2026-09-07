# 428型 シナリオ執筆＆演出ルール (.agents/rules/428_scenario_rules.md)

<scenario_writing_rules version="2.0">

<meta>
  <description>
    『パラレル・ジャパニア：クロニクル』におけるシナリオ追加・加筆・修正時に遵守すべき作劇・演出ガイドライン。
    教育性と428型サスペンスの極限融合を実現する。
  </description>
</meta>

<section id="1" title="視点と人称の絶対規律">
  <rule id="NO_PLAYER_SECOND_PERSON" severity="CRITICAL">
    <description>
      読者・プレイヤーに向けた二人称「あなたは」「あなたの」は、地の文・モノローグ・システム文において完全禁止。
      428型サウンドノベルの没入感を担保するため、主人公の主観一人称（オレ／私）または映画的客観三人称に徹すること。
    </description>
    <bad_example>地の文：「あなたは足音に気づき、身を隠した」「あなたの選択が街の運命を決める」</bad_example>
    <good_example>地の文：「背後から冷たい軍靴の足音が響く。オレは息を殺し、崩れた瓦礫の影へ滑り込んだ。」</good_example>
    <clarification>
      【劇中会話セリフにおける二人称の正当な許容】
      作中の登場人物同士が相手を指して呼ぶ自然な会話セリフ（例：娘エレナが父オーガスト卿に語りかける「あなた」、妻が夫を呼ぶ「あなた」、会話相手への二人称）は、キャラクターの人間関係・感情表現として完全に正当であり禁止対象外とする。禁止されるのはあくまで「読者・プレイヤーに向けたゲームマスター的二人称」である。
    </clarification>
    <point_of_view_table>
      <entry character="レン (Ren)" pov="一人称（オレ）" tone="荒削り、情熱的、直感型" />
      <entry character="エレナ (Elena)" pov="一人称（私）" tone="理知的、高潔、使命感" />
      <entry character="ダニエル (Daniel)" pov="一人称（私）" tone="沈着冷静、医師の倫理、秘めた怒り" />
      <entry character="地の文" pov="緊迫感のある映画的客観三人称 または 主人公の独白" />
    </point_of_view_table>
  </rule>
</section>

<section id="2" title="叙述トリックと条文番号の保護">
  <rule id="CONCEAL_CONSTITUTIONAL_ARTICLES" severity="CRITICAL">
    <description>
      12:15の「古遺物スキャン（CLIMAX_SCAN）」まで、本編テキスト（セリフ・地の文）内で「第25条」「第14条」「憲法」等の現代日本の法律用語・条文番号を出してはならない。
    </description>
    <reason>
      中世風・近未来風の架空ディストピアだと思わせておき、遺物スキャンで「日本国憲法」「東京都新宿区」の遺構が暴かれた瞬間に、
      「自分たちの社会が失った過去の権利だったのか」と鳥肌を立たせる教育的カタルシスを成立させるため。
    </reason>
    <dialogue_guideline>
      条文を棒読みさせるのではなく、生きる権利・自由への渇望・不平等への憤りを血の通った生の言葉で叫ばせること。
    </dialogue_guideline>
    <delegation>
      具体的な条文番号、法的解説、現代判例（堀木訴訟、尊属殺重罰規定違憲判決等）はすべて js_tips.html（TIPS機能）側で担う。
    </delegation>
  </rule>
</section>

<section id="3" title="選択肢ボタンの記述ルール">
  <rule id="NO_BRACKET_IN_CHOICE" severity="CRITICAL">
    <description>選択肢テキストから角括弧【...】を完全排除する。</description>
    <bad_example>【右の路地へ逃げる】足音から逃れるために路地へ走る</bad_example>
    <good_example>右の薄暗い路地へ飛び込み、瓦礫の影に身を潜める</good_example>
  </rule>

  <rule id="CAUSAL_CONTINUITY" severity="HIGH">
    <description>
      選択肢と次ノードの間に不自然な展開の跳躍（ワープ）を発生させない。
      叫ぶ ➔ 次の瞬間手錠が外れている などの飛躍を避け、叫んだが無駄だった焦りを描く中間ノードを挟むなど、因果を連続させること。
    </description>
  </rule>

  <rule id="MANDATORY_CAUSALITY_SPEC_REFERENCE" severity="CRITICAL">
    <description>
      シナリオを操作（ノード追加・選択肢作成・分岐変更）する際は、必ず『パラレル・ジャパニア_全選択肢・因果波及完全設計仕様書.md』を参照し、他主人公（A/B/C）への因果波及マトリクスおよびスロット・フラグ定義に100%合致させること。
      単なるローカルな文章差分で終わる形骸的選択肢を厳禁とし、音響・警備・送電・BAD END/KEEP OUTなどの世界と他者へ波及するバタフライ・エフェクトを必ず担保すること。
    </description>
  </rule>
</section>

<section id="4" title="BAD END演出シークエンス">
  <rule id="BAD_END_ANATOMY" severity="CRITICAL">
    <step id="1" name="破滅ノベルの描写">
      選択肢を選んだ直後に即赤画面に移行してはならない。
      必ずノベル画面上で、主人公たちの必死の足掻き、判断の誤り、迫り来る破滅、絶望の叫びを数段落（paragraphs）しっかり読ませる。
    </step>
    <step id="2" name="漆黒暗転 (Fade to Black)">
      ノベル読了後、画面を0.5秒かけて完全な暗黒（#000000）へフェードアウトさせ、0.5秒の重苦しい静寂を置く。
    </step>
    <step id="3" name="専用リザルトカードへの移行">
      重低音（AudioEngine.play('badend')）、画面の激震（shakeScreen()）、および深紅の閃光カットインとともに
      「CHRONICLE TERMINATED」専用BAD ENDカード画面を表示する。
    </step>
    <step id="4" name="JUMP先の設定">
      BAD ENDノードには必ず jumpTarget（原因となった過去の時間軸のノードID）を指定し、プレイヤーが即座に巻き戻して別の選択を試せるようにする。
    </step>
  </rule>
</section>

<section id="5" title="宿命の糸（因果交錯メッシュ）">
  <destiny_links>
    <link id="LINK_01">
      <character_a>レン (Ren)</character_a>
      <character_b>侍女マーサ (Martha)</character_b>
      <root_cause>平等権の欠如</root_cause>
      <relationship>実はレンの実の母。17年前、厳格な階級法によりスラムへ我が子を置き去りにせざるを得なかった後悔を胸に秘め、エレナの逃亡を支援する。</relationship>
    </link>
    <link id="LINK_02">
      <character_a>レン (Ren)</character_a>
      <character_b>親友シン (Shin / 享年16) ＆ ダニエル (Daniel)</character_b>
      <root_cause>自由権の欠如</root_cause>
      <relationship>シンの深夜の雨の中の最期を看取ったのがダニエル医師。シンの形見の万年筆がレンの手元にある。</relationship>
    </link>
    <link id="LINK_03">
      <character_a>エレナ (Elena)</character_a>
      <character_b>父オーガスト卿 (Lord August) ＆ ゴードン (Gordon)</character_b>
      <root_cause>社会権の欠如</root_cause>
      <relationship>オーガスト卿は16時間労働・医療物資削減を命じる黒幕。ゴードンはその圧政に抗議してストライキを起こす労働者代表。</relationship>
    </link>
    <link id="LINK_04">
      <character_a>ダニエル (Daniel)</character_a>
      <character_b>看護助手エマ (Emma) ＆ ゴードン (Gordon)</character_b>
      <root_cause>社会権の欠如</root_cause>
      <relationship>エマはゴードンの亡き親友の遺児。暴走しかけるゴードンを涙ながらに説得し、喘息の少年レオの命を救う。</relationship>
    </link>
  </destiny_links>
</section>

<section id="6" title="作中キャラクターの認知境界と神視点（メタ情報）の厳格排除">
  <rule id="STRICT_COGNITIVE_BOUNDARY" severity="CRITICAL">
    <description>
      シナリオ本文（地の文・セリフ・心理独白）において、主人公がその場・その瞬間に知り得ないメタ的情報（他時間軸の他者の行動、遠隔地で起きた事象、未観測の因果関係）を語らせることを完全禁止する。
    </description>
    <principles>
      1. 主観の厳守: キャラクターは自身の五感（視覚・聴覚・触覚）、直接経験、およびその場の合理的推論によってのみ思考・行動する。
      2. 遠隔因果の不認知: 別主人公の行動が引き起こした異変（爆発、停電、警報等）に巻き込まれた際、本文中では「何が起きたか（物理現象・衝撃・結果）」のみを描写し、「誰がなぜそれを起こしたか」という因果を勝手に推測・断定させない。
      3. 役割の完全分離: なぜその事態が発生したのかというタイムライン間の因果交錯（バタフライ・エフェクトの解説）は、作中テキストではなく【システム側のBAD ENDリザルトカード（desc / hint）】側のみで提示する。
    </principles>
    <pattern_comparison>
      <bad_pattern>
        「〇〇が水門を爆破したため濁流が押し寄せたのだ！」（被災側の主人公はその場にいない他者の行動を知る由もない）
        「これで遠くの施設も停電させずに済んだはずだ！」（主人公は遠隔地の特定インフラとの接続関係など知らない）
      </bad_pattern>
      <good_pattern>
        「上流側から凄まじい破壊音が轟き、巨大な濁流が押し寄せてきた！」（五感と直前の物理現象のみを忠実に描写）
        「煙幕でドローンの視界を奪った！ 街の送電設備を傷つけずに済んだぞ！」（自身の目の前にある成果のみを評価）
      </good_pattern>
    </pattern_comparison>
  </rule>
</section>

<section id="7" title="伏線・宿命関係の段階的開示（漸進的プロット構築の原則）">
  <rule id="GRADUAL_FORESHADOWING_PACING" severity="HIGH">
    <description>
      キャラクター間の血縁・過去の因縁・重要アイテムなどの核心的伏線は、序盤で一挙にネタバレ・開示してはならず、三段階（提示 ➔ 浸透 ➔ 符号）で漸進的に開示しなければならない。
    </description>
    <stages>
      <stage name="フェーズ1：自然な日常・所持品としての配置（提示）">
        物語序盤では、過酷な環境や世界観にそぐわない不自然な物品（戦場に持ち歩く赤ん坊の産着など）を持たせず、
        キャラクターの日常や来歴に即した自然な品（身元不明時に身につけていた古い装飾品・小道具等）としてさりげなく導入する。
        関係者も初対面や序盤の会話では核心的な秘密に一切触れず、その場の緊迫した状況に即した対話を行う。
      </stage>
      <stage name="フェーズ2：内面モノローグ・回想による断片開示（浸透）">
        物語中盤の静かな場面や単独行動時の心理描写において、関係者の生い立ちや過去の記憶、象徴的な意匠・祈りなどの断片を徐々に想起させる。
        この段階でも「誰と誰が繋がっている」と明言せず、読者に「もしかして」という推理の余白を残す。
      </stage>
      <stage name="フェーズ3：運命の邂逅・クライマックスにおける符号（回収）">
        複数の時間軸が合流する終盤・クライマックスにおいて、互いの持ち物・傷痕・言葉の断片が合致することで、
        プレイヤーの頭の中でパズルのピースが一気に組み合わさる劇的なカタルシスを演出する。
      </stage>
    </stages>
  </rule>
</section>

<section id="8" title="地理的トポロジー・移動時間の物理的整合性原則（428型都市サスペンス空間設計）">
  <rule id="SPATIAL_TRANSIT_RIGOR" severity="HIGH">
    <description>
      428型サウンドノベルの最大の魅力である「同時多発的サスペンス」と「運命の交差点（合流）」を成立させるため、
      各タイムラインにおける登場人物の移動は、架空世界であっても現実の運動力学・都市地理トポロジーに完全に合致していなければならない。
      キャラクターが時間軸の合流地点に「なぜその時刻に到着できるのか」を物理的に証明可能にすること。
    </description>
    <principles>
      <principle id="1" name="移動速度と所要時間の物理基準">
        作中人物の移動速度・時間計算は、以下の運動基準をベースに算出する。
        - 平地通常歩行: 分速約 67m (4 km/h)
        - 平地急ぎ足・警戒移動: 分速 100m (6 km/h)
        - 平地全力疾走: 分速 150m〜200m (9〜12 km/h) ※持続時間は数分が限度
        - 垂直非常階段の上昇: 1フロア（約3.5m）あたり 約15秒（毎分約4フロア上昇、垂直14m/min）※20フロア以上の連続昇降時は体力消耗による減速を考慮
        - 狭隘ダクト這い・水中歩行・瓦礫突破: 分速 20m〜30m (1.2〜1.8 km/h)
      </principle>
      <principle id="2" name="時間軸ワープ（超光速移動）の完全排除">
        15分刻み・30分刻みのタイムライン遷移において、物理的に移動不可能な距離（例：徒歩で3km離れた場所へ10分で到達する等）を移動させてはならない。
        移動手段（梯子、リフト、車両、水路等）と所要時間、および戦闘・隠密・対話による遅延バッファの合計が、ノード間の経過時間と厳密に一致すること。
      </principle>
      <principle id="3" name="因果波及の物理的伝播半径（五感メッシュ）">
        一方が起こした事象（爆発、煙幕、放水、停電）が他方の視点に影響を与える場合、両地点の直線距離と伝播媒体（空気・音速・水流・電線網）を考慮すること。
        - 音波・衝撃波: 約 340m/s（直線距離600mなら約1.8秒後に到達）
        - 黒煙・臭気: 空調ダクトや風向きに応じ数十秒〜数分後に到達
        - 放水・濁流: 水路勾配と流速（時速30〜40km）に応じ数分後に到達
        - 電力網サージ: 瞬時（光速）に遮断
      </principle>
      <principle id="4" name="都市空間諸元表の常時参照">
        シナリオ執筆・改修時は、必ずプロジェクトの空間設計書（『地理・都市空間完全設計仕様書』等）を参照し、
        エリアの広さ（km²）、高低差（標高/深度）、主要動線の接続関係から逸脱しないこと。
      </principle>
    </principles>
  </rule>
</section>

<section id="9" title="発見の快感（難易度曲線・ノーヒント原則）と時空間的伝播リアリズム">
  <rule id="DISCOVERY_CURVE_AND_UNSOLICITED_HINT_BAN" severity="CRITICAL">
    <concept>「親切すぎる誘導」の完全排除とアハ体験（発見の爽快感）の最大化</concept>
    <description>
      1. HUDインジケーター等の安易な通知演出の禁止:
         他主人公の行動が因果波及していることを「因果干渉中」などのUIバッジやポップアップで直接教えてはならない。
         428の真骨頂は、「あの選択肢を選んだら進めなかったのに、あっちを変えたらスムーズに進むようになった！」とプレイヤー自身が試行錯誤の中で因果を発見する快感にある。
      2. 難易度曲線（アワー別のヒント設計）:
         - 第1アワー（10:00〜11:00）: チュートリアル期間。KEEP OUT画面等で「誰の時間軸を変えるべきか」を明快に誘導し、ゲームの因果ルールをプレイヤーに体得させる。
         - 第2アワー（11:00〜12:00）: 自立探索期間（ほぼノーヒント）。直接の答えを提示せず、プレイヤーが自力でタイムラインを俯瞰し、街の動向から因果の糸を推理させる。
         - BAD ENDカードの投げかけ原則: 直接の正解手順を教えるのではなく、「この時刻、別の場所で〇〇をしていた者はいなかっただろうか？」「あの轟音の正体は何だったのか？」という知的探究心を刺激する問いかけにとどめること。
      3. 時空間伝播の物理的リアリズム（5分〜15分のタイムラグ）:
         一箇所の出来事（群衆の蜂起、小石の投擲、警備増援命令）は瞬間移動せず、数分〜十数分の時間差をもって他エリアへ伝播する。
         例：ダニエルが10:45にスラム中央で叫んだ怒号は、群衆の共鳴と大気伝播を経て11:00（15分後）に水門出口のレンや中立広場のエレナに「地鳴り」として届く。
    </description>
  </rule>
</section>

</scenario_writing_rules>

