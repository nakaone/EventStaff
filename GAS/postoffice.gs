const config = szLib.setConfig(['PostURL','PostKey']);

// ===========================================================
// トリガー関数
// ===========================================================

const authorization = () => {  // 「郵便局」の初期化
  console.log('郵便局.authorization start.');
  // 配達記録シートのデータを削除
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.getSheetByName('配達記録').getRange('a2:d').clear();

  // 配達員シートの count をリセット
  const dObj = szLib.getSheetData('配達員');
  const lastRow = dObj.sheet.getLastRow();
  //console.log('lastRow='+lastRow);
  dObj.sheet.getRange('e2:e'+lastRow).setValues((()=>{
    const rv = [];
    for( let i=2 ; i<=lastRow ; i++ )
      rv.push([0]);
    return rv;
  })());
  // 全配達員について順次テストメール配信を指示
  for( let i=0 ; i<lastRow-1 ; i++ ){
    //console.log('dObj.data['+i+']='+JSON.stringify(dObj.data[i]));
    const tObj = new Date();
    const postData = {
      passPhrase : dObj.data[i].passPhrase,
      template: '郵便局初期化',
      recipient: 'shimokita.oyaji@gmail.com',
      variables: {
        no : ('000'+(i+1)).slice(-4),
        delivery : dObj.data[i].account,
        timestamp: tObj.toLocaleString('ja-JP') + '.' + tObj.getMilliseconds(),
      },
    };
    console.log('postData='+JSON.stringify(postData));
    postMail(postData);
  }
  console.log('郵便局.authorization end.');
}

function doGet(e) {
  console.log('郵便局.doGet start.',e);

  // 'v'で渡されたクエリを復号
  arg = szLib.decrypt(e.parameter.v,config.PostKey);
  console.log('郵便局.arg',szLib.whichType(arg),arg);

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
  console.log('郵便局.doGet end. rv='+rv);
  return ContentService
  .createTextOutput(rv)
  .setMimeType(ContentService.MimeType.JSON);
}

function postMail(arg){ /*
  arg = {
    passPhrase string : 共通鍵
    template  string : テンプレート名。郵便局スプレッドシートのシート名
    recipient string : 宛先メールアドレス
    variables object : テンプレートで置換する{変数名:実値}オブジェクト
  }
  */
  console.log('郵便局.postMail start. arg='+JSON.stringify(arg));

  // メールを作成(sendGmailで送る際の引数Obj)
  const mail = mailMerge(arg);

  // 配達員の選定とAPIの取得
  const delivery = szLib.getSheetData('配達員').data.filter(x => {
    return x.next.toLowerCase() === 'true'})[0];
  console.log(delivery);
  const endpoint = delivery.endpoint;

  // 配達員に渡すパラメータの作成と配達指示
  const data = {
    passPhrase  : delivery.passPhrase,
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
  console.log('郵便局.mailMerge start. arg='+JSON.stringify(arg));

  // テンプレートをシートから取得
  const dObj = szLib.getSheetData(arg.template);
  //console.log('郵便局.dObj.data='+JSON.stringify(dObj.data));

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
  console.log('郵便局.mail prototype = '+JSON.stringify(mail));

  // 本文のプレースホルダを引数で渡された実値で置換
  for( let x in arg.variables ){
    const rex = new RegExp('::' + x + '::','g');
    mail.body = mail.body.replace(rex,arg.variables[x]);
    //console.log('rex='+rex+'\narg.variables[x]='+arg.variables[x]+'\nmail.body='+mail.body);
  }
  console.log('郵便局.mail replaced = '+JSON.stringify(mail));

  // HTMLメールならoptions.htmlBodyをセット
  if( lookup('html') ){
    mail.options.htmlBody = mail.body;
    mail.body = mail.body
    .replace(/[\s\S]+<body>([\s\S]+?)<\/body>[\s\S]+/,'$1')   // body内部のみ抽出
    .replace(/<a href="([^"]+?)".*?>([^<]+?)<\/a>/g,'$2($1)') // hrefはアドレス表示
    .replace(/<[^<>]+?>/g,'');  // HTMLのタグは削除
  }

  console.log('郵便局.mailMerge end. mail='+JSON.stringify(mail));
  return mail;
}