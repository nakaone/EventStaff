function doPost(e){
  console.log('doPost start. e.parameter='+JSON.stringify(e.parameter));
  // => doPost start. e.parameter={"mail":"{subject=郵便局テスト, body=<!...(後略)
  //    JSONではない!!

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

  const response = GmailApp.sendEmail(mail.recipient, mail.subject, mail.body, mail.options);
  const rv = JSON.stringify(response,null,2);
  console.log('doPost end. rv='+rv);

  return ContentService
  .createTextOutput(rv)
  .setMimeType(ContentService.MimeType.JSON);
}

  /* OK (copy only) ===============================
  console.log(e);
  var name = e.parameter.name;
  var hobby = e.parameter.hobby;
  const data = {
    "name": e.parameter.name + ":::",
    "hobby": e.parameter.hobby + ":::",
  }

  const rv = JSON.stringify(data,null,2);
  console.log(rv);
  //return ContentService.createTextOutput("Hello World");
  return ContentService
  .createTextOutput(rv)
  .setMimeType(ContentService.MimeType.JSON);
  =============================================== */


  /*
  Qiita : const params = JSON.parse(e.postData.getDataAsString());
  return makeContent(makeResponse(e,"POST"));
  
  メールを配信
  const response = GmailApp.sendEmail(mail.recipient, mail.subject, mail.body, mail.options);
  console.log(response.getResponseCode());  */

/* ===========================================================
「配達員」の使用方法
  1. passPhrase を郵便局と一致するよう設定
  2. ライブラリに szLib を追加
      1lWxDf1fpXFP0TzbvNo1AyTLpzWmrP3nOJPNgFskTQyOaaSKbcpHJau3L
  3. authorization を実行してメール送信権限を付与(宛先は適宜修正)
  4. ウェブアプリとしてデプロイ。郵便局にIDを登録
=========================================================== */

const passPhrase = "Oct.22,2022"; // テスト用共通鍵
const authorization = () => {
  GmailApp.sendEmail('nakaone.kunihiro@gmail.com','配達員初期化','これは配達員の初期化処理(authorization)で送信されたメールです。');
}

const doPostTest = () => {
  const rv = doPost({
    parameter:{}
  });
}

// ===========================================================
// トリガー関数
// ===========================================================

