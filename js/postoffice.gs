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
  console.log('postMail start. arg='+JSON.stringify(arg));
  */
  // テンプレートをシートから取得
  const dObj = szLib.getSheetData(arg.template);
  dObj.data = () => {
    const rv = {};
    for( let i=1 ; i<dObj.rows.length ; i++ ){
      rv[dObj.rows[i][0]] = dObj.rows[i][1];
    }
    return rv;
  };
  console.log('dObj.data='+JSON.stringify(dObj.data));

  const post = {  // szLib.sendGmail()の引数を作成
    recipient: arg.recipient,
    subject: dObj.data.subject,
    body: {
      template: dObj.data.template,
      variables : arg.variables,
      html : dObj.data.html,

    },
    options: {
      attachments: dObj.data.attachments,
      bcc: dObj.data.bcc,
      cc: dObj.data.cc,
      from: dObj.data.from,
      inlineImages: dObj.data.inlineImages,
      name: dObj.data.name,
      noReply: dObj.data.noReply,
      replyTo: dObj.data.replyTo,
      htmlBody: dObj.data.htmlBody,
    },
  }
  console.log('post='+JSON.stringify(post));

  // 使用する配達用アカウント(URL)を特定
  // 
  // 配達用アカウント(URL)にメール送付を指示
}