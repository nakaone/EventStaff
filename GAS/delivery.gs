/* ================================================================
「配達員」の使用方法
  1. authorization を実行してメール送信権限を付与(宛先は適宜修正)
  2. 本シートのpassPhraseを郵便局の「配達員」シート"passPhrase"に登録
  3. ウェブアプリとしてデプロイ。郵便局の「配達員」シート"endpointにIDを登録
================================================================== */

const passPhrase = "psp2*ZRTS/GXr9C4"; // 秘密鍵(郵便局との共通鍵として使用)

const authorization = () => {  /* 「配達員」の初期化
  なお宛先が発信元アカウントと同一の場合、受信フォルダではなく
  「送信フォルダ」に格納されるので注意。
  */
  console.log('配達員.authorization start.');
  const param = {parameter:{
    passPhrase: passPhrase,
    //passPhrase: 'huga', // エラーテスト用
    recipient: 'nakaone.kunihiro@gmail.com',  // 宛先は適宜修正
    //recipient: '',  // エラーテスト用
    //recipient: 'ljksdfhsfsldhiusfiu@gajk.lkjdsl.kdierjhcom', // エラーテスト用
    //  ⇒ 宛先エラーは正常終了してしまうが、後ほど発信元アカウントにエラーメールが届く。
    subject: '配達員01初期化',  // 複数の配達員を使用する場合、番号を適宜修正
    body: 'これは配達員の初期化処理(authorization)で送信されたメールです。',
    options: {},
  }};

  /* doPostの返値はTextOutputのインスタンス。
  getContentで中の文字列を取得、中の文字列をparseすれば結果オブジェクトが得られる。
  GAS公式: [Class TextOutput]
  (https://developers.google.com/apps-script/reference/content/text-output#getcontent) */
  const rv = doPost(param);
  const rObj = JSON.parse(rv.getContent());
  console.log('rObj='+rObj+', type='+szLib.whichType(rObj));
  console.log('配達員.authrization end. rv='+JSON.stringify(rObj));
}

// ===========================================================
// トリガー関数
// ===========================================================
/** doPost: 郵便局から渡されるパラメータに応じてメールを発送
 * @param {object} e - メールの中身。
 *      GmailApp.sendEmailの引数に'passPhrase'を追加したもの。
 * GAS公式 Class GmailApp
 * https://developers.google.com/apps-script/reference/gmail/gmail-app#sendEmail(String,String,String,Object)
 * @return {object} - メール配送結果。以下のメンバを持つオブジェクト
 *    isErr {boolean} : エラーならtrue
 *    message {string} : エラーの場合はメッセージ。正常終了ならundefined
 */
function doPost(e){
  console.log('配達員.doPost start. e.parameter='+JSON.stringify(e.parameter));
  let rv = null;
  try {

    // 共通鍵が一致しなければ配送拒否
    if( e.parameter.passPhrase !== passPhrase ){
      throw new Error('共通鍵が一致しません');
    }

    // 共通鍵が一致したらメール配送
    const mail = {
      recipient: e.parameter.recipient,
      subject: e.parameter.subject,
      body: e.parameter.body,
      options: {
        attachments: e.parameter.attachments || undefined,
        bcc: e.parameter.bcc || undefined,
        cc: e.parameter.cc || undefined,
        from: e.parameter.from || undefined,
        inlineImages: e.parameter.inlineImages || undefined,
        name: e.parameter.name || undefined,
        noReply: e.parameter.noReply || undefined,
        replyTo: e.parameter.replyTo || undefined,
        htmlBody: e.parameter.htmlBody || undefined,
      }
    };
    //console.log(JSON.stringify(mail));
    GmailApp.sendEmail(mail.recipient, mail.subject, mail.body, mail.options);
    rv = {isErr:false};  // 正常終了
  } catch(e) {
    // Errorオブジェクトをrvとするとmessageが欠落するので再作成
    rv = {isErr:true, message:e.name+': '+e.message};
  } finally {
    console.log('配達員.doPost end. rv='+JSON.stringify(rv));
    return ContentService
    .createTextOutput(JSON.stringify(rv,null,2))
    .setMimeType(ContentService.MimeType.JSON);
  }
}