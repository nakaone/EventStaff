/** webScanner: QRコードや文書をスキャン
 * <br>
 * 指定セレクタ以下にcanvas他の必要な要素を作成してスキャン実行、指定の後続処理を呼び出す。<br>
 * 呼び出す前に`config.scanCode = true`を実行しておくこと。<br>
 * 参考：[jsQRであっさりQRコードリーダ/メーカ](@link https://zenn.dev/sdkfz181tiger/articles/096dfb74d485db)
 */
class webScanner {
  /** constructor
   * @param {object} arg 
   * @param {string} arg.selector - 親要素のCSSセレクタ文字列
   * @param {number} arg.interval - 動画状態で撮像、読み込めなかった場合の時間間隔
   * @param {object} arg.RegExp - QRコードスキャン時、内容が適切か判断
   * @param {boolean} arg.alert - 読み込み完了時に内容をalert表示するか
   * @returns {void} なし
   */
  constructor(arg={}){
    console.log('webScanner.constructor start. opt='+JSON.stringify(arg));

    // デバイスがサポートされているか確認
    if (!('mediaDevices' in navigator) || !('getUserMedia' in navigator.mediaDevices)) {
      const msg = 'デバイス(カメラ)がサポートされていません';
      console.error('webScanner.constructor: '+msg);
      alert(msg);
      return;
    }
  
    this.opt = {   // 未指定設定値に既定値を設定
      selector: arg.selector || '#webScanner',  // 親要素のCSSセレクタ文字列
      //video   : arg.video || false,    // 動画枠の表示/非表示
      //canvas  : arg.canvas || true,    // 撮像結果の表示/非表示
      interval: arg.interval || 0.25,  // 動画状態で撮像、読み込めなかった場合の時間間隔
      RegExp  : arg.RegExp || new RegExp('.+'), // RegExpオブジェクトとして指定
      alert   : arg.alert || false,    // 読み込み完了時に内容をalert表示するか
    }
    console.log('this.opt='+JSON.stringify(this.opt));

    console.log('webScanner.constructor end.');
  }

  /** start: カメラを起動する
   * @param {function} callback - 後続処理
   * @returns {void} なし
   */
  start(callback){
    navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
      },
      audio: false
    }).then(stream => {
      this.video.srcObject = stream;
      this.video.setAttribute("playsinline", true);
      this.video.play();
      this.video.addEventListener("resize", () => {
        // 親要素の横幅に合わせて表示する
        const ratio = this.scanner.clientWidth / this.video.videoWidth;
        const w = this.video.videoWidth * ratio;
        const h = this.video.videoHeight * ratio;
        this.video.width = this.canvas.width = w;
        this.video.height = this.canvas.height = h;
      });
      callback(stream);
    }).catch(e => {
      alert('カメラを使用できません\n'+e.message);
    });
  }

  /** stop: カメラを停止する
   * @param {void} - なし
   * @returns {void} なし
   */
  stop(){
    this.video.srcObject.getVideoTracks().forEach((track) => {
      track.stop();
    });
  }

  /** scanDoc: 文書のスキャン */
  scanDoc(callback){

    // 親要素にカメラやファインダ等の作業用DIVを追加
    this.scanner = document.querySelector(this.opt.selector);
    this.scanner.innerHTML
    = '<video autoplay></video>'
    + '<canvas></canvas>'  // 撮影結果
    + '<div>'  // カメラ操作ボタン
    + '<input type="button" name="undo" value="◀" />'
    + '<input type="button" name="shutter" value="[ ● ]" />'
    + '<input type="button" name="adopt" value="▶" />'
    + '</div>';
    this.video = document.querySelector(this.opt.selector+' video');
    this.video.style.display = 'block';
    this.canvas = document.querySelector(this.opt.selector+' canvas');
    this.canvas.style.display = 'none';
    this.ctx = this.canvas.getContext('2d');

    // カメラ操作ボタン関係の定義
    this.buttons = document.querySelector(this.opt.selector+' div');
    this.buttons.style.display = 'none'; //最初は全部隠蔽
    this.undo = document.querySelector(this.opt.selector+' input[name="undo"]');
    this.undo.disabled = true;  // 再撮影
    this.shutter = document.querySelector(this.opt.selector+' input[name="shutter"]');
    this.shutter.disabled = false;  // シャッター
    this.adopt = document.querySelector(this.opt.selector+' input[name="adopt"]');
    this.adopt.disabled = true;  // 採用

    // 1. スキャナのボタン操作時の定義
    // (1) 再撮影ボタンクリック時
    this.undo.addEventListener('click',(callback) => {
      this.video.style.display = 'block';
      this.canvas.style.display = 'none';
      this.undo.disabled = true;
      this.shutter.disabled = false;
      this.adopt.disabled = true;
    });
    // (2) シャッタークリック時
    this.shutter.addEventListener('click',() => {
      this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
      this.video.style.display = 'none';
      this.canvas.style.display = 'block';
      this.undo.disabled = false;
      this.shutter.disabled = true;
      this.adopt.disabled = false;
    });
    // (3) 採用ボタンクリック時
    this.adopt.addEventListener('click',() => {
      // 正常終了時はスキャナを停止
      this.scanner.innerHTML = '';
      this.stop();
      // canvasからイメージをBASE64で取得
      const imageData = this.canvas.toDataURL('image/png',0.7);
      const postData = {
        timestamp: getJPDateTime(),
        image: imageData,
      }
      fetchGAS({
        from: 'scanDocHtml',
        to:   'scanDoc',
        func: 'scanDoc',
        data: postData,
        callback: res => {
          if( res.isErr ){
            alert(res.message);
          } else {
            console.log('scanDoc normal end.',res);
          }
        }
      });
      // 以下は圧縮検討時のメモ。削除可
      //const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      //imageCompression(imageData,{maxSizeMB:1,maxWidthOrHeight:1280}).then(data => {
      //  this.ctx.putImageData(data,0,0,this.canvas.width,this.canvas.height);

    })

    // 2. カメラ操作ボタンを表示してカメラを起動
    this.buttons.style.display = 'flex';
    this.start(()=>{console.log('Camera getting started!')});
  }

  /** scanQR: QRコードスキャン
   * @param {function} callback - 後続処理
   * @returns {void} なし
   */
  scanQR(callback){
    // 動画撮影用Webカメラを起動
    const userMedia = {audio:false, video:{facingMode: "environment"}};
    navigator.mediaDevices.getUserMedia(userMedia).then((stream)=>{
      video.srcObject = stream;
      video.setAttribute("playsinline", true);
      video.play();
      this.drawFinder(callback);  // 起動が成功したらdrawFinderを呼び出す
    }).catch(e => {
      alert('カメラを使用できません\n'+e.message);
    });
  }
  
  drawFinder(){  // キャンバスに描画する
    // スキャン実行フラグが立っていなかったら終了
    if( !config.scanCode )  return;
    if(video.readyState === video.HAVE_ENOUGH_DATA){
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      this.ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      let img = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
      // このタイミングでQRコードを判定
      let code = jsQR(img.data, img.width, img.height, {inversionAttempts: "dontInvert"});
			if(code){
        console.log('drawFinder: code='+JSON.stringify(code));
        // QRコード読み取り成功
				this.drawRect(code.location);// ファインダ上のQRコードに枠を表示
        if( opt.alert ) alert(code.data);  // alert出力指定があれば出力
        if( code.data.match(opt.RegExp) ){
          // 正しい内容が読み込まれた場合
          callback(code.data);
          config.scanCode = false;
          scanner.innerHTML = ''; // 作業用DIVを除去
        } else {
          // 不適切な、別のQRコードが読み込まれた場合
          alert('不適切なQRコードです。再読込してください。');
          console.log('[scanCode.drawFinder] Error: not match pattern. code='+code.data);
          setTimeout(drawFinder, opt.interval);
        }
			}
    }
    setTimeout(drawFinder, opt.interval);
  }

  drawRect(location){  // ファインダ上のQRコードに枠を表示
    this.drawLine(location.topLeftCorner,     location.topRightCorner);
		this.drawLine(location.topRightCorner,    location.bottomRightCorner);
		this.drawLine(location.bottomRightCorner, location.bottomLeftCorner);
		this.drawLine(location.bottomLeftCorner,  location.topLeftCorner);
  }

  drawLine(begin, end){  // ファインダ上に線を描画
		this.ctx.lineWidth = 4;
		this.ctx.strokeStyle = "#FF3B58";
		this.ctx.beginPath();
		this.ctx.moveTo(begin.x, begin.y);
		this.ctx.lineTo(end.x, end.y);
		this.ctx.stroke();
	}
}

/* ===================================================
  汎用ライブラリ(GAS,JavaScript共通)
=================================================== */

/** convertCharacters: 文字種を変換
 * <br><br>
 * 全角英数字は半角に、半角片仮名は全角に強制的に変換。<br>
 * 全角ひらがな<->全角カタカナは引数(kana)で指定。既定値はひらがなに変換。<br>
 * <br>参考：
 * <ul>
 * <li>[全角ひらがな⇔全角カタカナの文字列変換]{@link https://neko-note.org/javascript-hiragana-katakana/1024}
 * <li>[全角⇔半角の変換を行う(英数字、カタカナ)]{@link https://www.yoheim.net/blog.php?q=20191101}
 * </ul>
 * @param {string} str - 変換対象文字列
 * @param {boolean} kana - true:ひらがな、false:カタカナ
 * @returns {string} 変換結果
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

/** getJPDateTime: 指定日時文字列を作成
 * @param {any} dt - 作成する日時の指定。省略時は現在時刻
 * @param {string} locale - 作成する形式
 * @returns {string} 指定形式＋ミリ秒の日時文字列
 */
function getJPDateTime(dt=null,locale='ja-JP'){
  const tObj = dt === null ? new Date() : new Date(dt);
  return tObj.toLocaleString(locale) + '.' + tObj.getMilliseconds();
}

/** whichType: 変数の型を判定
 * @param {any} arg - 判定対象の変数
 * @returns {string} - 型の名前
 */
const whichType = (arg = undefined) => {
  return arg === undefined ? 'undefined'
   : Object.prototype.toString.call(arg).match(/^\[object\s(.*)\]$/)[1];
}

/* ===================================================
  汎用ライブラリ(JavaScript専用,非GAS)
=================================================== */

/** fetchGAS: GASのdoPostを呼び出し、後続処理を行う
 * <br>
 * 処理内部で使用する公開鍵・秘密鍵はszLib.getUrlKey()で取得。
 * 
 * @param {object}   arg          - 引数
 * @param {string}   arg.from     - 送信側のコード名(平文)
 * @param {string}   arg.to       - 受信側のコード名(平文)
 * @param {string}   arg.func     - GAS側で処理分岐の際のキー文字列
 * @param {any}      arg.data     - 処理対象データ
 * @param {function} arg.callback - GAS処理結果を受けた後続処理
 * @returns {void} なし
 * 
 * @example <caption>使用例</caption>
      const res = fetchGAS({
        from     : 'inputSearchKey',
        to       : 'Master',
        func     : 'candidates',
        data     : {..},
        callback : r => {...},
      });
 */
const fetchGAS = (arg) => {
  console.log("fetchGAS start.",arg);

  const endpoint = config[arg.to];

  // GASからの返信を受けたらcallbackを呼び出し
  fetch(endpoint.url,{
    "method": "POST",
    "body": JSON.stringify({
      passPhrase: endpoint.key,
      from: arg.from,
      to:   arg.to,
      func: arg.func,
      data: arg.data,
    }),
    "Accept": "application/json",
    "Content-Type": "application/json",
  }).then(response => response.json())
  .then(res => {
    console.log("fetchGAS end.",res);
    arg.callback(res);  // 成功した場合、後続処理を呼び出し
  });
}

/** genChild: テンプレートに差込データをセットした要素を生成
 * 
 * @param {object} template - 生成対象となる要素のテンプレート
 * @param {string} template.tag      - タグ
 * @param {string} template.children - 子要素。templateを再帰的に定義
 * @param {string} template.text - テキスト要素。'\t'の部分はvariableの値で置換
 * @param {string} template.skip - 「dObj[skip]=undefined⇒スキップ」の指定<br>例：参加者名が空欄なら名簿行を作成しない
 * @param {string} template.variable - テキスト要素の'\t'に埋め込むdObjの要素(ex.variable='名前'⇒dObj['名前'])
 * @param {string} template.max - 不定回数繰り返す場合、その最大を指定
 * @param {string} template.class - クラス名。三項演算子なら評価結果()
 * @param {string} template.id - setAttributeで設定
 * @param {string} template.type - setAttributeで設定
 * @param {string} template.name - setAttributeで設定
 * @param {string} template.value - setAttributeで設定
 * @param {string} template.accept - setAttributeで設定
 * @param {string} template.capture - setAttributeで設定
 * @param {string} template.width - setAttributeで設定
 * @param {string} template.height - setAttributeで設定
 * @param {string} template.style - setAttributeで設定
 * @param {string} template.onclick - location.hrefする場合の遷移先URL
 * @param {boolean} template.checked - trueならcheckedを追加
 * @param {string} template.opt - tag="select"の場合に作成されるoptions。variableの値が選択された状態になる
 * @param {object} dObj - 実データのオブジェクト
 * @param {string} pFP - パン屑リストの表示名
 * 
 * @returns {object} 処理結果と生成されたノード
 * <ul>
 * <li>append {boolean} - 追加対象となる子要素ならtrue
 * <li>status {string} - 処理結果
 * <ul>
 * <li>'skipped' => テンプレートのskip条件を満たすため、生成を見送った子要素
 * <li>'variable' => テンプレートのtextが未指定なので、変数の値をそのままセット
 * <li>'replaced' => テンプレートのtext指定に基づき、プレースホルダ('\t')に変数の値をセット
 * <li>'fixed' => テンプレートのtext指定にプレースホルダがなく、textをそのままセット(固定文字列)
 * <li>'node' => セットする文字列が指定されていない要素(既定値)
 * </ul>
 * <li>result: 子要素のオブジェクト。エラー時はエラーオブジェクト
 * </ul>
 * 
 * @example <caption>利用例</caption>
 * const template = [
 *   {tag:'div', class:'video', style:opt.video, children:[
 *     {tag:'video', style:'width:100%;'}]},
 *   {tag:'div', class:'camera', style:opt.camera, children:[
 *     {tag:'input', type:'file', accept:"image/*", capture:"camera", name:"file"}]},
 *   {tag:'div', class:'finder', style:opt.finder , children:[
 *     {tag:'canvas', style:'width:100%'},]},
 * ]
 * for( let i=0 ; i<template.length ; i++ ){
 *   let o = genChild(template[i],{},'root');  // 全体の定義と'root'を渡す
 *   if( toString.call(o.result).match(/Error/) ){  // エラーObjが帰ったら
 *     throw o.result;
 *   } else if( o.append ){  // 追加フラグがtrueなら親要素に追加
 *     scanner.appendChild(o.result);
 *   }
 * }
 */
const genChild = (template,dObj,pFP) => {
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

/** sha256: テキストをsha256でハッシュ化
 * 
 * @param {string} text - 暗号化対象のテキスト
 * @param {function} callback - 作成後の後続処理
 * 
 * @returns {void} なし
 */
function sha256(text,callback){
  const sha = async (text) => {
    const uint8  = new TextEncoder().encode(text)
    const digest = await crypto.subtle.digest('SHA-256', uint8)
    return Array.from(new Uint8Array(digest)).map(v => v.toString(16).padStart(2,'0')).join('')
  }
  sha(text).then((hash) => callback(hash));
}