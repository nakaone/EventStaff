/* ===================================================
  汎用ライブラリ
=================================================== */

const doGet = (str,callback) => {  // GASのdoGetを呼び出し、結果を表示する
  console.log("doGet start. str="+str);
  const endpoint =  //GASのAPIのURL。"https://script.google.com/macros/s/〜/exec"
    "https://script.google.com/macros/s/〜/exec"
    .replace("〜",config.GASwebAPId)
    + str;

  // エラー：CORSに引っかかってGASまで届かない
  // Access to fetch at 'https://script.google.com/macros/s/〜/exec?key=xxxx'
  // from origin 'null' has been blocked by CORS policy:
  // No 'Access-Control-Allow-Origin' header is present on the requested resource.
  // If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.

  // 対応：fetchのパラメータに"mode:'no-cors'"を追加
  // [備忘録]　GASのdoPost()にJavaScriptからJSONを渡す方法
  // https://qiita.com/khidaka/items/ebf770591100b1eb0eff
  fetch(endpoint //,{
  //  "method"     : "GET",
  //  "mode"       : "no-cors",}
  )  //APIを使って非同期データを取得する
  .then(response => response.json())
  .then(data => {  // 成功した処理
    // 撮影関係のDIVは隠す
    //document.getElementById("web_qrcode").style.display = "none";
    console.log('l.258',data);
    callback(data);
    /*
    if( data.length === 0 ){
      alert("該当する参加者は存在しませんでした");
    } else if( data.length > 1){
      callback(data);  // 該当が複数件ならまず選択、選択後編集画面へ
    } else {
      callback(data[0]);  // 該当が1件のみなら編集画面へ
    }
    */
  });
  console.log("doGet end.");
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
    ['id','type','name','value','accept','capture'].forEach(x => {
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

const scanCode = (selectorId='scanner', callback) => { /* QRコードのスキャン
  呼び出す前に`config.scanCode = true`を実行しておくこと。
  参考：jsQRであっさりQRコードリーダ/メーカ
  https://zenn.dev/sdkfz181tiger/articles/096dfb74d485db
*/
  // スキャン実行フラグが立っていなかったら終了
  if( !config.scanCode )  return;

  // 初期処理：カメラやファインダ等の作業用DIVを追加
  const template = [
    {tag:'div', class:'video', children:[{tag:'video'}]},
    {tag:'div', class:'camera', children:[
      {tag:'input', type:'file', accept:"image/*", capture:"camera", name:"file"}]},
    {tag:'div', class:'finder', children:[{tag:'canvas'},
    ]},
  ]
  for( let i=0 ; i<template.length ; i++ ){
    let o = genChild(template[i],{},'root');  // 全体の定義と'root'を渡す
    if( toString.call(o.result).match(/Error/) ){  // エラーObjが帰ったら
      throw o.result;
    } else if( o.append ){  // 追加フラグがtrueなら親要素に追加
      scanner.appendChild(o.result);
    }
  }

  const video = document.querySelector('#'+selectorId+' .video video');
  const camera = document.querySelector('#'+selectorId+' .camera input');
  const canvas = document.querySelector('#'+selectorId+' .finder canvas');
  const ctx = canvas.getContext('2d');

  document.querySelector('#'+selectorId+' .camera')
    .style.display = 'none';  // 静止画用カメラは未定義なので隠蔽

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
        callback(code.data);
        config.scanCode = false;
        document.getElementById(selectorId).remove(); // 作業用DIVを除去
			}
    }
    setTimeout(drawFinder, 250);
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

const whichType = (arg = undefined) => {
  return arg === undefined ? 'undefined'
   : Object.prototype.toString.call(arg).match(/^\[object\s(.*)\]$/)[1];
}
