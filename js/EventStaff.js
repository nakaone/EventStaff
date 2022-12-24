const dom = {
  title: document.querySelector('header .title'),
  menuIcon: document.querySelector('header .menuIcon'),
  nav  : document.querySelector('nav'),
  main : document.querySelector('#main'),
};

let config = {
  Auth:{
    url: 'https://script.google.com/macros/s/AKfycbz_dxbC3W0nbSOldTjxvy8jOoFbnbAG9IoMWNnm_MbO01ui0YZg0tdghQmmyW2yaeXW5w/exec',
  }
};

/** initialize: 初期設定
 * @param {void} - なし
 * @returns {void} なし
 */
const initialize = () => {
  console.log('initialize start.');
  config.menu = new Menu(dom);
  config.broadcast = new Broadcast(dom);
  console.log('initialize end.\n'+JSON.stringify(config));
}
/** messageBoard: お知らせ画面表示
 * @param {void} - なし
 * @returns {void} なし
 */
const messageBoard = () => {
  console.log('messageBoard',config);
  config.broadcast.display();
}
/** reception: 受付業務画面表示
 * @param {void} - なし
 * @returns {void} なし
 */
const reception = () => {
  console.log('reception');
  if( !config.reception ){
    config.reception = new Participant(dom);
  }
  config.reception.display();
}
/** cornerOperation: コーナー運営画面表示
 * @param {void} - なし
 * @returns {void} なし
 */
const cornerOperation = () => {
  console.log('cornerOperation');
}
/** entry: 参加受付画面表示
 * @param {void} - なし
 * @returns {void} なし
 * <a href="https://davidshimjs.github.io/qrcodejs/">QRCode.js</a>
 */
const entry = () => {
  console.log('entry');
  dom.title.innerText = '参加受付';
  dom.main.innerHTML = `
    <button>参加者の追加・変更・取消</button>
    <h1>受付番号：`+ config.entryStr + `</h1>
    <div></div>
  `;
  let qrcode = new QRCode(dom.main.querySelector('div'),{
    text: config.entryStr,
    width: 300,
    height: 300,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
  })
}

/** referState: 予約状況参照画面表示
 * @param {void} - なし
 * @returns {void} なし
 */
const referState = () => {
  console.log('referState');
  dom.title.innerText = '予約状況参照';
  dom.main.innerHTML = `
    <h1 style="text-align:center">(未実装)</h1>
  `;
}

/** information: お役立ち情報画面表示
 * @param {void} - なし
 * @returns {void} なし
 */
const information = () => {
  dom.title.innerText = 'お役立ち情報';
  dom.main.innerHTML = `
    <button name="schedule">進行予定</button>
    <button name="venueMap">校内案内図</button>
    <button name="noticeSite">募集要項</button>
  `;
  dom.main.querySelector('button[name="schedule"]').onclick = () => {
    window.open(config.public.TableURL,'_blank');
  };
  dom.main.querySelector('button[name="venueMap"]').onclick = () => {
    window.open(config.public.MapURL,'_blank');
  };
  dom.main.querySelector('button[name="noticeSite"]').onclick = () => {
    window.open(config.public.SiteURL,'_blank');
  };
}

/** enquete: 参加者アンケート画面表示
 * @param {void} - なし
 * @returns {void} なし
 */
const enquete = () => {
  dom.title.innerText = '参加者アンケート';
  dom.main.innerHTML = `
    <p>本日参加された感想を是非以下にお寄せください。</p>
    <button>参加者アンケート</button>`;
  dom.main.querySelector('button').onclick = () => {
    window.open(config.public.EnqueteURL,'_blank');
  };
}

/** system: システム設定画面表示
 * @param {void} - なし
 * @returns {void} なし
 */
const system = () => {
  dom.title.innerText = 'システム設定';
  initClass(dom.main,'system');
  dom.main.innerHTML = '';

  // 掲示板他の定期的処理停止・再開
  if( (config.private.menuFlags & 16384) > 0 ){
    const o = genChild({tag:'div', children:[
      {tag:'h1', text:'定期的処理の停止・再開'},
      {tag:'input', type:'button', value:'再開', name:'start'},
      {tag:'input', type:'button', value:'停止', name:'stop'},
    ]},{},'root');
    if( toString.call(o.result).match(/Error/) ){  // エラーObjが帰ったら
      throw o.result;
    } else if( o.append ){  // 追加フラグがtrueなら親要素に追加
      dom.main.appendChild(o.result);
    }
    
  }

  // ヘルプ
  if( (config.private.menuFlags & 32768) > 0 ){
    const o = document.createElement('div');
    o.innerHTML = '<h1>ヘルプ</h1>'
    + '<details><summary>[Android]カメラを使おうとすると「使用できません」と表示される</summary>'
    +   '<p>ブラウザにカメラを使用する権限が付与されていない場合に表示されます。対応は以下の通りです(<a href="https://support.google.com/android/answer/9431959?hl=ja" target="_blank">出典</a>)。</p>'
    +   '<ol>'
    +     '<li>設定 > アプリ > 変更するアプリ(ブラウザ)を選択 > 権限 > カメラ</li>'
    +     '<li>「許可しない」から「アプリの使用中のみ許可」または「毎回確認する」に変更</li>'
    +   '</ol>'
    + '</details>';
    dom.main.appendChild(o);
  }

  // おまつり奉行について
  const o = document.createElement('div');
  o.innerHTML = '<h1>おまつり奉行について</h1>'
  + '<p>about OMATSURI-Bugyo</p>'
  + '<p>version: 1.1.0 (Dec.13,2022 released)</p>'
  + '<p>author : <a mailto="nakaone.kunihiro@gmail.com"><ruby><rb>嶋津　邦浩</rb><rt>2-2ゆうなパパ</rt></ruby></a> (Shimazu Kunihiro)</p>'
  + '<p>License: <a href="https://opensource.org/licenses/mit-license.php" target="_blank">MIT</a></p>';
  dom.main.appendChild(o);
}

window.addEventListener('DOMContentLoaded', function(){
  const debugMode = 1; // 0:通常, 1:スタッフ, 2:参加者
  if( debugMode === 0 ){
    // 受付番号入力画面表示
    // getPassCode正常終了時、そこからinitializeを呼び出す
    const auth = new Auth(dom);
  } else {
    config = debugMode === 1
    ? {
        "Auth":{"url":"https://script.google.com/macros/s/AKfycbzjsxwmNmR9TV2wswNuUVZDOUIOYVGNGiA02hh74_BwNTzArExR21wVPYFOSLdBNe67BQ/exec"},
        "entryNo":1,
        "entryStr":"0001",
        "private":{"タイムスタンプ":"2022-10-09T04:34:42.211Z","メールアドレス":"shimokitasho.oyaji@gmail.com","申請者氏名":"奥田　美香","申請者氏名読み":"オクダ　ミカ","申請者はイベントに参加しますか？":"参加する","参加者①氏名":"太郎","参加者①氏名読み":"タロウ","参加者①所属":"未就学児","参加者②氏名":"二郎","参加者②氏名読み":"ジロウ","参加者②所属":"1年","参加者③氏名":"","参加者③氏名読み":"","参加者③所属":"","緊急連絡先":"","引取者氏名":"","備考":"","キャンセル":"","cancel":"1","participate00":"1","entryNo":"1","editURL":"https://docs.google.com/forms/d/e/1FAIpQLSfIJ4IFsBI5pPXsLz2jlTBczzIn8QZQL4r6QHqxZmSeDOhwUA/viewform?edit2=2_ABaOnufCYALGfSCCaKbN4LDLlq9n6oTS8MfbMXvMVGeqH9hcsqj47n1z3eUW-muVZIhFFjg","application":"","PIC":"","passCode":"27467","passTime":"2022-12-06T06:06:51.655Z","manualMF":"57119","menuFlags":"57119","manualAL":"14","AuthLevel":"14","name00":"奥田　美香","yomi00":"オクダ　ミカ","category00":"保護者","status00":"","fee00":"","name01":"太郎","yomi01":"タロウ","category01":"未就学児","status01":"","fee01":"","name02":"二郎","yomi02":"ジロウ","category02":"1年","status02":"","fee02":"","name03":"","yomi03":"","category03":"","status03":"","fee03":""},
        "Broad":{"level":2,"key":"xGq8kdob7NQXvCG3Jbcil9K-q9HIgJgUO727BfptbUIZXvFX05uJB0CSZHVMb","url":"https://script.google.com/macros/s/AKfycbxpfiilYN0-yZ7o9GnbQUlc4nTT8k3qtTE2o-6AJY_818TJj0Vt42Vqmiv87003SXeT8w/exec"},
        "Reserve":{"level":4},
        "Master":{"level":8,"key":"_WGbHipKdOeuFydHpbz2yzjBmnFNqHYuhAvyMy1QcX5BQgyLl","url":"https://script.google.com/macros/s/AKfycbzlZduU6mgFfQa-J1EBHtOc6sUWJw0cDjVgLIgeEp8WigrGhDNKM7H_LWaHO97gNqfF5w/exec","validTime":3600000},
        "public":{"level":65535,"interval":30000,"Administrator":"shimokitasho.oyaji@gmail.com","FormId":"1hnQLsY3lRh0gQMGfXoJJqAL_yBpKR6T0h2RFRc8tUEA","FormURL":"https://docs.google.com/forms/d/e/1FAIpQLSfIJ4IFsBI5pPXsLz2jlTBczzIn8QZQL4r6QHqxZmSeDOhwUA/viewform","SiteURL":"https://sites.google.com/view/shimokita-oyaji/home/archives/20221001-%E6%A0%A1%E5%BA%AD%E3%83%87%E3%82%A4%E3%82%AD%E3%83%A3%E3%83%B3%E3%83%97","MapURL":"materials/map.html","TableURL":"materials/timetable/WBS.html","EnqueteURL":"https://docs.google.com/forms/d/16r3luYQRiLVmI9xqaD4FuaSlUqTRGvI8nAGrjGcg8lc/viewform"},
        "Agent":{"key":"pSp2*ZR_S/GXr9C5","url":"https://script.google.com/macros/s/AKfycbwp2TuQPRhg9p-rbO-9iljdacPBZ_F6vNPoDEjckAuvEbSjeXLHKtLYA4YK4_P_Ped9/exec"}
      }
    : {
        "Auth":{"url":"https://script.google.com/macros/s/AKfycbz_dxbC3W0nbSOldTjxvy8jOoFbnbAG9IoMWNnm_MbO01ui0YZg0tdghQmmyW2yaeXW5w/exec"},
        "entryNo":2,
        "entryStr":"0002",
        "private":{"タイムスタンプ":"2022-10-09T04:39:20.911Z","メールアドレス":"shimokitasho.oyaji@gmail.com","申請者氏名":"榎田　道子","申請者氏名読み":"エノキダ　ミチコ","申請者はイベントに参加しますか？":"参加する","参加者①氏名":"","参加者①氏名読み":"","参加者①所属":"","参加者②氏名":"","参加者②氏名読み":"","参加者②所属":"","参加者③氏名":"","参加者③氏名読み":"","参加者③所属":"","緊急連絡先":"","引取者氏名":"","備考":"","キャンセル":"","cancel":"1","participate00":"1","entryNo":"2","editURL":"https://docs.google.com/forms/d/e/1FAIpQLSfIJ4IFsBI5pPXsLz2jlTBczzIn8QZQL4r6QHqxZmSeDOhwUA/viewform?edit2=2_ABaOnucIuwg3VQQ89wjGMjOrBzL9Ko6Yd_-VRLBvabY6pcLfvOC1MGlrA29XPym2rtomwwQ","application":"","PIC":"","passCode":"469555","passTime":"2022-12-06T06:09:22.880Z","manualMF":"","menuFlags":"32449","manualAL":"","AuthLevel":"4","name00":"榎田　道子","yomi00":"エノキダ　ミチコ","category00":"保護者","status00":"","fee00":"","name01":"","yomi01":"","category01":"","status01":"","fee01":"","name02":"","yomi02":"","category02":"","status02":"","fee02":"","name03":"","yomi03":"","category03":"","status03":"","fee03":""},
        "Reserve":{"level":4},
        "public":{"level":65535,"interval":30000,"Administrator":"shimokitasho.oyaji@gmail.com","FormId":"1hnQLsY3lRh0gQMGfXoJJqAL_yBpKR6T0h2RFRc8tUEA","FormURL":"https://docs.google.com/forms/d/e/1FAIpQLSfIJ4IFsBI5pPXsLz2jlTBczzIn8QZQL4r6QHqxZmSeDOhwUA/viewform","SiteURL":"https://sites.google.com/view/shimokita-oyaji/home/archives/20221001-%E6%A0%A1%E5%BA%AD%E3%83%87%E3%82%A4%E3%82%AD%E3%83%A3%E3%83%B3%E3%83%97","MapURL":"materials/map.html","TableURL":"materials/timetable/WBS.html","EnqueteURL":"https://docs.google.com/forms/d/16r3luYQRiLVmI9xqaD4FuaSlUqTRGvI8nAGrjGcg8lc/viewform"},
        "Agent":{"key":"pSp2*ZR_S/GXr9C5","url":"https://script.google.com/macros/s/AKfycbwp2TuQPRhg9p-rbO-9iljdacPBZ_F6vNPoDEjckAuvEbSjeXLHKtLYA4YK4_P_Ped9/exec"}
      };
    initialize();
  }
});