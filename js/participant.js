class Broad {
  constructor(URL,key,interval=30000){
    this.URL = URL;
    this.key = key;
    this.interval = interval;
    console.log('Broad.constructor end.');
  }

  start(){
    this.onGoing = true;
    this.IntervalId = setInterval(this.periodical,this.interval);
    this.periodical();
    console.log('Broad.start');
  }

  end(){
    this.onGoing = false;
    clearInterval(this.IntervalId);
    this.IntervalId = null;
    console.log('Broad.end');
  }

  periodical(){
    doGet(this.URL,this.key,{func:'getMessages',data:{}},(response) => {
      console.log('getMessages response='+JSON.stringify(response));
      // 時系列にメッセージを並べ替え
      response.sort((a,b) => a.timestamp < b.timestamp);
      console.log(response);
      // 掲示板領域に書き込むHTMLを msg として作成
      let msg = '';
      let lastMesDate = '1900/01/01';
      const t = '<p class="title">[_time] From:_from　To:_to</p><p>_message</p>';
      for( let i=0 ; i<response.length ; i++ ){
        const dt = new Date(response[i].timestamp);
        if( dt.toLocaleDateString('ja-JP') !== lastMesDate ){
          lastMesDate = dt.toLocaleDateString('ja-JP');
          msg += '<p class="date">' + lastMesDate + '</p>';
        }
        const hms = ('0'+dt.getHours()).slice(-2)
          + ':' + ('0'+dt.getMinutes()).slice(-2)
          + ':' + ('0'+dt.getSeconds()).slice(-2);
        const m = t.replace('_time',hms)
          .replace('_from',response[i].from)
          .replace('_to',response[i].to)
          .replace('_message',response[i].message)
          .replace(/\n/g,'<br>');
        console.log('m='+m);
        msg += m;
      }
      // 掲示板領域に書き込み
      const msgEl = document.getElementById('BroadArea');
      msgEl.innerHTML = msg;
      msgEl.scrollIntoView(false);
      console.log('getMessages periodical end: '+msg);
    })
  }
}

const config = {
  // 分類A
  AuthURL: "https://script.google.com/macros/s/AKfycbxCXpmamk-zGGckxIuCwEfP4Ac24sRKmO3DcFuBBW2UaNJK87RBr50eykjxKJ2D324k-w/exec",
  AuthLevel: 0,
}

const getEntryNo = () => {  // 受付番号入力時処理
  console.log('getEntryNo start.');

  // 受付番号のボタンを不活性化
  document.querySelector('#entryNo .entryNo input[type="button"]').disabled = 'disabled';
  // メッセージ設定
  document.querySelector('#entryNo .entryNo .message').innerHTML = '<p>暫くお待ちください...</p>';

  const inputValue = document.querySelector('#entryNo .entryNo input[type="text"]').value;
  if( !inputValue.match(/^[0-9]{1,4}$/) ){
    alert("不適切な受付番号です");
    // 入力欄をクリア
    document.querySelector('#entryNo .entryNo input[type="text"]').value = '';
    // 受付番号のボタンを活性化
    document.querySelector('#entryNo .entryNo input[type="button"]').disabled = null;
    return;
  }
  const endpoint = config.AuthURL;
  const entryNo = document.querySelector('#entryNo input').value;
  const sendData = {  // 認証局へ受付番号をPOSTで送る
    func: 'auth1A',
    data: {
      entryNo: entryNo,
    }
  };
  doPost(endpoint,sendData,(response) => {
    console.log('getEntryNo response = '+JSON.stringify(response));
    if( response.isErr ){
      document.querySelector('#entryNo .entryNo .message').innerHTML
        = '<p class="error">' + response.message + '</p>';
    } else {
      // 受付番号入力欄を隠蔽
      document.querySelector('#entryNo .entryNo').style.display = 'none';
      // パスコード入力画面を開く
      document.querySelector('#entryNo .passCode').style.display = 'block';
    }
  });
}

const getPassCode = () => {
  console.log('getPassCode start.');  

  // パスコードのボタンを不活性化
  document.querySelector('#entryNo .passCode input[type="button"]').disabled = 'disabled';

  const inputValue = document.querySelector('#entryNo .passCode input[type="text"]').value;
  if( !inputValue.match(/^[0-9]{6}$/) ){
    alert("不適切なパスコードです");
    // 入力欄をクリア
    document.querySelector('#entryNo .passCode input[type="text"]').value = '';
    // パスコードのボタンを活性化
    document.querySelector('#entryNo .passCode input[type="button"]').disabled = null;
    return;
  }
  const endpoint = config.AuthURL;
  const entryNo = document.querySelector('#entryNo .entryNo input[type="text"]').value;
  const passCode = document.querySelector('#entryNo .passCode input[type="text"]').value;
  const sendData = {  // 認証局へ受付番号とパスコードをPOSTで送る
    func: 'auth2A',
    data: {
      entryNo: entryNo,
      passCode: passCode,
    }
  };
  doPost(endpoint,sendData,(response) => {
    console.log('getPassCode response = '+JSON.stringify(response));
    if( response.isErr ){
      document.querySelector('#entryNo .passCode .message').innerHTML
        = '<p class="error">' + response.message + '</p>';
    } else {
      // 初期設定を呼び出す
      initialize(response);
    }
  });
  
  console.log('getPassCode end.');  
}  

const initialize = (arg) => {  // 初期設定処理
  console.log("initialize start.",arg);

  // サーバから取得したconfig, menuFlagsを保存
  for( let x in arg.config ){
    config[x] = arg.config[x];
  }
  config.menuFlags = arg.menuFlags;
  // 数値項目は数値化
  config.BroadInterval = Number(arg.config.BroadInterval);
  console.log('initialize.config',config);

  // 05. 進行予定画面
  document.querySelector("#schedule iframe").src = config.TableURL;
  // 06. 校内案内図
  document.querySelector("#VenueMap iframe").src = config.MapURL;
  // 07. サイト案内　※Googleのサイトはiframe不可
  document.querySelector('nav .noticeSite').href = config.SiteURL;
  // 08. アンケート
  document.querySelector('#enquete .button').innerHTML
  = '<a href="' + config.EnqueteURL + '" class="button">参加者アンケート</a>';

  // 新規のお知らせが来たら末尾を表示するよう設定
  // https://at.sachi-web.com/blog-entry-1516.html
  const msgArea = document.getElementById('BroadArea');
  const mo = new MutationObserver(() => {
    console.log('mutation detected');
    msgArea.scrollTop = msgArea.scrollHeight;
  });
  mo.observe(msgArea,{
    childList: true,
    attributes: true,
    characterData: true,
    subtree: true,//孫以降のノードの変化も検出
    attributeOldValue: true,//変化前の属性データを記録する
    characterDataOldValue: true,//変化前のテキストノードを記録する
    attributeFilter: [],//配列で記述した属性だけを見張る
  });

  // 掲示板定期更新開始
  config.Broad = new Broad(config.BroadURL,config.BroadKey,config.BroadInterval);
  config.Broad.start();
  //getMessages(1);

  changeScreen();// ホーム画面表示
  console.log("initialize end.",config);
}

const changeScreen = (scrId='home',titleStr='お知らせ') => {  // 表示画面の切り替え
  console.log("changeScreen start. scrId="+scrId+', titleStr='+titleStr);

  // screenクラスの画面を全部隠す
  const scrList = document.querySelectorAll('.screen');
  for( let i=0 ; i<scrList.length ; i++ ){
    scrList[i].style.display = 'none';
  }

  // ローディング画面以外の場合、メニュー名を書き換え
  if( scrId !== 'loading' ){
    document.querySelector('header .title').innerText = titleStr;
  }
  // 指定IDの画面は再表示
  document.querySelector('#'+scrId).style.display = 'flex';

  // メニューを隠す
  toggleMenu(false);

  // 投稿欄に名前をセット
  /* !! EventStaff Only !!
  if( scrId === 'home' ){
    document.querySelector('#home input[name="from"]').value = config.handleName;
  }
  console.log("changeScreen end.");*/
}

const doGet = (endpoint,passPhrase,postData,callback) => {  // GASのdoGetを呼び出し、後続処理を行う
  console.log("doGet start. ",endpoint,passPhrase,postData,callback);

  // GASに渡すデータを作成
  const v = encrypt(postData,passPhrase);
  dump('v',v);

  // エンドポイントを作成
  const ep = endpoint + '?v=' + v;
  dump('ep',ep);

  // GASからの返信を受けたらcallbackを呼び出し
  fetch(ep,{"method": "GET"})
  .then(response => response.json())
  .then(data => {
    console.log("doGet end.",data);
    callback(data);  // 成功した場合、後続処理を呼び出し
  });

}

const doPost = (endpoint,postData,callback) => {  // GASのdoPostを呼び出し、後続処理を行う
  console.log("doPost start. ",postData,callback);

  // GASからの返信を受けたらcallbackを呼び出し
  fetch(endpoint,{
    "method": "POST",
    "body": JSON.stringify(postData),
    "Content-Type": "application/json",
  }).then(response => response.json())
  .then(data => {
    console.log("doPost end.",data);
    callback(data);  // 成功した場合、後続処理を呼び出し
  });
}

window.addEventListener('DOMContentLoaded', function(){ // 主処理
  // Err: "Uncaught ReferenceError: jsQR is not defined"
  // -> DOMが構築されたときに初期化処理が行われるように設定
  // https://pisuke-code.com/jquery-is-not-defined-solution/
  console.log("participant start.",config);
  // 受付番号入力画面表示
  // getPassCode正常終了時、そこからinitializeを呼び出す
  changeScreen('entryNo','ログイン');
});
