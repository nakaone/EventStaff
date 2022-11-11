const config = szLib.setConfig(['PostURL','PostKey']);

/** authorize: 郵便局の初期化
 * <br>
 * doGetのテストも兼ね、sendEmail等の権限付与が必要な機能を一通り呼び出す。<br>
 * 結果はコンソールで確認する。
 * @param {} - なし
 * @return {void} なし
 */
const authorize = () => {
  console.log('郵便局.authorize start.');
  const testData = [{   // 正常パターン
      recipient: 'nakaone.kunihiro@gmail.com',
      variables: {no:1, delivery:'deli01', timestamp:'2022/11/01 00:00:00.000'}
    },{   // 宛先無し
      recipient: '',
      variables: {no:2, delivery:'deli01', timestamp:'2022/11/02 00:00:00.000'}
    },{   // 不適切な宛先(正常終了するが発信者宛エラーメール)
      recipient: 'hogohogo1172931@fuga.hoge.foo.baa',
      variables: {no:3, delivery:'deli01', timestamp:'2022/11/03 00:00:00.000'}
    },{   // 実引数'no'が未定義
      recipient: 'nakaone.kunihiro@gmail.com',
      variables: {delivery:'deli01', timestamp:'2022/11/01 00:00:00.000'}
    }
  ];
  const rv = doGet({parameter:{v:
    szLib.encrypt({func:'post',data:{template:'郵便局初期化',data:testData}},config.PostKey)
  }});
  const rObj = JSON.parse(rv.getContent());
  console.log('郵便局.authorize end. rv='+JSON.stringify(rObj));
}

/** doGet: 郵便局への配信依頼受付
 * <br>
 * 返値はTextOutputのインスタンス。<br>
 * getContentで中の文字列を取得、parseすれば結果オブジェクトが得られる。<br>
 * GAS公式: [Class TextOutput]{@link https://developers.google.com/apps-script/reference/content/text-output#getcontent}
 *
 * @param {object} e - const config = szLib.setConfig(['PostURL','PostKey']);
 * @param {object} e.parameter - パラメータ文字列
 * @param {object} e.parameter.v - グローバル変数PostKeyで暗号化された文字列。<br>復号すると以下のオブジェクトとなる
 * @param {string} e.parameter.v.func - 'post'固定(他は不正)
 * @param {object} e.parameter.v.data - [postMails]{@link postMails}の引数
 * 
 * @return {object} - 正常終了の場合はpostMailsの戻り値。エラーの場合は以下のメンバを持つオブジェクト
 * <ul>
 * <li>isErr {boolean} - 'true'(固定)
 * <li>message {string} - エラーメッセージ
 * </ul>
*/
function doGet(e){
  console.log('郵便局.doGet start.',e);
  let rv = null;
  try {
    // 'v'で渡されたクエリを復号
    const arg = szLib.decrypt(e.parameter.v,config.PostKey);
    if( !arg.func ){
      throw new Error("必要な引数が見つかりません");
    }
    console.log('arg='+JSON.stringify(arg));

    switch( arg.func ){  // 処理指定により分岐
      case 'post':  // メールの送信
        rv = postMails(arg.data);
        break;
      case 'test':  // テスト用
        rv = {isErr:false};  // 何もせず正常終了とする
        break;
    }
  } catch(e) {
    rv = {isErr:true, message:e.name+': '+e.message};
  } finally {
    // 結果をJSON化して返す
    rv = JSON.stringify(rv,null,2);
    console.log('郵便局.doGet end. rv='+rv);
    return ContentService
    .createTextOutput(rv)
    .setMimeType(ContentService.MimeType.JSON);
  }
}

/** postMails: 依頼された定型メールの配信
 * <br>
 * 指定されたテンプレートの仮引数を実引数に置換した上で配達員に渡すオブジェクトの配列を作成、
 * 最も配達数の少ない配達員に送信を指示する。
 * 
 * @param {object} arg - 
 * @param {string} arg.template - メールのテンプレートが定義された郵便局のシート名
 * @param {object[]} arg.data - 個別メールの宛先、実引数
 * @param {string} arg.data.recipient - 宛先メールアドレス
 * @param {object} arg.variables - 「仮引数：実引数」形式のオブジェクト
 * @return {object[]} 全件正常終了なら空配列、エラーは以下のオブジェクトを返す
 * <ul>
 * <li>recipient {string} - エラーとなった配信先
 * <li>message {string} - エラーメッセージ
 * </ul>
 */
const postMails = (arg) => {
  console.log('郵便局.postMails start. arg='+JSON.stringify(arg));
  let rv = [];   // 失敗の配列。[{recipient:(string),message:(string)}, {..}, ..]

  // 事前準備
  const templateObj = szLib.getSheetData(arg.template);
  const tObj = {};
  templateObj.data.forEach(x => { tObj[x.parameters] = x.value});
  const logObj = SpreadsheetApp.getActive().getSheetByName('配達記録');

  // テンプレートをシートから取得
  const prototype = JSON.stringify({
    //passPhrase  : null,
    //recipient   : null,
    subject     : tObj.subject,
    body        : tObj.template,
    // 以下options
    //attachments : null,
    bcc         : tObj.bcc || undefined,
    cc          : tObj.cc || undefined,
    //from        : null,
    //inlineImages: null,
    name        : tObj.name || undefined,
    noReply     : tObj.noReply || undefined,
    replyTo     : tObj.replyTo || undefined,
    htmlBody    : null,
  });
  //console.log('prototype='+prototype);

  // 一通ずつ文面を作成、配信
  for( let i=0 ; i<arg.data.length ; i++ ){
    const m = arg.data[i];
    //console.log('m='+JSON.stringify(m));
    const mail = JSON.parse(prototype);
    try {
      // テンプレートから配信員に渡すオブジェクトを作成
      mail.recipient = m.recipient;
      //console.log('mail.recipient='+mail.recipient);

      // テンプレートの仮引数を実引数で置換
      for( let x in m.variables ){
        const rex = new RegExp('::' + x + '::','g');
        mail.body = mail.body.replace(rex,m.variables[x]);
        //console.log('rex='+rex+'\nm.variables[x]='+m.variables[x]+'\nmail.body='+mail.body);
      }

      // HTMLメールの場合、options.htmlBodyをセット
      if( tObj.html.toLowerCase() === 'true' ){
        mail.htmlBody = mail.body;
        mail.body = mail.body
        .replace(/[\s\S]+<body>([\s\S]+?)<\/body>[\s\S]+/,'$1')   // body内部のみ抽出
        .replace(/<a href="([^"]+?)".*?>([^<]+?)<\/a>/g,'$2($1)') // hrefはアドレス表示
        .replace(/<[^<>]+?>/g,'');  // HTMLのタグは削除
      }
      //console.log('mail.body='+mail.body+'\nhtmlBody='+mail.htmlBody);

      // 配達員を選定
      const delivery = szLib.getSheetData('配達員').data.filter(x => {
        return x.next.toLowerCase() === 'true'})[0];
      //console.log('delivery='+JSON.stringify(delivery));
      const endpoint = delivery.endpoint;  // 配達員のURL
      mail.passPhrase = delivery.passPhrase;

      // 配達員に発送指示を送信
      //  UrlFetchApp.fetch
      //  https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app#fetch(String,Object)
      //  返値はClass HTTPResponse
      //  https://developers.google.com/apps-script/reference/url-fetch/http-response
      const options = {
        'method': 'post',
        'headers': {
          'contentType': 'application/json',
        },
        'payload': mail,
      }
      const r0 = UrlFetchApp.fetch(endpoint,options);
      //console.log('r0='+JSON.stringify(r0));
      const r1 = r0.getContentText("UTF-8");
      //console.log('r1='+JSON.stringify(r1));
      const res = JSON.parse(r1);
      console.log('郵便局.res='+JSON.stringify(res));
      if( res.isErr ){
        rv.push({recipient:mail.recipient,message:res.message});
      }

      // 配達記録に追記
      const t = new Date();
      logObj.appendRow([
        t.toLocaleString('ja-JP') + '.' + t.getMilliseconds(),  // timestamp
        m,  // arg
        delivery.account,  // delivery
        res.isErr ? 'NG' : 'OK',
      ]);
    } catch(e) {
      rv.push({recipient:mail.recipient,message:e.message});
    }
  };
  console.log('郵便局.postMails end. rv='+JSON.stringify(rv));
  return rv;
}