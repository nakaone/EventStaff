/* ===================================================
  汎用ライブラリ
=================================================== */

/**
 * 文字を変換。全角英数字は半角、半角カナは全角、ひらがな<->カタカナは指定
 * @param {string} str - 変換対象文字列
 * @param {string} kana - true:ひらがな、false:カタカナ
 * @returns {string} 変換結果
 *
 * [JavaScript] 全角ひらがな⇔全角カタカナの文字列変換 [コピペ用のメモ]
 * https://neko-note.org/javascript-hiragana-katakana/1024
 * [JavaScript] 全角⇔半角の変換を行う（英数字、カタカナ）
 * https://www.yoheim.net/blog.php?q=20191101
 */
 function convertCharacters(str,kana=true){
  let rv = str;
  // 全角英数字 -> 半角英数字
  rv = rv.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
    return String.fromCharCode(s.charCodeAt(0) - 65248);
  });

  // 半角カタカナ -> 全角カタカナ
  const hankaku = (arg) => {
    const kanaMap = {
      'ｶﾞ': 'ガ', 'ｷﾞ': 'ギ', 'ｸﾞ': 'グ', 'ｹﾞ': 'ゲ', 'ｺﾞ': 'ゴ',
      'ｻﾞ': 'ザ', 'ｼﾞ': 'ジ', 'ｽﾞ': 'ズ', 'ｾﾞ': 'ゼ', 'ｿﾞ': 'ゾ',
      'ﾀﾞ': 'ダ', 'ﾁﾞ': 'ヂ', 'ﾂﾞ': 'ヅ', 'ﾃﾞ': 'デ', 'ﾄﾞ': 'ド',
      'ﾊﾞ': 'バ', 'ﾋﾞ': 'ビ', 'ﾌﾞ': 'ブ', 'ﾍﾞ': 'ベ', 'ﾎﾞ': 'ボ',
      'ﾊﾟ': 'パ', 'ﾋﾟ': 'ピ', 'ﾌﾟ': 'プ', 'ﾍﾟ': 'ペ', 'ﾎﾟ': 'ポ',
      'ｳﾞ': 'ヴ', 'ﾜﾞ': 'ヷ', 'ｦﾞ': 'ヺ',
      'ｱ': 'ア', 'ｲ': 'イ', 'ｳ': 'ウ', 'ｴ': 'エ', 'ｵ': 'オ',
      'ｶ': 'カ', 'ｷ': 'キ', 'ｸ': 'ク', 'ｹ': 'ケ', 'ｺ': 'コ',
      'ｻ': 'サ', 'ｼ': 'シ', 'ｽ': 'ス', 'ｾ': 'セ', 'ｿ': 'ソ',
      'ﾀ': 'タ', 'ﾁ': 'チ', 'ﾂ': 'ツ', 'ﾃ': 'テ', 'ﾄ': 'ト',
      'ﾅ': 'ナ', 'ﾆ': 'ニ', 'ﾇ': 'ヌ', 'ﾈ': 'ネ', 'ﾉ': 'ノ',
      'ﾊ': 'ハ', 'ﾋ': 'ヒ', 'ﾌ': 'フ', 'ﾍ': 'ヘ', 'ﾎ': 'ホ',
      'ﾏ': 'マ', 'ﾐ': 'ミ', 'ﾑ': 'ム', 'ﾒ': 'メ', 'ﾓ': 'モ',
      'ﾔ': 'ヤ', 'ﾕ': 'ユ', 'ﾖ': 'ヨ',
      'ﾗ': 'ラ', 'ﾘ': 'リ', 'ﾙ': 'ル', 'ﾚ': 'レ', 'ﾛ': 'ロ',
      'ﾜ': 'ワ', 'ｦ': 'ヲ', 'ﾝ': 'ン',
      'ｧ': 'ァ', 'ｨ': 'ィ', 'ｩ': 'ゥ', 'ｪ': 'ェ', 'ｫ': 'ォ',
      'ｯ': 'ッ', 'ｬ': 'ャ', 'ｭ': 'ュ', 'ｮ': 'ョ',
      '｡': '。', '､': '、', 'ｰ': 'ー', '｢': '「', '｣': '」', '･': '・'
    };

    const reg = new RegExp('(' + Object.keys(kanaMap).join('|') + ')', 'g');
    return arg
      .replace(reg, function (match) {
          return kanaMap[match];
      })
      .replace(/ﾞ/g, '゛')
      .replace(/ﾟ/g, '゜');
  };
  rv = hankaku(rv);

  // 全角カタカナ <-> 全角ひらがな
  const hRep = (x,offset,string) => { // offset:マッチした位置 string:文字列全部
    //console.log('hRep start.',x,offset,string);
    let rv = String.fromCharCode(x.charCodeAt(0) - 0x60);
    //console.log('hRep end.',rv);
    return rv;
  }
  const toHiragana = (t) => {
    //console.log('toHiragana start.',typeof t, t);
    let rv = t.replace(/[\u30A1-\u30FA]/g,hRep);
    //console.log('toHiragana end.',typeof(rv),rv);
    return rv;
  };

  const kRep = (x,offset,string) => {
    //console.log('kRep start.',x,offset,string);
    let rv = String.fromCharCode(x.charCodeAt(0) + 0x60);
    //console.log('kRep end.',rv);
    return rv;
  }
  const toKatakana = (t) => {
    //console.log('toKatakana start.',typeof t, t);
    let rv = t.replace(/[\u3041-\u3096]/g,kRep);
    //console.log('toKatakana end.',typeof(rv),rv);
    return rv;
  };

  rv = kana ? toHiragana(rv) : toKatakana(rv);
  //console.log('convertCharacters end. rv=',rv);
  return rv;
}

const decrypt = (arg,passPhrase) => { // 対象を復号化
  console.log('decrypt start.\n'+arg);
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
    console.log('decrypt end.\ntype='+whichType(rv)+'\n',rv);
    return rv;
  }
};

const dump = (label,variable) => {  // コンソールに変数の内容出力
  console.log(label
    + ' (type=' +whichType(variable)
    + ', length=' + variable.length + ')\n'
    , variable
  );
}

const encrypt = (arg,passPhrase) => { // 対象を暗号化
  const str = JSON.stringify(arg);
  console.log('encript start.\ntype='+whichType(arg)
    + '\n' + str + '\npassPhrase='+passPhrase);

  //const utf8_plain = CryptoJS.enc.Utf8.parse(str);
  const encrypted = CryptoJS.AES.encrypt( str, passPhrase );  // Obj
  // crypto-jsで複合化するとMalformed UTF-8 data になった件
  // https://zenn.dev/naonao70/articles/a2f7df87f9f736
  const encryptResult = CryptoJS.enc.Base64
    .stringify(CryptoJS.enc.Latin1.parse(encrypted.toString()));

  console.log("encript end.\n"+encryptResult);
  return encryptResult;
};

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
  const userMedia = {audio:false, video:{facingMode: "environment"}};
  navigator.mediaDevices.getUserMedia(userMedia).then((stream)=>{
    video.srcObject = stream;
    video.setAttribute("playsinline", true);
    video.play();
    drawFinder(callback);  // 起動が成功したらdrawFinderを呼び出す
  }).catch(e => {
    alert('カメラを使用できません\n'+e.message);
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

const toggleMenu = (arg=null,opt={}) => {  // メニューの開閉
  // 引数は指定無し(単純開閉切換)またはtrue(強制オープン)
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

const whichType = (arg = undefined) => {
  return arg === undefined ? 'undefined'
   : Object.prototype.toString.call(arg).match(/^\[object\s(.*)\]$/)[1];
}