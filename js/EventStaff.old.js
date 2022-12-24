/** Participant: 参加者の検索、情報更新 */
class Participant {

  /** inputSearchKey: 参加者の検索キーを入力
   * 
   */
  inputSearchKey(){
    console.log('inputSearchKey start.');
    changeScreen('inputSearchKey','該当者の検索');
  
    // スキャンまたは値入力時の動作を定義
    const strEl = document.querySelector('#inputSearchKey input[type="text"]');
  
    // スキャナから読み込まれた文字列をinput欄にセット
    const callback = (keyPhrase) => {
      changeScreen('loading');
      config.scanCode = false;  // スキャンを停止
      document.querySelector('#inputSearchKey .scanner')
        .innerHTML = ''; // スキャナ用DIV内を除去
      doGet(config.MasterURL,config.MasterKey,{func:'search',data:{key:keyPhrase}},(data) => {
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
      console.log('scanCode: ' + code);
      strEl.value = code; // 念の為入力欄にもセット
      callback(code);
    },{
      selector:'#inputSearchKey .scanner',  // 設置位置指定
      RegExp:/^[0-9]+$/,  // 数字かチェック
      alert: false,  // 読み込み時、内容をalert表示しない
    });
  
    // キーワード入力欄の値が変わったら検索するよう設定
    document.querySelector('#inputSearchKey input[type="button"]')
    .addEventListener('click',() => {
      const keyPhrase = convertCharacters(strEl.value,false);
      console.log('keyPhrase: '+ strEl.value + ' -> ' + keyPhrase );
      callback(keyPhrase);
    });
  
    console.log('inputSearchKey end.');
  }
  
  /** selectParticipant: 複数検索結果からの選択
   * 
   * @param {*} arg 
   */
  selectParticipant(arg){
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
  
  /** editParticipant: 検索結果の内容編集
   * 
   * @param {*} arg 
   */
  editParticipant(arg){
    console.log('editParticipant start.',arg);
    changeScreen('editParticipant','参加者情報入力');
  
    // 該当が1件のみなら編集画面へ
    const editArea = document.querySelector('#editParticipant .edit');
    editArea.innerHTML = '';
  
    // [01] データクレンジング
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
  
    // [02] 各要素への値設定
  
    // 要素の作成とセット
    let o = genChild(config.editParticipant,arg,'root');  // 全体の定義と'root'を渡す
    if( toString.call(o.result).match(/Error/) ){  // エラーObjが帰ったら
      throw o.result;
    } else if( o.append ){  // 追加フラグがtrue
      // 親要素に追加
      editArea.appendChild(o.result);
  
      // 「詳細」ボタンクリック時の処理を定義
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
  
  /** updateParticipant: 参加者情報更新
   * @param {void} - なし
   */
  updateParticipant(){
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
    doGet(config.MasterURL,config.MasterKey,postData,(data) => {
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

}

/** Broadcast: お知らせへの投稿、配信
 * 
 */
class Broadcast {
  
  constructor(url=config.BroadURL,key=config.BroadKey,interval=config.BroadInterval){
    this.url = url;
    this.key = key;
    this.interval = interval;
    this.startTime = 978274800000;  // 2001/01/01 00:00:00
    console.log('Broad.constructor end.'
      + '\nurl=' + this.url
      + '\nkey=' + this.key
      + '\ninterval=' + this.interval
    );

    // お知らせ画面「投稿する」ボタンの動作を定義
    const postButton = document.querySelector('#home .PostArea input');
    postButton.addEventListener('click',() => {
      const post = document.querySelector('#home .postMessage');
      if( postButton.value === '投稿する' ){
        postButton.value = '閉じる';
        post.style.display = 'block';
      } else {
        postButton.value = '投稿する';
        post.style.display = 'none';
      }
    });

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
  }

  start(){
    this.onGoing = true;
    // スリープ時間も含め一定時間毎に実行
    // https://blog-and-destroy.com/28211
    this.IntervalId = setInterval(() => {
      if( Date.now() > (this.startTime + this.interval - 500) ){
        this.periodical();
        this.startTime = Date.now();
      }
    },this.interval);
    this.periodical();
    console.log('Broad.start'
      + '\nurl=' + this.url
      + '\nkey=' + this.key
      + '\ninterval=' + this.interval
    );
  }

  stop(){
    this.onGoing = false;
    clearInterval(this.IntervalId);
    this.IntervalId = null;
    console.log('Broad.end');
  }

  periodical(){
    console.log('Broad.periodical'
      + '\nurl=' + this.url
      + '\nkey=' + this.key
      + '\ninterval=' + this.interval
    );
    doGet(this.url,this.key,{func:'getMessages',data:{}},(response) => {
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

  /** postMessage: メッセージを投稿
   * 
   */
  postMessage(){
    console.log('postMessage start.');
  
    // 投稿領域を閉める
    document.querySelector('#home .PostArea input').value = '投稿する';
    document.querySelector('#home .postMessage').style.display = 'none';
  
    const msg = {
      timestamp: (()=>{
        const tObj = new Date();
        return tObj.toLocaleString('ja-JP') + '.' + tObj.getMilliseconds();
      })(),
      from: document.querySelector('#home .postMessage [name="from"]').value,
      to: '',
      message: document.querySelector('#home .postMessage [name="message"]').value,
    }
    const toEl = document.querySelector('#home .postMessage [name="to"]');
    const toNum = toEl.selectedIndex;
    msg.to = toEl.options[toNum].value;
  
    doGet(config.BroadURL,config.BroadKey,{func:'postMessage',data:msg},(response) => {
      console.log(response);
      config.Broad.periodical(); // 掲示板を更新
    });
    console.log('postMessage end.',JSON.stringify(msg));
  }
}

const config = {
  Auth:{
    key: '',
    url: 'https://script.google.com/macros/s/AKfycbyDrQRT5MWLl_eyNtg6vYRR-uX1nxq5mqEtfDv5vqYWNi_zbtDkBylHmHo0EHxrBDw-5w/exec',
  },
  editParticipant: {tag:"div", class:"table", children:[
    {tag:"div", class:"tr entry", children:[
      {tag:"div", class:"td entryNo", variable:"受付番号"},
      {tag:"div", class:"td name", children:[
        {tag:"ruby", children:[
          {tag:"rb", variable:"氏名"},
          {tag:"rt", variable:"読み"},
        ]},
      ]},
      {tag:"div", children:[
        {tag:"input", type:"button", value:"詳細"},
      ]},
    ]},
    {tag:"div", class:"tr detail", children:[ // 詳細情報
      {tag:"div", text:"受付日時：\t", variable:"登録日時"},
      {tag:"div", text:"e-mail：\t", variable:"メール"},
      {tag:"div", text:"緊急連絡先：\t", variable:"連絡先"},
      {tag:"div", text:"引取者：\t", variable:"引取者"},
      {tag:"div", text:"備考：\t", variable:"備考"},
      {tag:"div", text:"キャンセル：\t", variable:"取消"},
      {tag:"div", class:"form", children:[
        {tag:"div", text:"申込フォーム："},
        {tag:"div", class:"qrcode"},
        {tag:"input", type:"button", value:"申込フォームの表示"},
      ]},
    ]},
    {tag:"div", class:"tr participant", children:[ // 申請者の状態・参加費
      {tag:"div"},
      {tag:"div"},
      {tag:"div", children:[
        {tag:"label", text:"入退場"},
        {tag:"select", class:"status", name:"status00",
          opt:"未入場,入場済,退場済,不参加,未登録", variable:"状態"},
      ]},
      {tag:"div", children:[
        {tag:"label", text:"参加費"},
        {tag:"select", class:"fee", name:"fee00",
          opt:"未収,既収,免除,無し", variable:"参加費"},
      ]},
    ]},
    {tag:'hr'}, // 以下参加者
    {tag:"div", class:"tr participant", children:[
      {tag:"div", text:"①"},
      {tag:"div", variable:"①氏名"},
      {tag:"div", children:[
        {tag:"label", text:"入退場"},
        {tag:"select", class:"status", name:"status01",
          opt:"未入場,入場済,退場済,不参加,未登録", variable:"①状態"},
      ]},
      {tag:"div", children:[
        {tag:"label", text:"参加費"},
        {tag:"select", class:"fee", name:"fee01",
          opt:"未収,既収,免除,無し", variable:"①参加費"},
      ]},
    ]},
    {tag:"div", class:"tr participant", children:[
      {tag:"div", text:"②"},
      {tag:"div", variable:"②氏名"},
      {tag:"div", children:[
        {tag:"label", text:"入退場"},
        {tag:"select", class:"status", name:"status02",
          opt:"未入場,入場済,退場済,不参加,未登録", variable:"②状態"},
      ]},
      {tag:"div", children:[
        {tag:"label", text:"参加費"},
        {tag:"select", class:"fee", name:"fee02",
          opt:"未収,既収,免除,無し", variable:"②参加費"},
      ]},
    ]},
    {tag:"div", class:"tr participant", children:[
      {tag:"div", text:"③"},
      {tag:"div", variable:"③氏名"},
      {tag:"div", children:[
        {tag:"label", text:"入退場"},
        {tag:"select", class:"status", name:"status03",
          opt:"未入場,入場済,退場済,不参加,未登録", variable:"③状態"},
      ]},
      {tag:"div", children:[
        {tag:"label", text:"参加費"},
        {tag:"select", class:"fee", name:"fee03",
          opt:"未収,既収,免除,無し", variable:"③参加費"},
      ]},
    ]},
  ]},
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
  config.entryNo = Number(document.querySelector('#entryNo input').value);
  const res = fetchGAS({
    from     : 'getEntryNo',
    to       : 'Auth',
    func     : 'auth1A',
    data     : config.entryNo,
    callback : (response) => {
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
    },
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
  const passCode = document.querySelector('#entryNo .passCode input[type="text"]').value;
  const sendData = {  // 認証局へ受付番号とパスコードをPOSTで送る
    func: 'auth2A',
    data: {
      entryNo: config.entryNo,
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
  config.BroadInterval = Number(arg.config.BroadInterval) || 30000;
  console.log('initialize.config',config);

  // 参加者の変更・取消　※Googleのサイトはiframe不可
  document.querySelector('nav a.entryURL').href = config.entryURL;
  // 受付番号表示(QRコード)
  document.querySelector('#dispEntryNo h1').innerText
  = 'No.' + ('000'+config.entryNo).slice(-4);
  setQRcode('#dispEntryNo .qrcode',{
    text:('000'+config.entryNo).slice(-4),
    width: 400,
    height: 400,
  });
  // 進行予定画面
  document.querySelector("#schedule iframe").src = config.TableURL;
  // 校内案内図
  document.querySelector("#VenueMap iframe").src = config.MapURL;
  // サイト案内　※Googleのサイトはiframe不可
  document.querySelector('nav a.noticeSite').href = config.SiteURL;
  // アンケート
  document.querySelector('#enquete .button').innerHTML
  = '<a href="' + config.EnqueteURL + '" class="button" target="_blank">参加者アンケート</a>';

  // menuFlagsに基づくメニューの表示・非表示制御
  [
    {flag:1, selector:'.menu [name="entryURL"]'},
    {flag:2, selector:'.menu [name="dispEntryNo"]'},
    {flag:4, selector:'.menu [name="enquete"]'},
    {flag:16, selector:'.menu [name="ReservationStatus"]'},
    {flag:32, selector:'.menu [name="schedule"]'},
    {flag:64, selector:'.menu [name="VenueMap"]'},
    {flag:128, selector:'.menu [name="noticeSite"]'},
    {flag:256, selector:'#home .PostArea'},
    {flag:512, selector:'.menu [name="SearchPerticipant"]'},
    {flag:1024, selector:'.menu [name="onThatDay"]'},
    {flag:2048, selector:'.menu [name="ParticipationStatus"]'},
    {flag:4096, selector:'.menu [name="CornerOperation"]'},
  ].forEach(x => {
    document.querySelector(x.selector).style.display
    = ( config.menuFlags & x.flag ) > 0 ? 'block' : 'none';
  });

  changeScreen();// ホーム画面表示
  console.log("initialize end.",config);
}

/** periodical: 定期的処理の開始/停止
 * 
 */
const periodical = () => {
  // 掲示板の巡回
  // configの更新
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

const onThatDay = (arg) => { // 参加フォームURLのQRコード表示
  console.log("onThatDay start.",arg);

  // 申請フォームのQRコードをセット
  setQRcode('#onThatDay .qrcode',{
    //text: "https://docs.google.com/forms/d/" + config.formId + "/edit",
    text: config.FormURL,
  });

  // QRコード表示/非表示ボタンにイベント設定
  const btn = document.querySelector('#onThatDay input[type="button"]');
  const qr = document.querySelector('#onThatDay .qrcode');
  btn.addEventListener('click',() => {
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
  console.log("showSummary end.");
}

/** toggleMenu: メニューの開閉
 * 
 * @param {boolean} arg - 無し(単純開閉切換)またはtrue(強制オープン)
 * @param {object} opt - オプション
 * @param {string} opt.openIcon - 「三」アイコンを置く場所(CSSセレクタ)
 * @param {string} opt.closeIcon - 「×」アイコンを置く場所(CSSセレクタ)
 * @param {string} opt.nav - メニューの場所(CSSセレクタ)
 * 
 * @returns {void} なし
 */
 const toggleMenu = (arg=null,opt={}) => {
  console.log('toggleMenu start.',arg);

  // 操作対象要素を取得
  const o = {
    openIcon: opt.openIcon || 'header .openIcon',
    closeIcon: opt.closeIcon || 'header .closeIcon',
    nav: opt.nav || 'nav',
  }
  const openIcon = document.querySelector(o.openIcon); // 「三」アイコン
  const closeIcon = document.querySelector(o.closeIcon); // 「×」アイコン
  const nav = document.querySelector(o.nav);

  const v = {  // 現状をisActiveに取得
    isActive: nav.style.display === 'grid',
  }

  // 行うべき動作を判定。引数無しなら現状の反対
  v.action = arg === null ? !v.isActive : arg;

  if( v.action ){  // 現在閉じているメニューを開く
    openIcon.style.display = 'none';
    closeIcon.style.display = 'flex';
    nav.style.display = 'grid';
  } else {       // 現在開いているメニューを閉じる
    openIcon.style.display = 'flex';
    closeIcon.style.display = 'none';
    nav.style.display = 'none';
  }

  console.log('toggleMenu end.',v);
}

/** 主処理
 * <br>
 * [DOMが構築されたときに初期化処理が行われるように設定]{@link https://pisuke-code.com/jquery-is-not-defined-solution/}
 */
window.addEventListener('DOMContentLoaded', function(){ // 主処理
  // 受付番号入力画面表示
  // getPassCode正常終了時、そこからinitializeを呼び出す
  changeScreen('entryNo','ログイン');
});
