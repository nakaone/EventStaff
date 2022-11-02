/* ===========================================================
「配達員」の使用方法
  1. passPhrase を郵便局と一致するよう設定
  2. authorization を実行してメール送信権限を付与(宛先は適宜修正)
  3. ウェブアプリとしてデプロイ。郵便局にIDを登録
=========================================================== */

const passPhrase = "Oct.22,2022"; // テスト用共通鍵

const authorization = () => {
  GmailApp.sendEmail('nakaone.kunihiro@gmail.com','配達員初期化','これは配達員の初期化処理(authorization)で送信されたメールです。');
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