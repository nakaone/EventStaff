const elaps = {account:'shimokitasho.oyaji@gmail.com',department:'郵便局'};
const conf = szLib.getConf();

const authorize = () => {
  const testData = [{
    template:'郵便局初期化',
    data:[{
      recipient: conf.Administrator,
      variables: {delivery:'郵便局',timestamp:szLib.getJPDateTime()},
    }],
  }];

  for( let i=0 ; i<testData.length ; i++ ){
    console.log('testData: '+JSON.stringify(testData[i]));
    const res = doPost({postData:{contents:JSON.stringify({
      from: 'authorize',
      to: 'Post',
      func: 'postMails',
      key: conf.Post.key,
      data:testData[i]
    })}});
    console.log('res:',res.getContent());
  }
}

/** doPost: パラメータに応じて処理を分岐
 * @param {object} e - Class UrlFetchApp <a href="https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app#fetchurl,-params">fetch(url, params)</a>の"Make a POST request with a JSON payload"参照
 * @param {object} arg - データ部分。JSON.parse(e.postData.getDataAsString())の結果
 * @param {string} arg.key        - 共通鍵。szLib.getUrl()で取得
 * @param {string} arg.from       - 送信元
 * @param {string} arg.to         - 送信先(自分)
 * @param {string} arg.func       - 分岐する処理名
 * @param {string} arg.data       - 処理対象データ
 * @return {object} 正常終了の場合は分岐先処理の戻り値、エラーの場合は以下。
 * <ul>
 * <li>isErr {boolean}  - true(固定)
 * <li>message {string} - エラーメッセージ
 * </ul>
 */
function doPost(e){
  elaps.startTime = Date.now();  // 開始時刻をセット
  console.log('郵便局.doPost start.',e);

  const arg = JSON.parse(e.postData.contents);
  let rv = null;
  if( arg.key === conf.Post.key ){
    try {
      elaps.func = arg.func; // 処理名をセット
	  
      switch( arg.func ){
        case 'postMails':
          rv = postMails(arg.data);
          break;
      }
    } catch(e) {
      // Errorオブジェクトをrvとするとmessageが欠落するので再作成
      rv = {isErr:true, message:e.name+': '+e.message};
    } finally {
      console.log('郵便局.doPost end. rv='+JSON.stringify(rv));
      szLib.elaps(elaps, rv.isErr ? rv.message : 'OK');  // 結果を渡して書き込み
      return ContentService
      .createTextOutput(JSON.stringify(rv,null,2))
      .setMimeType(ContentService.MimeType.JSON);
    }
  } else {
    rv = {isErr:true,message:'invalid passPhrase :'+arg.key};
    console.error('郵便局.doPost end. '+rv.message);
    console.log('end',elaps);
    szLib.elaps(elaps, rv.isErr ? rv.message : 'OK');
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
 * @param {object} arg.variables - 「仮引数：実引数」形式のオブジェクト(仮引数は英字)
 * @return {object[]} 全件正常終了なら空配列、エラーは以下のオブジェクトを返す
 * <ul>
 * <li>recipient {string} - エラーとなった配信先
 * <li>message {string} - エラーメッセージ
 * </ul>
 */
const postMails = (arg) => {
  console.log('郵便局.postMails start. arg='+JSON.stringify(arg));
  let rv = {isErr:false,faild:[]};   // 失敗の配列。[{recipient:(string),message:(string)}, {..}, ..]

  // 01. 事前準備：メールのプロトタイプを作成
  //   Class GmailApp
  //   https://developers.google.com/apps-script/reference/gmail/gmail-app
  //   sendEmail(recipient, subject, body, options)

  // (1) テンプレートとして指定されたシートからtObj[パラメータ名]で値を参照可能に
  const templateObj = szLib.szSheet(arg.template);
  const tObj = {};
  templateObj.data.forEach(x => { tObj[x.parameters] = x.value});
  console.log('postMails 1.1');

  // (2) メールのプロトタイプを作成
  const prototype = JSON.stringify({
    recipient: null,
    subject: tObj.subject,
    body: templateObj.template,
    options: {
      attachments: undefined,
      bcc: tObj.bcc || undefined,
      cc: tObj.cc || undefined,
      from: undefined,
      htmlBody: '',
      inlineImages: undefined,
      name: tObj.name || undefined,
      noReply: tObj.noReply || undefined,
      replyTo: tObj.replyTo || undefined,
    }
  });
  console.log('postMails 1.2 prototype='+prototype);

  // 02.一通ずつ文面を作成、配信
  const logObj = szLib.szSheet('配達記録');
  for( let i=0 ; i<arg.data.length ; i++ ){
    const m = arg.data[i];
    //console.log('m='+JSON.stringify(m));
    const mail = JSON.parse(prototype);
    try {

      // (1) 宛先の設定
      mail.recipient = m.recipient;
      console.log('mail.recipient='+mail.recipient);

      // (2) 文面の作成(テンプレートの仮引数を実引数で置換)
      for( let x in m.variables ){
        const rex = new RegExp('::' + x + '::','g');
        mail.body = mail.body.replace(rex,m.variables[x]);
        console.log('rex='+rex+'\nm.variables[x]='+m.variables[x]+'\nmail.body='+mail.body);
      }

      // (3) HTMLメールの場合、options.htmlBodyをセット
      if( tObj.html.toLowerCase() === 'true' ){
        mail.options.htmlBody = mail.body;
        mail.body = mail.body
        .replace(/[\s\S]+<body>([\s\S]+?)<\/body>[\s\S]+/,'$1')   // body内部のみ抽出
        .replace(/<a href="([^"]+?)".*?>([^<]+?)<\/a>/g,'$2($1)') // hrefはアドレス表示
        .replace(/<[^<>]+?>/g,'');  // HTMLのタグは削除
      }
      console.log('mail.body='+mail.body+'\nhtmlBody='+mail.htmlBody);

      // (4) 配信局を選定
      // a. 過去24時間のメール送信数が100未満
      const ngList = szLib.szSheet('メール不能').data.map(x => x[0]);
      console.log('ngList='+JSON.stringify(ngList));
      
      // b. 過去24時間の合計実行時間が最も多い
      let res = szLib.fetchGAS({
        from    : 'Post',
        to      : 'Agency',
        func    : 'listAgents',
      });
      const activeList = res.result
        .filter(x => x.type === '配信局')
        .sort((a,b) => {return Number(a.elaps) < Number(b.elaps) ? -1 : 1});
      console.log('activeList='+JSON.stringify(activeList));
      let agent = {};
      for( let i=0 ; i<activeList.length ; i++ ){
        if( ngList.findIndex(x => x === activeList[i].account) < 0 ){
          agent = activeList[i];
          break; 
        }
      }
      console.log('agent='+JSON.stringify(agent));

      // (5) 配信局に発送指示を送信
      res = szLib.fetchGAS({
        from      : 'Post',
        to        : 'Agent',
        func      : 'sendMail',
        endpoint  : agent.endpoint,
        passPhrase: agent.key,
        data      : mail,
      });		
      console.log('郵便局.res='+JSON.stringify(res));
      if( res.isErr ){
        rv.push({recipient:mail.recipient,message:res.message});
      }

      // (6) 配達記録に追記
      logObj.append({
        timestamp: szLib.getJPDateTime(),
        arg: m,
        delivery: delivery.account,
        result: (res.isErr ? 'NG' : 'OK'),
      });

    } catch(e) {
      rv.isErr = true;
      rv.faild.push({recipient:mail.recipient,message:e.message});
    }
  }


  console.log('郵便局.postMails end. rv='+JSON.stringify(rv));
  return rv;
}