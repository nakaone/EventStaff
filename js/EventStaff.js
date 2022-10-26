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

  console.log("changeScreen end.");
}

const doGet = (postData,callback) => {  // GASのdoGetを呼び出し、結果を返す
  console.log("doGet start. ",postData,callback);

  // GASに渡すデータを作成
  const v = encrypt(postData,config.passPhrase);
  dump('v',v);

  // エンドポイントを作成
  const endpoint = 'https://script.google.com/macros/s/〜/exec'
    .replace('〜',config.GASwebAPId) + '?v=' + v;
  dump('endpoint',endpoint);

  // GASからの返信を受けたらcallbackを呼び出し
  fetch(endpoint,{"method": "GET"})
  .then(response => response.json())
  .then(data => {
    console.log("doGet end.",data);
    callback(data);  // 成功した場合、後続処理を呼び出し
  });

}

const initialize = () => {  // 初期設定処理
  console.log("initialize start.");

  const dummy = {};
  Object.assign(definition,dummy);
  console.log('l.69',definition);

  // 初期設定終了時の処理を定義
  const terminate = () => {
    console.log("initialize end.",config);
    changeScreen();// ホーム画面表示
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

  // 初期設定処理の画面を表示
  changeScreen('initialize',"初期化処理");

  // QRコード読み取り
  config.scanCode = true;
  scanCode((code) => {
    const o = JSON.parse(code);
    for( let x in o ){ // グローバル変数configに値を設定
      config[x] = o[x];
    }
    localStorage.setItem('config',JSON.stringify(config));
    alert('初期設定は正常に終了しました');
    terminate();
  },{
    selector:'#initialize .scanner',  // 設置位置指定
    RegExp:new RegExp('^{.+}$'),  // JSON文字列であること
    alert: true,  // 読み込み時、内容をalert表示する
  });
}

const inputSearchKey = () => {  // 参加者の検索キーを入力
  console.log('inputSearchKey start.');

  document.querySelector('header .title').innerText = "登録済参加者処理";
  changeScreen('inputSearchKey','該当者の検索');

  // スキャンまたは値入力時の動作を定義
  const strEl = document.querySelector('#inputSearchKey input');

  // スキャナから読み込まれた文字列をinput欄にセット
  const callback = (arg) => {
    console.log('inputSearchKey.callback start.',arg);
    config.scanCode = false;  // スキャンを停止
    document.querySelector('#inputSearchKey .scanner')
      .innerHTML = ''; // スキャナ用DIV内を除去
    strEl.value = arg;
  };

  // スキャナを起動
  config.scanCode = true;
  scanCode((code) => {
    callback(code);
  },{
    selector:'#inputSearchKey .scanner',  // 設置位置指定
    RegExp:/^[0-9]+$/,  // 数字
    alert: false,  // 読み込み時、内容をalert表示しない
  });

  // キーワード入力欄の値が変わったら検索するよう設定
  strEl.addEventListener('change',() => {
    changeScreen('loading');
    const postData = {
      func: 'search',
      data: {key: convertCharacters(strEl.value,'kata')},
    };
    doGet(postData,(data) => {
      if( data.length === 0 ){
        alert("該当する参加者は存在しませんでした");
      } else if( data.length > 1){
        selectParticipant(data);  // 該当が複数件なら選択画面へ
      } else {
        editParticipant(data[0]);  // 該当が1件のみなら編集画面へ
      }  
    });
  });

  console.log('inputSearchKey end.');
}

const selectParticipant = (arg) => {  // 複数検索結果からの選択
  console.log('selectParticipant start.',arg);
  changeScreen('selectParticipant','該当者リスト');

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
  changeScreen('editParticipant','参加者情報入力');

    // 該当が1件のみなら編集画面へ
    const editArea = document.querySelector('#editParticipant .edit');
    editArea.innerHTML = '';

    // データクレンジング
    arg['受付番号'] = ('000'+arg['受付番号']).slice(-4);  // 0パディング
    arg['登録日時'] = new Date(arg['登録日時']).toLocaleString('ja-JP');
    // 「取消」の文字列が入っていればtrue
    arg['取消'] = arg['取消'].length === 0 ? "無し" : "有り";
    ['','①','②','③'].forEach(x => {
      if( arg[x+'状態'].length === 0 )
        arg[x+'状態'] = arg[x+'氏名'].length === 0 ? '未登録' : '未入場';
      if( arg[x+'参加費'].length === 0 )
        arg[x+'参加費'] = arg[x+'氏名'].length === 0 ? '無し' : '未収';
    });

    // 要素の作成とセット
    let o = genChild(definition.editGuestTemplate,arg,'root');  // 全体の定義と'root'を渡す
    if( toString.call(o.result).match(/Error/) ){  // エラーObjが帰ったら
      throw o.result;
    } else if( o.append ){  // 追加フラグがtrue
      // 親要素に追加
      editArea.appendChild(o.result);

      // 「更新」「破棄」「詳細」ボタンクリック時の処理を定義
      document.querySelector('#editParticipant input[name="update"]')
      .addEventListener(updateParticipant());
      document.querySelector('#editParticipant input[name="cancel"]')
      .addEventListener(changeScreen());
      document.querySelector('#editParticipant .entry input[type="button"]')
      .addEventListener('click', () => {
        const detail = document.querySelector('#editParticipant .detail');
        const button = document.querySelector('#editParticipant .entry input[type="button"]');
        if( button.value === '詳細' ){
          button.value = '閉じる';
          detail.style.display = 'block';
        } else {
          button.value = '詳細';
          detail.style.display = 'none';
        }
      });
      
      // 編集用URLをQRコードで表示
      // https://saitodev.co/article/QRCode.js%E3%82%92%E8%A9%A6%E3%81%97%E3%81%A6%E3%81%BF%E3%81%9F/
      setQRcode('#editParticipant .qrcode',{text:arg['編集用URL']});

      // 「申込フォームを表示」ボタンクリック時の遷移先を定義
      document.querySelector('#editParticipant .form input[type="button"]')
        .onclick = () => window.open(arg['編集用URL'], '_blank');
    }

  console.log('editParticipant end.');
}

const updateParticipant = () => {  // 参加者情報更新
  console.log('updateParticipant start.');

  const sList = {
    status:'#editParticipant [name="status0_"]',
    fee:'#editParticipant [name="fee0_"]',
  };
  const prefix = ['','①','②','③'];

  // 更新用のデータオブジェクトの作成
  const postData = {func:'update',data:{
    target:{
      key: '受付番号',  //更新対象のレコードを特定する為の項目名
      value: Number(document.querySelector("#editParticipant .entryNo")
        .innerText), //キーの値
    } ,
    revice: [],
  }};
  for( let i=0 ; i<4 ; i++ ){
    const s = document.querySelector(sList.status.replace('_',i));
    postData.data.revice.push({
      key: prefix[i]+'状態',  // 更新対象の項目名
      value: s.options[s.selectedIndex].value,  // 更新後の値
    });
    const f = document.querySelector(sList.fee.replace('_',i));
    postData.data.revice.push({
      key: prefix[i]+'参加費',
      value: f.options[f.selectedIndex].value,
    });
  }
  doGet(postData,(data) => {
    // 結果表示
    let result = '<p>以下の変更を行いました。</p>';
    if( data.length > 0 ){
      for( let i=0 ; i<data.length ; i++ ){
        result += '<p>_1 : _2 => _3</p>'
          .replace('_1',data[i].column)
          .replace('_2',data[i].before)
          .replace('_3',data[i].after);
      }
    } else {
      result = '<p>変更点はありませんでした。</p>';
    }
    document.querySelector('#editParticipant .result').innerHTML = result;
    console.log('updateParticipant end.',JSON.stringify(data));
  });
}

const onThatDay = (arg) => { // 参加フォームURLのQRコード表示
  console.log("onThatDay start.",arg);

  // 申請フォームのQRコードをセット
  setQRcode('#onThatDay .qrcode',{
    text: "https://docs.google.com/forms/d/" + config.formId + "/edit",
  });

  // QRコード表示/非表示ボタンにイベント設定
  const btn = document.querySelector('#onThatDay input[type="button"]');
  const qr = document.querySelector('#onThatDay .qrcode');
  btn.addEventListener(() => {
    if( btn.value === 'QRコード表示' ){
      btn.value = 'QRコード非表示';
      qr.style.display = 'block';
    } else {
      btn.value = 'QRコード表示';
      qr.style.display = 'none';
    }
  });

  changeScreen('onThatDay','当日参加対応');
  console.log("onThatDay end.");
}

const showSummary = () => {  // 集計表の表示
  console.log("showSummary start.");
  changeScreen('showSummary','参加状況');
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
