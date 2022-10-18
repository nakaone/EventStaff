const config = {
  qrSize: Math.ceil(document.body.clientWidth * 0.8), // QRコードのサイズ
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
const flags = {  // 各種フラグ
  checkImage: false,  // checkImage(QRコード撮影)実行可能フラグ。永久ループ防止用
  //inputKeyWord: false,  // QRコード撮影画面に受付番号・氏名読み入力欄を表示するかどうか
};

const changeScreen = (scrId='home') => {  // 表示画面の切り替え
  console.log("changeScreen start. scrId="+scrId);

  // 画面遷移の指示がある->QRコード撮影はキャンセル
  flags.checkImage = false;

  // 一度全部隠す
  const scrList = document.querySelectorAll('.screen');
  for( let i=0 ; i<scrList.length ; i++ ){
    scrList[i].style.display = 'none';
  }

  // homeの場合、ヘッダは隠す
  document.querySelector('header').style.display
    = scrId === 'home' ? 'none' : 'flex';

  // 指定IDの画面は再表示
  document.querySelector('#'+scrId).style.display = 'flex';

  console.log("changeScreen end.");
}

const initialize = () => {  // 初期設定処理
  console.log("initialize start.");

  // 初期設定終了時の処理を定義
  const terminate = () => {
    alert('初期設定は正常に終了しました');
    console.log("initialize end.",config);
    changeScreen('home');// ホーム画面表示
  }

  // canvasのサイズ指定
  const c = document.getElementById("js-canvas");
  const v = document.getElementById("js-video");
  c.width = v.clientWidth;
  c.height = v.clientHeight;

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

  // 保存されていなかったら初期設定処理の画面を表示
  document.querySelector('header h1').innerText = "初期化処理";
  changeScreen('initialize');
  document.getElementById('camera').style.display = 'flex';

  // QRコード読み取り
  flags.checkImage = true;
  checkImage((code) => {
    const o = JSON.parse(code);
    for( let x in o ){ // configの値を設定
      config[x] = o[x];
    }
    config.DateOfExpiry  // 有効期限は取得後24H
    = new Date(new Date().getTime() + 86400000); 
    localStorage.setItem('config',JSON.stringify(config));
    terminate();
  });
}

const registerd = (arg) => {
  console.log('registerd start.',arg);

  // 本関数は引数の型・個数により処理を分岐させている。
  // 分岐した後の個々の処理も複雑なので、内部関数として定義する
  const initRegi = () => {  // 初期状態の場合の処理定義
    // 初期状態(キーワードも入ってないし、doGetも実行されていない)
    // スキャナを起動
    changeScreen('camera');
    // キーワード入力欄を表示
    document.querySelector("#registerd .search_box").style.display = "inline-block";
    // 虫眼鏡がクリックされたら値を取得するよう設定
    const f = () => {
      changeScreen('loading');
      const keywordElement = document.querySelector("#camera .search_box input");
      const keyword = keywordElement.value;
      keywordElement.value = '';
      registerd(keyword);
    };
    document.querySelector("#camera .search_box img").addEventListener('click',f);
  }

  const unique = (arg) => {  // 検索結果が一つしか無い場合の処理
    // 該当が1件のみなら編集画面へ

    const editArea = document.querySelector("#registerd .edit");
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
    document.getElementById("img-qr").innerHTML = "";// Clear
    let qrcode = new QRCode("img-qr", {  // 第一引数のqrcodeはCSSセレクタ
      text: arg['編集用URL'],
      width: 200, height: 200,// QRコードの幅と高さ
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
  }

  const multi = (arg) => {  // 検索結果が複数あった場合の処理
    // 該当が複数件ならまず選択、選択後編集画面へ

    const editArea = document.querySelector("#registerd .edit");
    editArea.innerHTML = '<p>検索結果が複数あります。選択してください。</p>';
    for( let i=0 ; i<arg.length ; i++ ){
      const o = document.createElement('div');
      o.innerText = arg[i]['氏名'] + '(' + arg[i]['読み'] + ')';
      o.addEventListener('click',() => {
        registerd([arg[i]]);
      });
      editArea.appendChild(o);
    }
  }

  // 主処理：引数の型・個数により事前に定義した内部関数を呼び出す
  if( arg === undefined ){  // 初期状態(ホーム画面のボタン)から呼ばれた
    initRegi();
  } else {
    const argType = whichType(arg);
    if( argType === 'String' ){  // 引数が文字列 ⇒ 検索キーワード
      doGet("?key=" + arg,registerd);
    } else {  // 配列 ⇒ GASのdoGetからの戻り値(検索結果)
      if( arg.length === 0 ){  // 検索結果が0
        alert("該当する参加者は存在しませんでした");
      } else {  // 検索結果が>0
        changeScreen('registerd');
        if( arg.length === 1 ){
          unique(arg[0]);
        } else {
          multi(arg);  // 検索結果が複数あるので選択が必要
        }
      }
    }
  }

  console.log('registerd end.');
}

const editGuest = (arg) => {  // 状態・参加費の更新
  console.log("editGuest start.",arg);
  // 1:未収,2:既収,3:免除,4:無し
  // 1:未入場,2:入場済,3:退場済,4:不参加,5:未登録
  // ^n(\d+)c([0|1])s([1-5]{3})f([1-4]{3})m(.*)$
  //    1     2       3          4          5
  const map = {
    label:['①','②','③'],
    status:{'未入場':'1','入場済':'2','退場済':'3','不参加':'4','未登録':'5'},
    fee:{'未収':'1','既収':'2','免除':'3','無し':'4'},
  }
  if( arg === undefined ){
    // 更新のキー文字列を生成
    const key = "?key=n_1c_2s_3f_4m_5"
      .replace(/_1/,String(Number(document.querySelector('#registerd .edit .entryNo').innerText)))  // 受付番号
      .replace(/_2/,(document.querySelector('#registerd .edit .summary input').checked ? '1' : '0')) // 取消
      .replace(/_3/,() => {  // 状態
        let rv = '';
        for( let i=0 ; i<map.label.length ; i++ ){
          const v = document.querySelector('#registerd .edit [name="status0' + (i+1) + '"]').value
          rv += map.status[v];
        }
        return rv;
      })
      .replace(/_4/,() => {
        let rv = '';
        for( let i=0 ; i<map.label.length ; i++ ){
          const v = document.querySelector('#registerd .edit [name="fee0' + (i+1) + '"]').value
          rv += map.fee[v];
        }
        return rv;
      })
      .replace(/_5/,document.querySelector('#registerd .edit .note').innerText);
    console.log('l.693',key);
    doGet(key,editGuest);
    //console.log("editGuest end.",v);
  } else {
    // argにdoGetの結果となるJSON文字列が入っていた場合
    //const result = JSON.parse(arg);
    console.log('l.678',arg);
  }
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

// Err: "Uncaught ReferenceError: jsQR is not defined"
// -> DOMが構築されたときに初期化処理が行われるように設定
// https://pisuke-code.com/jquery-is-not-defined-solution/
window.addEventListener('DOMContentLoaded', function(){
  console.log("EventStaff start.",config);
  initialize();
  changeScreen('home');
});
