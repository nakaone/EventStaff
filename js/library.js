/* ===================================================
  汎用クラス
=================================================== */
class cipher {  // 変数をAES暗号化文字列に変換

  constructor(passPhrase){
    this.passPhrase = passPhrase;
  }

  encrypt(arg){
    const str = JSON.stringify(arg);
    console.log('cipher.encript start.\ntype='+whichType(arg)+'\n'+str);

    //const utf8_plain = CryptoJS.enc.Utf8.parse(str);
    const encrypted = CryptoJS.AES.encrypt( str, this.passPhrase );  // Obj
    // crypto-jsで複合化するとMalformed UTF-8 data になった件
    // https://zenn.dev/naonao70/articles/a2f7df87f9f736
    const encryptResult = CryptoJS.enc.Base64
      .stringify(CryptoJS.enc.Latin1.parse(encrypted.toString()));

    console.log("cipher.encript end.\n"+encryptResult);
    return encryptResult;
  }

  decrypt(arg){
    console.log('cipher.decrypt start.\n'+arg);
    const decodePath = decodeURIComponent(arg);
    const data = CryptoJS.enc.Base64
      .parse(decodePath.toString()).toString(CryptoJS.enc.Latin1);
    const bytes = CryptoJS.AES.decrypt(data, this.passPhrase)
      .toString(CryptoJS.enc.Utf8)

    let rv = null;
    try {
      rv = JSON.parse(bytes);
    } catch(e) {
      rv = bytes;
    } finally {
      console.log('cipher.decrypt end.\ntype='+whichType(rv)+'\n',rv);
      return rv;
    }

    /*const decrypted = CryptoJS.AES.decrypt( arg , this.passPhrase );
    const txt_dexrypted = decrypted.toString(CryptoJS.enc.Utf8);
    return txt_dexrypted;*/
  }
}

/* ===================================================
  汎用ライブラリ
=================================================== */
const doGet = (query,callback) => {  // GASのdoGetを呼び出し、結果を表示する
  console.log("doGet start. query="+query);
  const endpoint =  //GASのAPIのURL。"https://script.google.com/macros/s/〜/exec"
    "https://script.google.com/macros/s/〜/exec"
    //.replace("〜",config.GASwebAPId)
    .replace("〜","AKfycbwOniHTTXL9Ilq55csskVm2XXYlr0m0xYIlbjtw_qosH0-CxO7jRyIg3T4oFxIgJn_-eA")
    + query;

  fetch(endpoint,{
    "method": "GET",
    "mode": "no-cors",
    //"Accept": "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
  })
  .then(response => response.json())
  .then(data => {  // 成功した処理
    console.log('doGet data: type='+whichType(data)+', length='+data.length+'\n'+JSON.stringify(data));
    callback(data);
  });
  console.log("doGet end.");
}

const doPost = (obj,callback) => {
  // [備忘録]　GASのdoPost()にJavaScriptからJSONを渡す方法
  // https://qiita.com/khidaka/items/ebf770591100b1eb0eff
  //const URL = config.GASwebAPId;
  const URL = "https://script.google.com/macros/s/AKfycbx9wfFviwrj5vMtA1vmgjMUoSVwdyGpUukFB9PI_66HFQnZRC1rGaYxMWVJ91TZeW4vUQ/exec";
  const postData = {
    "method"     : "POST",
    "mode"       : "no-cors",
    "Content-Type" : "application/x-www-form-urlencoded",
    "body" : JSON.stringify(obj)
  };

  fetch(URL,postData)
  .then(response => response.json)  //  JavaScript のオブジェクトを生成
  .then(data => {  // 成功した処理
    console.log('doPost success.\n'
      + 'type=' + whichType(data)
      + '\nlength=' + data.length
      + '\n' + JSON.stringify(data)
      , data
    );
    callback(data);
  })
  .finally(() => {
    console.log('doPost end.');    
  })
}

const genChild = (template,dObj,pFP) => {  /* テンプレートに差込データをセットした要素を生成
  引数
    template [hash]x1 : 生成対象となる要素のテンプレート。書式はtemplateの項参照。
    dObj [hash]x1 : 差込データ。ラベルを変数名として扱う。階層化は不可
    pFP [string]x1     : フットプリント文字列(parent foot print)
  戻り値: ハッシュ。以下はそのメンバ
    append [boolean]: 追加対象となる子要素ならtrue
    status: 'skipped' => テンプレートのskip条件を満たすため、生成を見送った子要素
            'variable' => テンプレートのtextが未指定なので、変数の値をそのままセット
            'replaced' => テンプレートのtext指定に基づき、プレースホルダ('\t')に変数の値をセット
            'fixed' => テンプレートのtext指定にプレースホルダがなく、textをそのままセット(固定文字列)
            'node' => セットする文字列が指定されていない要素(既定値)
    result: 子要素のオブジェクト。エラー時はエラーオブジェクト
  使用方法
    let o = genChild(template,dObj,'root');  // 全体の定義と'root'を渡す
    if( toString.call(o.result).match(/Error/) ){  // エラーObjが帰ったら
      throw o.result;
    } else if( o.append ){  // 追加フラグがtrueなら親要素に追加
      container.appendChild(o.result);
    }
  */

  let rv = {append:true, status:'node', result:null};  // catch節でも使用する変数を、try節の前で宣言
  try {

    /* ========================================
      1.前処理
    ======================================== */
    // 1.1.テンプレートの定義(メンバ)がundefinedにならないよう初期値を設定し、
    //     'sDef'とする(structure definition)
    const sDef = {  // template.specにある、文書構造定義に使用される項目
      tag:'', children:[], text:'', skip:'', variable:'', max:0,
      class:'', // 生成される要素(タグ)に指定する属性(現在classのみ)
      ...template  // 既定値を指定値で上書き
    };

    // 1.2.現在の位置を示すパンくずリスト文字列を生成(current foot print)
    const cFP = pFP + ' > '
      + (sDef.tag.length === 0 ? '(no tag)' : sDef.tag)
      + (sDef.class.length > 0 ? '.'+sDef.class : '');
    console.log('genChild start: ' + cFP + '\n');

    // 1.3.内部関数の定義
    const addSeqNo = (cDef,no) => {
      if( cDef.skip && cDef.skip !== '' ) cDef.skip += '_' + no;
      if( cDef.variable && cDef.variable !== '' ) cDef.variable += '_' + no;
      if( cDef.children && cDef.children.length > 0 ){
        for( let i=0 ; i<cDef.children.length ; i++ )
          addSeqNo(cDef.children[i],no);
      }
    };

    if( sDef.skip.length > 0 && dObj[sDef.skip] && dObj[sDef.skip].length === 0 ){
      return {append:false, status:'skipped', result:null};
    }

    /* ========================================
      2. 自要素の作成
    ======================================== */

    // 2.1.dObj[skip]が空なら作成不要
    if( sDef.skip.length > 0 ){
      console.log('l.176 dObj['+sDef.skip+']='+dObj[sDef.skip]
      + ', length='+String(dObj[sDef.skip]).length);
      if( dObj[sDef.skip] !== undefined ){
        if( String(dObj[sDef.skip]).length === 0 ){
          console.log('genChild skipped: '+cFP);
          return {append:false, status:'skipped', result:null};
        }
      }
    }

    // 2.2.中の文字列をstrとして作成
    let str = '';
    if( sDef.text.length === 0 ){
      if( dObj[sDef.variable] !== undefined ){
        rv.status = 'variable';
        str = dObj[sDef.variable];
      }
    } else {
      if( sDef.text.match(/\t/) ){
        if( dObj[sDef.variable] !== undefined ){
          rv.status = 'replaced';
          str = sDef.text.replace(/\t/g,dObj[sDef.variable]);
        }
      } else {
        rv.status = 'fixed';
        str = sDef.text;
      }
    }

    // 2.3.自要素(element)の生成
    if( sDef.tag.length > 0 ){
      rv.result = document.createElement(sDef.tag);
      if( str )
        rv.result.appendChild(document.createTextNode(str));
    } else {
      rv.result = document.createTextNode(str);
    }
    //console.log('l.216 rv',rv.result);

    // 2.4.自要素に属性を追加
    if( sDef.class && sDef.class.length > 0 ){
      /* sDef.classが三項演算子の場合、評価結果をクラスとする。
        それ以外は文字列としてそのまま適用 */
      rv.result.className = sDef.class.match(/.+\?.+:.+/)
        ? eval(sDef.class) : sDef.class;
    }
    ['id','type','name','value','accept','capture','width','height','style'].forEach(x => {
      if( sDef[x] && sDef[x].length > 0 ){
        rv.result.setAttribute(x,sDef[x]);
      }
    });
    if( sDef.onclick && dObj[sDef.onclick] ){
      // ボタンクリックで遷移
      rv.result.setAttribute('onclick',"location.href='_'".replace('_',dObj[sDef.onclick]));
    }
    if( sDef.checked && dObj[sDef.checked] ){
      // dObj[sDef.checked]がtrueならcheckedを追加
      rv.result.checked = true;
    }
    if( sDef.tag === 'select' ){  // select文の場合、子要素としてoptionを作成
      const options = sDef.opt.split(',');
      for( let i=0 ; i<options.length ; i++ ){
        let opt = document.createElement('option');
        opt.value = options[i];
        opt.appendChild(document.createTextNode(options[i]));
        if( options[i] === dObj[sDef.variable] ){
          opt.selected = true;
        }
        rv.result.appendChild(opt);
      }
    }
    //console.log('l.225 rv',rv.result);

    /* ========================================
      3. 子要素の作成
    ======================================== */
    for( let i=0 ; i<(sDef.max === 0 ? 1 : sDef.max) ; i++ ){
      const cDef = JSON.parse(JSON.stringify(sDef));
      if( cDef.max > 0 )
        addSeqNo(cDef,i);  // 不定項目の場合、子孫全部ラベルを書き換え
      for( let j=0 ; j<cDef.children.length ; j++ ){
        const o = genChild(cDef.children[j],dObj,cFP);
        if( o.append ) rv.result.appendChild(o.result);
      }
    }
    //console.log('l.239 rv',rv.result);

    /* ========================================
      5. 結果表示して作成した要素を返す
    ======================================== */
    console.log('genChild end: '+cFP+'\n',rv);
    return rv;

  } catch(e) {
    console.error(e);
    return rv;
  }
};

const scanCode = (callback, arg={}) => { /* QRコードのスキャン
  呼び出す前に`config.scanCode = true`を実行しておくこと。
  参考：jsQRであっさりQRコードリーダ/メーカ
  https://zenn.dev/sdkfz181tiger/articles/096dfb74d485db
*/
  // スキャン実行フラグが立っていなかったら終了
  if( !config.scanCode )  return;

  const opt = {   // 未指定設定値に既定値を設定
    selector: arg.selector || '#scanCode',  // 親要素のCSSセレクタ文字列
    video   : arg.video || false,    // 動画枠の表示/非表示
    camera  : arg.camera || false,   // 静止画の表示/非表示
    finder  : arg.finder || true,    // 撮像結果の表示/非表示
    interval: arg.interval || 0.25,  // 動画状態で撮像、読み込めなかった場合の時間間隔
    RegExp  : arg.RegExp || new RegExp('.+'), // RegExpオブジェクトとして指定
    alert   : arg.alert || false,    // 読み込み完了時に内容をalert表示するか
  }

  // 初期処理：カメラやファインダ等の作業用DIVを追加
  // 親要素の取得、幅を指定
  const scanner = document.querySelector(opt.selector);
  //scanner.style.width = opt.width;
  // 作業用DIVのスタイル指定
  ['video','camera','finder'].forEach(x => {
    opt[x] = 'width:100%; display:' + ( opt[x] ? 'flex' : 'none' );
  })
  const template = [
    {tag:'div', class:'video', style:opt.video, children:[
      {tag:'video', style:'width:100%;'}]},
    {tag:'div', class:'camera', style:opt.camera, children:[
      {tag:'input', type:'file', accept:"image/*", capture:"camera", name:"file"}]},
    {tag:'div', class:'finder', style:opt.finder , children:[
      {tag:'canvas', style:'width:100%'},]},
  ]
  for( let i=0 ; i<template.length ; i++ ){
    let o = genChild(template[i],{},'root');  // 全体の定義と'root'を渡す
    if( toString.call(o.result).match(/Error/) ){  // エラーObjが帰ったら
      throw o.result;
    } else if( o.append ){  // 追加フラグがtrueなら親要素に追加
      scanner.appendChild(o.result);
    }
  }  

  const video = document.querySelector(opt.selector+' .video video');
  const camera = document.querySelector(opt.selector+' .camera input');
  const canvas = document.querySelector(opt.selector+' .finder canvas');
  const ctx = canvas.getContext('2d');

  // 動画撮影用Webカメラを起動
  const userMedia = {video: {facingMode: "environment"}};
  navigator.mediaDevices.getUserMedia(userMedia).then((stream)=>{
    video.srcObject = stream;
    video.setAttribute("playsinline", true);
    video.play();
    drawFinder(callback);  // 起動が成功したらdrawFinderを呼び出す
  });

  const drawFinder = () => {  // キャンバスに描画する
    // スキャン実行フラグが立っていなかったら終了
    if( !config.scanCode )  return;
    if(video.readyState === video.HAVE_ENOUGH_DATA){
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      let img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      // このタイミングでQRコードを判定
      let code = jsQR(img.data, img.width, img.height, {inversionAttempts: "dontInvert"});
			if(code){
        // QRコード読み取り成功
				drawRect(code.location);// ファインダ上のQRコードに枠を表示
        console.log(code.data,callback);
        if( opt.alert ) alert(code.data);  // alert出力指定があれば出力
        if( code.data.match(opt.RegExp) ){
          // 正しい内容が読み込まれた場合
          callback(code.data);
          config.scanCode = false;
          scanner.innerHTML = ''; // 作業用DIVを除去
        } else {
          // 不適切な、別のQRコードが読み込まれた場合
          alert('不適切なQRコードです。再読込してください。');
          setTimeout(drawFinder, opt.interval);
        }
			}
    }
    setTimeout(drawFinder, opt.interval);
  }

  const drawRect = (location) => {  // ファインダ上のQRコードに枠を表示
    drawLine(location.topLeftCorner,     location.topRightCorner);
		drawLine(location.topRightCorner,    location.bottomRightCorner);
		drawLine(location.bottomRightCorner, location.bottomLeftCorner);
		drawLine(location.bottomLeftCorner,  location.topLeftCorner);
  }

  const drawLine = (begin, end) => {  // ファインダ上に線を描画
		ctx.lineWidth = 4;
		ctx.strokeStyle = "#FF3B58";
		ctx.beginPath();
		ctx.moveTo(begin.x, begin.y);
		ctx.lineTo(end.x, end.y);
		ctx.stroke();
	}

}

const setQRcode = (selector,opt) => {  // QRコードを指定位置にセット
  // https://saitodev.co/article/QRCode.js%E3%82%92%E8%A9%A6%E3%81%97%E3%81%A6%E3%81%BF%E3%81%9F/
  
  const qrDiv = document.querySelector(selector);
  qrDiv.innerHTML = ""; // Clear
  new QRCode(qrDiv,{  // 第一引数のqrcodeはCSSセレクタ
    text: opt.text,
    width: opt.width || 200,  // QRコードの幅と高さ
    height: opt.height || 200,
    colorDark: opt.colorDark || "#000000",
    colorLight: opt.colorLight || "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
}

const whichType = (arg = undefined) => {
  return arg === undefined ? 'undefined'
   : Object.prototype.toString.call(arg).match(/^\[object\s(.*)\]$/)[1];
}

const toggleMenu = (arg=null) => {  // メニューの開閉
  // 引数は指定無し(単純開閉切換)またはtrue(強制オープン)
  console.log('toggleMenu start.',arg);

  // 操作対象要素を取得
  const openIcon = document.querySelector('header .open'); // 「三」アイコン
  const closeIcon = document.querySelector('header .close'); // 「×」アイコン
  const nav = document.querySelector('nav');

  const v = {  // 現状をisActiveに取得
    isActive: nav.style.display === 'grid',
  }

  // 行うべき動作を判定。引数無しなら現状の反対
  v.action = arg === null ? !v.isActive : arg;

  const open = 'flex';
  const close = 'none';
  if( v.action ){  // 現在閉じているメニューを開く
    openIcon.style.display = close;
    closeIcon.style.display = open;
    nav.style.display = open;
  } else {       // 現在開いているメニューを閉じる
    openIcon.style.display = open;
    closeIcon.style.display = close;
    nav.style.display = close;
  }

  console.log('toggleMenu end.',v);
}