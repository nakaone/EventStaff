const config = {
  // 分類A
  AuthURL: "https://script.google.com/macros/s/AKfycbzLTSCt6lfjnCE1h1kzcDC9kXraugHUsT0mnZ6HEF1JeqCDfYiBPbzbGvlhRPdjdqSKxg/exec",
  FormURL: "https://docs.google.com/forms/d/e/1FAIpQLSfIJ4IFsBI5pPXsLz2jlTBczzIn8QZQL4r6QHqxZmSeDOhwUA/viewform",
  SiteURL: "https://sites.google.com/view/shimokita-oyaji/home/archives/20221001-%E6%A0%A1%E5%BA%AD%E3%83%87%E3%82%A4%E3%82%AD%E3%83%A3%E3%83%B3%E3%83%97",
  MapURL: "materials/map.html",
  TableURL: "materials/timetable/WBS.html",
  EnqueteURL: "https://docs.google.com/forms/d/16r3luYQRiLVmI9xqaD4FuaSlUqTRGvI8nAGrjGcg8lc/viewform",
  // 分類B　※プリセットは認証実装までの暫定
  BoardAPI: null,         // 「掲示板」のGAS Web API のID
  passPhrase: null,       // GASとの共通鍵(Master, Board共通)
  DateOfExpiry: null,     // config情報の有効期限
  BoardInterval: 30000,   // 掲示板巡回のインターバル。m秒
  // 分類C
  //handleName: '(未定義)',  // お知らせに表示する自分の名前
  // 分類D
  //scanCode: false,        // スキャン実行フラグ。true時のみスキャン可
  getMessages: false,     // 掲示板データ取得フラグ。true時のみ実行可。
  BoardIntervalId: null,  // setIntervalのID
  // --- メソッド
  set: (label,value) => { // 値のセット＋localStorageへの格納
    console.log('config.set start. label='+label+', value='+JSON.stringify(value));
    config[label] = value;
    let sv = {};
    for( let x in config ){
      if( typeof config[x] !== 'function' ){
	      sv[x] = config[x];
      }
    }
    sv = JSON.stringify(sv);
    localStorage.setItem('config',sv)
    console.log('config.set end. sv='+sv);
  },
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

const doGet = (endpoint,postData,callback) => {  // GASのdoGetを呼び出し、後続処理を行う
  console.log("doGet start. ",postData,callback);

  // GASに渡すデータを作成
  const v = encrypt(postData,config.passPhrase);
  dump('v',v);

  // エンドポイントを作成
  const ep = 'https://script.google.com/macros/s/〜/exec'
    .replace('〜',endpoint) + '?v=' + v;
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

const getMessages = (arg=0) => {
  console.log('getMessages start.');

  if( arg === 0 ){  // 定期的に実行される処理
    const cTime = new Date();
    console.log('getMessages periodical start: '+cTime.toLocaleString('ja-JP')+'.'+cTime.getMilliseconds());
    if( config.getMessages && config.BoardIntervalId !== null){
      // 掲示板スプレッドシートからデータを取得し、boardAreaに書き込む
      doGet(config.BoardAPI,{func:'getMessages',data:{}},(response) => {
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
            lastMesDate = dt.toLocaleDateString();
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
        const msgEl = document.getElementById('boardArea');
        msgEl.innerHTML = msg;
        msgEl.scrollIntoView(false);
        console.log('getMessages periodical end: '+msg);
      });
    }
  } else {  // 実行/停止指示
    if( arg > 0 ){  // 定期巡回開始(再開)
      config.getMessages = true;
      //config.BoardInterval = true;
      console.log('config='+JSON.stringify(config));
      // 取得間隔は最低10秒。既定値30秒
      const interval = Number(config.BoardInterval) > 9999 ? config.BoardInterval : 30000;
//      config.BoardIntervalId = setInterval(getMessages,10000);
      config.BoardIntervalId = setInterval(getMessages,interval);
      getMessages(0);
      console.log('getMessages start. id='+config.BoardIntervalId);
    } else {    // 定期巡回停止
      clearInterval(config.BoardIntervalId);
      config.getMessages = false;
      //config.BoardInterval = false;
      console.log('getMessages stop. id='+config.BoardIntervalId);
      config.BoardIntervalId = null;
    }
  }
}