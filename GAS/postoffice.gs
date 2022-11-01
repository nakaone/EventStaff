const passPhrase = "Oct.22,2022"; // テスト用共通鍵

// ===========================================================
// トリガー関数
// ===========================================================

const doGetTest = () => {
  const testData = [
    //{func:'test',data:{from:'嶋津',to:'スタッフ',message:'ふがふが'}},
    //{func:'search',data:{key:'ナ'}},
    /*{func:'update',data:{target:{key:'受付番号',value:12},revice:[
      {key:'状態',value:'参加'},
      {key:'参加費',value:'既収'},
    ]}},*/
    {func:'post',data:{
      template: '申込への返信',
      recipient: 'nakaone.kunihiro@gmail.com',
      variables: {name:'嶋津　邦浩',entryNo:'0025'},
    }},
  ];
  for( let i=0 ; i<testData.length ; i++ ){
    doGet({parameter:{v:szLib.encrypt(testData[i],passPhrase)}});
  }
};

function doGet(e) {
  console.log('doGet start.',e);

  // 'v'で渡されたクエリを復号
  arg = szLib.decrypt(e.parameter.v,passPhrase);
  console.log('arg',szLib.whichType(arg),arg);

  let rv = [];
  switch( arg.func ){  // 処理指定により分岐
    case 'post':  // メールの送信
      rv = postMail(arg.data);
      break;
    case 'test':  // テスト用
      rv = arg.data;  // 何もせず、そのまま返す
      break;
  }

  // 結果をJSON化して返す
  rv = JSON.stringify(rv,null,2);
  console.log('doGet end. rv='+rv);
  return ContentService
  .createTextOutput(rv)
  .setMimeType(ContentService.MimeType.JSON);
}

function postMail(arg){ /*
  arg = {
    template  string : テンプレート名。郵便局スプレッドシートのシート名
    recipient string : 宛先メールアドレス
    variables object : テンプレートで置換する{変数名:実値}オブジェクト
  }
  */
  console.log('postMail start. arg='+JSON.stringify(arg));

  // メールを作成(sendGmailで送る際の引数Obj)
  const mail = mailMerge(arg);

  // 配達員の選定とAPIの取得
  const delivery = szLib.getSheetData('配達員').data.filter(x => {
    return x.next.toLowerCase() === 'true'})[0];
  console.log(delivery);
  const endpoint = delivery.endpoint;

  // 文面の作成と配達指示
  const data = {
    passPhrase  : passPhrase,
    recipient   : arg.recipient,
    subject     : mail.subject,
    body        : mail.body,
    // 以下options
    //attachments : mail.attachments || undefined,
    bcc         : mail.options.bcc || undefined,
    cc          : mail.options.cc || undefined,
    //from        : mail.options.from || undefined,
    //inlineImages: mail.options.inlineImages,
    name        : mail.options.name || undefined,
    noReply     : mail.options.noReply || undefined,
    replyTo     : mail.options.replyTo || undefined,
    htmlBody    : mail.options.htmlBody || undefined,
  };
  const options = {
    'method': 'post',
    'headers': {
      'contentType': 'application/json',
    },
    'payload': data,
  }
  const response = UrlFetchApp.fetch(endpoint,options);
  console.log(response.getContentText());

  // 配達記録への追記
  const tObj = new Date();
  SpreadsheetApp.getActive().getSheetByName('配達記録').appendRow([
    tObj.toLocaleString('ja-JP') + '.' + tObj.getMilliseconds(),  // timestamp
    arg,  // arg
    delivery.account,  // delivery
    'OK'  // result。本来は配達員から結果を受け取るが、エラーの切り分けができないため無視
  ]);

}

function mailMerge(arg){  /* 差込印刷でメールの文面を作成
  postMailから渡された実データをシートで定義しているテンプレートに差し込み、
  sendEmail()に渡すメールオブジェクトを作成する。
  GmailApp.sendEmail() :
  https://developers.google.com/apps-script/reference/gmail/gmail-app#sendEmail(String,String,String,Object)
  */
  console.log('mailMerge start. arg='+JSON.stringify(arg));

  // テンプレートをシートから取得
  const dObj = szLib.getSheetData(arg.template);
  //console.log('dObj.data='+JSON.stringify(dObj.data));

  // 	内部関数定義：dObjから指定ラベルを持つ値を取得
  const lookup = (label) => {
    return dObj.data.filter(x => {
      return x.parameters === label;
    })[0].value;
  };

  const mail = {  // メールオブジェクトの雛形
    recipient: arg.recipient,
    subject: lookup('subject'),
    body: lookup('template'),
    options: {
      //未対応 attachments: lookup('attachments'),
      bcc: lookup('bcc') || undefined,
      cc: lookup('cc') || undefined,
      from: lookup('from') || undefined,
      //未対応 inlineImages: lookup('inlineImages'),
      name: lookup('name') || undefined,
      noReply: lookup('noReply') || undefined,
      replyTo: lookup('replyTo') || undefined,
      //htmlBody: lookup('htmlBody'),
    },
  }
  console.log('mail prototype = '+JSON.stringify(mail));

  // 本文のプレースホルダを引数で渡された実値で置換
  for( let x in arg.variables ){
    mail.body = mail.body.replace(new RegExp('::' + x + '::','g'),arg.variables[x]);
  }

  // HTMLメールならoptions.htmlBodyをセット
  if( lookup('html') ){
    mail.options.htmlBody = mail.body;
    mail.body = mail.body.replace(/<[^<>]+?>/g,'');
  }

  console.log('mailMerge end. mail='+JSON.stringify(mail));
  return mail;
}