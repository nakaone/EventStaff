const config = {
  qrSize: Math.ceil(document.body.clientWidth * 0.8), // QRコードのサイズ
  checkImage: false,  // checkImage(QRコード撮影)実行可能フラグ。永久ループ防止用
  viewMonitor: true,  // checkImage実行時、モニタ画面を表示するかどうか
  editGuestTemplate:  /* 一行分のデータに対する文書構造の定義
    tag string 1 タグ指定(必須)。"text"の場合は文字列と看做し、createTextNodeで追加する
    children [object] 0..1 子要素の定義。childrenとtextは排他
    text string 0..1 文字列の定義。変数に置換する部分には'\t'を挿入
    skip string 0..1 変数が空白の場合は出力抑止する場合、判断基準となる変数名を指定
    variable string 0..1 入力データの変数名。複数の変数は不可
    max number : 子要素が不定繰返ならその回数、不定繰返ではないなら0(固定、既定値)
      例：members配下に最大5人のメンバがいる場合 ⇒ max:5(添字は0..4となる)
    --- 上記以外は全て属性指定(properties)。以下は処理対象となる属性 -------
    class string 0..1 要素のクラス指定。三項演算子の場合、評価結果をクラスとする
      例： {.., class:"dObj['申込者']==='参加'?'representative':'representative glay'", ..}
    */
    {tag:"div", class:"table", children:[
      {tag:"div", class:"summary", children:[
        {tag:"div", class:"tr",children:[
          {tag:"div", class:"th vth", text:"受付番号"},
          {tag:"div", class:"td entryNo", variable:"受付番号"},
          {tag:"div", id:'img-qr'},
        ]},
        {tag:"div", class:"tr",children:[
          {tag:"div", class:"th vth", text:"申込者"},
          {tag:"div", class:"td name", children:[
            {tag:"ruby", children:[
              {tag:"rb", variable:"氏名"},
              {tag:"rt", variable:"読み"},
            ]},
          ]},
        ]},
        {tag:"div", class:"tr", children:[
          {tag:"div", class:"th vth", text:"キャンセル"},
          {tag:"div", class:"td", children:[
            {tag:"input", type:"checkbox", name:"cancel", checked:"取消"},
          ]},
        ]},
        {tag:"div", class:"tr", children:[
          {tag:"div", class:"th vth", text:"受付日時"},
          {tag:"div", class:"td", variable:"登録日時"},
        ]},
        {tag:"div", class:"tr", children:[
          {tag:"div", class:"th vth", text:"e-mail"},
          {tag:"div", class:"td", variable:"メール"},
        ]},
        {tag:"div", class:"tr", children:[
          {tag:"div", class:"th vth", text:"緊急連絡先"},
          {tag:"div", class:"td", variable:"連絡先"},
        ]},
        {tag:"div", class:"tr", children:[
          {tag:"div", class:"th vth", text:"引取者"},
          {tag:"div", class:"td", variable:"引取者"},
        ]},
        {tag:"div", class:"tr", children:[
          {tag:"div", class:"th vth", text:"備考"},
          {tag:"div", class:"note", variable:"備考"},
        ]},
      ]},
      {tag:"div", class:"tr",children:[
        {tag:"div", class:"td memNo", text:"①"},
        {tag:"div", class:"td name", name:"name01", children:[
          {tag:"ruby", children:[
            {tag:"rb", variable:"①氏名"},
            {tag:"rt", variable:"①読み"},
          ]},
        ]},
        {tag:"div", class:"td affiliation", name:"affiliation01", text:"\t", variable:"①所属"},
      ]},
      {tag:"div", class:"tr",children:[
        {tag:"select", class:"td status", name:"status01", opt:"未入場,入場済,退場済,不参加", variable:"①状態"},
        {tag:"select", class:"td fee", name:"fee01", opt:"未収,既収,免除", variable:"①参加費"},
      ]},
      {tag:"div", class:"tr",children:[
        {tag:"div", class:"td memNo", text:"②"},
        {tag:"div", class:"td name", name:"name02", children:[
          {tag:"ruby", children:[
            {tag:"rb", variable:"②氏名"},
            {tag:"rt", variable:"②読み"},
          ]},
        ]},
        {tag:"div", class:"td affiliation", name:"affiliation02", text:"\t", variable:"②所属"},
      ]},
      {tag:"div", class:"tr",children:[
        {tag:"select", class:"td status", name:"status02", opt:"未入場,入場済,退場済,不参加,未登録", variable:"②状態"},
        {tag:"select", class:"td fee", name:"fee02", opt:"未収,既収,免除,無し", variable:"②参加費"},
      ]},
      {tag:"div", class:"tr",children:[
        {tag:"div", class:"td memNo", text:"③"},
        {tag:"div", class:"td name", name:"name03", children:[
          {tag:"ruby", children:[
            {tag:"rb", variable:"③氏名"},
            {tag:"rt", variable:"③読み"},
          ]},
        ]},
        {tag:"div", class:"td affiliation", name:"affiliation03", text:"\t", variable:"③所属"},
      ]},
      {tag:"div", class:"tr",children:[
        {tag:"select", class:"td status", name:"status03", opt:"未入場,入場済,退場済,不参加,未登録", variable:"③状態"},
        {tag:"select", class:"td fee", name:"fee03", opt:"未収,既収,免除,無し", variable:"③参加費"},
      ]},
    ]
  },
  dump: () => {
    const o = JSON.parse(JSON.stringify(config));
    // 内容が長すぎるメンバは割愛
    ['editGuestTemplate','show'].forEach(x => delete o[x]);
    return JSON.stringify(o);
  },
};

const changeScreen = (scrId='home') => {  // 表示画面の切り替え
  console.log("changeScreen start. scrId="+scrId);

  // 画面遷移の指示がある->QRコード撮影はキャンセル
  config.checkImage = false;

  // 一度全部隠す
  const scrList = document.querySelectorAll('.screen');
  for( let i=0 ; i<scrList.length ; i++ ){
    scrList[i].style.display = 'none';
  }

  // home,loadingの場合、ヘッダは隠す
  document.querySelector('header').style.display
    = (scrId === 'home' || scrId === 'loading') ? 'none' : 'flex';

  // 指定IDの画面は再表示
  document.querySelector('#'+scrId).style.display = 'flex';

  console.log("changeScreen end.");
}

const initialize = () => {  // 初期設定処理
  console.log("initialize start.");

  // 初期設定処理の画面を表示
  document.querySelector('header h1').innerText = "初期化処理";
  changeScreen('initialize');

  // 初期設定終了時の処理を定義
  const terminate = () => {
    alert('初期設定は正常に終了しました');
    console.log("initialize end.",config);
    changeScreen('home');// ホーム画面表示
  }

  // localStorageにconfigが保存されていたら読み込み
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

  // QRコード読み取り
  config.scanCode = true;
  scanCode((code) => {
    const o = JSON.parse(code);
    for( let x in o ){ // configの値を設定
      config[x] = o[x];
    }
    config.DateOfExpiry  // 有効期限は取得後24H
    = new Date(new Date().getTime() + 86400000); 
    localStorage.setItem('config',JSON.stringify(config));
    terminate();
  },{
    selector:'#initialize .scanner',  // 設置位置指定
    RegExp:new RegExp('^{.+}$'),  // JSON文字列であること
    alert: true,  // 読み込み時、内容をalert表示する
  });
}

const inputSearchKey = () => {  // 参加者の検索キーを入力
  console.log('inputSearchKey start.');

  document.querySelector('header h1').innerText = "登録済参加者処理";
  changeScreen('inputSearchKey');

  // スキャンまたは値入力時の動作を定義
  const strEl = document.querySelector('#inputSearchKey input');
  const callback = (arg) => {
    console.log('inputSearchKey.callback start.',arg);
    changeScreen('loading');
    document.querySelector('#inputSearchKey .scanner')
      .innerHTML = ''; // 作業用DIVを除去してカメラでのスキャンを停止
    doGet("?key=" + (strEl.value || arg),(data) => {
      if( data.length === 0 ){
        alert("該当する参加者は存在しませんでした");
      } else if( data.length > 1){
        selectParticipant(data);  // 該当が複数件なら選択画面へ
      } else {
        editParticipant(data[0]);  // 該当が1件のみなら編集画面へ
      }  
    });
  };

  // スキャナを起動
  config.scanCode = true;
  scanCode((code) => {
    callback(code);
  },{
    selector:'#inputSearchKey .scanner',  // 設置位置指定
    RegExp:/^[0-9]{4}$/,  // 数字4桁
    alert: true,  // 読み込み時、内容をalert表示する
  });

  // キーワード入力欄の値が変わったら検索するよう設定
  strEl.addEventListener('change',callback);

  console.log('inputSearchKey end.');
}

const selectParticipant = (arg) => {  // 複数検索結果からの選択
  console.log('selectParticipant start.',arg);
  changeScreen('selectParticipant');

  const editArea = document.querySelector("#selectParticipant");
  editArea.innerHTML = '<p>検索結果が複数あります。選択してください。</p>';
  for( let i=0 ; i<arg.length ; i++ ){
    const o = document.createElement('div');
    o.innerText = arg[i]['氏名'] + '(' + arg[i]['読み'] + ')';
    o.addEventListener('click',() => {
      editParticipant(arg[i]);  // 選択後編集画面へ
    });
    editArea.appendChild(o);
  }

  console.log('selectParticipant end.');
}

const editParticipant = (arg) => {  // 検索結果の内容編集
  console.log('editParticipant start.',arg);
  changeScreen('editParticipant');

    // 該当が1件のみなら編集画面へ

    const editArea = document.querySelector('#editParticipant .edit');
    editArea.innerHTML = '';

    // データクレンジング
    arg['受付番号'] = ('000'+arg['受付番号']).slice(-4);  // 0パディング
    arg['登録日時'] = new Date(arg['登録日時']).toLocaleString('ja-JP');
    // 「取消」の文字列が入っていればtrue
    arg['取消'] = arg['取消'].length === 0 ? false : true;
    ['①','②','③'].forEach(x => {
      if( arg[x+'状態'].length === 0 )
        arg[x+'状態'] = arg[x+'氏名'].length === 0 ? '未登録' : '未入場';
      if( arg[x+'参加費'].length === 0 )
        arg[x+'参加費'] = arg[x+'氏名'].length === 0 ? '無し' : '未収';
    });

    // 要素の作成とセット
    let o = genChild(config.editGuestTemplate,arg,'root');  // 全体の定義と'root'を渡す
    if( toString.call(o.result).match(/Error/) ){  // エラーObjが帰ったら
      throw o.result;
    } else if( o.append ){  // 追加フラグがtrueなら親要素に追加
      editArea.appendChild(o.result);
    }

    // 編集用URLをQRコードで表示
    // https://saitodev.co/article/QRCode.js%E3%82%92%E8%A9%A6%E3%81%97%E3%81%A6%E3%81%BF%E3%81%9F/
    const qrDiv = document.querySelector('#editParticipant .qrcode');
    qrDiv.innerHTML = ""; // Clear
    new QRCode(qrDiv,{  // 第一引数のqrcodeはCSSセレクタ
      text: arg['編集用URL'],
      width: 200, height: 200,// QRコードの幅と高さ
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });

  console.log('editParticipant end.');
}

const updateParticipant = () => {
  console.log('updateParticipant start.');

  const sList = {
    name: '#editParticipant [name="name0_"] rb',
    status:'#editParticipant [name="status0_"]',
    fee:'#editParticipant [name="fee0_"]',
  };

  const rv = [];
  for( let i=1 ; i<4 ; i++ ){
    let r = {};
    r.name = document.querySelector(sList.name.replace('_',i)).innerText;
    let s = document.querySelector(sList.status.replace('_',i));
    r.status = s.options[s.selectedIndex].value;
    let f = document.querySelector(sList.fee.replace('_',i));
    r.fee = f.options[f.selectedIndex].value;
    rv.push(r);
  }

  console.log('updateParticipant end.',rv);
}

const showFormURL = () => { // 参加フォームURLのQRコード表示
  console.log("showFormURL start.");
  changeScreen('showFormURL');
  document.getElementById('showFormURL').style.height = config.qrSize * 2 + 'px';

  // 申請フォームのQRコードを表示
  const text = "https://docs.google.com/forms/d/" + config.formId + "/edit";
  console.log('text="'+text+'"');
  document.getElementById("qrcode").innerHTML = "";// Clear
  let qrcode = new QRCode("qrcode", {  // 第一引数のqrcodeはCSSセレクタ
    text: text,
    width: config.qrSize, height: config.qrSize,// QRコードの幅と高さ
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
  console.log("showFormURL end.");
}

const showSummary = () => {  // 集計表の表示
  console.log("showSummary start.");
  changeScreen('showSummary');
  alert(config.dump());
  console.log("showSummary end.");
}

window.addEventListener('DOMContentLoaded', function(){ // 主処理
  // Err: "Uncaught ReferenceError: jsQR is not defined"
  // -> DOMが構築されたときに初期化処理が行われるように設定
  // https://pisuke-code.com/jquery-is-not-defined-solution/
  console.log("EventStaff start.",config);
  initialize();
});
