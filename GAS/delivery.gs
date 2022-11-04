/* ================================================================
「配達員」の使用方法
  1. authorization を実行してメール送信権限を付与(宛先は適宜修正)
  2. 本シートのpassPhraseを郵便局の「配達員」シート"passPhrase"に登録
  3. ウェブアプリとしてデプロイ。郵便局の「配達員」シート"endpointにIDを登録
================================================================== */

const passPhrase = "psp2*ZRTS/GXr9C4"; // 郵便局との共通鍵

const authorization = () => {  /* 「配達員」の初期化
  なお宛先が発信元アカウントと同一の場合、受信フォルダではなく
  「送信フォルダ」に格納されるので注意。
  */
  GmailApp.sendEmail(
    'nakaone.kunihiro@gmail.com',  // 宛先は適宜修正
    '配達員02初期化',  // 複数の配達員を使用する場合、番号を適宜修正
    'これは配達員の初期化処理(authorization)で送信されたメールです。');
}

// ===========================================================
// トリガー関数
// ===========================================================

function doPost(e){
  console.log('配達員.doPost start. e.parameter='+JSON.stringify(e.parameter));

  let rv = null;
  if( e.parameter.passPhrase === passPhrase ){
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
    console.log(JSON.stringify(mail));

    rv = GmailApp.sendEmail(mail.recipient, mail.subject, mail.body, mail.options);

  } else {
    // 共通鍵が一致しなければ配送拒否
    rv = new Error('共通鍵が一致しません');
  }

  console.log('配達員.doPost end. rv='+rv);
  return ContentService
  .createTextOutput(JSON.stringify(rv,null,2))
  .setMimeType(ContentService.MimeType.JSON);
}