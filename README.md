# JSDoc

[認証局](./doc/auth/global.html) |
[放送局](./doc/broad/global.html) |
[管理局](./doc/master/global.html) |
[郵便局](./doc/post/global.html) |
[配達員](./doc/delivery/global.html) |
[szLib](./doc/szLib/global.html) |
EventStaff.js |
[library.js](./doc/library/global.html)

# 開発の目的

## 現状

- 受付の効率化のため、参加申請を紙ベースからGoogle Formに変更
- 参加者へのイベント進行案内は、紙ベースの「予定表」として配布
- スタッフ間の連携は、基本的に対面ベース

## 課題

1. フォームになって申込期限ギリギリの申請が増加、当日参加が爆発的に発生
   - 需要予測が困難(ex.綿あめの担当者は足りる？　カレーは何食分用意する？)<br>※ 紙ベースならリアルタイムに把握できないのだから、そもそも気にしない？
   - 当日参加は受付担当のみ概数を把握(詳細は無理)、スタッフ全員に伝えるのも困難
   - 当日参加用申込用紙が途中でなくなり、フリーフォーマットで対応
     - 書き方の案内が必要、受付が忙しくなるにつれどんどん適当に(必要事項の記載漏れ)

2. 各コーナーの状況がスタッフ・参加者共わからない
   - 「カレーは何時から配膳？(今から参加して食べられる？)」「缶バッチはまだやってる？」「うちの子の肝試しは何時頃終わる？(何時にお迎えに来れば良い？)」
   - 参加者はもちろん、スタッフも担当外のコーナーの状況はわからない

3. 希望の多いコーナーは混雑・混乱、参加者の不満に
   - 長蛇の列に並んでいる時間が長く、他のコーナーを見に行けない
   - 同じ子が何度も参加、横入りされたり小さい子が諦める事例も

## 解決案

1. 当日参加も含め、参加申請はフォームでイベント終了まで受付
   - 受付でのチェックはクラウド上の名簿を参照<br>※万一に備え紙ベースの名簿はバックアップとして用意
   - 紙での申請はスマホが無い当日参加希望者のみ、受付担当は【必要最低限の属性情報のみ】入力

2. スタッフ・参加者は自分のスマホで(ほぼ)リアルタイムに状況を把握可能に
   - スタッフ用に双方向の業務連絡を実現(簡易チャット。ex.「お手隙のスタッフは綿あめ周辺の誘導に来て」)
   - 自担当イベントの進行状況は随時発信。参加者も参照可能に。
   - マスタと連携して参加者をセグメント化、各種お知らせを配信(※スタッフ→参加者の一方向)<br>例：「受付番号100番までの1年生のご家族はカレーをお受け取りください」
   - 配信用端末(スマホ)が無い人のためには、本部前へのディスプレイ設置等で別途対応

3. コーナー毎に順番の予約を可能に
   - 参加者個々人にQRコード(参加者番号)が印刷されたカードを配布
   - コーナーの前に端末を用意、QRコードを読ませて予約(状態：予約中)、順番が来たらもう一度読ませる(状態：参加中)<br>
     ※できれば終了時点でもう一度読ませたい(状態：無予約)が、面倒そう...
   - 端末では「参加した回数」と「予約時刻」をキーに参加者番号を表示、コーナー担当は表示順にその場にいる子を呼ぶ<br>※その場にいない子はスキップするが、順番はトップが維持される

## 解決案実行のメリット、デメリットと対策

- メリット
  - カレー配膳や肝試し等、セグメント別の誘導が円滑になる
  - 「アンケートのお願い」等、従来メアドがわからなかった当日参加の方にも当日・事後に連絡がつけられるようになる

- デメリット
  - 期限ギリギリの申請・当日参加がより増える
    - 対策案：申請期限の設定は継続、期限前＞期限〜前日＞当日の順に優先(ex.テント設営場所、配膳の順番、ゲームコーナー)
  - 慣れない手順なのでスタッフ側が事前に習熟しておく必要がある(学習コストが発生)
    - 対策案：学習コストは極限まで切り詰め、1時間程度に収める(UIを工夫、「次に何をすれば良いか」を常に表示)
    - 対策案：常連のスタッフは事前に、スポット参加のスタッフは当日朝に時間をとる

# 処理の流れ

1. 参加登録(参加者・スタッフ共通)
2. ログイン、お知らせ表示(参加者・スタッフ共通)
3. 受付
   - 参加登録済の方、当日参加でもスマホで参加登録可能な方
   - 当日参加でスマホでの参加登録ができない方
4. お知らせへの投稿(スタッフのみ)
5. コーナー予約

## 1. 参加登録(参加者・スタッフ共通)

```mermaid
sequenceDiagram
  autonumber
  actor camera as カメラ
  actor browser as ブラウザ
  actor mail as メーラ
  participant form as 参加申請フォーム
  participant system as システム

  camera ->> form   : QRコードから参加申請フォームへ
  form ->> browser  : 参加申請フォームをブラウザに表示
  browser ->> form  : 必要事項を入力、送信
  form ->> system   : 登録
  system ->> mail   : 登録終了通知メール
  mail ->> browser  : 専用サイトボタンクリック
  browser ->> browser : 専用サイト表示、ブクマ
  system ->> system : システム管理者がスタッフ権限付与
```

- 人のアイコンは参加者・スタッフのスマホ(or タブレット or PC)上のカメラ・ブラウザ・メーラ
- 最後の⑧はスタッフのみ、参加者は不要。

<details><summary>登録終了通知メール(サンプル)</summary>

※「::〜::」の部分は実データで置換されます。

<style>
*,
*:before,
*:after {
  -webkit-box-sizing: inherit;
  box-sizing: inherit;
}

html {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  font-size: 62.5%;/*rem算出をしやすくするために*/
}

div.body {
  width: 80%;
  background-color: white;
}

.btn,
a.btn,
button.btn {
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1.5;
  position: relative;
  display: inline-block;
  padding: 1rem 4rem;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-transition: all 0.3s;
  transition: all 0.3s;
  text-align: center;
  vertical-align: middle;
  text-decoration: none;
  letter-spacing: 0.1em;
  color: #212529;
  border-radius: 0.5rem;
}

a.btn--blue.btn--border-double {
  border: 8px double #0090bb;
}

.frame {
  position: relative;
  margin: 2rem;
  padding: 0.5rem 1rem;
  border: solid 4px #95ccff;
  border-radius: 8px;
}
.label {
  position: absolute;
  display: inline-block;
  top: calc(-0.5rem - 2px);
  left: 2rem;
  padding: 0 0.5rem;
  line-height: 1;
  background: #fff;
  color: #95ccff;
  font-weight: bold;
}
.number {
  text-align:center;
  font-size: 3rem;
  font-weight: bold;
}
.caution {
  font-size: 1.5rem;
  color: red;
}
</style>
<div class="body">
<p>::name:: 様</p>

<p>下北沢小学校おやじの会です。この度は参加登録、ありがとうございました。</p>

<div class="frame">
  <span class="label">受付番号</span>
  <p class="number">::entryNo::</p>
</div>

<p>引き続き以下のボタンをクリックし、表示されたサイトをブックマークしておいていただけますようおねがい致します。</p>

<div>
  <a href="https://nakaone.github.io/EventStaff/" target="_blank" class="btn btn--blue btn--border-double">専用サイト</a>
</div>

<p>このページは参加者の皆様に以下の機能・情報を提供します。</p>

<ol>
<li>参加メンバの追加・取消、申込のキャンセル</li>
<li>当日受付での受付番号(QRコード)の表示</li>
<li>運営からのリアルタイムお知らせ表示</li>
<li>イベント各コーナーの予約待ち状況表示</li>
<li>進行予定表、マップ表示</li>
</ol>

<p>※ 個人情報保護のため、これらの情報を表示するためにはログインが必要です。ご利用の際は画面の指示に従って受付番号を入力してください。</p>

<p class="caution">!! ログインできない場合 !!</summary>

<p>chrome,safari,firefox等のブラウザではなく、Gmail等のメーラーから専用サイトが開かれると、以下のようにうまくログインできない場合があります。</p>

<ol>
<li>上のボタンで専用サイトに遷移し、受付番号を入力</li>
<li>「パスコードを記載したメールを送りました」のメッセージが出る</li>
<li>メールを確認するため「戻る」と、専用サイトが見えなくなってしまう</li>
</ol>

<p>この場合は以下のいずれかの対応を行い、専用サイトはブラウザで開いていただけますようお願いします。</p>

<ol>
<li>本メールの「専用サイト」ボタンを長押しして「ブラウザで開く」を選択</li>
<li>メーラーで専用サイトを開き、メニュー(「⁝」等)から改めてブラウザで開き直す</li>
<li>予め別途ブラウザを開いておき「https://nakaone.github.io/EventStaff/」と入力</li>
</ol>

<p>ご不明な点がありましたら<a href="mailto:shimokitasho.oyaji@gmail.com">shimokitasho.oyaji@gmail.com</a>宛お問合せください。</p>

<p>当日のお越しをお待ちしております。</p>
</div>
_
</details>

## 2. ログイン、お知らせ表示

```mermaid
sequenceDiagram
  autonumber
  actor camera as カメラ
  actor browser as ブラウザ
  actor mail as メーラ
  participant form as 参加申請フォーム
  participant system as システム

  alt ブクマ有り
    browser ->> browser : 専用サイトを呼び出し
  else ブクマ無し
    mail ->> browser  : 登録終了メールの<br>専用サイトボタンクリック
  end
  browser ->> system  : 受付番号を入力、送信
  system ->> mail     : パスコード通知メール
  mail ->> browser    : パスコードをコピー
  browser ->> system  : パスコードを送信
  system ->> system   : 本人確認
  system ->> browser  : お知らせ(ホーム)画面表示
  Note right of browser : 以降定期的に繰り返し
  browser ->> system  : 新しいお知らせがないかチェック
  system ->> browser  : 新しいお知らせを配信、画面更新
```

## 3.(1) 参加登録済の方の受付

以下は参加者・スタッフともログイン済の前提。

```mermaid
sequenceDiagram
  autonumber
  actor guest as 参加者
  actor staff as 受付担当
  participant system as システム

  guest ->> staff    : QR/受付番号/名前
  staff ->> system   : 受付番号
  system ->> staff   : 該当者情報
  staff ->> guest    : 該当か確認
  guest ->> staff    : 参加者名、参加費
  staff ->> system   : 登録
```

## 3.(2) 当日参加(スマホなし)の受付

```mermaid

sequenceDiagram
  autonumber
  actor guest as 参加者
  actor staff as 受付担当
  participant html as 受付担当画面
  participant master as システム

  guest ->> guest    : QR付用紙に記入
  guest->>staff    : 記入済申込用紙
  staff->>html     : 紙申請処理起動
  html->>+master   : 仮登録申請
  master->>-html   : 受付番号
  html->>staff     : 申込用紙に受付番号を追記
  staff->>+master  : 本登録申請(受付番号記入済用紙の写真＋参加者属性)
  master->>-staff  : 本登録終了通知
  staff->>guest    : 記入済申込用紙
  guest ->> staff  : 参加費支払い

  guest->>staff    : 記入済申込用紙<br>(帰宅時)
```

## 4. お知らせへの投稿(スタッフのみ)

```mermaid
sequenceDiagram
  autonumber
  actor guest as 参加者
  actor staff as スタッフ
  participant html as スタッフ用画面
  participant system as システム

  staff ->> html    : 文言、対象
  html ->> system   : 登録

  guest->>system   : 定期的に参照
  system ->> guest : 対象情報
```

GCPの無料枠に収めるため、送受信の情報量・頻度は極力絞る(Max.1GB/日)

配信対象のグルーピングは以下を想定
- 参加者の属性(ex.未就学児/1〜6年生/卒業生/保護者)
- 受付番号の範囲(ex. No.10以上20以下)
- スタッフの担当(ex. 受付、射的、お化け屋敷、スタッフ全員)

## 5. コーナー予約

※未実装

綿飴の予約や射的の回数制限、ヨーヨーの販売などを行うなら参加者の個々人の識別が必要になる。
また「綿あめがもうすぐできるよ」等のフィードバックを行う場合、通知先は親のスマホとなるため、受付番号との紐付けが必要になる。

以下は仮に行うとした場合の実現手段の想定。
- 中身は1からの連番であるQRコードを印刷した「参加者証」を用意
- 受付時、カードを参加者に配布、受付番号と一括してスキャンして紐付け
- 個別の通知はカード番号→受付番号を特定して一斉配信で

```mermaid
sequenceDiagram
  autonumber
  actor other as 待機者
  actor guest as 参加者
  actor staff as スタッフ
  participant system as システム

  guest ->> staff : 予約登録(参加証QRコード)
  staff ->> system : 予約情報(参加者番号)
  system ->> staff : 待機者一覧
  staff ->>+ guest : 次の人を呼び出し
  Note right of guest : イベント参加
  guest ->> staff : 参加登録(参加証QRコード)
  staff ->> system : 参加情報(参加者番号)
  system ->> staff : 更新済待機者一覧
  guest ->>- staff : 終了登録(参加証QRコード)
  staff ->> system : 終了情報(参加者番号)
  system ->> staff : 更新済待機者一覧
  other ->> system : コーナー別予約状況参照(随時)
  system ->> other : コーナー別予約状況(回数別予約者数)
```