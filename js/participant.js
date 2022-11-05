const getEntryNo = () => {  // 受付番号入力時処理
  console.log('getEntryNo start.');

  const endpoint = config.AuthURL;
  const entryNo = document.querySelector('#entryNo input').value;
  const sendData = {  // 認証局へ受付番号をPOSTで送る
    func: 'authA1',
    data: {
      entryNo: entryNo,
    }
  };
  doPost(endpoint,sendData,(response) => {
    console.log('getEntryNo response = '+JSON.stringify(response));
    //document.querySelector('#entryNo').innerHTML = response.message;
  });
}

const initialize = () => {  // 初期設定処理
  console.log("initialize start.");

  // [01] 初期設定処理の画面を表示
  changeScreen();

  // [02] 画面・イベント定義の設定
  // 01. お知らせ画面
  // 新規のお知らせが来たら末尾を表示
  // https://at.sachi-web.com/blog-entry-1516.html
  const msgArea = document.getElementById('boardArea');
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

  // 05. 進行予定画面
  document.querySelector("#schedule iframe").src = config.TableURL;
  // 06. 校内案内図
  document.querySelector("#VenueMap iframe").src = config.MapURL;
  // 07. サイト案内　※Googleのサイトはiframe不可
  document.querySelector('nav .noticeSite').href = config.SiteURL;
  // 08. アンケート
  document.querySelector('#enquete .button').innerHTML
  = '<a href="' + config.EnqueteURL + '" class="button">参加者アンケート</a>';

  // [03] グローバル変数 config 設定
  // 01. 初期設定終了時の処理を事前に定義
  const terminate = () => {
    getMessages(1);  // 掲示板定期更新開始
    console.log("initialize end.",config);
    changeScreen();// ホーム画面表示
  }

  // 02. localStorageから読み込み
  let confStr = localStorage.getItem('config');
  if( confStr ){  // localStorageに存在
    confObj = JSON.parse(confStr);
    if( confObj.DateOfExpiry < new Date() ){
      // 有効期限が切れていたら無効化＋localStorageから削除
      localStorage.removeItem('config');
    } else {
      // 有効期限内ならセットして以後の処理はスキップ
      Object.assign(config,confObj);
      terminate();
      return;
    }
  }

  // 03. 受付番号入力画面表示
  changeScreen('entryNo','受付番号入力');

  /* 03. パスコード入力
  document.querySelector('#initialize input[type="submit"]')
  .addEventListener('click',() => {

  });
  alert('input passcord');

  // 03. 分類B : シートからQRコードを読み込んで設定する変数
  config.scanCode = true;
  scanCode((code) => {
    const o = JSON.parse(code); // QRコード優先分は書き換え
    for( let x in o ){ // グローバル変数configに値を設定
      config.set(x,o[x]);
    }
    alert('初期設定は正常に終了しました');
    terminate();
  },{
    selector:'#initialize .scanner',  // 設置位置指定
    RegExp:new RegExp('^{.+}$'),  // JSON文字列であること
    alert: false,  // 読み込み時、内容をalert表示しない
  });
  */
}

window.addEventListener('DOMContentLoaded', function(){ // 主処理
  // Err: "Uncaught ReferenceError: jsQR is not defined"
  // -> DOMが構築されたときに初期化処理が行われるように設定
  // https://pisuke-code.com/jquery-is-not-defined-solution/
  console.log("participant start.",config);
  initialize();
});
