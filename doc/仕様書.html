<!DOCTYPE html><html lang="ja">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta http-equiv="Content-Style-Type" content="text/css">
  <meta http-equiv="Content-Script-Type" content="text/javascript">
  <title>スマホ受付 rev.0.2.0</title>
  <!-- UML: mermaid -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/mermaid/7.0.0/mermaid.min.css">
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>

  <!-- UML: PlantUML
    参考：JavaScriptを用いてPlantUMLを呼び出す
    https://168iroha.net/blog/topic/?id=202206081036&sorting=post_date
  -->
  <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/plantuml-encoder@1.4.0/dist/plantuml-encoder.min.js"></script>

  <!-- シンタックスハイライト: google-code-prettify
    <pre class="prettyprint linenums"><?php 
$code = <<<EOL
EOL;
      echo htmlspecialchars($code, ENT_QUOTES, 'UTF-8');
      ?>
    </pre>

    https://kzhishu.hatenablog.jp/entry/2017/04/14/003202#google-code-prettify
  -->
  <script src="https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js"></script>
  <style>
    /* =========================================================
    ========================================================= */
    html {font-size:10pt;  /* 基本となる文字サイズ。。印刷プレビューを見て適宜修正 */}
    body {/* padding: 30px; */
      box-sizing: border-box;  /* 枠線は要素サイズに含める */
    }
    div {margin:0px;padding:0px;}
  </style>
</head>
<body>

<div><h1>目次</h1>
  <ul>
    <li><a href="#1">Ⅰ.リソース一覧</a></li>
    <li><a href="#2">Ⅱ.処理手順</a></li>
    <ul>
      <li><a href="#21">Ⅱ.1.初期設定</a></li>
      <li><a href="#22">Ⅱ.2.フォームでの参加申込</a></li>
      <li><a href="#23">Ⅱ.3.フォーム登録済参加者の受付</a></li>
      <li><a href="#24">Ⅱ.4.当日参加票での受付</a></li>
      <li><a href="#25">Ⅱ.5.一斉配信</a></li>
    </ul>
    <li><a href="#3">Ⅲ.機能別解説</a></li>
    <ul>
      <li><a href="#31">Ⅲ.1.フォーム</a></li>
      <li><a href="#32">Ⅲ.2.回答(スプレッドシート)</a></li>
        <ul>
          <li><a href="#321">(1) doGet: 問合せへの返信</a></li>
          <li><a href="#322">(2) onFormSubmit: フォーム登録時、参加者にメールを自動返信</a></li>
        </ul>
      <li><a href="#33">Ⅲ.3.受付担当者画面(html)</a></li>
      <ul>
        <li><a href="#331">(1) ホーム・QRコードスキャン</a></li>  
        <li><a href="#332">(2) 処理候補選択</a></li>  
        <li><a href="#333">(3) 入力(フォーム登録済分)</a></li>  
        <li><a href="#334">(4) 登録内容詳細</a></li>  
        <li><a href="#335">(5) 入力(当日紙申請分)</a></li>  
        <li><a href="#336">(6) 申込フォームへの誘導(QRコード表示)</a></li>  
        <li><a href="#337">(7) 申込/参加者数集計表</a></li>  
      </ul>
    </ul>
  </ul>
</div>

<div><h1>Ⅰ.リソース一覧</h1><a name="1"></a>

  <table>
    <tr><th>記号</th><th>名称</th><th>格納場所</th><th>種類</th><th>備考</th></tr>
    <tr><td>A</td><td>申込みフォーム</td><td>prototype > 20221006_QR受付 > QR受付テスト</td><td>Google Form</td><td></td></tr>
    <tr><td>B</td><td>回答</td><td>prototype > 20221006_QR受付 > QR受付テスト - 回答</td><td>Google Spread</td><td></td></tr>
    <tr><td>C</td><td>受付画面</td><td>prototype > 20221006_QR受付 > QR受付.html</td><td>html</td><td></td></tr>
    <tr><td>D</td><td>マスタ</td><td>prototype > 20221006_QR受付 > QR受付マスタ - 原本</td><td>Google Spread</td><td></td></tr>
    <tr><td>X</td><td>CDN</td><td colspan="3">※各種ライブラリ</td></tr>
  </table>

</div>

<div><h1>Ⅱ.処理手順</h1><a name="2"></a>
  <div><a name="21"></a><h2>Ⅱ.1.初期設定</h2>
    <div class="mermaid">
      sequenceDiagram
        autonumber
        actor staff as 受付担当
        actor admin as システム管理者
        participant git as HTML置き場<br>(GitHub)
        participant master as マスタ

        admin->>master    : スタッフグループ登録
        admin->>staff     : スタッフ用画面URL通知
        staff->>git       : アクセス
        git->>staff       : スタッフ用画面(html)ダウンロード
        master->>staff    : 初期設定情報(QRコード)
        staff->>staff     : 初期設定
        staff->>master    : 設定内容(稼働中のスタッフ識別子＋所属グループ？)

    </div>
    <p>「初期設定」では以下の登録を行う。<br>
      - GAS WebAPI ID情報の登録<br>
      - 識別子(氏名)の登録<br>
      - 所属するスタッフのグループ設定
    </p>
  </div>

  <div><a name="22"></a><h2>Ⅱ.2.フォームでの参加申込</h2>
    <div class="mermaid">
      sequenceDiagram
        autonumber
        actor guest as 参加者
        participant form as 申込フォーム
        participant answer as 回答
        participant gas as システム(GAS)
  
        guest->>form    : 必要事項を記入
        form->>+answer   : 記入内容を<br>そのまま保存
        Note right of answer: onFormSubmit()
        answer->>+gas    : 受付番号
        Note right of gas: createQrCode ()
        gas->>-answer    : QRコード
        answer->>-guest  : 返信メール
    </div>
    <p>「回答」はマスタとなるスプレッドシートを指す。</p>
    <p>返信メールには以下の内容を記載する。<br>
    - 受付番号<br>
    - QRコード(受付番号)<br>
    - フォーム修正サイトへの誘導(URL/ボタン)<br>
    - 参加者サイトへの誘導(URL/ボタン)<br>
    なお一斉配信の配信対象に変動がある可能性があるため、フォームで修正の都度、改めて返信メールを送る。</p>
  </div>

  <div><a name="23"></a><h2>Ⅱ.3.フォーム登録済参加者の受付</h2>
    <div class="mermaid">
      sequenceDiagram
        autonumber
        actor guest as 参加者
        actor staff as 受付担当
        participant html as スタッフ用画面
        participant master as マスタ

        Note right of guest: 受付時
        guest->>staff    : QR/受付番号/名前
        staff->>html     : QR/受付番号/名前
        html->>+master    : 受付番号/名前
        Note right of master: doGet()
        master->>-html    : 該当者情報
        html->>staff     : 該当者情報
        staff->>guest    : 該当か確認
        guest->>staff    : 参加者名、参加費
        staff->>html     : 登録
        html->>master    : 登録情報
    </div>
    <p>参加者の変更は極力受付前に終了してもらう。無理なら受付後でも可。</p>
  </div>

  <div><a name="24"></a><h2>Ⅱ.4.当日参加票での受付</h2>
    <div class="mermaid">
      sequenceDiagram
        autonumber
        actor guest as 参加者
        actor staff as 受付担当
        actor admin as システム管理者
        participant html as C.スタッフ用画面
        participant master as D.マスタ

        admin->>guest    : 記入用紙(用紙番号QR付)
        guest->>staff    : 記入済申込用紙
        staff->>html     : 紙申請処理起動
        html->>+master   : 仮登録申請
        master->>-html   : 受付番号
        html->>staff     : 申込用紙に受付番号を記入
        staff->>+master  : 本登録申請(受付番号記入済用紙の写真＋参加者属性)
        master->>-staff  : 本登録結果
        staff->>guest    : 記入済申込用紙

        guest->>staff    : 記入済申込用紙<br>(帰宅時)
    </div>
  </div>

  <div><a name="25"></a><h2>Ⅱ.5.一斉配信</h2>
    <div class="mermaid">
      sequenceDiagram
        autonumber
        actor guest as 参加者
        actor staff as スタッフ
        participant html as C.スタッフ用画面
        participant gHtml as 参加者用画面
        participant json as JSONサーバ

        staff->>html    : 文言、対象、予約時刻
        html->>json     : 登録(CRUD)、予約

        guest->>gHtml   : 参加登録返信メールから誘導、表示
        gHtml->>json     : 参照(10秒毎)
        json->>gHtml     : 対象情報
        gHtml->>guest    : 該当する追加情報があればアラーム
    </div>
    <p>フォーム登録の返信メールで参加者用画面へのURLを記載。<br>
      記載されるURLはクエリ文字列で受付番号＋属性を持たせ、
      サーバorクライアント側で表示対象の絞り込みを可能にする。
    </p>
    <p>GCPの無料枠に収めるため、送受信の情報量・頻度は極力絞る(Max.1GB/日)</p>
    <p>配信対象のグルーピングは以下を想定<br>
      - 参加者の属性(ex.未就学児/1〜6年生/卒業生/保護者)<br>
      - 受付番号の範囲(ex. No.10以上20以下)<br>
      - スタッフの担当(ex. 受付、射的、お化け屋敷、スタッフ全員)
    </p>
    <p>参加者用画面には校内マップ・イベントスケジュール等の「しおり」記載情報も記載する。</p>
  </div>

  <div><h2>Ⅱ.6.その他</h2>
    <!-- p>受付担当の業務終了後の秘密保持(アカウント削除)：
      <a href="https://support.google.com/android/answer/7664951?hl=ja">Android でアカウントを追加または削除する</a><br>
      ⇒ Web API IDの受け渡しはQRコードで行うため、不要になった
    </p -->
    <p>綿飴の予約や射的の回数制限、ヨーヨーの販売などを行うなら参加者の個々人の識別が必要になる。<br>
      また「綿あめがもうすぐできるよ」等のフィードバックを行う場合、通知先は親のスマホとなるため、受付番号との紐付けが必要になる。<br>
      以下は仮に行うとした場合の実現手段の想定。<br>
      - 中身は1からの連番であるQRコードを印刷したカードを用意<br>
      - 受付時、カードを参加者に配布、受付番号と一括してスキャンして紐付け<br>
      - 個別の通知はカード番号→受付番号を特定して一斉配信で
      参考：<a href="https://tech.basicinc.jp/articles/193">
        QR コードを連続で読み取れる Web アプリを作った</a>
    </p>
  </div>
</div>

<div><a name="3"></a><h1>Ⅲ.機能別解説</h1>

  <div><h2>Ⅲ.1.フォーム</h2><a name="31"></a>

    <div><h3>「質問」タグでの設定</h3>
      <p>適切な内容が入力されるよう「回答の検証」に以下の正規表現を設定</p>
      <ol>
        <li>氏名：".+　.+" / ".+"</li>
        <li>氏名読み："[ァ-ヾ]+　+[ァ-ヾ　]+" / "[ァ-ヾ　]+"</li>
      </ol>
      <p>「ヷ」「ヸ」「ヹ」「ヺ」等、ひらがなでは対応する文字がないものがあるので、カタカナで入力
        (参考：Unicode<a href="https://ja.wikipedia.org/wiki/%E7%89%87%E4%BB%AE%E5%90%8D_(Unicode%E3%81%AE%E3%83%96%E3%83%AD%E3%83%83%E3%82%AF)">片仮名</a>,
        <a href="https://ja.wikipedia.org/wiki/%E5%B9%B3%E4%BB%AE%E5%90%8D_(Unicode%E3%81%AE%E3%83%96%E3%83%AD%E3%83%83%E3%82%AF)">平仮名</a>)
      </p>
    </div>
    
    <div><h3>「設定」タグでの設定</h3>
      <p>メールアドレスを収集する：ON</p>
      <p>回答のコピーを回答者に送信：リクエストされた場合</p>
      <p>回答の編集を許可する：ON</p>
    </div>
  </div>

  <div><h2>Ⅲ.2.回答(スプレッドシート)</h2><a name="#32"></a>

    <p>
      QRコード作成時の注意：
      MDN「<a href="https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#json.parse_%E3%81%AF%E6%9C%AB%E5%B0%BE%E3%81%AE%E3%82%AB%E3%83%B3%E3%83%9E%E3%82%92%E8%A8%B1%E5%AE%B9%E3%81%97%E3%81%AA%E3%81%84">
      JSON.parse() は末尾のカンマを許容しない</a>」
      ⇒ d列に"label:'value',"の文字列を作成し、arrayformula(concatenate(d:d))とすると末尾にカンマが入る。<br>
      ついでに単一引用符も許されないので、要注意。
    </p>

    <div><h3>(1) doGet: 受付画面からの問合せに該当者情報を提供</h3><a name="321"></a>

      <details><summary>source</summary>
        <pre class="prettyprint linenums">function doGet(e) { // 受付画面からの問合せに該当者情報を提供
  // GASでSpreadSheetにあっさりアクセス
  // https://zenn.dev/sdkfz181tiger/articles/82a91f8bbcc734
  
  // スプレッドシートにアクセス、「マスタ」からデータ取得
  const sheet = SpreadsheetApp.getActive().getSheetByName(&quot;マスタ&quot;);
  // JSONオブジェクトに変換する
  const rows = sheet.getDataRange().getValues();
  const keys = rows.splice(0, 1)[0];
  const data = rows.map(row =&gt; {
    const obj = {};
    row.map((item, index) =&gt; {
      obj[String(keys[index])] = String(item);
    });
    return obj;
  });

  // 条件に合うレコードを抽出
  const dObj = [];
  if( e.parameter.key ){
    const matchKana = e.parameter.key.match(/^[ァ-ヾ　]+$/);
    const matchNum  = e.parameter.key.match(/^[0-9]+$/);
    if( matchKana || matchNum ){
      console.log(&#039;key = &#039;+e.parameter.key);
      for( let i=0 ; i&lt;data.length ; i++ ){
        console.log(i,
          Number(data[i][&#039;受付番号&#039;]),
          Number(e.parameter.key),
          data[i][&#039;読み&#039;].indexOf(e.parameter.key)
        );
        if( Number(data[i][&#039;受付番号&#039;]) === Number(e.parameter.key)
          || data[i][&#039;読み&#039;].indexOf(e.parameter.key) === 0 ){
          dObj.push(data[i]);
          console.log(&#039;pushed!&#039;,data[i]);
        }
      }
      console.log(&#039;dObj&#039;,dObj);
    }
  }

  // JSON文字列に変換して出力する
  const json = JSON.stringify(dObj, null, 2);
  const type = ContentService.MimeType.JSON;
  return ContentService.createTextOutput(json).setMimeType(type);
}</pre>
      </details>

      <p>参考：<a href="https://zenn.dev/sdkfz181tiger/articles/82a91f8bbcc734">GASでSpreadSheetにあっさりアクセス</a></p>
      <p>以下のウェブアプリURLの末尾に"?key=xxxx"を付加。xxxxは受付番号または氏名読み(前方一致)。<br>
      [例] ウェブアプリ : https://script.google.com/macros/s/〜/exec?key=わたなべ</p>

      <details><summary>結果として渡されるJSONサンプル</summary>
        <pre>[
  {
    '登録日時': 'Sun Oct 09 2022 14:09:19 GMT+0900 (日本標準時)',
    'メール': 'nakaone.kunihiro@gmail.com',
    '氏名': '国生　さゆり','読み': 'コクショウ　サユリ','参加': '参加する',
    '①氏名': '','①読み': '','①所属': '',
    '②氏名': '','②読み': '','②所属': '',
    '③氏名': '','③読み': '','③所属': '',
    '連絡先': '','引取者': '','備考': '','取消': '',
    '受付番号': '10','編集用URL': 'https://〜',
    '担当': '','課金': '','非課金': '','免除': '','用紙番号': '',
    '申請数(小学生以上)': '1','申請数(未就学児)': '0',
    '参加費': '','状態': '','①参加費': '','①状態': '','②参加費': '','②状態': '','③参加費': '','③状態': '',
    '参加数(小学生以上)': '','参加数(未就学児)': ''
  }
]</pre>
      </details>
    </div>

    <div><h3>(2) onFormSubmit: フォーム登録時、参加者にメールを自動返信</h3><a name="322"></a>

      <details><summary>source</summary>
        <pre class="prettyprint linenums">// テストデータ出典
// https://e.usen.com/onyankomember/

const bodyPattern = `
::firstName:: 様

下北沢小学校おやじの会です。この度は参加登録、ありがとうございました。

当日は検温後に受付に行き、添付QRコードまたは受付番号を担当者にお示しください。
=============================
受付番号： ::entryNo::
=============================

なお登録いただいた参加メンバの追加・欠席、または申込みのキャンセルがあった場合、以下のフォームを修正してお知らせください。
::editURL::

当日のお越しをお待ちしております。
`;

const htmlPattern = `
&lt;p&gt;::firstName:: 様&lt;/p&gt;

&lt;p&gt;下北沢小学校おやじの会です。この度は参加登録、ありがとうございました。&lt;/p&gt;

&lt;p&gt;当日は検温後に受付に行き、以下を受付担当者にお示しください。&lt;/p&gt;
&lt;div style=&quot;
  border: solid 2px #f00;
  padding:5px;&quot;&gt;受付番号：
  &lt;p style=&quot;text-align:center;&quot;&gt;
    &lt;span style=&quot;font-size: 3rem;&quot;&gt;::entryNo::&lt;/span&gt;
  &lt;/p&gt;
  &lt;p style=&quot;text-align:center;&quot;&gt;
    &lt;img src=&#039;cid:qr_code&#039; /&gt;
  &lt;/p&gt;
&lt;/div&gt;

&lt;p&gt;もし登録いただいた参加メンバの追加・欠席、または申込みのキャンセルがあった場合、以下から修正してください。&lt;/p&gt;

&lt;p&gt;&lt;a href=&quot;::editURL::&quot; style=&quot;
  display: inline-block;
  padding: 20px 50px 20px 50px;
  text-decoration: none;
  color: white;
  background: blue;
  font-weight: bold;
  border: solid 4px blue;
  border-radius: 8px;&quot;&gt;参加申込の修正&lt;/a&gt;&lt;/p&gt;

&lt;p&gt;なお当日の注意事項・持ち物リストは適宜追加されることがありますので、イベント前日に「&lt;a href=&quot;https://sites.google.com/view/shimokita-oyaji/home/archives/20221001-%E6%A0%A1%E5%BA%AD%E3%83%87%E3%82%A4%E3%82%AD%E3%83%A3%E3%83%B3%E3%83%97&quot;&gt;開催案内&lt;/a&gt;」のページで再度ご確認いただけますようお願い申し上げます。&lt;/p&gt;

&lt;p&gt;当日のお越しをお待ちしております。&lt;/p&gt;
`;

function onFormSubmit(  // メールの自動返信
  e={namedValues:{&#039;メールアドレス&#039;:[&#039;nakaone.kunihiro@gmail.com&#039;]}} // テスト用既定値
) {
  console.log(e.namedValues);

  // 1.受付番号の採番
  // 「回答」シート上で書き込まれた行番号＋「当日」上のデータ件数−ヘッダ1行×2シート
  let entryNo = e.range.rowStart - 2
    + SpreadsheetApp.getActiveSpreadsheet().getSheetByName(&#039;当日&#039;).getLastRow();
  // シートに受付番号を記入
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(&#039;回答&#039;);
  sheet.getRange(&quot;S&quot;+e.range.rowStart).setValue(entryNo); // 受付番号はS列
  entryNo = (&#039;0000&#039;+entryNo).slice(-4);

  // 2.編集用URLの取得
  // 2.1.シート側のキーを生成
  const sKey = sheet.getRange(&quot;A&quot;+e.range.rowStart).getValue().getTime()
    + e.namedValues[&#039;メールアドレス&#039;][0];
  /* 以下だと秒単位でミリ秒が無いためフォームと一致しない
  const sKey = new Date(e.namedValues[&#039;タイムスタンプ&#039;][0]).getTime()
    + e.namedValues[&#039;メールアドレス&#039;][0]; */
  console.log(&#039;sKey = &#039;+sKey);

  // 2.2.フォームデータを全件読み込み
  // FormIdはフォームの編集画面。入力画面、回答後の「回答を記録しました」画面とは異なる。
  const FormId = &quot;1hnQLsY3lRh0gQMGfXoJJqAL_yBpKR6T0h2RFRc8tUEA&quot;;
  const formData = FormApp.openById(FormId).getResponses();

  // 2.3.フォームデータを順次検索
  let editURL = &#039;&#039;;
  for( let i=formData.length-1 ; i&gt;=0 ; i++ ){
    const fKey = formData[i].getTimestamp().getTime()
      + formData[i].getRespondentEmail();
    console.log(i,fKey);
    if( sKey === fKey ){
      console.log(&#039;formData&#039;,formData[i]);
      editURL = formData[i].getEditResponseUrl();
      break;
    }
  }
  console.log(&#039;editURL = &#039;+editURL);

  // 2.4.シートに編集用URLを保存
  sheet.getRange(&quot;T&quot;+e.range.rowStart).setValue(editURL); // 編集用URLはT列

  // 3.本文の編集
  const firstName = e.namedValues[&#039;申請者氏名&#039;][0].match(/^([^　]+)/)[1];
  const body = bodyPattern
    .replace(&quot;::firstName::&quot;,firstName)
    .replace(&quot;::entryNo::&quot;,entryNo)
    .replace(&quot;::editURL::&quot;,editURL);
  /*let body = JSON.stringify(e) + &#039;\n\n&#039;
    + &#039;entryNo = &#039; + entryNo + &#039;\n\n&#039;
    + &#039;editURL = &#039; + editURL + &#039;\n&#039;
  ;*/

  // 3.2.htmlメールの編集
  const options = {
    name: &#039;下北沢小学校おやじの会&#039;,
    replyTo: &#039;shimokitasho.oyaji@gmail.com&#039;,
    //attachments: createQrCode(entryNo),
    htmlBody: htmlPattern
      .replace(&quot;::firstName::&quot;,firstName)
      .replace(&quot;::entryNo::&quot;,entryNo)
      .replace(&quot;::editURL::&quot;,editURL),
    inlineImages: {
      qr_code: createQrCode(entryNo),
    }
  }

  GmailApp.sendEmail(
    e.namedValues[&#039;メールアドレス&#039;][0],  // to
    &#039;【完了】QR受付テストへの登録&#039;,     // subject
    body,
    options
  );
}

const createQrCode = (code_data) =&gt; { // QRコード生成
  let url = &#039;https://chart.googleapis.com/chart?chs=200x200&amp;cht=qr&amp;chl=&#039; + code_data;
  let option = {
      method: &quot;get&quot;,
      muteHttpExceptions: true
    };
  let ajax = UrlFetchApp.fetch(url, option);
  console.log(ajax.getBlob())
  return ajax.getBlob();
}</pre>
      </details>

      <p>AppScript > トリガー > トリガーを追加 > onFormSubmit/フォーム送信時</p>
  
      <div><h3>1.引数・戻り値</h3>
        <p>引数はフォームから登録された内容の情報。</p>
        <details><summary>サンプル</summary>
          <pre class="hljs" style="display: block; overflow-x: auto; padding: 0.5em; color: rgb(51, 51, 51); background: rgb(248, 248, 248);">{
            <span class="hljs-string" style="color: rgb(221, 17, 68);">"authMode"</span>:<span class="hljs-string" style="color: rgb(221, 17, 68);">"FULL"</span>,
            <span class="hljs-string" style="color: rgb(221, 17, 68);">"namedValues"</span>:{
              <span class="hljs-string" style="color: rgb(221, 17, 68);">"参加者③所属"</span>:[<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>],
              <span class="hljs-string" style="color: rgb(221, 17, 68);">"参加者③氏名"</span>:[<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>],
              <span class="hljs-string" style="color: rgb(221, 17, 68);">"タイムスタンプ"</span>:[<span class="hljs-string" style="color: rgb(221, 17, 68);">"2022/10/06 13:08:50"</span>],
              <span class="hljs-string" style="color: rgb(221, 17, 68);">"メールアドレス"</span>:[<span class="hljs-string" style="color: rgb(221, 17, 68);">"nakaone.kunihiro@gmail.com"</span>],
              <span class="hljs-string" style="color: rgb(221, 17, 68);">"参加者②氏名"</span>:[<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>],
              <span class="hljs-string" style="color: rgb(221, 17, 68);">"参加者②氏名読み"</span>:[<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>],
              <span class="hljs-string" style="color: rgb(221, 17, 68);">"引取者氏名"</span>:[<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>],
              <span class="hljs-string" style="color: rgb(221, 17, 68);">"参加者①氏名"</span>:[<span class="hljs-string" style="color: rgb(221, 17, 68);">"内海　和子"</span>],
              <span class="hljs-string" style="color: rgb(221, 17, 68);">"参加者③氏名読み"</span>:[<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>],
              <span class="hljs-string" style="color: rgb(221, 17, 68);">"緊急連絡先"</span>:[<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>],
              <span class="hljs-string" style="color: rgb(221, 17, 68);">"備考"</span>:[<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>],
              <span class="hljs-string" style="color: rgb(221, 17, 68);">"参加者①氏名読み"</span>:[<span class="hljs-string" style="color: rgb(221, 17, 68);">"うつみ
              かずこ"</span>],
              <span class="hljs-string" style="color: rgb(221, 17, 68);">"参加者①所属"</span>:[<span class="hljs-string" style="color: rgb(221, 17, 68);">"4年"</span>],
              <span class="hljs-string" style="color: rgb(221, 17, 68);">"参加者②所属"</span>:[<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>]
            },
            <span class="hljs-string" style="color: rgb(221, 17, 68);">"range"</span>:{<span class="hljs-string" style="color: rgb(221, 17, 68);">"columnEnd"</span>:<span class="hljs-number" style="color: teal;">14</span>,<span class="hljs-string" style="color: rgb(221, 17, 68);">"columnStart"</span>:<span class="hljs-number" style="color: teal;">1</span>,<span class="hljs-string" style="color: rgb(221, 17, 68);">"rowEnd"</span>:<span class="hljs-number" style="color: teal;">14</span>,<span class="hljs-string" style="color: rgb(221, 17, 68);">"rowStart"</span>:<span class="hljs-number" style="color: teal;">14</span>},
            <span class="hljs-string" style="color: rgb(221, 17, 68);">"source"</span>:{},
            <span class="hljs-string" style="color: rgb(221, 17, 68);">"triggerUid"</span>:<span class="hljs-string" style="color: rgb(221, 17, 68);">"12944381"</span>,
            <span class="hljs-string" style="color: rgb(221, 17, 68);">"values"</span>:[<span class="hljs-string" style="color: rgb(221, 17, 68);">"2022/10/06 13:08:50"</span>,<span class="hljs-string" style="color: rgb(221, 17, 68);">"nakaone.kunihiro@gmail.com"</span>,<span class="hljs-string" style="color: rgb(221, 17, 68);">"内海　和子"</span>,<span class="hljs-string" style="color: rgb(221, 17, 68);">"うつみ　かずこ"</span>,<span class="hljs-string" style="color: rgb(221, 17, 68);">"4年"</span>,<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>,<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>,<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>,<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>,<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>,<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>,<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>,<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>,<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>]
          }</pre>
        </details>
          <p>受付番号として`range.rowStart`、一意キーとしてタイムスタンプ＋e-mail`values[0]+values[1]`を使用する。<br>
          ※ namedValuesでも取得できるが、valuesがFormApp.getResponses()と同じ一次元配列なのでベターと判断。</p>
      </div>
  
      <div><h3>2.フォーム編集用URLの取得</h3>
        <p>参加者の追加・削除やキャンセル登録のため、登録者(参加者)がフォームを編集する必要があるが、
          編集用URLはGoogle Spreadには記録されず、フォームの登録情報にしか存在しない。
          そこで①フォームの登録情報を全件取得し、②Google Spreadの登録日時＋e-mailから特定し、
          ③特定された登録情報から編集用URLを取得、という手順を踏む。</p>
  
        <p>※回答シートとフォームで添字が一致しないかと考えたが、結果的には一致していない。
          よって「タイムスタンプのgetTime()＋e-mail」を検索キーとする。</p>
  
        <p>フォームの全件取得</p>
        <pre class="hljs" style="display: block; overflow-x: auto; padding: 0.5em; color: rgb(51, 51, 51); background: rgb(248, 248, 248);">  <span class="hljs-comment" style="color: rgb(153, 153, 136); font-style: italic;">// OK:フォームの編集画面</span>
          <span class="hljs-keyword" style="color: rgb(51, 51, 51); font-weight: 700;">const</span> FormId = <span class="hljs-string" style="color: rgb(221, 17, 68);">"1vlVbz6DM7hSFsijDPv63GUaz9cozSOxO5_O--SBR9cg"</span>;
          <span class="hljs-comment" style="color: rgb(153, 153, 136); font-style: italic;">// NG:フォームの入力画面、回答後の「回答を記録しました」画面, 「回答を編集」のリンク先</span>
          <span class="hljs-comment" style="color: rgb(153, 153, 136); font-style: italic;">//const FormId = "1FAIpQLSewOvfxT2b_jomhMOTG6rw7qX6a_KtFYAz3gkyWPgc9lx7jfA";</span>
          <span class="hljs-keyword" style="color: rgb(51, 51, 51); font-weight: 700;">const</span> formData = FormApp.openById(FormId).getResponses();</pre>
  
        <p>編集用URL・登録日時・e-mailの取得</p>
        <pre class="hljs" style="display: block; overflow-x: auto; padding: 0.5em; color: rgb(51, 51, 51); background: rgb(248, 248, 248);">for( <span class="hljs-name" style="color: navy; font-weight: 400;">let</span> i=0 <span class="hljs-comment" style="color: rgb(153, 153, 136); font-style: italic;">; i&lt;formData.length ; i++ ){</span>
          console.log(<span class="hljs-string" style="color: rgb(221, 17, 68);">"formData["</span>+i+<span class="hljs-string" style="color: rgb(221, 17, 68);">"] : "</span>
            + <span class="hljs-string" style="color: rgb(221, 17, 68);">"getEditResponseUrl="</span> + formData[i].getEditResponseUrl() + <span class="hljs-string" style="color: rgb(221, 17, 68);">"\n"</span>
            + <span class="hljs-string" style="color: rgb(221, 17, 68);">"key = "</span> + String(<span class="hljs-name" style="color: navy; font-weight: 400;">new</span> Date(<span class="hljs-name" style="color: navy; font-weight: 400;">formData</span>[i].getTimestamp()).getTime())
            + formData[i].getRespondentEmail()
          )<span class="hljs-comment" style="color: rgb(153, 153, 136); font-style: italic;">;</span>
        }</pre>
  
        <p>getEditResponseUrl()他のメソッドの詳細については、Google公式 <a href="https://developers.google.com/apps-script/reference/forms/form-response">Class FormResponse</a>参照。</p>
      </div>
  
      <div><h3>3.注意事項</h3>
        <div><h4>(1) 運用前、GASコンソールで「実行」し、権限を付与しておく</h4>
          <p>でないと"Exception: The script does not have permission"が発生する。<br>
            参考：https://stackoverflow.com/questions/28200857/you-do-not-have-permission-to-perform-that-action
          </p>
  
          <p>これは以下のそれぞれについて必要<br>
          ・メールの送信(GmailApp.sendEmail)<br>
          ・Google Spreadへのアクセス(getLastRow)<br>
          ・createQrCode
          </p>
  
          <p>参考：上記以前に実行した対処(これだけではNG)<br>
            appsscript.jsonの修正：https://qiita.com/kajirikajiri/items/84b9a9fee61cbc3bf124<br>
            appsscript.jsonの表示：https://blog-and-destroy.com/42443
          </p>
        </div>
  
        <div><h4>(2) 管理者への回答通知を回避する設定</h4>
          <p>フォーム > 回答タグ > スプレッドシートアイコン右のメニュー > <br>
          「新しい回答についてのメール通知を受け取る」のチェックを外す
          </p>
        </div>
      </div>
  
      <div><h3>4.参考</h3>
        <p>メールの自動返信：https://blog.hubspot.jp/google-forms-automatic-reply#f</p>
        <p>メールへのファイル添付：https://my-funs.com/gas-mailapp/</p>    
        <p><a href="https://auto-worker.com/blog/?p=2827">GASでHTMLメールを送る方法とインライン画像を埋め込む(画像挿入)方法</a></p>
  
      </div>
      
    </div>
  
    <div><h3>(3) createQrCode: 渡された文字列からQRコード(Blob)を生成</h3>
      <div><h3>引数・戻り値</h3>
      </div>
      
      <div><h3>参考</h3>
        <p>Google Apps ScriptでQRコードを生成してみる：https://note.com/himajin_no_asobi/n/n51de21bf73e5</p>
      </div>
      
    </div>

    <details><summary>デプロイ履歴</summary>
      <p>※タイトルは「スマホ受付 rev.x」とする。</p>
      <pre>
        バージョン 3（10月9日 18:00）
        デプロイ ID
        AKfycbwLUU_XxDtn9sDjTZccuIfM9Od6DdjYEX7m2QkgWi73d7fjNEcCVGIjD7OmDkBDv4ihog
        ウェブアプリ
        URL
        https://script.google.com/macros/s/AKfycbwLUU_XxDtn9sDjTZccuIfM9Od6DdjYEX7m2QkgWi73d7fjNEcCVGIjD7OmDkBDv4ihog/exec
      </pre>
      <pre>
        バージョン 2（10月9日 13:44）
        デプロイ ID
        AKfycbzvJ76fOmgoB70kpkm4-TXUCJNfS7G1j_JTev-inCLe4kxEYzQ33sHhQvBZLmzOYpFT
        ウェブアプリ
        URL
        https://script.google.com/macros/s/AKfycbzvJ76fOmgoB70kpkm4-TXUCJNfS7G1j_JTev-inCLe4kxEYzQ33sHhQvBZLmzOYpFT/exec
      </pre>
      <pre>
        バージョン 1（10月9日 13:37）
        デプロイ ID
        AKfycbx_lxQmFxZ20dfK7TqdbE0WSnIfBcNRgVEM9l_V9-8r-nb3mzlmLS6HS4-1EJxUVHS1jA
        ウェブアプリ
        URL
        https://script.google.com/macros/s/AKfycbx_lxQmFxZ20dfK7TqdbE0WSnIfBcNRgVEM9l_V9-8r-nb3mzlmLS6HS4-1EJxUVHS1jA/exec
        </pre>
    </details>
  </div>

  <div><h2>Ⅲ.3.受付担当者画面(html)</h2><a name="33"></a>
  
    <div><h3>temp</h3>

      <p><a href="https://shu-sait.com/wordpres-html-kyouzon/#:~:text=%E9%9D%99%E7%9A%84%E3%82%B5%E3%82%A4%E3%83%88%E3%81%AE%E3%83%95%E3%82%A9%E3%83%AB%E3%83%80%E3%81%ABhtml%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%82%92%E3%82%A2%E3%83%83%E3%83%97,-%E4%BD%9C%E6%88%90%E3%81%97%E3%81%9F%E3%83%95%E3%82%A9%E3%83%AB%E3%83%80&text=%E3%81%9D%E3%81%97%E3%81%A6URL%E3%81%ABhtml%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB,%E3%81%A6%E3%81%84%E3%82%8B%E3%81%8B%E3%81%A8%E6%80%9D%E3%81%84%E3%81%BE%E3%81%99%E3%80%82">
        WordPressに静的サイトを共存させてみる</a></p>
      <ol>
        <li>Google CloudでSSHコンソールを開く</li>
        <li>"/var/www/html/static/"に移動</li>
        <li>コンソールからzipファイルをアップロード</li>
        <li>ユーザルートにアップロードされたファイルを格納場所に移動</li>
        <li>unzip</li>
      </ol>
      <details><summary>staticディレクトリ作成時ログ</summary>
        <pre>shimokitasho_oyaji@wordpress-1-vm:/var/www/html$ pwd
/var/www/html
shimokitasho_oyaji@wordpress-1-vm:/var/www/html$ sudo mkdir static
shimokitasho_oyaji@wordpress-1-vm:/var/www/html$ sudo chmod 655 static
shimokitasho_oyaji@wordpress-1-vm:/var/www/html$ sudo mkdir static/reception
shimokitasho_oyaji@wordpress-1-vm:/var/www/html$ sudo chmod 655 static/reception </pre>
      </details>
    </div>

      <p>ファイルのGCPへのアップロード：Google Cloud
      <a href="https://cloud.google.com/compute/docs/instances/transfer-files?hl=ja#transferbrowser">
      ブラウザの SSH を使用したファイルの転送</a></p>
    <div><h3>(1) ホーム・QRコードスキャン</h3><a name="331"></a>
      <div><h4>参考</h4>
        <p><a href="http://dotnsf.blog.jp/archives/1078584611.html">HTML と JavaScript だけで QR コード読み取り</a></p>
        <p>以下はボタン操作が不要になるが、https通信が必要になるので、次期開発で対応</p>
        <p><a href="https://qiita.com/kan_dai/items/4331aae12f5f2d3ad18d">Webの技術だけで作るQRコードリーダー</a></p>
        <p><a href="https://qiita.com/kan_dai/items/3486880236a2fcd9b527">続・Webの技術だけで作るQRコードリーダ</a></p>
        <p>Zenn <a href="https://zenn.dev/sdkfz181tiger/articles/096dfb74d485db">jsQRであっさりQRコードリーダ/メーカ</a></p>
      </div>
        <!-- 以下旧版
        <details><summary>参考：<a href="http://dotnsf.blog.jp/archives/1078584611.html">HTML と JavaScript だけで QR コード読み取り</a></summary>
    
          <pre class="hljs" style="display: block; overflow-x: auto; padding: 0.5em; background: rgb(240, 240, 240); color: rgb(68, 68, 68);"><span class="xml"><span class="hljs-tag">&lt;<span class="hljs-name" style="font-weight: 700;">html</span>&gt;</span>
            <span class="hljs-tag">&lt;<span class="hljs-name" style="font-weight: 700;">head</span>&gt;</span>
            <span class="hljs-tag">&lt;<span class="hljs-name" style="font-weight: 700;">meta</span> <span class="hljs-attr">charset</span>=<span class="hljs-string" style="color: rgb(136, 0, 0);">"utf8"</span>/&gt;</span>
            <span class="hljs-tag">&lt;<span class="hljs-name" style="font-weight: 700;">title</span>&gt;</span>Web QRCode Reader<span class="hljs-tag">&lt;/<span class="hljs-name" style="font-weight: 700;">title</span>&gt;</span>
            <span class="hljs-tag">&lt;<span class="hljs-name" style="font-weight: 700;">script</span> <span class="hljs-attr">src</span>=<span class="hljs-string" style="color: rgb(136, 0, 0);">"https://code.jquery.com/jquery-2.2.4.min.js"</span>&gt;</span><span class="undefined"></span><span class="hljs-tag">&lt;/<span class="hljs-name" style="font-weight: 700;">script</span>&gt;</span>
            <span class="hljs-tag">&lt;<span class="hljs-name" style="font-weight: 700;">script</span> <span class="hljs-attr">src</span>=<span class="hljs-string" style="color: rgb(136, 0, 0);">"https://cdn.jsdelivr.net/npm/jsqr@1.3.1/dist/jsQR.min.js"</span>&gt;</span><span class="undefined"></span><span class="hljs-tag">&lt;/<span class="hljs-name" style="font-weight: 700;">script</span>&gt;</span>
            <span class="hljs-tag">&lt;<span class="hljs-name" style="font-weight: 700;">link</span> <span class="hljs-attr">href</span>=<span class="hljs-string" style="color: rgb(136, 0, 0);">"https://maxcdn.bootstrapcdn.com/bootstrap/4.3.0/css/bootstrap.min.css"</span> <span class="hljs-attr">rel</span>=<span class="hljs-string" style="color: rgb(136, 0, 0);">"stylesheet"</span>/&gt;</span>
            <span class="hljs-tag">&lt;<span class="hljs-name" style="font-weight: 700;">script</span> <span class="hljs-attr">src</span>=<span class="hljs-string" style="color: rgb(136, 0, 0);">"https://maxcdn.bootstrapcdn.com/bootstrap/4.3.0/js/bootstrap.min.js"</span>&gt;</span><span class="undefined"></span><span class="hljs-tag">&lt;/<span class="hljs-name" style="font-weight: 700;">script</span>&gt;</span>
            
            <span class="hljs-tag">&lt;<span class="hljs-name" style="font-weight: 700;">meta</span> <span class="hljs-attr">name</span>=<span class="hljs-string" style="color: rgb(136, 0, 0);">"viewport"</span> <span class="hljs-attr">content</span>=<span class="hljs-string" style="color: rgb(136, 0, 0);">"width=device-width,initial-scale=1"</span>/&gt;</span>
            <span class="hljs-tag">&lt;<span class="hljs-name" style="font-weight: 700;">meta</span> <span class="hljs-attr">name</span>=<span class="hljs-string" style="color: rgb(136, 0, 0);">"apple-mobile-web-app-capable"</span> <span class="hljs-attr">content</span>=<span class="hljs-string" style="color: rgb(136, 0, 0);">"yes"</span>/&gt;</span>
            <span class="hljs-tag">&lt;<span class="hljs-name" style="font-weight: 700;">meta</span> <span class="hljs-attr">name</span>=<span class="hljs-string" style="color: rgb(136, 0, 0);">"apple-mobile-web-app-status-bar-style"</span> <span class="hljs-attr">content</span>=<span class="hljs-string" style="color: rgb(136, 0, 0);">"black"</span>/&gt;</span>
            <span class="hljs-tag">&lt;<span class="hljs-name" style="font-weight: 700;">meta</span> <span class="hljs-attr">name</span>=<span class="hljs-string" style="color: rgb(136, 0, 0);">"apple-mobile-web-app-title"</span> <span class="hljs-attr">content</span>=<span class="hljs-string" style="color: rgb(136, 0, 0);">"Web QRCode Reader"</span>/&gt;</span>
            
            <span class="hljs-tag">&lt;<span class="hljs-name" style="font-weight: 700;">style</span> <span class="hljs-attr">type</span>=<span class="hljs-string" style="color: rgb(136, 0, 0);">"text/css"</span>&gt;</span><span class="css">
            <span class="hljs-selector-tag" style="font-weight: 700;">html</span>, <span class="hljs-selector-tag" style="font-weight: 700;">body</span>{
              <span class="hljs-attribute" style="font-weight: 700;">text-align</span>: center;
              <span class="hljs-attribute" style="font-weight: 700;">background-color</span>: <span class="hljs-number" style="color: rgb(136, 0, 0);">#fafafa</span>;
              <span class="hljs-attribute" style="font-weight: 700;">font-size</span>: <span class="hljs-number" style="color: rgb(136, 0, 0);">20px</span>;
              <span class="hljs-attribute" style="font-weight: 700;">color</span>: <span class="hljs-number" style="color: rgb(136, 0, 0);">#333</span>;
            }
            <span class="hljs-selector-id" style="color: rgb(136, 0, 0);">#mycanvas</span>{
              <span class="hljs-attribute" style="font-weight: 700;">border</span>: <span class="hljs-number" style="color: rgb(136, 0, 0);">1px</span> solid <span class="hljs-number" style="color: rgb(136, 0, 0);">#333</span>;
            }
            </span><span class="hljs-tag">&lt;/<span class="hljs-name" style="font-weight: 700;">style</span>&gt;</span>
            
            <span class="hljs-tag">&lt;<span class="hljs-name" style="font-weight: 700;">script</span>&gt;</span><span class="javascript">
            <span class="hljs-keyword" style="font-weight: 700;">var</span> canvas = <span class="hljs-literal" style="color: rgb(120, 169, 96);">null</span>;
            <span class="hljs-keyword" style="font-weight: 700;">var</span> ctx = <span class="hljs-literal" style="color: rgb(120, 169, 96);">null</span>;
            $(<span class="hljs-function"><span class="hljs-keyword" style="font-weight: 700;">function</span>(<span class="hljs-params"></span>)</span>{
              canvas = <span class="hljs-built_in" style="color: rgb(57, 115, 0);">document</span>.getElementById( <span class="hljs-string" style="color: rgb(136, 0, 0);">'mycanvas'</span> );
              ctx = canvas.getContext( <span class="hljs-string" style="color: rgb(136, 0, 0);">'2d'</span> );
            
              <span class="hljs-keyword" style="font-weight: 700;">var</span> file_image = <span class="hljs-built_in" style="color: rgb(57, 115, 0);">document</span>.getElementById( <span class="hljs-string" style="color: rgb(136, 0, 0);">'file-image'</span> );
              file_image.addEventListener( <span class="hljs-string" style="color: rgb(136, 0, 0);">'change'</span>, selectReadFile, <span class="hljs-literal" style="color: rgb(120, 169, 96);">false</span> );
            });
            
            <span class="hljs-function"><span class="hljs-keyword" style="font-weight: 700;">function</span> <span class="hljs-title" style="color: rgb(136, 0, 0); font-weight: 700;">selectReadFile</span>(<span class="hljs-params"> e </span>)</span>{
              <span class="hljs-keyword" style="font-weight: 700;">var</span> file = e.target.files;
              <span class="hljs-keyword" style="font-weight: 700;">var</span> reader = <span class="hljs-keyword" style="font-weight: 700;">new</span> FileReader();
              <span class="hljs-comment" style="color: rgb(136, 136, 136);">//reader.readAsDataURL( file[0] );</span>
              reader.onload = <span class="hljs-function"><span class="hljs-keyword" style="font-weight: 700;">function</span>(<span class="hljs-params"></span>)</span>{
                readDrawImg( reader, canvas, <span class="hljs-number" style="color: rgb(136, 0, 0);">0</span>, <span class="hljs-number" style="color: rgb(136, 0, 0);">0</span> );
              }
              reader.readAsDataURL( file[<span class="hljs-number" style="color: rgb(136, 0, 0);">0</span>] );
            }
            
            <span class="hljs-function"><span class="hljs-keyword" style="font-weight: 700;">function</span> <span class="hljs-title" style="color: rgb(136, 0, 0); font-weight: 700;">readDrawImg</span>(<span class="hljs-params"> reader, canvas, x, y </span>)</span>{
              <span class="hljs-keyword" style="font-weight: 700;">var</span> img = readImg( reader );
              img.onload = <span class="hljs-function"><span class="hljs-keyword" style="font-weight: 700;">function</span>(<span class="hljs-params"></span>)</span>{
                <span class="hljs-keyword" style="font-weight: 700;">var</span> w = img.width;
                <span class="hljs-keyword" style="font-weight: 700;">var</span> h = img.height;
                printWidthHeight( <span class="hljs-string" style="color: rgb(136, 0, 0);">'src-width-height'</span>, <span class="hljs-literal" style="color: rgb(120, 169, 96);">true</span>, w, h );
            
                <span class="hljs-comment" style="color: rgb(136, 136, 136);">// resize</span>
                <span class="hljs-keyword" style="font-weight: 700;">var</span> resize = resizeWidthHeight( <span class="hljs-number" style="color: rgb(136, 0, 0);">1024</span>, w, h );
                printWidthHeight( <span class="hljs-string" style="color: rgb(136, 0, 0);">'dst-width-height'</span>, resize.flag, resize.w, resize.h );
                drawImgOnCav( canvas, img, x, y, resize.w, resize.h );
              }
            }
            
            <span class="hljs-function"><span class="hljs-keyword" style="font-weight: 700;">function</span> <span class="hljs-title" style="color: rgb(136, 0, 0); font-weight: 700;">readImg</span>(<span class="hljs-params"> reader </span>)</span>{
              <span class="hljs-keyword" style="font-weight: 700;">var</span> result_dataURL = reader.result;
              <span class="hljs-keyword" style="font-weight: 700;">var</span> img = <span class="hljs-keyword" style="font-weight: 700;">new</span> Image();
              img.src = result_dataURL;
            
              <span class="hljs-keyword" style="font-weight: 700;">return</span> img;
            }
            
            <span class="hljs-function"><span class="hljs-keyword" style="font-weight: 700;">function</span> <span class="hljs-title" style="color: rgb(136, 0, 0); font-weight: 700;">drawImgOnCav</span>(<span class="hljs-params"> canvas, img, x, y, w, h </span>)</span>{
              canvas.width = w;
              canvas.height = h;
              ctx.drawImage( img, x, y, w, h );
            
              checkQRCode();
            }
            
            <span class="hljs-function"><span class="hljs-keyword" style="font-weight: 700;">function</span> <span class="hljs-title" style="color: rgb(136, 0, 0); font-weight: 700;">resizeWidthHeight</span>(<span class="hljs-params"> target_length_px, w0, h0 </span>)</span>{
              <span class="hljs-keyword" style="font-weight: 700;">var</span> length = <span class="hljs-built_in" style="color: rgb(57, 115, 0);">Math</span>.max( w0, h0 );
              <span class="hljs-keyword" style="font-weight: 700;">if</span>( length &lt;= target_length_px ){
                <span class="hljs-keyword" style="font-weight: 700;">return</span>({
                  flag: <span class="hljs-literal" style="color: rgb(120, 169, 96);">false</span>,
                  w: w0,
                  h: h0
                });
              }
            
              <span class="hljs-keyword" style="font-weight: 700;">var</span> w1;
              <span class="hljs-keyword" style="font-weight: 700;">var</span> h1;
              <span class="hljs-keyword" style="font-weight: 700;">if</span>( w0 &gt;= h0 ){
                w1 = target_length_px;
                h1 = h0 * target_length_px / w0;
              }<span class="hljs-keyword" style="font-weight: 700;">else</span>{
                w1 = w0 * target_length_px / h0;
                h1 = target_length_px;
              }
            
              <span class="hljs-keyword" style="font-weight: 700;">return</span>({
                flag: <span class="hljs-literal" style="color: rgb(120, 169, 96);">true</span>,
                w: <span class="hljs-built_in" style="color: rgb(57, 115, 0);">parseInt</span>( w1 ),
                h: <span class="hljs-built_in" style="color: rgb(57, 115, 0);">parseInt</span>( h1 )
              });
            }
            
            <span class="hljs-function"><span class="hljs-keyword" style="font-weight: 700;">function</span> <span class="hljs-title" style="color: rgb(136, 0, 0); font-weight: 700;">printWidthHeight</span>(<span class="hljs-params"> width_height_id, flag, w, h </span>)</span>{
              <span class="hljs-keyword" style="font-weight: 700;">var</span> wh = <span class="hljs-built_in" style="color: rgb(57, 115, 0);">document</span>.getElementById( width_height_id );
              wh.innerHTML = <span class="hljs-string" style="color: rgb(136, 0, 0);">'幅: '</span> + w + <span class="hljs-string" style="color: rgb(136, 0, 0);">', 高さ: '</span> + h;
            }
            
            <span class="hljs-function"><span class="hljs-keyword" style="font-weight: 700;">function</span> <span class="hljs-title" style="color: rgb(136, 0, 0); font-weight: 700;">checkQRCode</span>(<span class="hljs-params"></span>)</span>{
              <span class="hljs-keyword" style="font-weight: 700;">var</span> imageData = ctx.getImageData( <span class="hljs-number" style="color: rgb(136, 0, 0);">0</span>, <span class="hljs-number" style="color: rgb(136, 0, 0);">0</span>, canvas.width, canvas.height );
              <span class="hljs-keyword" style="font-weight: 700;">var</span> code = jsQR( imageData.data, canvas.width, canvas.height );
              <span class="hljs-keyword" style="font-weight: 700;">if</span>( code ){
                <span class="hljs-comment" style="color: rgb(136, 136, 136);">//console.log( code );</span>
                alert( code.data );
              }<span class="hljs-keyword" style="font-weight: 700;">else</span>{
                alert( <span class="hljs-string" style="color: rgb(136, 0, 0);">"No QR Code found."</span> );
              }
            }
            </span><span class="hljs-tag">&lt;/<span class="hljs-name" style="font-weight: 700;">script</span>&gt;</span>
            <span class="hljs-tag">&lt;/<span class="hljs-name" style="font-weight: 700;">head</span>&gt;</span>
            <span class="hljs-tag">&lt;<span class="hljs-name" style="font-weight: 700;">body</span>&gt;</span>
            <span class="hljs-tag">&lt;<span class="hljs-name" style="font-weight: 700;">div</span> <span class="hljs-attr">class</span>=<span class="hljs-string" style="color: rgb(136, 0, 0);">"container"</span>&gt;</span>
              <span class="hljs-tag">&lt;<span class="hljs-name" style="font-weight: 700;">h1</span>&gt;</span>Web QRCode<span class="hljs-tag">&lt;/<span class="hljs-name" style="font-weight: 700;">h1</span>&gt;</span>
              <span class="hljs-tag">&lt;<span class="hljs-name" style="font-weight: 700;">p</span>&gt;</span>リサイズ前画像 <span class="hljs-tag">&lt;<span class="hljs-name" style="font-weight: 700;">span</span> <span class="hljs-attr">id</span>=<span class="hljs-string" style="color: rgb(136, 0, 0);">"src-width-height"</span>&gt;</span>幅: 高さ: <span class="hljs-tag">&lt;/<span class="hljs-name" style="font-weight: 700;">span</span>&gt;</span><span class="hljs-tag">&lt;/<span class="hljs-name" style="font-weight: 700;">p</span>&gt;</span>
              <span class="hljs-tag">&lt;<span class="hljs-name" style="font-weight: 700;">p</span>&gt;</span>リサイズ後画像 <span class="hljs-tag">&lt;<span class="hljs-name" style="font-weight: 700;">span</span> <span class="hljs-attr">id</span>=<span class="hljs-string" style="color: rgb(136, 0, 0);">"dst-width-height"</span>&gt;</span>幅: 高さ: <span class="hljs-tag">&lt;/<span class="hljs-name" style="font-weight: 700;">span</span>&gt;</span><span class="hljs-tag">&lt;/<span class="hljs-name" style="font-weight: 700;">p</span>&gt;</span>
              <span class="hljs-tag">&lt;<span class="hljs-name" style="font-weight: 700;">p</span>&gt;</span><span class="hljs-tag">&lt;<span class="hljs-name" style="font-weight: 700;">form</span> <span class="hljs-attr">id</span>=<span class="hljs-string" style="color: rgb(136, 0, 0);">"form1"</span> <span class="hljs-attr">enctype</span>=<span class="hljs-string" style="color: rgb(136, 0, 0);">"multipart/form-data"</span>&gt;</span><span class="hljs-tag">&lt;<span class="hljs-name" style="font-weight: 700;">input</span> <span class="hljs-attr">type</span>=<span class="hljs-string" style="color: rgb(136, 0, 0);">"file"</span> <span class="hljs-attr">accept</span>=<span class="hljs-string" style="color: rgb(136, 0, 0);">"image/*"</span> <span class="hljs-attr">capture</span>=<span class="hljs-string" style="color: rgb(136, 0, 0);">"camera"</span> <span class="hljs-attr">name</span>=<span class="hljs-string" style="color: rgb(136, 0, 0);">"file"</span> <span class="hljs-attr">id</span>=<span class="hljs-string" style="color: rgb(136, 0, 0);">"file-image"</span>/&gt;</span><span class="hljs-tag">&lt;/<span class="hljs-name" style="font-weight: 700;">form</span>&gt;</span><span class="hljs-tag">&lt;/<span class="hljs-name" style="font-weight: 700;">p</span>&gt;</span>
              <span class="hljs-tag">&lt;<span class="hljs-name" style="font-weight: 700;">div</span>&gt;</span>
                <span class="hljs-tag">&lt;<span class="hljs-name" style="font-weight: 700;">canvas</span> <span class="hljs-attr">id</span>=<span class="hljs-string" style="color: rgb(136, 0, 0);">"mycanvas"</span>&gt;</span><span class="hljs-tag">&lt;/<span class="hljs-name" style="font-weight: 700;">canvas</span>&gt;</span>
              <span class="hljs-tag">&lt;/<span class="hljs-name" style="font-weight: 700;">div</span>&gt;</span>
            <span class="hljs-tag">&lt;/<span class="hljs-name" style="font-weight: 700;">div</span>&gt;</span>
            <span class="hljs-tag">&lt;/<span class="hljs-name" style="font-weight: 700;">body</span>&gt;</span>
            <span class="hljs-tag">&lt;/<span class="hljs-name" style="font-weight: 700;">html</span>&gt;</span></span></pre>
    
        </details> -->
    </div>

    <div><h3>(2) 処理候補選択</h3><a name="332"></a>
    </div>
  
    <div><h3>(3) 入力(フォーム登録済分)</h3><a name="333"></a>
    </div>
  
    <div><h3>(4) 登録内容詳細</h3><a name="334"></a>
    </div>
  
    <div><h3>(5) 入力(当日紙申請分)</h3><a name="335"></a>
    </div>
  
    <div><h3>(6) 申込フォームへの誘導(QRコード表示)</h3><a name="336"></a>
    </div>  
  
    <div><h3>(7) 申込/参加者数集計表</h3><a name="337"></a>
    </div>  
  
  </div>

</div>


<div><a name="4"></a><h1>Ⅳ.開発履歴</h1>
  <details><summary>2022/10/06 : 改善しようとして動作不良</summary>

    <pre class="hljs" style="display: block; overflow-x: auto; padding: 0.5em; background: rgb(240, 240, 240); color: rgb(68, 68, 68);"><span class="hljs-comment" style="color: rgb(136, 136, 136);">// テストデータ出典</span>
      <span class="hljs-comment" style="color: rgb(136, 136, 136);">// https://e.usen.com/onyankomember/</span>
      
      <span class="hljs-keyword" style="font-weight: 700;">const</span> adminMail = <span class="hljs-string" style="color: rgb(136, 0, 0);">'shimokitasho.oyaji@gmail.com'</span>;
      <span class="hljs-comment" style="color: rgb(136, 136, 136);">// フォームの編集画面のID</span>
      <span class="hljs-keyword" style="font-weight: 700;">const</span> formId = <span class="hljs-string" style="color: rgb(136, 0, 0);">"1vlVbz6DM7hSFsijDPv63GUaz9cozSOxO5_O--SBR9cg"</span>;
      <span class="hljs-comment" style="color: rgb(136, 136, 136);">// NG : フォームの入力画面、回答後の「回答を記録しました」画面, 「回答を編集」のリンク先</span>
      <span class="hljs-comment" style="color: rgb(136, 136, 136);">//const formId = "1FAIpQLSewOvfxT2b_jomhMOTG6rw7qX6a_KtFYAz3gkyWPgc9lx7jfA";</span>
      
      <span class="hljs-keyword" style="font-weight: 700;">const</span> onFormSubmit = (  <span class="hljs-comment" style="color: rgb(136, 136, 136);">// メールの自動返信</span>
        arg={<span class="hljs-attribute" style="font-weight: 700;">namedValues</span>:{<span class="hljs-string" style="color: rgb(136, 0, 0);">'メールアドレス'</span>:[<span class="hljs-string" style="color: rgb(136, 0, 0);">'nakaone.kunihiro@gmail.com'</span>]}} <span class="hljs-comment" style="color: rgb(136, 136, 136);">// テスト用既定値</span>
      ) =&gt; {
        <span class="hljs-built_in" style="color: rgb(57, 115, 0);">console</span>.log(<span class="hljs-string" style="color: rgb(136, 0, 0);">'onFormSubmit start.'</span>);
        <span class="hljs-title" style="color: rgb(136, 0, 0); font-weight: 700;">try</span> {
          <span class="hljs-comment" style="color: rgb(136, 136, 136);">// 1. エラーまたはテストなら管理者にメールを出して終了</span>
          <span class="hljs-keyword" style="font-weight: 700;">if</span>( !arg.authMode )
            <span class="hljs-keyword" style="font-weight: 700;">throw</span> <span class="hljs-keyword" style="font-weight: 700;">new</span> <span class="hljs-built_in" style="color: rgb(57, 115, 0);">Error</span>(<span class="hljs-string" style="color: rgb(136, 0, 0);">'引数のメンバにauthModeがありません'</span>);
      
          <span class="hljs-comment" style="color: rgb(136, 136, 136);">// 2. 受付番号の採番</span>
          <span class="hljs-keyword" style="font-weight: 700;">const</span> receptNum = arg.range.rowStart;
          <span class="hljs-built_in" style="color: rgb(57, 115, 0);">console</span>.log(<span class="hljs-string" style="color: rgb(136, 0, 0);">'receptNum = '</span>+receptNum);
      
          <span class="hljs-comment" style="color: rgb(136, 136, 136);">// 3. 修正用URLの取得</span>
          <span class="hljs-keyword" style="font-weight: 700;">const</span> editURL = getEditURL(
            <span class="hljs-built_in" style="color: rgb(57, 115, 0);">String</span>(<span class="hljs-keyword" style="font-weight: 700;">new</span> <span class="hljs-built_in" style="color: rgb(57, 115, 0);">Date</span>(arg.values[<span class="hljs-number" style="color: rgb(136, 0, 0);">0</span>]).getTime()) + arg.values[<span class="hljs-number" style="color: rgb(136, 0, 0);">1</span>]
          );
          <span class="hljs-built_in" style="color: rgb(57, 115, 0);">console</span>.log(<span class="hljs-string" style="color: rgb(136, 0, 0);">'editURL = '</span>+editURL);
      
          <span class="hljs-comment" style="color: rgb(136, 136, 136);">// 4. QRコードの生成</span>
          <span class="hljs-keyword" style="font-weight: 700;">const</span> QRobj = createQrCode(receptNum);
      
          <span class="hljs-comment" style="color: rgb(136, 136, 136);">// 5.本文の作成</span>
          <span class="hljs-keyword" style="font-weight: 700;">let</span> body =
            arg.namedValues[<span class="hljs-string" style="color: rgb(136, 0, 0);">'参加者①氏名'</span>][<span class="hljs-number" style="color: rgb(136, 0, 0);">0</span>].match(<span class="hljs-regexp" style="color: rgb(188, 96, 96);">/^(.+)[ |　]*/</span>)[<span class="hljs-number" style="color: rgb(136, 0, 0);">1</span>] + <span class="hljs-string" style="color: rgb(136, 0, 0);">'様\n\n'</span>
            + <span class="hljs-string" style="color: rgb(136, 0, 0);">'この度はホニャララ\n\n'</span>
            + <span class="hljs-string" style="color: rgb(136, 0, 0);">'あなたの受付番号は以下になります。\n'</span>
            + <span class="hljs-string" style="color: rgb(136, 0, 0);">'==============================\n'</span>
            + <span class="hljs-string" style="color: rgb(136, 0, 0);">'受付番号：'</span> + receptNum + <span class="hljs-string" style="color: rgb(136, 0, 0);">'\n'</span>
            + <span class="hljs-string" style="color: rgb(136, 0, 0);">'==============================\n'</span>
            + <span class="hljs-string" style="color: rgb(136, 0, 0);">'当日、受付で添付QRコードまたは受付番号を係員にお示しください。\n\n'</span>
            + <span class="hljs-string" style="color: rgb(136, 0, 0);">'参加者の追加・削除等の修正、またはキャンセルの場合、以下から登録内容を修正願います。\n'</span>
            + <span class="hljs-string" style="color: rgb(136, 0, 0);">'※キャンセルの場合、一番下の「キャンセル」にチェックしてください\n'</span>
            + editURL + <span class="hljs-string" style="color: rgb(136, 0, 0);">'\n\n'</span>
            + <span class="hljs-string" style="color: rgb(136, 0, 0);">'参加登録、ありがとうございました。\n'</span>
            ;
          <span class="hljs-built_in" style="color: rgb(57, 115, 0);">console</span>.log(<span class="hljs-string" style="color: rgb(136, 0, 0);">'body = '</span>+body);
      
          <span class="hljs-comment" style="color: rgb(136, 136, 136);">// 6.メールの送信</span>
          GmailApp.sendEmail(
            arg.namedValues[<span class="hljs-string" style="color: rgb(136, 0, 0);">'メールアドレス'</span>][<span class="hljs-number" style="color: rgb(136, 0, 0);">0</span>],  <span class="hljs-comment" style="color: rgb(136, 136, 136);">// to</span>
            <span class="hljs-string" style="color: rgb(136, 0, 0);">'【完了】QR受付テストへの登録'</span>,     <span class="hljs-comment" style="color: rgb(136, 136, 136);">// subject</span>
            body,
            {
              <span class="hljs-attribute" style="font-weight: 700;">name</span>: <span class="hljs-string" style="color: rgb(136, 0, 0);">'下北沢小学校おやじの会'</span>,
              <span class="hljs-attribute" style="font-weight: 700;">replyTo</span>: <span class="hljs-string" style="color: rgb(136, 0, 0);">'shimokitasho.oyaji@gmail.com'</span>,
              <span class="hljs-attribute" style="font-weight: 700;">attachments</span>: createQrCode(receptNum),
            }
          );
      
        } <span class="hljs-keyword" style="font-weight: 700;">catch</span>(e) {
      
          <span class="hljs-keyword" style="font-weight: 700;">let</span> body = e.message + <span class="hljs-string" style="color: rgb(136, 0, 0);">'\n\n'</span>
            + <span class="hljs-string" style="color: rgb(136, 0, 0);">'arg = '</span> + <span class="hljs-built_in" style="color: rgb(57, 115, 0);">JSON</span>.stringify(arg);
      
          <span class="hljs-comment" style="color: rgb(136, 136, 136);">// 管理者にエラーメールを送る</span>
          GmailApp.sendEmail(
            adminMail,  <span class="hljs-comment" style="color: rgb(136, 136, 136);">// to</span>
            <span class="hljs-string" style="color: rgb(136, 0, 0);">'[Error] QR受付テストへの登録'</span>,     <span class="hljs-comment" style="color: rgb(136, 136, 136);">// subject</span>
            body
          );
        }
      }
      
      <span class="hljs-keyword" style="font-weight: 700;">const</span> createQrCode = (code_data) =&gt; { <span class="hljs-comment" style="color: rgb(136, 136, 136);">// QRコード生成</span>
        <span class="hljs-keyword" style="font-weight: 700;">let</span> <span class="hljs-built_in" style="color: rgb(57, 115, 0);">url</span> = <span class="hljs-string" style="color: rgb(136, 0, 0);">'https://chart.googleapis.com/chart?chs=300x300&amp;cht=qr&amp;chl='</span> + code_data;
        <span class="hljs-keyword" style="font-weight: 700;">let</span> option = {
          <span class="hljs-attribute" style="font-weight: 700;">method</span>: <span class="hljs-string" style="color: rgb(136, 0, 0);">"get"</span>,
          <span class="hljs-attribute" style="font-weight: 700;">muteHttpExceptions</span>: <span class="hljs-literal" style="color: rgb(120, 169, 96);">true</span>
        };
        <span class="hljs-keyword" style="font-weight: 700;">let</span> ajax = UrlFetchApp.fetch(<span class="hljs-built_in" style="color: rgb(57, 115, 0);">url</span>, option);
        <span class="hljs-keyword" style="font-weight: 700;">return</span> ajax.getBlob();
      }
      
      <span class="hljs-keyword" style="font-weight: 700;">const</span> getEditURL = (key) =&gt; {
        <span class="hljs-built_in" style="color: rgb(57, 115, 0);">console</span>.log(<span class="hljs-string" style="color: rgb(136, 0, 0);">'getEditURL start. key='</span>+key);
      
        <span class="hljs-comment" style="color: rgb(136, 136, 136);">// フォームの全データを取得</span>
        <span class="hljs-keyword" style="font-weight: 700;">const</span> formData = FormApp.openById(formId).getResponses();
        <span class="hljs-built_in" style="color: rgb(57, 115, 0);">console</span>.log(<span class="hljs-string" style="color: rgb(136, 0, 0);">'formData = '</span>+<span class="hljs-built_in" style="color: rgb(57, 115, 0);">JSON</span>.stringify(formData));
      
        <span class="hljs-comment" style="color: rgb(136, 136, 136);">// 順次検索、当たったらリンク先を返して終了</span>
        <span class="hljs-keyword" style="font-weight: 700;">for</span>( <span class="hljs-keyword" style="font-weight: 700;">let</span> i=formData.length ; i&gt;=<span class="hljs-number" style="color: rgb(136, 0, 0);">0</span> ; i-- ){
          <span class="hljs-built_in" style="color: rgb(57, 115, 0);">console</span>.log(<span class="hljs-string" style="color: rgb(136, 0, 0);">'formData['</span>+i+<span class="hljs-string" style="color: rgb(136, 0, 0);">']='</span>+<span class="hljs-built_in" style="color: rgb(57, 115, 0);">JSON</span>.stringify(formData[i]));
          <span class="hljs-keyword" style="font-weight: 700;">const</span> val = <span class="hljs-built_in" style="color: rgb(57, 115, 0);">String</span>(<span class="hljs-keyword" style="font-weight: 700;">new</span> <span class="hljs-built_in" style="color: rgb(57, 115, 0);">Date</span>(formData[i].getTimestamp()).getTime())
          + formData[i].getRespondentEmail();
          <span class="hljs-built_in" style="color: rgb(57, 115, 0);">console</span>.log(<span class="hljs-string" style="color: rgb(136, 0, 0);">'val = '</span>+val+<span class="hljs-string" style="color: rgb(136, 0, 0);">', =key?:'</span>+(val===key));
          <span class="hljs-keyword" style="font-weight: 700;">if</span>( val === key ){
            <span class="hljs-built_in" style="color: rgb(57, 115, 0);">console</span>.log(<span class="hljs-string" style="color: rgb(136, 0, 0);">'getEditURL successed'</span>);
            <span class="hljs-keyword" style="font-weight: 700;">return</span> (formData[i].getEditResponseUrl());
          }
        }
        <span class="hljs-comment" style="color: rgb(136, 136, 136);">// マッチするものが無かった場合</span>
        <span class="hljs-built_in" style="color: rgb(57, 115, 0);">console</span>.log(<span class="hljs-string" style="color: rgb(136, 0, 0);">'getEditURL failed.'</span>);
        <span class="hljs-keyword" style="font-weight: 700;">return</span> <span class="hljs-keyword" style="font-weight: 700;">new</span> <span class="hljs-built_in" style="color: rgb(57, 115, 0);">Error</span>(<span class="hljs-string" style="color: rgb(136, 0, 0);">'マッチするものがありません\n'</span>
          + <span class="hljs-string" style="color: rgb(136, 0, 0);">'getEditURL.formData = '</span> + <span class="hljs-built_in" style="color: rgb(57, 115, 0);">JSON</span>.stringify(formData) + <span class="hljs-string" style="color: rgb(136, 0, 0);">'\n'</span>
          + <span class="hljs-string" style="color: rgb(136, 0, 0);">'getEditURL.key = "'</span> + key + <span class="hljs-string" style="color: rgb(136, 0, 0);">'"\n'</span>
          + <span class="hljs-string" style="color: rgb(136, 0, 0);">'getEditURL.val = "'</span> + val + <span class="hljs-string" style="color: rgb(136, 0, 0);">'"\n'</span>
        );
      }</pre>
  
  </details>
  
  <details><summary>2022/10/06 : onFormSubmit, createQrCode 作成</summary>
  <pre class="hljs" style="display: block; overflow-x: auto; padding: 0.5em; color: rgb(51, 51, 51); background: rgb(248, 248, 248);"><span class="hljs-keyword" style="color: rgb(51, 51, 51); font-weight: 700;">function</span> onFormSubmit(  // メールの自動返信
    /*
    ■参考
      メールの自動返信
      https://blog.hubspot.jp/google-forms-automatic-reply<span class="hljs-comment" style="color: rgb(153, 153, 136); font-style: italic;">#f</span>
      添付メールを含むGmailApp
      https://my-funs.com/gas-mailapp/
  
    ■引数
      namedValues: 
      { <span class="hljs-string" style="color: rgb(221, 17, 68);">'引取者氏名'</span>: [ <span class="hljs-string" style="color: rgb(221, 17, 68);">''</span> ],
        <span class="hljs-string" style="color: rgb(221, 17, 68);">'参加者③氏名読み'</span>: [ <span class="hljs-string" style="color: rgb(221, 17, 68);">''</span> ],
        <span class="hljs-string" style="color: rgb(221, 17, 68);">'タイムスタンプ'</span>: [ <span class="hljs-string" style="color: rgb(221, 17, 68);">'2022/10/06 10:03:37'</span> ],
        <span class="hljs-string" style="color: rgb(221, 17, 68);">'参加者②氏名読み'</span>: [ <span class="hljs-string" style="color: rgb(221, 17, 68);">''</span> ],
        <span class="hljs-string" style="color: rgb(221, 17, 68);">'備考'</span>: [ <span class="hljs-string" style="color: rgb(221, 17, 68);">''</span> ],
        <span class="hljs-string" style="color: rgb(221, 17, 68);">'メールアドレス'</span>: [ <span class="hljs-string" style="color: rgb(221, 17, 68);">'nakaone.kunihiro@gmail.com'</span> ],
        <span class="hljs-string" style="color: rgb(221, 17, 68);">'参加者③所属'</span>: [ <span class="hljs-string" style="color: rgb(221, 17, 68);">''</span> ],
        <span class="hljs-string" style="color: rgb(221, 17, 68);">'参加者③氏名'</span>: [ <span class="hljs-string" style="color: rgb(221, 17, 68);">''</span> ],
        <span class="hljs-string" style="color: rgb(221, 17, 68);">'参加者②氏名'</span>: [ <span class="hljs-string" style="color: rgb(221, 17, 68);">''</span> ],
        <span class="hljs-string" style="color: rgb(221, 17, 68);">'参加者①所属'</span>: [ <span class="hljs-string" style="color: rgb(221, 17, 68);">'5年'</span> ],
        <span class="hljs-string" style="color: rgb(221, 17, 68);">'緊急連絡先'</span>: [ <span class="hljs-string" style="color: rgb(221, 17, 68);">''</span> ],
        <span class="hljs-string" style="color: rgb(221, 17, 68);">'参加者②所属'</span>: [ <span class="hljs-string" style="color: rgb(221, 17, 68);">''</span> ],
        <span class="hljs-string" style="color: rgb(221, 17, 68);">'参加者①氏名読み'</span>: [ <span class="hljs-string" style="color: rgb(221, 17, 68);">'なかじま　みはる'</span> ],
        <span class="hljs-string" style="color: rgb(221, 17, 68);">'参加者①氏名'</span>: [ <span class="hljs-string" style="color: rgb(221, 17, 68);">'中島　美春'</span> ] },
  
  {<span class="hljs-string" style="color: rgb(221, 17, 68);">"authMode"</span>:<span class="hljs-string" style="color: rgb(221, 17, 68);">"FULL"</span>,<span class="hljs-string" style="color: rgb(221, 17, 68);">"namedValues"</span>:{<span class="hljs-string" style="color: rgb(221, 17, 68);">"参加者③所属"</span>:[<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>],<span class="hljs-string" style="color: rgb(221, 17, 68);">"参加者③氏名"</span>:[<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>],<span class="hljs-string" style="color: rgb(221, 17, 68);">"タイムスタンプ"</span>:[<span class="hljs-string" style="color: rgb(221, 17, 68);">"2022/10/06
  13:08:50"</span>],<span class="hljs-string" style="color: rgb(221, 17, 68);">"メールアドレス"</span>:[<span class="hljs-string" style="color: rgb(221, 17, 68);">"nakaone.kunihiro@gmail.com"</span>],<span class="hljs-string" style="color: rgb(221, 17, 68);">"参加者②氏名"</span>:[<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>],<span class="hljs-string" style="color: rgb(221, 17, 68);">"参加者②氏名読み"</span>:[<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>],<span class="hljs-string" style="color: rgb(221, 17, 68);">"引取者氏名"</span>:[<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>],<span class="hljs-string" style="color: rgb(221, 17, 68);">"参加者①氏名"</span>:[<span class="hljs-string" style="color: rgb(221, 17, 68);">"内海
  和子"</span>],<span class="hljs-string" style="color: rgb(221, 17, 68);">"参加者③氏名読み"</span>:[<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>],<span class="hljs-string" style="color: rgb(221, 17, 68);">"緊急連絡先"</span>:[<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>],<span class="hljs-string" style="color: rgb(221, 17, 68);">"備考"</span>:[<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>],<span class="hljs-string" style="color: rgb(221, 17, 68);">"参加者①氏名読み"</span>:[<span class="hljs-string" style="color: rgb(221, 17, 68);">"うつみ
  かずこ"</span>],<span class="hljs-string" style="color: rgb(221, 17, 68);">"参加者①所属"</span>:[<span class="hljs-string" style="color: rgb(221, 17, 68);">"4年"</span>],<span class="hljs-string" style="color: rgb(221, 17, 68);">"参加者②所属"</span>:[<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>]},<span class="hljs-string" style="color: rgb(221, 17, 68);">"range"</span>:{<span class="hljs-string" style="color: rgb(221, 17, 68);">"columnEnd"</span>:14,<span class="hljs-string" style="color: rgb(221, 17, 68);">"columnStart"</span>:1,<span class="hljs-string" style="color: rgb(221, 17, 68);">"rowEnd"</span>:14,<span class="hljs-string" style="color: rgb(221, 17, 68);">"rowStart"</span>:14},<span class="hljs-string" style="color: rgb(221, 17, 68);">"source"</span>:{},<span class="hljs-string" style="color: rgb(221, 17, 68);">"triggerUid"</span>:<span class="hljs-string" style="color: rgb(221, 17, 68);">"12944381"</span>,<span class="hljs-string" style="color: rgb(221, 17, 68);">"values"</span>:[<span class="hljs-string" style="color: rgb(221, 17, 68);">"2022/10/06
  13:08:50"</span>,<span class="hljs-string" style="color: rgb(221, 17, 68);">"nakaone.kunihiro@gmail.com"</span>,<span class="hljs-string" style="color: rgb(221, 17, 68);">"内海　和子"</span>,<span class="hljs-string" style="color: rgb(221, 17, 68);">"うつみ
  かずこ"</span>,<span class="hljs-string" style="color: rgb(221, 17, 68);">"4年"</span>,<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>,<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>,<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>,<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>,<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>,<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>,<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>,<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>,<span class="hljs-string" style="color: rgb(221, 17, 68);">""</span>]}
  
    行番号は e.range.rowStart, rowEnd
    タイムスタンプは values[0]
    e-mailは values[1] で取得可。
    namedValuesでも取得できるが、valuesがFormApp.getResponses()と同じ一次元配列なのでベター？
  
  
  
    ■Exception: The script does not have permission
      本コンソールで「実行」し、権限を付与しておく
      https://stackoverflow.com/questions/28200857/you-do-not-have-permission-to-perform-that-action
  
      これは以下のそれぞれについて必要
      ・メールの送信(GmailApp.sendEmail)
      ・Google Spreadへのアクセス(getLastRow)
      ・createQrCode
  
      上記以前に実行した対処(これだけではNG)
      appsscript.jsonの修正
      https://qiita.com/kajirikajiri/items/84b9a9fee61cbc3bf124
      appsscript.jsonの表示
      https://blog-and-destroy.com/42443
  
    ■管理者への回答通知を回避する設定
    　フォーム &gt; 回答タグ &gt; スプレッドシートアイコン右のメニュー &gt; 
      「新しい回答についてのメール通知を受け取る」のチェックを外す
  
    */
    e={namedValues:{<span class="hljs-string" style="color: rgb(221, 17, 68);">'メールアドレス'</span>:[<span class="hljs-string" style="color: rgb(221, 17, 68);">'nakaone.kunihiro@gmail.com'</span>]}} // テスト用既定値
  ) {
    console.log(e.namedValues);
  
    // 最終行の取得(=受付番号)
    const lastRow = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(<span class="hljs-string" style="color: rgb(221, 17, 68);">'回答'</span>).getLastRow();
  
    <span class="hljs-built_in" style="color: rgb(0, 134, 179);">let</span> body = JSON.stringify(e) + <span class="hljs-string" style="color: rgb(221, 17, 68);">'\n\n'</span>
    //<span class="hljs-built_in" style="color: rgb(0, 134, 179);">let</span> body = JSON.stringify(e.namedValues) + <span class="hljs-string" style="color: rgb(221, 17, 68);">'\n\n'</span>
      + <span class="hljs-string" style="color: rgb(221, 17, 68);">'lastRow = '</span> + lastRow + <span class="hljs-string" style="color: rgb(221, 17, 68);">'\n'</span>;
  
  
    GmailApp.sendEmail(
      e.namedValues[<span class="hljs-string" style="color: rgb(221, 17, 68);">'メールアドレス'</span>][0],  // to
      <span class="hljs-string" style="color: rgb(221, 17, 68);">'【完了】QR受付テストへの登録'</span>,     // subject
      body,
      {
        name: <span class="hljs-string" style="color: rgb(221, 17, 68);">'下北沢小学校おやじの会'</span>,
        replyTo: <span class="hljs-string" style="color: rgb(221, 17, 68);">'shimokitasho.oyaji@gmail.com'</span>,
        attachments: createQrCode(lastRow),
      }
    );
  }
  
  const createQrCode = (code_data) =&gt; { // QRコード生成
    /*
    ■参考
      Google Apps ScriptでQRコードを生成してみる
      https://note.com/himajin_no_asobi/n/n51de21bf73e5
    */
    <span class="hljs-built_in" style="color: rgb(0, 134, 179);">let</span> url = <span class="hljs-string" style="color: rgb(221, 17, 68);">'https://chart.googleapis.com/chart?chs=200x200&amp;cht=qr&amp;chl='</span> + code_data;
    <span class="hljs-built_in" style="color: rgb(0, 134, 179);">let</span> option = {
        method: <span class="hljs-string" style="color: rgb(221, 17, 68);">"get"</span>,
        muteHttpExceptions: <span class="hljs-literal" style="color: teal;">true</span>
      };
    <span class="hljs-built_in" style="color: rgb(0, 134, 179);">let</span> ajax = UrlFetchApp.fetch(url, option);
    console.log(ajax.getBlob())
    <span class="hljs-built_in" style="color: rgb(0, 134, 179);">return</span> ajax.getBlob();
  }
  
  const getEditTest = () =&gt; {
    /* 回答シートの全データを取得
      回答シートとフォームで添字が一致しないかと考えたが、結果的には一致していない。
      よって「タイムスタンプのgetTime()＋e-mail」を検索キーとする。
      なおsheetDataのタイムスタンプは<span class="hljs-string" style="color: rgb(221, 17, 68);">"2022-10-06T03:17:22.506Z"</span>形式
    */
    const sheetData = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(<span class="hljs-string" style="color: rgb(221, 17, 68);">"回答"</span>).getDataRange().getValues();
    const sheetMap = {};
    <span class="hljs-keyword" style="color: rgb(51, 51, 51); font-weight: 700;">for</span>( <span class="hljs-built_in" style="color: rgb(0, 134, 179);">let</span> i=0 ; i&lt;sheetData.length ; i++ ){
      sheetMap[String(new Date(sheetData[i][0]).getTime()) + sheetData[i][1]] = i;
    }
    console.log(<span class="hljs-string" style="color: rgb(221, 17, 68);">"sheetMap = "</span>+JSON.stringify(sheetMap));
  
    // フォームの全データを取得
    // フォームの編集画面
    const FormId = <span class="hljs-string" style="color: rgb(221, 17, 68);">"1vlVbz6DM7hSFsijDPv63GUaz9cozSOxO5_O--SBR9cg"</span>;
    // フォームの入力画面、回答後の「回答を記録しました」画面, 「回答を編集」のリンク先
    //const FormId = <span class="hljs-string" style="color: rgb(221, 17, 68);">"1FAIpQLSewOvfxT2b_jomhMOTG6rw7qX6a_KtFYAz3gkyWPgc9lx7jfA"</span>;
    const formData = FormApp.openById(FormId).getResponses();
  
    <span class="hljs-keyword" style="color: rgb(51, 51, 51); font-weight: 700;">for</span>( <span class="hljs-built_in" style="color: rgb(0, 134, 179);">let</span> i=0 ; i&lt;formData.length ; i++ ){
      //console.log(<span class="hljs-string" style="color: rgb(221, 17, 68);">"sheetData["</span>+i+<span class="hljs-string" style="color: rgb(221, 17, 68);">"] : "</span> + JSON.stringify(sheetData[i]));
      // メソッドの詳細は以下参照
      // https://developers.google.com/apps-script/reference/forms/form-response
      console.log(<span class="hljs-string" style="color: rgb(221, 17, 68);">"formData["</span>+i+<span class="hljs-string" style="color: rgb(221, 17, 68);">"] : "</span>
        //+ <span class="hljs-string" style="color: rgb(221, 17, 68);">"toString = "</span> + formData[i].toString() + <span class="hljs-string" style="color: rgb(221, 17, 68);">"\n"</span>
        //+ <span class="hljs-string" style="color: rgb(221, 17, 68);">"submit = "</span> + formData[i].submit() + <span class="hljs-string" style="color: rgb(221, 17, 68);">"\n"</span>
        //+ <span class="hljs-string" style="color: rgb(221, 17, 68);">"getId = "</span> + formData[i].getId() + <span class="hljs-string" style="color: rgb(221, 17, 68);">"\n"</span>  // getEditResponseForItemの後半部分と一致
        + <span class="hljs-string" style="color: rgb(221, 17, 68);">"getRespondentEmail = "</span> + formData[i].getRespondentEmail() + <span class="hljs-string" style="color: rgb(221, 17, 68);">"\n"</span>
        //+ <span class="hljs-string" style="color: rgb(221, 17, 68);">"getItemResponses = "</span> + formData[i].getItemResponses() + <span class="hljs-string" style="color: rgb(221, 17, 68);">"\n"</span>  // １つ１つの質問項目の回答を管理
        //+ <span class="hljs-string" style="color: rgb(221, 17, 68);">"getGradableItemResponses = "</span> + formData[i].getGradableItemResponses() + <span class="hljs-string" style="color: rgb(221, 17, 68);">"\n"</span>
        //+ <span class="hljs-string" style="color: rgb(221, 17, 68);">"withItemGrade = "</span> + formData[i].withItemGrade() + <span class="hljs-string" style="color: rgb(221, 17, 68);">"\n"</span>
        //+ <span class="hljs-string" style="color: rgb(221, 17, 68);">"withItemResponse = "</span> + formData[i].withItemResponse() + <span class="hljs-string" style="color: rgb(221, 17, 68);">"\n"</span>
        //+ <span class="hljs-string" style="color: rgb(221, 17, 68);">"getGradableResponseForItem = "</span> + formData[i].getGradableResponseForItem() + <span class="hljs-string" style="color: rgb(221, 17, 68);">"\n"</span>
        //+ <span class="hljs-string" style="color: rgb(221, 17, 68);">"getResponseForItem = "</span> + formData[i].getResponseForItem() + <span class="hljs-string" style="color: rgb(221, 17, 68);">"\n"</span>
        //+ <span class="hljs-string" style="color: rgb(221, 17, 68);">"toPrefilledUrl = "</span> + formData[i].toPrefilledUrl() + <span class="hljs-string" style="color: rgb(221, 17, 68);">"\n"</span>
        + <span class="hljs-string" style="color: rgb(221, 17, 68);">"getEditResponseUrl="</span> + formData[i].getEditResponseUrl() + <span class="hljs-string" style="color: rgb(221, 17, 68);">"\n"</span>
        //+ <span class="hljs-string" style="color: rgb(221, 17, 68);">"getTimestamp = "</span> + formData[i].getTimestamp() + <span class="hljs-string" style="color: rgb(221, 17, 68);">"\n"</span>
        + <span class="hljs-string" style="color: rgb(221, 17, 68);">"toLocaleString = "</span> + formData[i].getTimestamp().toLocaleString(<span class="hljs-string" style="color: rgb(221, 17, 68);">'ja-JP'</span>)
        + <span class="hljs-string" style="color: rgb(221, 17, 68);">"."</span> + formData[i].getTimestamp().getMilliseconds() + <span class="hljs-string" style="color: rgb(221, 17, 68);">"\n"</span>
        + <span class="hljs-string" style="color: rgb(221, 17, 68);">"sheetData = "</span> + JSON.stringify(sheetData[sheetMap[
          String(new Date(formData[i].getTimestamp()).getTime())
          + formData[i].getRespondentEmail()
        ]])
      );
    };
  }</pre>
  </details>  
</div>

</body>
<!-- 以下は PlantUML を使用する際のサンプル -->
<script type="text/javascript">
document.getElementById('view').src = "http://www.plantuml.com/plantuml/svg/"+plantumlEncoder.encode(`
  @startuml
  |参加者|

  start
    |検温担当|
    :検温を実施;
    if (発熱あり？) then (≧37.5℃)
      |参加者|
      :帰宅;
    else (＜37.5℃)
      |検温担当|
      if (参加登録済？) then (当日参加)
        |検温担当|
        :当日参加受付票\n記入コーナーを案内;
        |参加者|
        :当日参加受付票に記入;
        |受付|
        :当日参加受付票の\n記入内容を確認;
        if(親も参加？) then (子供が受付)
          :お迎えが決まって\nいることを確認;
          :参加証は\n【赤】;
        else (大人が受付);
          :参加証は\n【黄色】;
        endif
      else (登録済)
        |受付|
        :「参加者リスト」に\n必要事項を記入;
        if(申込者名欄の背景色) then (灰色)
          :親は不参加なので\n参加証は【赤】;
        else (白);
          :親も参加するので\n参加証は【黄色】;
        endif
      endif
      :参加料を収受;
      :参加証を左肩袖に貼付し\n「参加のしおり」を渡す;
    endif

  stop
  @enduml
`);
</script>
</html>