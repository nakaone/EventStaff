/** getUrl: おまつり奉行関係のAPI URLを返す
 * <br>
 * @param {string} arg - 局/htmlのコード名
 * @return {object|string} APIのURLと共通鍵。引数がない場合は共通鍵
 */
 function getUrl(arg){
  const list = {
    key: "Hrwr7MvnTUv_vh4DyTuxddznVEjzi5UHSiRLrlrwUiXD5b6lx82FZO6t",
    scanDoc: 'https://script.google.com/macros/s/AKfycbwgcdpGuqWRqZBlXHPuaHI2AQcyHnRctmzBRzwCasa3WBak8ayM7-dDbHyd2Ii5GVPWsw/exec',
    GasPost: 'https://script.google.com/macros/s/AKfycbxo0SNEOcsjzi5UHSiRLrlrwUiXD5b6lx82FZO6tnw4-0ae5yosZA1oClCqKYdLNFfZEw/exec',
  }
  return arg ? {key:list.key,url:list[arg]} : list.key;
}

function elaps(arg,result=''){
  SpreadsheetApp.openById("1V-9LgZlRDhuHUgKdDdUvJHu34FAi6hEwe2cAcPbz2TA").getSheetByName("log").appendRow([
    getJPDateTime(arg.startTime),   // timestamp
    arg.account,     // account
    arg.department,  // department
    arg.func,        // function/method
    Date.now() - arg.startTime + 140, // elaps
    result          // result
  ]);
}

/** getJPDateTime: yyyy-MM-ddThh:mm:ss.nnnZ形式で日本時間の日時文字列を取得
 * @param {void} - なし
 * @returns {string} yyyy/MM/dd hh:mm:ss.nnn形式で日本時間の日時文字列
 */
const getJPDateTime = (arg) => {
  const tObj = arg ? new Date(arg) : new Date();
  return tObj.toLocaleString('ja-JP') + '.' + tObj.getMilliseconds();
}

/** getSheetData: 指定シートから全データ取得
 * @param {string} sheetName - 取得対象シート名
 * @param {string} spreadId - スプレッドシートID。コンテナ以外のシートを開く場合に指定
 * @returns {object} 取得したシートのデータ
 * <ul>
 * <li>rows   {array[]}  - 取得した生データ(二次元配列)
 * <li>keys   {string[]} - ヘッダ行(1行目固定)の一次元配列
 * <li>data   {object[]} - データ行を[{ラベル1:値, ラベル2:値, ..},{..},..]形式にした配列
 * <li>sheet  {object}   - getSheetで取得したシートのオブジェクト
 * <li>lookup {function} - メソッド。(key,value)を引数に、項目名'key'の値がvalueである行Objを返す
 * <ul>
 */
function getSheetData(sheetName='マスタ',spreadId){
  console.log('szLib.getSheetData start. sheetName='+sheetName);

  let sheet;
  if( spreadId ){
    sheet = SpreadsheetApp.openById(spreadId).getSheetByName(sheetName);
  } else {
    sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  }
  // JSONオブジェクトに変換する
  const rows = sheet.getDataRange().getValues()
    .filter(row => row.join('').length > 0);  // 空白行は削除
  const keys = rows.splice(0, 1)[0];  // ヘッダを一次元配列で取得
  const data = rows.map(row => {  // [{ラベル1:値, ラベル2:値, ..},{..},..]形式
    const obj = {};
    row.map((item, index) => {
      obj[String(keys[index])] = String(item);
    });
    return obj;
  });
  /* lookupメソッドテスト
  const lookupTest = () => {
    const spreadId = '1y4FjpKJVE5zhwgK68IKiahy6Pm3v_PNigkcgDFW2YpE';
    const dObj = getSheetData('郵便局初期化',spreadId);
    console.log(JSON.stringify(dObj));
    console.log(dObj.lookup('parameters','template'));
  }  */
  const rv = {rows:rows, keys:keys, data:data, sheet:sheet,
    lookup: (key,value) => { // 項目名'key'の値がvalueである行Objを返す
      return data.filter(x => {return x[key] === value})[0];
    },
  };
  console.log('szLib.getSheetData end.\n'+JSON.stringify({
    // 配列が大きいと表示し切れないので、rows,dataは最初の1行のみサンプル表示
    rows: [rv.rows[0] || 'null'],
    keys: rv.keys || 'null',
    data: [rv.data[0] || 'null'],
    sheet: rv.sheet || 'null',
  }));
  return rv;
}

/** setConfig: 各局のURL/Keyを管理局から参照してセット
 * @param {string[]} arg - 設定したいキー。管理局-configシート「key」列の文字列
 * @return {object} - configのオブジェクト。{argで渡されたキー:値, ..}形式
 */
function setConfig(arg=['MasterURL']){
  console.log('szLib.setConfig start. arg='+JSON.stringify(arg));

  const rv = {};
  // 「管理局」configシートのデータを読み込み
  const configSheet = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1eTBBzj9pryniOK-vTbNMks6aO5tqRdEjjgeQpBNZDuI/edit#gid=397762435').getSheetByName('config');
  const configData = configSheet.getDataRange().getValues();
  //console.log(JSON.stringify(configData));

  // key, value の列番号を検索
  const keyRow = configData[0].findIndex(x => x === 'key');
  const valueRow = configData[0].findIndex(x => x === 'value');
  //console.log('key='+keyRow+', value='+valueRow);

  // 指定キーの値をconfigにセット
  for( let i=0 ; i<arg.length ; i++ ){
    const arr = configData.filter(x => {
      //console.log(x[keyRow],arg[i],x[keyRow] === arg[i]);
      return x[keyRow] === arg[i];
    })[0];
    //console.log(arg[i],arr[valueRow]);
    rv[arg[i]] = arr[valueRow];
  }
  console.log('szLib.setConfig end. rv='+JSON.stringify(rv));
  return rv;
}

/** updateSheetData: シートの値を更新
 * @param {object}   dObj              - 取得対象シートオブジェクト。型は[getSheetDataの戻り値]{@link getSheetData}参照。
 * @param {object}   post              - 更新データ
 * @param {object}   post.target       - 更新対象を特定するための情報
 * @param {object}   post.target.key   - キーとなる項目名
 * @param {object}   post.target.value - キー値
 * @param {object[]} post.revice       - 更新するための情報(上書きする値)の集合
 * @param {string}   post.revice.key   - 更新対象の項目名
 * @param {string}   post.revice.value - 上書きする値

 * @param {object[]} post              - 追加データ
 * @param {string}   post.key          - 追加項目の項目名
 * @param {any}      post.value        - 項目の値
 * 
 * @param {object}   opt               - オプション
 * @param {boolean}  opt.append        - キー値が存在しない場合、追加ならtrue
 * @return {object[]} 更新の場合の戻り値
 * <ul>
 * <li>column {string} - 更新対象項目名
 * <li>before {any}    - 更新前の値
 * <li>after {any}     - 更新後の値
 * </ul>
 * @return {any[]} 追加の場合の戻り値。更新された行イメージ(一次元配列)
 * 
 * @example <caption>postサンプル：更新時</caption>
 * {
 *  "target":{"key":"受付番号","value":1},
 *  "revice":[
 *    {"key":"パスコード","value":"101390"},
 *    {"key":"発行日時","value":"2022-11-09T06:18:19.037Z"}
 *  ]
 * }
 * // hoge
 */
function updateSheetData(dObj,post,opt={append:true}){
  console.log('szLib.updateSheetData start.',JSON.stringify(post));
  const log = [];

  const doUpdate = () => {
    // 1.何行目のデータを更新するか特定する
    const map = dObj.data.map(x => x[post.target.key]);
    const rowNum = map.indexOf(String(post.target.value)) + 2;

    // 2.更新対象行のデータをuArrに保存する
    const uArr = dObj.rows[rowNum-2];
    console.log('szLib.uArr = '+JSON.stringify(uArr));

    // 3.uArrのデータを順次更新しながらログに記録、更新範囲をメモ
    let maxColumn = 0;
    let minColumn = 99999;
    for( let i=0 ; i<post.revice.length ; i++ ){
      // (1) 更新対象項目の列番号を特定、columnに保存
      const column = dObj.keys.indexOf(post.revice[i].key);
      // (2) >maxColumn or <minColumn ならmax/minを更新
      maxColumn = column > maxColumn ? column : maxColumn;
      minColumn = column < minColumn ? column : minColumn;
      // (3) logに更新対象項目/更新前の値/更新後の値を保存
      if( uArr[column] !== post.revice[i].value ){
        log.push({
          column: post.revice[i].key,
          before: uArr[column],
          after: post.revice[i].value,
        });
      }
      // (4) uArr[column]の値を更新
      uArr[column] = post.revice[i].value;
    }
    console.log('szLib.uArr = '+JSON.stringify(uArr));

    // uArrから更新範囲のデータを切り出して更新
    const range = dObj.sheet.getRange(rowNum, minColumn+1, 1, maxColumn-minColumn+1);
    const sv = uArr.splice(minColumn, maxColumn-minColumn+1);
    console.log('szLib.sv = '+JSON.stringify(sv));
    range.setValues([sv]);
  }

  const doAppend = () => {
    // 追加対象行のデータをaArrとして作成
    const aArr = [];
    const rv = {};
    for( let i=0 ; i<dObj.keys.length ; i++ ){
      rv[dObj.keys[i]] = post[dObj.keys[i]] || '';
      aArr.push(rv[dObj.keys[i]]);
    }
    dObj.sheet.appendRow(aArr);
    log.push(rv);
    console.log('szLib.aArr = '+JSON.stringify(aArr));
    console.log('szLib.rv = '+JSON.stringify(rv));
  }

  if( post.hasOwnProperty('target') ){
    console.log('szLib.doUpdate');
    doUpdate();
  } else if( opt.append ){
    console.log('szLib.doAppend');
    doAppend();
  }

  console.log('szLib.updateSheetData end.'+JSON.stringify(log));
  return log;
}


/* ====================================================================
  汎用ライブラリ
==================================================================== */

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
    //console.log('szLib.hRep start.',x,offset,string);
    let rv = String.fromCharCode(x.charCodeAt(0) - 0x60);
    //console.log('szLib.hRep end.',rv);
    return rv;
  }
  const toHiragana = (t) => {
    //console.log('szLib.toHiragana start.',typeof t, t);
    let rv = t.replace(/[\u30A1-\u30FA]/g,hRep);
    //console.log('szLib.toHiragana end.',typeof(rv),rv);
    return rv;
  };
  
  const kRep = (x,offset,string) => {
    //console.log('szLib.kRep start.',x,offset,string);
    let rv = String.fromCharCode(x.charCodeAt(0) + 0x60);
    //console.log('szLib.kRep end.',rv);
    return rv;
  }
  const toKatakana = (t) => {
    //console.log('szLib.toKatakana start.',typeof t, t);
    let rv = t.replace(/[\u3041-\u3096]/g,kRep);
    //console.log('szLib.toKatakana end.',typeof(rv),rv);
    return rv;
  };
  
  rv = kana ? toHiragana(rv) : toKatakana(rv);
  //console.log('szLib.convertCharacters end. rv=',rv);
  return rv;
}

/** createQrCode: QRコード生成
 * @param {String} code_data QRコードに埋め込む文字列
 * @return {Blob} QRコード画像のBLOB
 */
function createQrCode(
  code_data){ 
  let url = 'https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=' + code_data;
  let option = {
      method: "get",
      muteHttpExceptions: true
    };
  let ajax = UrlFetchApp.fetch(url, option);
  console.log(ajax.getBlob())
  return ajax.getBlob();
}

/** decrypt: 文字列を復号(＋オブジェクト化)
 * @param {string} arg 暗号化された文字列
 * @param {string} passPhrase 暗号鍵
 * @return {string|object} 復号化された文字列・オブジェクト
 */
function decrypt(arg,passPhrase){
  console.log('szLib.decrypt start.\n'+arg);
  const decodePath = decodeURIComponent(arg);
  dump('decodePath',decodePath);
  const data = CryptoJS.enc.Base64
    .parse(decodePath.toString()).toString(CryptoJS.enc.Latin1);
  dump('data',data);
  const bytes = CryptoJS.AES.decrypt(data, passPhrase)
    .toString(CryptoJS.enc.Utf8)
  dump('bytes',bytes);

  let rv = null;
  try {
    rv = JSON.parse(bytes);
  } catch(e) {
    rv = bytes;
  } finally {
    console.log('szLib.decrypt end.\ntype='+whichType(rv)+'\n',rv);
    return rv;
  }
}

/** dump: 変数の型と値をコンソールに出力。デバッグ用
 * @param {string} label 変数名
 * @param {any} variable 変数
 * @return {void} なし
 */
function dump(label,variable){ 
  console.log(label+' (type='+whichType(variable)+')\n',variable);
}

/** encrypt: 文字列・オブジェクトを暗号化
 * @param {string|object} arg 暗号化する文字列・オブジェクト
 * @param {String} passPhrase 暗号鍵
 * @return {String} 暗号化された文字列
 */
function encrypt(arg,passPhrase){
  const str = JSON.stringify(arg);
  console.log('szLib.encript start.\ntype='+whichType(arg)+'\n'+str);

  //const utf8_plain = CryptoJS.enc.Utf8.parse(str);
  const encrypted = CryptoJS.AES.encrypt( str, passPhrase );  // Obj
  // crypto-jsで複合化するとMalformed UTF-8 data になった件
  // https://zenn.dev/naonao70/articles/a2f7df87f9f736
  const encryptResult = CryptoJS.enc.Base64
    .stringify(CryptoJS.enc.Latin1.parse(encrypted.toString()));

  console.log("encript end.\n"+encryptResult);
  return encryptResult;
}

/** inspect: オブジェクトの構造を分析
 * <br>
 * 構造不明のオブジェクトの内容を分析・出力する。prototype/inspect.html参照。
 * 
 * @param {any} arg - 分析対象の変数
 * @param {number} depth - 再帰階層の深さ。指定不要
 * @return {object} 分析結果
 * 
 * @example <caption>分析結果例</caption>
 * inspect({a:10,b:{c:true,d:['abc',Symbol('baa')],e:(x)=>x*4},f:new Date()})
 * // -> {"a":"number","b":{"c":"boolean","d":["string","symbol"],"e":"function"},"f":"Date"}
 */
function inspect(arg,depth=0){ 
  // エラー対策(RangeError: Maximum call stack size exceeded)
  if( depth > 2 ){
    return 'Err:depth>2';
  }

  // プリミティブ型または関数
  const primitiveList = ['undefined','boolean','number','string','bigint','symbol','function'];
  let i = primitiveList.indexOf(typeof arg);
  if( i > -1 ){
    return primitiveList[i];
  }
  // 配列またはハッシュ以外
  const whichType = Object.prototype.toString.call(arg).match(/^\[object\s(.*)\]$/)[1];
  if( whichType !== 'Array' && whichType !== 'Object' )
    return whichType;

  let rv = null;
  if( whichType === 'Array' ){
    // 配列の場合、順次再帰で呼び出し
    rv = [];
    for( let i=0 ; i<arg.length ; i++ ){
      rv.push(inspect(arg[i],depth+1));
    }
  } else {
    // ハッシュの場合、メンバ名つきの配列を作成
    rv = {};
    for( let x in arg ){
      if( x.toUpperCase() === 'NONE' ){  // 'NONE'は調査対象から削除(循環参照？)
        rv[x] = 'Err:label NONE';
      } else {
        rv[x] = inspect(arg[x],depth+1);
      }
    }
  }
  return depth === 0 ? JSON.stringify(rv) : rv;
}

/** whichType: 変数の型を判定
 * @param {any} arg - 判定対象の変数
 * @returns {string} - 型の名前
 */
function whichType(arg){
  return arg === undefined ? 'undefined'
   : Object.prototype.toString.call(arg)
    .match(/^\[object\s(.*)\]$/)[1];
}

//== https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.3.0/crypto-js.min.js
!function(t,e){"object"==typeof exports?module.exports=exports=e():"function"==typeof define&&define.amd?define([],e):t.CryptoJS=e()}(this,function(){var l,r,t,e,i,f,n,o,s,a,c,h,u,d,p,_,v,y,g,B,w,k,S,m,x,b,H,z,A,C,D,R,E,M,F,P,W,O,U,I,K,X,L,j,N,T,Z,q,G,J,$,Q,V,Y,tt,et,rt,it,nt,ot,st,at,ct,ht,lt,ft,ut,dt,pt,_t,vt,yt,gt,Bt,wt,kt,St,mt,xt,bt,Ht,zt,At,Ct,Dt,Rt,Et,Mt,Ft,Pt=Pt||(l=Math,r=Object.create||function(t){var e;return Wt.prototype=t,e=new Wt,Wt.prototype=null,e},e=(t={}).lib={},i=e.Base={extend:function(t){var e=r(this);return t&&e.mixIn(t),e.hasOwnProperty("init")&&this.init!==e.init||(e.init=function(){e.$super.init.apply(this,arguments)}),(e.init.prototype=e).$super=this,e},create:function(){var t=this.extend();return t.init.apply(t,arguments),t},init:function(){},mixIn:function(t){for(var e in t)t.hasOwnProperty(e)&&(this[e]=t[e]);t.hasOwnProperty("toString")&&(this.toString=t.toString)},clone:function(){return this.init.prototype.extend(this)}},f=e.WordArray=i.extend({init:function(t,e){t=this.words=t||[],this.sigBytes=null!=e?e:4*t.length},toString:function(t){return(t||o).stringify(this)},concat:function(t){var e=this.words,r=t.words,i=this.sigBytes,n=t.sigBytes;if(this.clamp(),i%4)for(var o=0;o<n;o++){var s=r[o>>>2]>>>24-o%4*8&255;e[i+o>>>2]|=s<<24-(i+o)%4*8}else for(o=0;o<n;o+=4)e[i+o>>>2]=r[o>>>2];return this.sigBytes+=n,this},clamp:function(){var t=this.words,e=this.sigBytes;t[e>>>2]&=4294967295<<32-e%4*8,t.length=l.ceil(e/4)},clone:function(){var t=i.clone.call(this);return t.words=this.words.slice(0),t},random:function(t){function e(e){e=e;var r=987654321,i=4294967295;return function(){var t=((r=36969*(65535&r)+(r>>16)&i)<<16)+(e=18e3*(65535&e)+(e>>16)&i)&i;return t/=4294967296,(t+=.5)*(.5<l.random()?1:-1)}}for(var r,i=[],n=0;n<t;n+=4){var o=e(4294967296*(r||l.random()));r=987654071*o(),i.push(4294967296*o()|0)}return new f.init(i,t)}}),n=t.enc={},o=n.Hex={stringify:function(t){for(var e=t.words,r=t.sigBytes,i=[],n=0;n<r;n++){var o=e[n>>>2]>>>24-n%4*8&255;i.push((o>>>4).toString(16)),i.push((15&o).toString(16))}return i.join("")},parse:function(t){for(var e=t.length,r=[],i=0;i<e;i+=2)r[i>>>3]|=parseInt(t.substr(i,2),16)<<24-i%8*4;return new f.init(r,e/2)}},s=n.Latin1={stringify:function(t){for(var e=t.words,r=t.sigBytes,i=[],n=0;n<r;n++){var o=e[n>>>2]>>>24-n%4*8&255;i.push(String.fromCharCode(o))}return i.join("")},parse:function(t){for(var e=t.length,r=[],i=0;i<e;i++)r[i>>>2]|=(255&t.charCodeAt(i))<<24-i%4*8;return new f.init(r,e)}},a=n.Utf8={stringify:function(t){try{return decodeURIComponent(escape(s.stringify(t)))}catch(t){throw new Error("Malformed UTF-8 data")}},parse:function(t){return s.parse(unescape(encodeURIComponent(t)))}},c=e.BufferedBlockAlgorithm=i.extend({reset:function(){this._data=new f.init,this._nDataBytes=0},_append:function(t){"string"==typeof t&&(t=a.parse(t)),this._data.concat(t),this._nDataBytes+=t.sigBytes},_process:function(t){var e=this._data,r=e.words,i=e.sigBytes,n=this.blockSize,o=i/(4*n),s=(o=t?l.ceil(o):l.max((0|o)-this._minBufferSize,0))*n,a=l.min(4*s,i);if(s){for(var c=0;c<s;c+=n)this._doProcessBlock(r,c);var h=r.splice(0,s);e.sigBytes-=a}return new f.init(h,a)},clone:function(){var t=i.clone.call(this);return t._data=this._data.clone(),t},_minBufferSize:0}),e.Hasher=c.extend({cfg:i.extend(),init:function(t){this.cfg=this.cfg.extend(t),this.reset()},reset:function(){c.reset.call(this),this._doReset()},update:function(t){return this._append(t),this._process(),this},finalize:function(t){return t&&this._append(t),this._doFinalize()},blockSize:16,_createHelper:function(r){return function(t,e){return new r.init(e).finalize(t)}},_createHmacHelper:function(r){return function(t,e){return new h.HMAC.init(r,e).finalize(t)}}}),h=t.algo={},t);function Wt(){}function Ot(t,e,r){return t^e^r}function Ut(t,e,r){return t&e|~t&r}function It(t,e,r){return(t|~e)^r}function Kt(t,e,r){return t&r|e&~r}function Xt(t,e,r){return t^(e|~r)}function Lt(t,e){return t<<e|t>>>32-e}function jt(t,e,r,i){var n=this._iv;if(n){var o=n.slice(0);this._iv=void 0}else o=this._prevBlock;i.encryptBlock(o,0);for(var s=0;s<r;s++)t[e+s]^=o[s]}function Nt(t){if(255==(t>>24&255)){var e=t>>16&255,r=t>>8&255,i=255&t;255===e?(e=0,255===r?(r=0,255===i?i=0:++i):++r):++e,t=0,t+=e<<16,t+=r<<8,t+=i}else t+=1<<24;return t}function Tt(){for(var t=this._X,e=this._C,r=0;r<8;r++)mt[r]=e[r];e[0]=e[0]+1295307597+this._b|0,e[1]=e[1]+3545052371+(e[0]>>>0<mt[0]>>>0?1:0)|0,e[2]=e[2]+886263092+(e[1]>>>0<mt[1]>>>0?1:0)|0,e[3]=e[3]+1295307597+(e[2]>>>0<mt[2]>>>0?1:0)|0,e[4]=e[4]+3545052371+(e[3]>>>0<mt[3]>>>0?1:0)|0,e[5]=e[5]+886263092+(e[4]>>>0<mt[4]>>>0?1:0)|0,e[6]=e[6]+1295307597+(e[5]>>>0<mt[5]>>>0?1:0)|0,e[7]=e[7]+3545052371+(e[6]>>>0<mt[6]>>>0?1:0)|0,this._b=e[7]>>>0<mt[7]>>>0?1:0;for(r=0;r<8;r++){var i=t[r]+e[r],n=65535&i,o=i>>>16,s=((n*n>>>17)+n*o>>>15)+o*o,a=((4294901760&i)*i|0)+((65535&i)*i|0);xt[r]=s^a}t[0]=xt[0]+(xt[7]<<16|xt[7]>>>16)+(xt[6]<<16|xt[6]>>>16)|0,t[1]=xt[1]+(xt[0]<<8|xt[0]>>>24)+xt[7]|0,t[2]=xt[2]+(xt[1]<<16|xt[1]>>>16)+(xt[0]<<16|xt[0]>>>16)|0,t[3]=xt[3]+(xt[2]<<8|xt[2]>>>24)+xt[1]|0,t[4]=xt[4]+(xt[3]<<16|xt[3]>>>16)+(xt[2]<<16|xt[2]>>>16)|0,t[5]=xt[5]+(xt[4]<<8|xt[4]>>>24)+xt[3]|0,t[6]=xt[6]+(xt[5]<<16|xt[5]>>>16)+(xt[4]<<16|xt[4]>>>16)|0,t[7]=xt[7]+(xt[6]<<8|xt[6]>>>24)+xt[5]|0}function Zt(){for(var t=this._X,e=this._C,r=0;r<8;r++)Et[r]=e[r];e[0]=e[0]+1295307597+this._b|0,e[1]=e[1]+3545052371+(e[0]>>>0<Et[0]>>>0?1:0)|0,e[2]=e[2]+886263092+(e[1]>>>0<Et[1]>>>0?1:0)|0,e[3]=e[3]+1295307597+(e[2]>>>0<Et[2]>>>0?1:0)|0,e[4]=e[4]+3545052371+(e[3]>>>0<Et[3]>>>0?1:0)|0,e[5]=e[5]+886263092+(e[4]>>>0<Et[4]>>>0?1:0)|0,e[6]=e[6]+1295307597+(e[5]>>>0<Et[5]>>>0?1:0)|0,e[7]=e[7]+3545052371+(e[6]>>>0<Et[6]>>>0?1:0)|0,this._b=e[7]>>>0<Et[7]>>>0?1:0;for(r=0;r<8;r++){var i=t[r]+e[r],n=65535&i,o=i>>>16,s=((n*n>>>17)+n*o>>>15)+o*o,a=((4294901760&i)*i|0)+((65535&i)*i|0);Mt[r]=s^a}t[0]=Mt[0]+(Mt[7]<<16|Mt[7]>>>16)+(Mt[6]<<16|Mt[6]>>>16)|0,t[1]=Mt[1]+(Mt[0]<<8|Mt[0]>>>24)+Mt[7]|0,t[2]=Mt[2]+(Mt[1]<<16|Mt[1]>>>16)+(Mt[0]<<16|Mt[0]>>>16)|0,t[3]=Mt[3]+(Mt[2]<<8|Mt[2]>>>24)+Mt[1]|0,t[4]=Mt[4]+(Mt[3]<<16|Mt[3]>>>16)+(Mt[2]<<16|Mt[2]>>>16)|0,t[5]=Mt[5]+(Mt[4]<<8|Mt[4]>>>24)+Mt[3]|0,t[6]=Mt[6]+(Mt[5]<<16|Mt[5]>>>16)+(Mt[4]<<16|Mt[4]>>>16)|0,t[7]=Mt[7]+(Mt[6]<<8|Mt[6]>>>24)+Mt[5]|0}return u=Pt.lib.WordArray,Pt.enc.Base64={stringify:function(t){var e=t.words,r=t.sigBytes,i=this._map;t.clamp();for(var n=[],o=0;o<r;o+=3)for(var s=(e[o>>>2]>>>24-o%4*8&255)<<16|(e[o+1>>>2]>>>24-(o+1)%4*8&255)<<8|e[o+2>>>2]>>>24-(o+2)%4*8&255,a=0;a<4&&o+.75*a<r;a++)n.push(i.charAt(s>>>6*(3-a)&63));var c=i.charAt(64);if(c)for(;n.length%4;)n.push(c);return n.join("")},parse:function(t){var e=t.length,r=this._map,i=this._reverseMap;if(!i){i=this._reverseMap=[];for(var n=0;n<r.length;n++)i[r.charCodeAt(n)]=n}var o=r.charAt(64);if(o){var s=t.indexOf(o);-1!==s&&(e=s)}return function(t,e,r){for(var i=[],n=0,o=0;o<e;o++)if(o%4){var s=r[t.charCodeAt(o-1)]<<o%4*2,a=r[t.charCodeAt(o)]>>>6-o%4*2;i[n>>>2]|=(s|a)<<24-n%4*8,n++}return u.create(i,n)}(t,e,i)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="},function(l){var t=Pt,e=t.lib,r=e.WordArray,i=e.Hasher,n=t.algo,H=[];!function(){for(var t=0;t<64;t++)H[t]=4294967296*l.abs(l.sin(t+1))|0}();var o=n.MD5=i.extend({_doReset:function(){this._hash=new r.init([1732584193,4023233417,2562383102,271733878])},_doProcessBlock:function(t,e){for(var r=0;r<16;r++){var i=e+r,n=t[i];t[i]=16711935&(n<<8|n>>>24)|4278255360&(n<<24|n>>>8)}var o=this._hash.words,s=t[e+0],a=t[e+1],c=t[e+2],h=t[e+3],l=t[e+4],f=t[e+5],u=t[e+6],d=t[e+7],p=t[e+8],_=t[e+9],v=t[e+10],y=t[e+11],g=t[e+12],B=t[e+13],w=t[e+14],k=t[e+15],S=o[0],m=o[1],x=o[2],b=o[3];S=z(S,m,x,b,s,7,H[0]),b=z(b,S,m,x,a,12,H[1]),x=z(x,b,S,m,c,17,H[2]),m=z(m,x,b,S,h,22,H[3]),S=z(S,m,x,b,l,7,H[4]),b=z(b,S,m,x,f,12,H[5]),x=z(x,b,S,m,u,17,H[6]),m=z(m,x,b,S,d,22,H[7]),S=z(S,m,x,b,p,7,H[8]),b=z(b,S,m,x,_,12,H[9]),x=z(x,b,S,m,v,17,H[10]),m=z(m,x,b,S,y,22,H[11]),S=z(S,m,x,b,g,7,H[12]),b=z(b,S,m,x,B,12,H[13]),x=z(x,b,S,m,w,17,H[14]),S=A(S,m=z(m,x,b,S,k,22,H[15]),x,b,a,5,H[16]),b=A(b,S,m,x,u,9,H[17]),x=A(x,b,S,m,y,14,H[18]),m=A(m,x,b,S,s,20,H[19]),S=A(S,m,x,b,f,5,H[20]),b=A(b,S,m,x,v,9,H[21]),x=A(x,b,S,m,k,14,H[22]),m=A(m,x,b,S,l,20,H[23]),S=A(S,m,x,b,_,5,H[24]),b=A(b,S,m,x,w,9,H[25]),x=A(x,b,S,m,h,14,H[26]),m=A(m,x,b,S,p,20,H[27]),S=A(S,m,x,b,B,5,H[28]),b=A(b,S,m,x,c,9,H[29]),x=A(x,b,S,m,d,14,H[30]),S=C(S,m=A(m,x,b,S,g,20,H[31]),x,b,f,4,H[32]),b=C(b,S,m,x,p,11,H[33]),x=C(x,b,S,m,y,16,H[34]),m=C(m,x,b,S,w,23,H[35]),S=C(S,m,x,b,a,4,H[36]),b=C(b,S,m,x,l,11,H[37]),x=C(x,b,S,m,d,16,H[38]),m=C(m,x,b,S,v,23,H[39]),S=C(S,m,x,b,B,4,H[40]),b=C(b,S,m,x,s,11,H[41]),x=C(x,b,S,m,h,16,H[42]),m=C(m,x,b,S,u,23,H[43]),S=C(S,m,x,b,_,4,H[44]),b=C(b,S,m,x,g,11,H[45]),x=C(x,b,S,m,k,16,H[46]),S=D(S,m=C(m,x,b,S,c,23,H[47]),x,b,s,6,H[48]),b=D(b,S,m,x,d,10,H[49]),x=D(x,b,S,m,w,15,H[50]),m=D(m,x,b,S,f,21,H[51]),S=D(S,m,x,b,g,6,H[52]),b=D(b,S,m,x,h,10,H[53]),x=D(x,b,S,m,v,15,H[54]),m=D(m,x,b,S,a,21,H[55]),S=D(S,m,x,b,p,6,H[56]),b=D(b,S,m,x,k,10,H[57]),x=D(x,b,S,m,u,15,H[58]),m=D(m,x,b,S,B,21,H[59]),S=D(S,m,x,b,l,6,H[60]),b=D(b,S,m,x,y,10,H[61]),x=D(x,b,S,m,c,15,H[62]),m=D(m,x,b,S,_,21,H[63]),o[0]=o[0]+S|0,o[1]=o[1]+m|0,o[2]=o[2]+x|0,o[3]=o[3]+b|0},_doFinalize:function(){var t=this._data,e=t.words,r=8*this._nDataBytes,i=8*t.sigBytes;e[i>>>5]|=128<<24-i%32;var n=l.floor(r/4294967296),o=r;e[15+(64+i>>>9<<4)]=16711935&(n<<8|n>>>24)|4278255360&(n<<24|n>>>8),e[14+(64+i>>>9<<4)]=16711935&(o<<8|o>>>24)|4278255360&(o<<24|o>>>8),t.sigBytes=4*(e.length+1),this._process();for(var s=this._hash,a=s.words,c=0;c<4;c++){var h=a[c];a[c]=16711935&(h<<8|h>>>24)|4278255360&(h<<24|h>>>8)}return s},clone:function(){var t=i.clone.call(this);return t._hash=this._hash.clone(),t}});function z(t,e,r,i,n,o,s){var a=t+(e&r|~e&i)+n+s;return(a<<o|a>>>32-o)+e}function A(t,e,r,i,n,o,s){var a=t+(e&i|r&~i)+n+s;return(a<<o|a>>>32-o)+e}function C(t,e,r,i,n,o,s){var a=t+(e^r^i)+n+s;return(a<<o|a>>>32-o)+e}function D(t,e,r,i,n,o,s){var a=t+(r^(e|~i))+n+s;return(a<<o|a>>>32-o)+e}t.MD5=i._createHelper(o),t.HmacMD5=i._createHmacHelper(o)}(Math),p=(d=Pt).lib,_=p.WordArray,v=p.Hasher,y=d.algo,g=[],B=y.SHA1=v.extend({_doReset:function(){this._hash=new _.init([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(t,e){for(var r=this._hash.words,i=r[0],n=r[1],o=r[2],s=r[3],a=r[4],c=0;c<80;c++){if(c<16)g[c]=0|t[e+c];else{var h=g[c-3]^g[c-8]^g[c-14]^g[c-16];g[c]=h<<1|h>>>31}var l=(i<<5|i>>>27)+a+g[c];l+=c<20?1518500249+(n&o|~n&s):c<40?1859775393+(n^o^s):c<60?(n&o|n&s|o&s)-1894007588:(n^o^s)-899497514,a=s,s=o,o=n<<30|n>>>2,n=i,i=l}r[0]=r[0]+i|0,r[1]=r[1]+n|0,r[2]=r[2]+o|0,r[3]=r[3]+s|0,r[4]=r[4]+a|0},_doFinalize:function(){var t=this._data,e=t.words,r=8*this._nDataBytes,i=8*t.sigBytes;return e[i>>>5]|=128<<24-i%32,e[14+(64+i>>>9<<4)]=Math.floor(r/4294967296),e[15+(64+i>>>9<<4)]=r,t.sigBytes=4*e.length,this._process(),this._hash},clone:function(){var t=v.clone.call(this);return t._hash=this._hash.clone(),t}}),d.SHA1=v._createHelper(B),d.HmacSHA1=v._createHmacHelper(B),function(n){var t=Pt,e=t.lib,r=e.WordArray,i=e.Hasher,o=t.algo,s=[],B=[];!function(){function t(t){for(var e=n.sqrt(t),r=2;r<=e;r++)if(!(t%r))return;return 1}function e(t){return 4294967296*(t-(0|t))|0}for(var r=2,i=0;i<64;)t(r)&&(i<8&&(s[i]=e(n.pow(r,.5))),B[i]=e(n.pow(r,1/3)),i++),r++}();var w=[],a=o.SHA256=i.extend({_doReset:function(){this._hash=new r.init(s.slice(0))},_doProcessBlock:function(t,e){for(var r=this._hash.words,i=r[0],n=r[1],o=r[2],s=r[3],a=r[4],c=r[5],h=r[6],l=r[7],f=0;f<64;f++){if(f<16)w[f]=0|t[e+f];else{var u=w[f-15],d=(u<<25|u>>>7)^(u<<14|u>>>18)^u>>>3,p=w[f-2],_=(p<<15|p>>>17)^(p<<13|p>>>19)^p>>>10;w[f]=d+w[f-7]+_+w[f-16]}var v=i&n^i&o^n&o,y=(i<<30|i>>>2)^(i<<19|i>>>13)^(i<<10|i>>>22),g=l+((a<<26|a>>>6)^(a<<21|a>>>11)^(a<<7|a>>>25))+(a&c^~a&h)+B[f]+w[f];l=h,h=c,c=a,a=s+g|0,s=o,o=n,n=i,i=g+(y+v)|0}r[0]=r[0]+i|0,r[1]=r[1]+n|0,r[2]=r[2]+o|0,r[3]=r[3]+s|0,r[4]=r[4]+a|0,r[5]=r[5]+c|0,r[6]=r[6]+h|0,r[7]=r[7]+l|0},_doFinalize:function(){var t=this._data,e=t.words,r=8*this._nDataBytes,i=8*t.sigBytes;return e[i>>>5]|=128<<24-i%32,e[14+(64+i>>>9<<4)]=n.floor(r/4294967296),e[15+(64+i>>>9<<4)]=r,t.sigBytes=4*e.length,this._process(),this._hash},clone:function(){var t=i.clone.call(this);return t._hash=this._hash.clone(),t}});t.SHA256=i._createHelper(a),t.HmacSHA256=i._createHmacHelper(a)}(Math),function(){var n=Pt.lib.WordArray,t=Pt.enc;t.Utf16=t.Utf16BE={stringify:function(t){for(var e=t.words,r=t.sigBytes,i=[],n=0;n<r;n+=2){var o=e[n>>>2]>>>16-n%4*8&65535;i.push(String.fromCharCode(o))}return i.join("")},parse:function(t){for(var e=t.length,r=[],i=0;i<e;i++)r[i>>>1]|=t.charCodeAt(i)<<16-i%2*16;return n.create(r,2*e)}};function s(t){return t<<8&4278255360|t>>>8&16711935}t.Utf16LE={stringify:function(t){for(var e=t.words,r=t.sigBytes,i=[],n=0;n<r;n+=2){var o=s(e[n>>>2]>>>16-n%4*8&65535);i.push(String.fromCharCode(o))}return i.join("")},parse:function(t){for(var e=t.length,r=[],i=0;i<e;i++)r[i>>>1]|=s(t.charCodeAt(i)<<16-i%2*16);return n.create(r,2*e)}}}(),function(){if("function"==typeof ArrayBuffer){var t=Pt.lib.WordArray,n=t.init;(t.init=function(t){if(t instanceof ArrayBuffer&&(t=new Uint8Array(t)),(t instanceof Int8Array||"undefined"!=typeof Uint8ClampedArray&&t instanceof Uint8ClampedArray||t instanceof Int16Array||t instanceof Uint16Array||t instanceof Int32Array||t instanceof Uint32Array||t instanceof Float32Array||t instanceof Float64Array)&&(t=new Uint8Array(t.buffer,t.byteOffset,t.byteLength)),t instanceof Uint8Array){for(var e=t.byteLength,r=[],i=0;i<e;i++)r[i>>>2]|=t[i]<<24-i%4*8;n.call(this,r,e)}else n.apply(this,arguments)}).prototype=t}}(),Math,k=(w=Pt).lib,S=k.WordArray,m=k.Hasher,x=w.algo,b=S.create([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8,3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12,1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2,4,0,5,9,7,12,2,10,14,1,3,8,11,6,15,13]),H=S.create([5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12,6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2,15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13,8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14,12,15,10,4,1,5,8,7,6,2,13,14,0,3,9,11]),z=S.create([11,14,15,12,5,8,7,9,11,13,14,15,6,7,9,8,7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12,11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5,11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12,9,15,5,11,6,8,13,12,5,12,13,14,11,8,5,6]),A=S.create([8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6,9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11,9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5,15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8,8,5,12,9,12,5,14,6,8,13,6,5,15,13,11,11]),C=S.create([0,1518500249,1859775393,2400959708,2840853838]),D=S.create([1352829926,1548603684,1836072691,2053994217,0]),R=x.RIPEMD160=m.extend({_doReset:function(){this._hash=S.create([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(t,e){for(var r=0;r<16;r++){var i=e+r,n=t[i];t[i]=16711935&(n<<8|n>>>24)|4278255360&(n<<24|n>>>8)}var o,s,a,c,h,l,f,u,d,p,_,v=this._hash.words,y=C.words,g=D.words,B=b.words,w=H.words,k=z.words,S=A.words;l=o=v[0],f=s=v[1],u=a=v[2],d=c=v[3],p=h=v[4];for(r=0;r<80;r+=1)_=o+t[e+B[r]]|0,_+=r<16?Ot(s,a,c)+y[0]:r<32?Ut(s,a,c)+y[1]:r<48?It(s,a,c)+y[2]:r<64?Kt(s,a,c)+y[3]:Xt(s,a,c)+y[4],_=(_=Lt(_|=0,k[r]))+h|0,o=h,h=c,c=Lt(a,10),a=s,s=_,_=l+t[e+w[r]]|0,_+=r<16?Xt(f,u,d)+g[0]:r<32?Kt(f,u,d)+g[1]:r<48?It(f,u,d)+g[2]:r<64?Ut(f,u,d)+g[3]:Ot(f,u,d)+g[4],_=(_=Lt(_|=0,S[r]))+p|0,l=p,p=d,d=Lt(u,10),u=f,f=_;_=v[1]+a+d|0,v[1]=v[2]+c+p|0,v[2]=v[3]+h+l|0,v[3]=v[4]+o+f|0,v[4]=v[0]+s+u|0,v[0]=_},_doFinalize:function(){var t=this._data,e=t.words,r=8*this._nDataBytes,i=8*t.sigBytes;e[i>>>5]|=128<<24-i%32,e[14+(64+i>>>9<<4)]=16711935&(r<<8|r>>>24)|4278255360&(r<<24|r>>>8),t.sigBytes=4*(e.length+1),this._process();for(var n=this._hash,o=n.words,s=0;s<5;s++){var a=o[s];o[s]=16711935&(a<<8|a>>>24)|4278255360&(a<<24|a>>>8)}return n},clone:function(){var t=m.clone.call(this);return t._hash=this._hash.clone(),t}}),w.RIPEMD160=m._createHelper(R),w.HmacRIPEMD160=m._createHmacHelper(R),E=Pt.lib.Base,M=Pt.enc.Utf8,Pt.algo.HMAC=E.extend({init:function(t,e){t=this._hasher=new t.init,"string"==typeof e&&(e=M.parse(e));var r=t.blockSize,i=4*r;e.sigBytes>i&&(e=t.finalize(e)),e.clamp();for(var n=this._oKey=e.clone(),o=this._iKey=e.clone(),s=n.words,a=o.words,c=0;c<r;c++)s[c]^=1549556828,a[c]^=909522486;n.sigBytes=o.sigBytes=i,this.reset()},reset:function(){var t=this._hasher;t.reset(),t.update(this._iKey)},update:function(t){return this._hasher.update(t),this},finalize:function(t){var e=this._hasher,r=e.finalize(t);return e.reset(),e.finalize(this._oKey.clone().concat(r))}}),P=(F=Pt).lib,W=P.Base,O=P.WordArray,U=F.algo,I=U.SHA1,K=U.HMAC,X=U.PBKDF2=W.extend({cfg:W.extend({keySize:4,hasher:I,iterations:1}),init:function(t){this.cfg=this.cfg.extend(t)},compute:function(t,e){for(var r=this.cfg,i=K.create(r.hasher,t),n=O.create(),o=O.create([1]),s=n.words,a=o.words,c=r.keySize,h=r.iterations;s.length<c;){var l=i.update(e).finalize(o);i.reset();for(var f=l.words,u=f.length,d=l,p=1;p<h;p++){d=i.finalize(d),i.reset();for(var _=d.words,v=0;v<u;v++)f[v]^=_[v]}n.concat(l),a[0]++}return n.sigBytes=4*c,n}}),F.PBKDF2=function(t,e,r){return X.create(r).compute(t,e)},j=(L=Pt).lib,N=j.Base,T=j.WordArray,Z=L.algo,q=Z.MD5,G=Z.EvpKDF=N.extend({cfg:N.extend({keySize:4,hasher:q,iterations:1}),init:function(t){this.cfg=this.cfg.extend(t)},compute:function(t,e){for(var r=this.cfg,i=r.hasher.create(),n=T.create(),o=n.words,s=r.keySize,a=r.iterations;o.length<s;){c&&i.update(c);var c=i.update(t).finalize(e);i.reset();for(var h=1;h<a;h++)c=i.finalize(c),i.reset();n.concat(c)}return n.sigBytes=4*s,n}}),L.EvpKDF=function(t,e,r){return G.create(r).compute(t,e)},$=(J=Pt).lib.WordArray,Q=J.algo,V=Q.SHA256,Y=Q.SHA224=V.extend({_doReset:function(){this._hash=new $.init([3238371032,914150663,812702999,4144912697,4290775857,1750603025,1694076839,3204075428])},_doFinalize:function(){var t=V._doFinalize.call(this);return t.sigBytes-=4,t}}),J.SHA224=V._createHelper(Y),J.HmacSHA224=V._createHmacHelper(Y),tt=Pt.lib,et=tt.Base,rt=tt.WordArray,(it=Pt.x64={}).Word=et.extend({init:function(t,e){this.high=t,this.low=e}}),it.WordArray=et.extend({init:function(t,e){t=this.words=t||[],this.sigBytes=null!=e?e:8*t.length},toX32:function(){for(var t=this.words,e=t.length,r=[],i=0;i<e;i++){var n=t[i];r.push(n.high),r.push(n.low)}return rt.create(r,this.sigBytes)},clone:function(){for(var t=et.clone.call(this),e=t.words=this.words.slice(0),r=e.length,i=0;i<r;i++)e[i]=e[i].clone();return t}}),function(u){var t=Pt,e=t.lib,d=e.WordArray,i=e.Hasher,l=t.x64.Word,r=t.algo,C=[],D=[],R=[];!function(){for(var t=1,e=0,r=0;r<24;r++){C[t+5*e]=(r+1)*(r+2)/2%64;var i=(2*t+3*e)%5;t=e%5,e=i}for(t=0;t<5;t++)for(e=0;e<5;e++)D[t+5*e]=e+(2*t+3*e)%5*5;for(var n=1,o=0;o<24;o++){for(var s=0,a=0,c=0;c<7;c++){if(1&n){var h=(1<<c)-1;h<32?a^=1<<h:s^=1<<h-32}128&n?n=n<<1^113:n<<=1}R[o]=l.create(s,a)}}();var E=[];!function(){for(var t=0;t<25;t++)E[t]=l.create()}();var n=r.SHA3=i.extend({cfg:i.cfg.extend({outputLength:512}),_doReset:function(){for(var t=this._state=[],e=0;e<25;e++)t[e]=new l.init;this.blockSize=(1600-2*this.cfg.outputLength)/32},_doProcessBlock:function(t,e){for(var r=this._state,i=this.blockSize/2,n=0;n<i;n++){var o=t[e+2*n],s=t[e+2*n+1];o=16711935&(o<<8|o>>>24)|4278255360&(o<<24|o>>>8),s=16711935&(s<<8|s>>>24)|4278255360&(s<<24|s>>>8),(x=r[n]).high^=s,x.low^=o}for(var a=0;a<24;a++){for(var c=0;c<5;c++){for(var h=0,l=0,f=0;f<5;f++){h^=(x=r[c+5*f]).high,l^=x.low}var u=E[c];u.high=h,u.low=l}for(c=0;c<5;c++){var d=E[(c+4)%5],p=E[(c+1)%5],_=p.high,v=p.low;for(h=d.high^(_<<1|v>>>31),l=d.low^(v<<1|_>>>31),f=0;f<5;f++){(x=r[c+5*f]).high^=h,x.low^=l}}for(var y=1;y<25;y++){var g=(x=r[y]).high,B=x.low,w=C[y];if(w<32)h=g<<w|B>>>32-w,l=B<<w|g>>>32-w;else h=B<<w-32|g>>>64-w,l=g<<w-32|B>>>64-w;var k=E[D[y]];k.high=h,k.low=l}var S=E[0],m=r[0];S.high=m.high,S.low=m.low;for(c=0;c<5;c++)for(f=0;f<5;f++){var x=r[y=c+5*f],b=E[y],H=E[(c+1)%5+5*f],z=E[(c+2)%5+5*f];x.high=b.high^~H.high&z.high,x.low=b.low^~H.low&z.low}x=r[0];var A=R[a];x.high^=A.high,x.low^=A.low}},_doFinalize:function(){var t=this._data,e=t.words,r=(this._nDataBytes,8*t.sigBytes),i=32*this.blockSize;e[r>>>5]|=1<<24-r%32,e[(u.ceil((1+r)/i)*i>>>5)-1]|=128,t.sigBytes=4*e.length,this._process();for(var n=this._state,o=this.cfg.outputLength/8,s=o/8,a=[],c=0;c<s;c++){var h=n[c],l=h.high,f=h.low;l=16711935&(l<<8|l>>>24)|4278255360&(l<<24|l>>>8),f=16711935&(f<<8|f>>>24)|4278255360&(f<<24|f>>>8),a.push(f),a.push(l)}return new d.init(a,o)},clone:function(){for(var t=i.clone.call(this),e=t._state=this._state.slice(0),r=0;r<25;r++)e[r]=e[r].clone();return t}});t.SHA3=i._createHelper(n),t.HmacSHA3=i._createHmacHelper(n)}(Math),function(){var t=Pt,e=t.lib.Hasher,r=t.x64,i=r.Word,n=r.WordArray,o=t.algo;function s(){return i.create.apply(i,arguments)}var mt=[s(1116352408,3609767458),s(1899447441,602891725),s(3049323471,3964484399),s(3921009573,2173295548),s(961987163,4081628472),s(1508970993,3053834265),s(2453635748,2937671579),s(2870763221,3664609560),s(3624381080,2734883394),s(310598401,1164996542),s(607225278,1323610764),s(1426881987,3590304994),s(1925078388,4068182383),s(2162078206,991336113),s(2614888103,633803317),s(3248222580,3479774868),s(3835390401,2666613458),s(4022224774,944711139),s(264347078,2341262773),s(604807628,2007800933),s(770255983,1495990901),s(1249150122,1856431235),s(1555081692,3175218132),s(1996064986,2198950837),s(2554220882,3999719339),s(2821834349,766784016),s(2952996808,2566594879),s(3210313671,3203337956),s(3336571891,1034457026),s(3584528711,2466948901),s(113926993,3758326383),s(338241895,168717936),s(666307205,1188179964),s(773529912,1546045734),s(1294757372,1522805485),s(1396182291,2643833823),s(1695183700,2343527390),s(1986661051,1014477480),s(2177026350,1206759142),s(2456956037,344077627),s(2730485921,1290863460),s(2820302411,3158454273),s(3259730800,3505952657),s(3345764771,106217008),s(3516065817,3606008344),s(3600352804,1432725776),s(4094571909,1467031594),s(275423344,851169720),s(430227734,3100823752),s(506948616,1363258195),s(659060556,3750685593),s(883997877,3785050280),s(958139571,3318307427),s(1322822218,3812723403),s(1537002063,2003034995),s(1747873779,3602036899),s(1955562222,1575990012),s(2024104815,1125592928),s(2227730452,2716904306),s(2361852424,442776044),s(2428436474,593698344),s(2756734187,3733110249),s(3204031479,2999351573),s(3329325298,3815920427),s(3391569614,3928383900),s(3515267271,566280711),s(3940187606,3454069534),s(4118630271,4000239992),s(116418474,1914138554),s(174292421,2731055270),s(289380356,3203993006),s(460393269,320620315),s(685471733,587496836),s(852142971,1086792851),s(1017036298,365543100),s(1126000580,2618297676),s(1288033470,3409855158),s(1501505948,4234509866),s(1607167915,987167468),s(1816402316,1246189591)],xt=[];!function(){for(var t=0;t<80;t++)xt[t]=s()}();var a=o.SHA512=e.extend({_doReset:function(){this._hash=new n.init([new i.init(1779033703,4089235720),new i.init(3144134277,2227873595),new i.init(1013904242,4271175723),new i.init(2773480762,1595750129),new i.init(1359893119,2917565137),new i.init(2600822924,725511199),new i.init(528734635,4215389547),new i.init(1541459225,327033209)])},_doProcessBlock:function(t,e){for(var r=this._hash.words,i=r[0],n=r[1],o=r[2],s=r[3],a=r[4],c=r[5],h=r[6],l=r[7],f=i.high,u=i.low,d=n.high,p=n.low,_=o.high,v=o.low,y=s.high,g=s.low,B=a.high,w=a.low,k=c.high,S=c.low,m=h.high,x=h.low,b=l.high,H=l.low,z=f,A=u,C=d,D=p,R=_,E=v,M=y,F=g,P=B,W=w,O=k,U=S,I=m,K=x,X=b,L=H,j=0;j<80;j++){var N=xt[j];if(j<16)var T=N.high=0|t[e+2*j],Z=N.low=0|t[e+2*j+1];else{var q=xt[j-15],G=q.high,J=q.low,$=(G>>>1|J<<31)^(G>>>8|J<<24)^G>>>7,Q=(J>>>1|G<<31)^(J>>>8|G<<24)^(J>>>7|G<<25),V=xt[j-2],Y=V.high,tt=V.low,et=(Y>>>19|tt<<13)^(Y<<3|tt>>>29)^Y>>>6,rt=(tt>>>19|Y<<13)^(tt<<3|Y>>>29)^(tt>>>6|Y<<26),it=xt[j-7],nt=it.high,ot=it.low,st=xt[j-16],at=st.high,ct=st.low;T=(T=(T=$+nt+((Z=Q+ot)>>>0<Q>>>0?1:0))+et+((Z=Z+rt)>>>0<rt>>>0?1:0))+at+((Z=Z+ct)>>>0<ct>>>0?1:0);N.high=T,N.low=Z}var ht,lt=P&O^~P&I,ft=W&U^~W&K,ut=z&C^z&R^C&R,dt=A&D^A&E^D&E,pt=(z>>>28|A<<4)^(z<<30|A>>>2)^(z<<25|A>>>7),_t=(A>>>28|z<<4)^(A<<30|z>>>2)^(A<<25|z>>>7),vt=(P>>>14|W<<18)^(P>>>18|W<<14)^(P<<23|W>>>9),yt=(W>>>14|P<<18)^(W>>>18|P<<14)^(W<<23|P>>>9),gt=mt[j],Bt=gt.high,wt=gt.low,kt=X+vt+((ht=L+yt)>>>0<L>>>0?1:0),St=_t+dt;X=I,L=K,I=O,K=U,O=P,U=W,P=M+(kt=(kt=(kt=kt+lt+((ht=ht+ft)>>>0<ft>>>0?1:0))+Bt+((ht=ht+wt)>>>0<wt>>>0?1:0))+T+((ht=ht+Z)>>>0<Z>>>0?1:0))+((W=F+ht|0)>>>0<F>>>0?1:0)|0,M=R,F=E,R=C,E=D,C=z,D=A,z=kt+(pt+ut+(St>>>0<_t>>>0?1:0))+((A=ht+St|0)>>>0<ht>>>0?1:0)|0}u=i.low=u+A,i.high=f+z+(u>>>0<A>>>0?1:0),p=n.low=p+D,n.high=d+C+(p>>>0<D>>>0?1:0),v=o.low=v+E,o.high=_+R+(v>>>0<E>>>0?1:0),g=s.low=g+F,s.high=y+M+(g>>>0<F>>>0?1:0),w=a.low=w+W,a.high=B+P+(w>>>0<W>>>0?1:0),S=c.low=S+U,c.high=k+O+(S>>>0<U>>>0?1:0),x=h.low=x+K,h.high=m+I+(x>>>0<K>>>0?1:0),H=l.low=H+L,l.high=b+X+(H>>>0<L>>>0?1:0)},_doFinalize:function(){var t=this._data,e=t.words,r=8*this._nDataBytes,i=8*t.sigBytes;return e[i>>>5]|=128<<24-i%32,e[30+(128+i>>>10<<5)]=Math.floor(r/4294967296),e[31+(128+i>>>10<<5)]=r,t.sigBytes=4*e.length,this._process(),this._hash.toX32()},clone:function(){var t=e.clone.call(this);return t._hash=this._hash.clone(),t},blockSize:32});t.SHA512=e._createHelper(a),t.HmacSHA512=e._createHmacHelper(a)}(),ot=(nt=Pt).x64,st=ot.Word,at=ot.WordArray,ct=nt.algo,ht=ct.SHA512,lt=ct.SHA384=ht.extend({_doReset:function(){this._hash=new at.init([new st.init(3418070365,3238371032),new st.init(1654270250,914150663),new st.init(2438529370,812702999),new st.init(355462360,4144912697),new st.init(1731405415,4290775857),new st.init(2394180231,1750603025),new st.init(3675008525,1694076839),new st.init(1203062813,3204075428)])},_doFinalize:function(){var t=ht._doFinalize.call(this);return t.sigBytes-=16,t}}),nt.SHA384=ht._createHelper(lt),nt.HmacSHA384=ht._createHmacHelper(lt),Pt.lib.Cipher||function(){var t=Pt,e=t.lib,r=e.Base,c=e.WordArray,i=e.BufferedBlockAlgorithm,n=t.enc,o=(n.Utf8,n.Base64),s=t.algo.EvpKDF,a=e.Cipher=i.extend({cfg:r.extend(),createEncryptor:function(t,e){return this.create(this._ENC_XFORM_MODE,t,e)},createDecryptor:function(t,e){return this.create(this._DEC_XFORM_MODE,t,e)},init:function(t,e,r){this.cfg=this.cfg.extend(r),this._xformMode=t,this._key=e,this.reset()},reset:function(){i.reset.call(this),this._doReset()},process:function(t){return this._append(t),this._process()},finalize:function(t){return t&&this._append(t),this._doFinalize()},keySize:4,ivSize:4,_ENC_XFORM_MODE:1,_DEC_XFORM_MODE:2,_createHelper:function(i){return{encrypt:function(t,e,r){return h(e).encrypt(i,t,e,r)},decrypt:function(t,e,r){return h(e).decrypt(i,t,e,r)}}}});function h(t){return"string"==typeof t?w:g}e.StreamCipher=a.extend({_doFinalize:function(){return this._process(!0)},blockSize:1});var l,f=t.mode={},u=e.BlockCipherMode=r.extend({createEncryptor:function(t,e){return this.Encryptor.create(t,e)},createDecryptor:function(t,e){return this.Decryptor.create(t,e)},init:function(t,e){this._cipher=t,this._iv=e}}),d=f.CBC=((l=u.extend()).Encryptor=l.extend({processBlock:function(t,e){var r=this._cipher,i=r.blockSize;p.call(this,t,e,i),r.encryptBlock(t,e),this._prevBlock=t.slice(e,e+i)}}),l.Decryptor=l.extend({processBlock:function(t,e){var r=this._cipher,i=r.blockSize,n=t.slice(e,e+i);r.decryptBlock(t,e),p.call(this,t,e,i),this._prevBlock=n}}),l);function p(t,e,r){var i=this._iv;if(i){var n=i;this._iv=void 0}else n=this._prevBlock;for(var o=0;o<r;o++)t[e+o]^=n[o]}var _=(t.pad={}).Pkcs7={pad:function(t,e){for(var r=4*e,i=r-t.sigBytes%r,n=i<<24|i<<16|i<<8|i,o=[],s=0;s<i;s+=4)o.push(n);var a=c.create(o,i);t.concat(a)},unpad:function(t){var e=255&t.words[t.sigBytes-1>>>2];t.sigBytes-=e}},v=(e.BlockCipher=a.extend({cfg:a.cfg.extend({mode:d,padding:_}),reset:function(){a.reset.call(this);var t=this.cfg,e=t.iv,r=t.mode;if(this._xformMode==this._ENC_XFORM_MODE)var i=r.createEncryptor;else{i=r.createDecryptor;this._minBufferSize=1}this._mode&&this._mode.__creator==i?this._mode.init(this,e&&e.words):(this._mode=i.call(r,this,e&&e.words),this._mode.__creator=i)},_doProcessBlock:function(t,e){this._mode.processBlock(t,e)},_doFinalize:function(){var t=this.cfg.padding;if(this._xformMode==this._ENC_XFORM_MODE){t.pad(this._data,this.blockSize);var e=this._process(!0)}else{e=this._process(!0);t.unpad(e)}return e},blockSize:4}),e.CipherParams=r.extend({init:function(t){this.mixIn(t)},toString:function(t){return(t||this.formatter).stringify(this)}})),y=(t.format={}).OpenSSL={stringify:function(t){var e=t.ciphertext,r=t.salt;if(r)var i=c.create([1398893684,1701076831]).concat(r).concat(e);else i=e;return i.toString(o)},parse:function(t){var e=o.parse(t),r=e.words;if(1398893684==r[0]&&1701076831==r[1]){var i=c.create(r.slice(2,4));r.splice(0,4),e.sigBytes-=16}return v.create({ciphertext:e,salt:i})}},g=e.SerializableCipher=r.extend({cfg:r.extend({format:y}),encrypt:function(t,e,r,i){i=this.cfg.extend(i);var n=t.createEncryptor(r,i),o=n.finalize(e),s=n.cfg;return v.create({ciphertext:o,key:r,iv:s.iv,algorithm:t,mode:s.mode,padding:s.padding,blockSize:t.blockSize,formatter:i.format})},decrypt:function(t,e,r,i){return i=this.cfg.extend(i),e=this._parse(e,i.format),t.createDecryptor(r,i).finalize(e.ciphertext)},_parse:function(t,e){return"string"==typeof t?e.parse(t,this):t}}),B=(t.kdf={}).OpenSSL={execute:function(t,e,r,i){i=i||c.random(8);var n=s.create({keySize:e+r}).compute(t,i),o=c.create(n.words.slice(e),4*r);return n.sigBytes=4*e,v.create({key:n,iv:o,salt:i})}},w=e.PasswordBasedCipher=g.extend({cfg:g.cfg.extend({kdf:B}),encrypt:function(t,e,r,i){var n=(i=this.cfg.extend(i)).kdf.execute(r,t.keySize,t.ivSize);i.iv=n.iv;var o=g.encrypt.call(this,t,e,n.key,i);return o.mixIn(n),o},decrypt:function(t,e,r,i){i=this.cfg.extend(i),e=this._parse(e,i.format);var n=i.kdf.execute(r,t.keySize,t.ivSize,e.salt);return i.iv=n.iv,g.decrypt.call(this,t,e,n.key,i)}})}(),Pt.mode.CFB=((ft=Pt.lib.BlockCipherMode.extend()).Encryptor=ft.extend({processBlock:function(t,e){var r=this._cipher,i=r.blockSize;jt.call(this,t,e,i,r),this._prevBlock=t.slice(e,e+i)}}),ft.Decryptor=ft.extend({processBlock:function(t,e){var r=this._cipher,i=r.blockSize,n=t.slice(e,e+i);jt.call(this,t,e,i,r),this._prevBlock=n}}),ft),Pt.mode.ECB=((ut=Pt.lib.BlockCipherMode.extend()).Encryptor=ut.extend({processBlock:function(t,e){this._cipher.encryptBlock(t,e)}}),ut.Decryptor=ut.extend({processBlock:function(t,e){this._cipher.decryptBlock(t,e)}}),ut),Pt.pad.AnsiX923={pad:function(t,e){var r=t.sigBytes,i=4*e,n=i-r%i,o=r+n-1;t.clamp(),t.words[o>>>2]|=n<<24-o%4*8,t.sigBytes+=n},unpad:function(t){var e=255&t.words[t.sigBytes-1>>>2];t.sigBytes-=e}},Pt.pad.Iso10126={pad:function(t,e){var r=4*e,i=r-t.sigBytes%r;t.concat(Pt.lib.WordArray.random(i-1)).concat(Pt.lib.WordArray.create([i<<24],1))},unpad:function(t){var e=255&t.words[t.sigBytes-1>>>2];t.sigBytes-=e}},Pt.pad.Iso97971={pad:function(t,e){t.concat(Pt.lib.WordArray.create([2147483648],1)),Pt.pad.ZeroPadding.pad(t,e)},unpad:function(t){Pt.pad.ZeroPadding.unpad(t),t.sigBytes--}},Pt.mode.OFB=(dt=Pt.lib.BlockCipherMode.extend(),pt=dt.Encryptor=dt.extend({processBlock:function(t,e){var r=this._cipher,i=r.blockSize,n=this._iv,o=this._keystream;n&&(o=this._keystream=n.slice(0),this._iv=void 0),r.encryptBlock(o,0);for(var s=0;s<i;s++)t[e+s]^=o[s]}}),dt.Decryptor=pt,dt),Pt.pad.NoPadding={pad:function(){},unpad:function(){}},_t=Pt.lib.CipherParams,vt=Pt.enc.Hex,Pt.format.Hex={stringify:function(t){return t.ciphertext.toString(vt)},parse:function(t){var e=vt.parse(t);return _t.create({ciphertext:e})}},function(){var t=Pt,e=t.lib.BlockCipher,r=t.algo,h=[],l=[],f=[],u=[],d=[],p=[],_=[],v=[],y=[],g=[];!function(){for(var t=[],e=0;e<256;e++)t[e]=e<128?e<<1:e<<1^283;var r=0,i=0;for(e=0;e<256;e++){var n=i^i<<1^i<<2^i<<3^i<<4;n=n>>>8^255&n^99,h[r]=n;var o=t[l[n]=r],s=t[o],a=t[s],c=257*t[n]^16843008*n;f[r]=c<<24|c>>>8,u[r]=c<<16|c>>>16,d[r]=c<<8|c>>>24,p[r]=c;c=16843009*a^65537*s^257*o^16843008*r;_[n]=c<<24|c>>>8,v[n]=c<<16|c>>>16,y[n]=c<<8|c>>>24,g[n]=c,r?(r=o^t[t[t[a^o]]],i^=t[t[i]]):r=i=1}}();var B=[0,1,2,4,8,16,32,64,128,27,54],i=r.AES=e.extend({_doReset:function(){if(!this._nRounds||this._keyPriorReset!==this._key){for(var t=this._keyPriorReset=this._key,e=t.words,r=t.sigBytes/4,i=4*(1+(this._nRounds=6+r)),n=this._keySchedule=[],o=0;o<i;o++)if(o<r)n[o]=e[o];else{var s=n[o-1];o%r?6<r&&o%r==4&&(s=h[s>>>24]<<24|h[s>>>16&255]<<16|h[s>>>8&255]<<8|h[255&s]):(s=h[(s=s<<8|s>>>24)>>>24]<<24|h[s>>>16&255]<<16|h[s>>>8&255]<<8|h[255&s],s^=B[o/r|0]<<24),n[o]=n[o-r]^s}for(var a=this._invKeySchedule=[],c=0;c<i;c++){o=i-c;if(c%4)s=n[o];else s=n[o-4];a[c]=c<4||o<=4?s:_[h[s>>>24]]^v[h[s>>>16&255]]^y[h[s>>>8&255]]^g[h[255&s]]}}},encryptBlock:function(t,e){this._doCryptBlock(t,e,this._keySchedule,f,u,d,p,h)},decryptBlock:function(t,e){var r=t[e+1];t[e+1]=t[e+3],t[e+3]=r,this._doCryptBlock(t,e,this._invKeySchedule,_,v,y,g,l);r=t[e+1];t[e+1]=t[e+3],t[e+3]=r},_doCryptBlock:function(t,e,r,i,n,o,s,a){for(var c=this._nRounds,h=t[e]^r[0],l=t[e+1]^r[1],f=t[e+2]^r[2],u=t[e+3]^r[3],d=4,p=1;p<c;p++){var _=i[h>>>24]^n[l>>>16&255]^o[f>>>8&255]^s[255&u]^r[d++],v=i[l>>>24]^n[f>>>16&255]^o[u>>>8&255]^s[255&h]^r[d++],y=i[f>>>24]^n[u>>>16&255]^o[h>>>8&255]^s[255&l]^r[d++],g=i[u>>>24]^n[h>>>16&255]^o[l>>>8&255]^s[255&f]^r[d++];h=_,l=v,f=y,u=g}_=(a[h>>>24]<<24|a[l>>>16&255]<<16|a[f>>>8&255]<<8|a[255&u])^r[d++],v=(a[l>>>24]<<24|a[f>>>16&255]<<16|a[u>>>8&255]<<8|a[255&h])^r[d++],y=(a[f>>>24]<<24|a[u>>>16&255]<<16|a[h>>>8&255]<<8|a[255&l])^r[d++],g=(a[u>>>24]<<24|a[h>>>16&255]<<16|a[l>>>8&255]<<8|a[255&f])^r[d++];t[e]=_,t[e+1]=v,t[e+2]=y,t[e+3]=g},keySize:8});t.AES=e._createHelper(i)}(),function(){var t=Pt,e=t.lib,r=e.WordArray,i=e.BlockCipher,n=t.algo,h=[57,49,41,33,25,17,9,1,58,50,42,34,26,18,10,2,59,51,43,35,27,19,11,3,60,52,44,36,63,55,47,39,31,23,15,7,62,54,46,38,30,22,14,6,61,53,45,37,29,21,13,5,28,20,12,4],l=[14,17,11,24,1,5,3,28,15,6,21,10,23,19,12,4,26,8,16,7,27,20,13,2,41,52,31,37,47,55,30,40,51,45,33,48,44,49,39,56,34,53,46,42,50,36,29,32],f=[1,2,4,6,8,10,12,14,15,17,19,21,23,25,27,28],u=[{0:8421888,268435456:32768,536870912:8421378,805306368:2,1073741824:512,1342177280:8421890,1610612736:8389122,1879048192:8388608,2147483648:514,2415919104:8389120,2684354560:33280,2952790016:8421376,3221225472:32770,3489660928:8388610,3758096384:0,4026531840:33282,134217728:0,402653184:8421890,671088640:33282,939524096:32768,1207959552:8421888,1476395008:512,1744830464:8421378,2013265920:2,2281701376:8389120,2550136832:33280,2818572288:8421376,3087007744:8389122,3355443200:8388610,3623878656:32770,3892314112:514,4160749568:8388608,1:32768,268435457:2,536870913:8421888,805306369:8388608,1073741825:8421378,1342177281:33280,1610612737:512,1879048193:8389122,2147483649:8421890,2415919105:8421376,2684354561:8388610,2952790017:33282,3221225473:514,3489660929:8389120,3758096385:32770,4026531841:0,134217729:8421890,402653185:8421376,671088641:8388608,939524097:512,1207959553:32768,1476395009:8388610,1744830465:2,2013265921:33282,2281701377:32770,2550136833:8389122,2818572289:514,3087007745:8421888,3355443201:8389120,3623878657:0,3892314113:33280,4160749569:8421378},{0:1074282512,16777216:16384,33554432:524288,50331648:1074266128,67108864:1073741840,83886080:1074282496,100663296:1073758208,117440512:16,134217728:540672,150994944:1073758224,167772160:1073741824,184549376:540688,201326592:524304,218103808:0,234881024:16400,251658240:1074266112,8388608:1073758208,25165824:540688,41943040:16,58720256:1073758224,75497472:1074282512,92274688:1073741824,109051904:524288,125829120:1074266128,142606336:524304,159383552:0,176160768:16384,192937984:1074266112,209715200:1073741840,226492416:540672,243269632:1074282496,260046848:16400,268435456:0,285212672:1074266128,301989888:1073758224,318767104:1074282496,335544320:1074266112,352321536:16,369098752:540688,385875968:16384,402653184:16400,419430400:524288,436207616:524304,452984832:1073741840,469762048:540672,486539264:1073758208,503316480:1073741824,520093696:1074282512,276824064:540688,293601280:524288,310378496:1074266112,327155712:16384,343932928:1073758208,360710144:1074282512,377487360:16,394264576:1073741824,411041792:1074282496,427819008:1073741840,444596224:1073758224,461373440:524304,478150656:0,494927872:16400,511705088:1074266128,528482304:540672},{0:260,1048576:0,2097152:67109120,3145728:65796,4194304:65540,5242880:67108868,6291456:67174660,7340032:67174400,8388608:67108864,9437184:67174656,10485760:65792,11534336:67174404,12582912:67109124,13631488:65536,14680064:4,15728640:256,524288:67174656,1572864:67174404,2621440:0,3670016:67109120,4718592:67108868,5767168:65536,6815744:65540,7864320:260,8912896:4,9961472:256,11010048:67174400,12058624:65796,13107200:65792,14155776:67109124,15204352:67174660,16252928:67108864,16777216:67174656,17825792:65540,18874368:65536,19922944:67109120,20971520:256,22020096:67174660,23068672:67108868,24117248:0,25165824:67109124,26214400:67108864,27262976:4,28311552:65792,29360128:67174400,30408704:260,31457280:65796,32505856:67174404,17301504:67108864,18350080:260,19398656:67174656,20447232:0,21495808:65540,22544384:67109120,23592960:256,24641536:67174404,25690112:65536,26738688:67174660,27787264:65796,28835840:67108868,29884416:67109124,30932992:67174400,31981568:4,33030144:65792},{0:2151682048,65536:2147487808,131072:4198464,196608:2151677952,262144:0,327680:4198400,393216:2147483712,458752:4194368,524288:2147483648,589824:4194304,655360:64,720896:2147487744,786432:2151678016,851968:4160,917504:4096,983040:2151682112,32768:2147487808,98304:64,163840:2151678016,229376:2147487744,294912:4198400,360448:2151682112,425984:0,491520:2151677952,557056:4096,622592:2151682048,688128:4194304,753664:4160,819200:2147483648,884736:4194368,950272:4198464,1015808:2147483712,1048576:4194368,1114112:4198400,1179648:2147483712,1245184:0,1310720:4160,1376256:2151678016,1441792:2151682048,1507328:2147487808,1572864:2151682112,1638400:2147483648,1703936:2151677952,1769472:4198464,1835008:2147487744,1900544:4194304,1966080:64,2031616:4096,1081344:2151677952,1146880:2151682112,1212416:0,1277952:4198400,1343488:4194368,1409024:2147483648,1474560:2147487808,1540096:64,1605632:2147483712,1671168:4096,1736704:2147487744,1802240:2151678016,1867776:4160,1933312:2151682048,1998848:4194304,2064384:4198464},{0:128,4096:17039360,8192:262144,12288:536870912,16384:537133184,20480:16777344,24576:553648256,28672:262272,32768:16777216,36864:537133056,40960:536871040,45056:553910400,49152:553910272,53248:0,57344:17039488,61440:553648128,2048:17039488,6144:553648256,10240:128,14336:17039360,18432:262144,22528:537133184,26624:553910272,30720:536870912,34816:537133056,38912:0,43008:553910400,47104:16777344,51200:536871040,55296:553648128,59392:16777216,63488:262272,65536:262144,69632:128,73728:536870912,77824:553648256,81920:16777344,86016:553910272,90112:537133184,94208:16777216,98304:553910400,102400:553648128,106496:17039360,110592:537133056,114688:262272,118784:536871040,122880:0,126976:17039488,67584:553648256,71680:16777216,75776:17039360,79872:537133184,83968:536870912,88064:17039488,92160:128,96256:553910272,100352:262272,104448:553910400,108544:0,112640:553648128,116736:16777344,120832:262144,124928:537133056,129024:536871040},{0:268435464,256:8192,512:270532608,768:270540808,1024:268443648,1280:2097152,1536:2097160,1792:268435456,2048:0,2304:268443656,2560:2105344,2816:8,3072:270532616,3328:2105352,3584:8200,3840:270540800,128:270532608,384:270540808,640:8,896:2097152,1152:2105352,1408:268435464,1664:268443648,1920:8200,2176:2097160,2432:8192,2688:268443656,2944:270532616,3200:0,3456:270540800,3712:2105344,3968:268435456,4096:268443648,4352:270532616,4608:270540808,4864:8200,5120:2097152,5376:268435456,5632:268435464,5888:2105344,6144:2105352,6400:0,6656:8,6912:270532608,7168:8192,7424:268443656,7680:270540800,7936:2097160,4224:8,4480:2105344,4736:2097152,4992:268435464,5248:268443648,5504:8200,5760:270540808,6016:270532608,6272:270540800,6528:270532616,6784:8192,7040:2105352,7296:2097160,7552:0,7808:268435456,8064:268443656},{0:1048576,16:33555457,32:1024,48:1049601,64:34604033,80:0,96:1,112:34603009,128:33555456,144:1048577,160:33554433,176:34604032,192:34603008,208:1025,224:1049600,240:33554432,8:34603009,24:0,40:33555457,56:34604032,72:1048576,88:33554433,104:33554432,120:1025,136:1049601,152:33555456,168:34603008,184:1048577,200:1024,216:34604033,232:1,248:1049600,256:33554432,272:1048576,288:33555457,304:34603009,320:1048577,336:33555456,352:34604032,368:1049601,384:1025,400:34604033,416:1049600,432:1,448:0,464:34603008,480:33554433,496:1024,264:1049600,280:33555457,296:34603009,312:1,328:33554432,344:1048576,360:1025,376:34604032,392:33554433,408:34603008,424:0,440:34604033,456:1049601,472:1024,488:33555456,504:1048577},{0:134219808,1:131072,2:134217728,3:32,4:131104,5:134350880,6:134350848,7:2048,8:134348800,9:134219776,10:133120,11:134348832,12:2080,13:0,14:134217760,15:133152,2147483648:2048,2147483649:134350880,2147483650:134219808,2147483651:134217728,2147483652:134348800,2147483653:133120,2147483654:133152,2147483655:32,2147483656:134217760,2147483657:2080,2147483658:131104,2147483659:134350848,2147483660:0,2147483661:134348832,2147483662:134219776,2147483663:131072,16:133152,17:134350848,18:32,19:2048,20:134219776,21:134217760,22:134348832,23:131072,24:0,25:131104,26:134348800,27:134219808,28:134350880,29:133120,30:2080,31:134217728,2147483664:131072,2147483665:2048,2147483666:134348832,2147483667:133152,2147483668:32,2147483669:134348800,2147483670:134217728,2147483671:134219808,2147483672:134350880,2147483673:134217760,2147483674:134219776,2147483675:0,2147483676:133120,2147483677:2080,2147483678:131104,2147483679:134350848}],d=[4160749569,528482304,33030144,2064384,129024,8064,504,2147483679],o=n.DES=i.extend({_doReset:function(){for(var t=this._key.words,e=[],r=0;r<56;r++){var i=h[r]-1;e[r]=t[i>>>5]>>>31-i%32&1}for(var n=this._subKeys=[],o=0;o<16;o++){var s=n[o]=[],a=f[o];for(r=0;r<24;r++)s[r/6|0]|=e[(l[r]-1+a)%28]<<31-r%6,s[4+(r/6|0)]|=e[28+(l[r+24]-1+a)%28]<<31-r%6;s[0]=s[0]<<1|s[0]>>>31;for(r=1;r<7;r++)s[r]=s[r]>>>4*(r-1)+3;s[7]=s[7]<<5|s[7]>>>27}var c=this._invSubKeys=[];for(r=0;r<16;r++)c[r]=n[15-r]},encryptBlock:function(t,e){this._doCryptBlock(t,e,this._subKeys)},decryptBlock:function(t,e){this._doCryptBlock(t,e,this._invSubKeys)},_doCryptBlock:function(t,e,r){this._lBlock=t[e],this._rBlock=t[e+1],p.call(this,4,252645135),p.call(this,16,65535),_.call(this,2,858993459),_.call(this,8,16711935),p.call(this,1,1431655765);for(var i=0;i<16;i++){for(var n=r[i],o=this._lBlock,s=this._rBlock,a=0,c=0;c<8;c++)a|=u[c][((s^n[c])&d[c])>>>0];this._lBlock=s,this._rBlock=o^a}var h=this._lBlock;this._lBlock=this._rBlock,this._rBlock=h,p.call(this,1,1431655765),_.call(this,8,16711935),_.call(this,2,858993459),p.call(this,16,65535),p.call(this,4,252645135),t[e]=this._lBlock,t[e+1]=this._rBlock},keySize:2,ivSize:2,blockSize:2});function p(t,e){var r=(this._lBlock>>>t^this._rBlock)&e;this._rBlock^=r,this._lBlock^=r<<t}function _(t,e){var r=(this._rBlock>>>t^this._lBlock)&e;this._lBlock^=r,this._rBlock^=r<<t}t.DES=i._createHelper(o);var s=n.TripleDES=i.extend({_doReset:function(){var t=this._key.words;this._des1=o.createEncryptor(r.create(t.slice(0,2))),this._des2=o.createEncryptor(r.create(t.slice(2,4))),this._des3=o.createEncryptor(r.create(t.slice(4,6)))},encryptBlock:function(t,e){this._des1.encryptBlock(t,e),this._des2.decryptBlock(t,e),this._des3.encryptBlock(t,e)},decryptBlock:function(t,e){this._des3.decryptBlock(t,e),this._des2.encryptBlock(t,e),this._des1.decryptBlock(t,e)},keySize:6,ivSize:2,blockSize:2});t.TripleDES=i._createHelper(s)}(),function(){var t=Pt,e=t.lib.StreamCipher,r=t.algo,i=r.RC4=e.extend({_doReset:function(){for(var t=this._key,e=t.words,r=t.sigBytes,i=this._S=[],n=0;n<256;n++)i[n]=n;n=0;for(var o=0;n<256;n++){var s=n%r,a=e[s>>>2]>>>24-s%4*8&255;o=(o+i[n]+a)%256;var c=i[n];i[n]=i[o],i[o]=c}this._i=this._j=0},_doProcessBlock:function(t,e){t[e]^=n.call(this)},keySize:8,ivSize:0});function n(){for(var t=this._S,e=this._i,r=this._j,i=0,n=0;n<4;n++){r=(r+t[e=(e+1)%256])%256;var o=t[e];t[e]=t[r],t[r]=o,i|=t[(t[e]+t[r])%256]<<24-8*n}return this._i=e,this._j=r,i}t.RC4=e._createHelper(i);var o=r.RC4Drop=i.extend({cfg:i.cfg.extend({drop:192}),_doReset:function(){i._doReset.call(this);for(var t=this.cfg.drop;0<t;t--)n.call(this)}});t.RC4Drop=e._createHelper(o)}(),Pt.mode.CTRGladman=(yt=Pt.lib.BlockCipherMode.extend(),gt=yt.Encryptor=yt.extend({processBlock:function(t,e){var r,i=this._cipher,n=i.blockSize,o=this._iv,s=this._counter;o&&(s=this._counter=o.slice(0),this._iv=void 0),0===((r=s)[0]=Nt(r[0]))&&(r[1]=Nt(r[1]));var a=s.slice(0);i.encryptBlock(a,0);for(var c=0;c<n;c++)t[e+c]^=a[c]}}),yt.Decryptor=gt,yt),wt=(Bt=Pt).lib.StreamCipher,kt=Bt.algo,St=[],mt=[],xt=[],bt=kt.Rabbit=wt.extend({_doReset:function(){for(var t=this._key.words,e=this.cfg.iv,r=0;r<4;r++)t[r]=16711935&(t[r]<<8|t[r]>>>24)|4278255360&(t[r]<<24|t[r]>>>8);var i=this._X=[t[0],t[3]<<16|t[2]>>>16,t[1],t[0]<<16|t[3]>>>16,t[2],t[1]<<16|t[0]>>>16,t[3],t[2]<<16|t[1]>>>16],n=this._C=[t[2]<<16|t[2]>>>16,4294901760&t[0]|65535&t[1],t[3]<<16|t[3]>>>16,4294901760&t[1]|65535&t[2],t[0]<<16|t[0]>>>16,4294901760&t[2]|65535&t[3],t[1]<<16|t[1]>>>16,4294901760&t[3]|65535&t[0]];for(r=this._b=0;r<4;r++)Tt.call(this);for(r=0;r<8;r++)n[r]^=i[r+4&7];if(e){var o=e.words,s=o[0],a=o[1],c=16711935&(s<<8|s>>>24)|4278255360&(s<<24|s>>>8),h=16711935&(a<<8|a>>>24)|4278255360&(a<<24|a>>>8),l=c>>>16|4294901760&h,f=h<<16|65535&c;n[0]^=c,n[1]^=l,n[2]^=h,n[3]^=f,n[4]^=c,n[5]^=l,n[6]^=h,n[7]^=f;for(r=0;r<4;r++)Tt.call(this)}},_doProcessBlock:function(t,e){var r=this._X;Tt.call(this),St[0]=r[0]^r[5]>>>16^r[3]<<16,St[1]=r[2]^r[7]>>>16^r[5]<<16,St[2]=r[4]^r[1]>>>16^r[7]<<16,St[3]=r[6]^r[3]>>>16^r[1]<<16;for(var i=0;i<4;i++)St[i]=16711935&(St[i]<<8|St[i]>>>24)|4278255360&(St[i]<<24|St[i]>>>8),t[e+i]^=St[i]},blockSize:4,ivSize:2}),Bt.Rabbit=wt._createHelper(bt),Pt.mode.CTR=(Ht=Pt.lib.BlockCipherMode.extend(),zt=Ht.Encryptor=Ht.extend({processBlock:function(t,e){var r=this._cipher,i=r.blockSize,n=this._iv,o=this._counter;n&&(o=this._counter=n.slice(0),this._iv=void 0);var s=o.slice(0);r.encryptBlock(s,0),o[i-1]=o[i-1]+1|0;for(var a=0;a<i;a++)t[e+a]^=s[a]}}),Ht.Decryptor=zt,Ht),Ct=(At=Pt).lib.StreamCipher,Dt=At.algo,Rt=[],Et=[],Mt=[],Ft=Dt.RabbitLegacy=Ct.extend({_doReset:function(){for(var t=this._key.words,e=this.cfg.iv,r=this._X=[t[0],t[3]<<16|t[2]>>>16,t[1],t[0]<<16|t[3]>>>16,t[2],t[1]<<16|t[0]>>>16,t[3],t[2]<<16|t[1]>>>16],i=this._C=[t[2]<<16|t[2]>>>16,4294901760&t[0]|65535&t[1],t[3]<<16|t[3]>>>16,4294901760&t[1]|65535&t[2],t[0]<<16|t[0]>>>16,4294901760&t[2]|65535&t[3],t[1]<<16|t[1]>>>16,4294901760&t[3]|65535&t[0]],n=this._b=0;n<4;n++)Zt.call(this);for(n=0;n<8;n++)i[n]^=r[n+4&7];if(e){var o=e.words,s=o[0],a=o[1],c=16711935&(s<<8|s>>>24)|4278255360&(s<<24|s>>>8),h=16711935&(a<<8|a>>>24)|4278255360&(a<<24|a>>>8),l=c>>>16|4294901760&h,f=h<<16|65535&c;i[0]^=c,i[1]^=l,i[2]^=h,i[3]^=f,i[4]^=c,i[5]^=l,i[6]^=h,i[7]^=f;for(n=0;n<4;n++)Zt.call(this)}},_doProcessBlock:function(t,e){var r=this._X;Zt.call(this),Rt[0]=r[0]^r[5]>>>16^r[3]<<16,Rt[1]=r[2]^r[7]>>>16^r[5]<<16,Rt[2]=r[4]^r[1]>>>16^r[7]<<16,Rt[3]=r[6]^r[3]>>>16^r[1]<<16;for(var i=0;i<4;i++)Rt[i]=16711935&(Rt[i]<<8|Rt[i]>>>24)|4278255360&(Rt[i]<<24|Rt[i]>>>8),t[e+i]^=Rt[i]},blockSize:4,ivSize:2}),At.RabbitLegacy=Ct._createHelper(Ft),Pt.pad.ZeroPadding={pad:function(t,e){var r=4*e;t.clamp(),t.sigBytes+=r-(t.sigBytes%r||r)},unpad:function(t){for(var e=t.words,r=t.sigBytes-1;!(e[r>>>2]>>>24-r%4*8&255);)r--;t.sigBytes=r+1}},Pt});