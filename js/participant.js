const config = {
  // 分類A
  FormURL: "https://docs.google.com/forms/d/e/1FAIpQLSfIJ4IFsBI5pPXsLz2jlTBczzIn8QZQL4r6QHqxZmSeDOhwUA/viewform",
  SiteURL: "https://sites.google.com/view/shimokita-oyaji/home/archives/20221001-%E6%A0%A1%E5%BA%AD%E3%83%87%E3%82%A4%E3%82%AD%E3%83%A3%E3%83%B3%E3%83%97",
  MapURL: "materials/map.html",
  TableURL: "materials/timetable/WBS.html",
  EnqueteURL: "https://docs.google.com/forms/d/16r3luYQRiLVmI9xqaD4FuaSlUqTRGvI8nAGrjGcg8lc/viewform",
  // 分類B
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

const initialize = () => {  // 初期設定処理
  console.log("initialize start.");

  // [01] 初期設定処理の画面を表示
  changeScreen('initialize',"初期化処理");

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
  setQRcode('#enquete .qrcode',{text:config.SiteURL});

  // [03] グローバル変数 config 設定
  // 01. 初期設定終了時の処理を事前に定義
  const terminate = () => {
    getMessages(1);  // 掲示板定期更新開始
    console.log("initialize end.",config);
    changeScreen();// ホーム画面表示
  }

  // 02. localStorageから読み込み
  let confStr = localStorage.getItem('config');
  if( confStr ){
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

  // 03. パスコード入力
  /*
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
