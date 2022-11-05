const config = {
  // 分類A
  AuthURL: "https://script.google.com/macros/s/AKfycbzOhcReYRaoK9orCI63PNlKMtAHBK6GEBNZ2AFZbj48M05lf472OxmqEInPFIg2TF-3vg/exec",
  AuthLevel: 0,
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