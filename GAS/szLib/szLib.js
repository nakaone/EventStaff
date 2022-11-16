/** szLib 使用上の注意
 * <ul>
 * <li>「共有」の設定(アクセス権)は各局を配置したアカウントのみに限定する
 * </ul>
 */

/** getConf: おまつり奉行用の各種パラメータを取得
 * @param {void} - なし
 * @returns {object} おまつり奉行用の各種パラメータ
 */
function getConf(){
  return {
    Auth: {   // 認証局
      // 認証局は誰でもアクセス可なので、key は設定しない
      key: '',  // undefinedにならないよう設定するダミー
      url: '',
    },
    Master: { // 管理局
      key: '',
      url: '',
    },
    Form: {   // 申請フォーム
      url: '',
    },
    Broad: {  // 放送局
      key: '',
      url: '',
    },
    Post: {   // 郵便局
      key: '',
      url: '',
    },
    Delivery: { // 配送局(配達員) ※将来的に放送局も使用予定
      key: '',
      url: '',
    },
    Monitor: {  // 監督局
      key: '',
      url: '',
      spreadId: '1V-9LgZlRDhuHUgKdDdUvJHu34FAi6hEwe2cAcPbz2TA',
      sheetName: 'log', // ↑ログを記入するスプレッドのID　←シート名
      overhead: 140, // ログを書き込む際に発生するオーバーヘッドタイム。ミリ秒
    },
  };
}

/** elaps: 監督局ログシートへの書き込み
 * 
 * @param {object} arg 
 * @param {number} arg.startTime - 開始時刻
 * @param {string} arg.account - 実行アカウント名
 * @param {string} arg.department - 局名
 * @param {string} arg.func - function/method名
 * @param {string} result - 結果
 * @returns {void} - なし
 */
function elaps(arg,result=''){
  SpreadsheetApp.openById(szConf.Monitor.spreadId).getSheetByName(szConf.Monitor.sheetName).appendRow([
    getJPDateTime(arg.startTime),   // timestamp
    arg.account,     // account
    arg.department,  // department
    arg.func,        // function/method
    Date.now() - arg.startTime + szConf.Monitor.overhead, // elaps
    result          // result
  ]);
}

/** fetchGAS: GASのdoPostを呼び出し、後続処理を行う
 * <br>
 * 処理内部で使用する公開鍵・秘密鍵はszLib.getUrlKey()で取得。<br>
 * なおhtml版のarg.callbackはGAS版では存在しない。
 * 
 * @param {object}   arg          - 引数
 * @param {string}   arg.from     - 送信側のコード名(Auth, Master等)
 * @param {string}   arg.to       - 受信側のコード名
 * @param {string}   arg.func     - GAS側で処理分岐の際のキー文字列
 * @param {any}      arg.data     - 処理対象データ
 * @returns {void} なし
 */
 const fetchGAS = (arg) => {
  console.log('fetchGAS start. arg='+JSON.stringify(arg));
  const conf = getConf();
  const options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify({
      passPhrase  : conf[arg.to].key,
      from: arg.from,
      to: arg.to,
      func: arg.func,
      data: arg.data,
    }),
  }
  const res = UrlFetchApp.fetch(config.MasterURL,options).getContentText();
  console.log('sender.GasPost.res=',typeof res,res);
  const rObj = JSON.parse(res);
  console.log('sender.GasPost.rObj',typeof rObj,rObj);
  return rObj;
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

/** szSheet: シートのデータ取得等、CRUDするメソッドを持つオブジェクトを返す
 * @param {object} arg - 引数
 * @param {string} arg.spreadId - 外部スプレッドシートのID
 * @param {string} arg.sheetName - シート名
 * @param {number} arg.headerRow - ヘッダ行の行番号(>0)。既定値1。項目名は重複不可
 * @returns {object} 取得したシートのデータ
 * <ul>
 * <li>sheet  {object}   - getSheetで取得したシートのオブジェクト
 * <li>raw    {any[][]}  - 取得した生データ(二次元配列)
 * <li>headerRow {number} - ヘッダ行番号
 * <li>keys   {string[]} - ヘッダ行の一次元配列
 * <li>data   {object[]} - データ行を[{ラベル1:値, ラベル2:値, ..},{..},..]形式にした配列
 * <li>lastRow {number} - データが存在する最下行の行番号(>0)
 * <li>lookup {function} - メソッド。(key,value)を引数に、項目名'key'の値がvalueである行Objを返す
 * <ul>
 */
function szSheet(arg){
  const rv = {};
  if( 'spreadId' in arg ){
    rv.sheet = SpreadsheetApp.openById(arg.spreadId).getSheetByName(arg.sheetName);
  } else {
    rv.sheet = SpreadsheetApp.getActive().getSheetByName(arg.sheetName);
  }  

  // データの取得・加工
  rv.raw = rv.sheet.getDataRange().getValues();
  const raw = JSON.parse(JSON.stringify(rv.raw));
  rv.headerRow = arg.headerRow || 1;  // ヘッダ行の既定値は1行目
  rv.keys = raw.splice(rv.headerRow-1,1)[0];
  rv.data = raw.splice(rv.headerRow-1).map(row => {
    const obj = {};
    row.map((item, index) => {
      obj[String(rv.keys[index])] = String(item);
    });
    return obj;
  });
  rv.lastRow = rv.raw.length;
  
  /** lookup: 項目名'key'の値がvalueである行Objを返す
   * @param {string} key   - キーとなる項目名
   * @param {any}    value - キー値
   * @returns {object} 行オブジェクト({項目名1:値1,項目名2:値2,..}形式)
   */
  rv.lookup = (key,value) => { // 
    return rv.data.filter(x => {return x[key] === value})[0];
  };

  /** update: 該当する行の値を変更する
   * @param {string} keyColumn - キーとなる項目名
   * @param {any} keyValue - キー値
   * @param {object[]} revise - 修正箇所の配列
   * @param {string} revise.column - 修正する項目名
   * @param {any} revise.value - 修正後の値
   * @param {boolean} append - 一致するキー値が無ければ追加するならtrue
   * @returns {object[]} 修正前後の値
   * <ul>
   * <li>isErr {boolean} - エラーならtrue
   * <li>result {object[]} - 更新結果。空なら変更なし
   * <ul>
   * <li>column {string} - 更新した項目名
   * <li>before {any} - 修正前の値
   * <li>after {any} - 修正後の値
   * </ul>
   * </ul>
   */
  rv.update = (keyColumn,keyValue,revise,append=true) => {
    try {
      // 1.何行目のデータを更新するか特定するし、更新対象行のデータをuArrに保存する
      // keyColumn == null ならappendから回されたと判断
      let i = (keyColumn === null) ? -1 : rv.data.map(x => x[keyColumn]).indexOf(String(keyValue));
      let rowNum = null;
      let uArr = [];
      if( i < 0 ){  // 未登録の場合
        if( append ){  // 追加する場合
          rowNum = rv.lastRow + 1;
          rv.lastRow += 1;
          if( keyColumn !== null ){
            revise.push({column:keyColumn,value:keyValue}); // キー項目も追加
          }
        } else {  // 追加しない場合
          return {isErr:false,result:[]};
        }
      } else {  // 登録済の場合
        rowNum = i + rv.headerRow + 1;
        uArr = rv.raw[rowNum-1];
      }

      // 2.uArrのデータを順次更新しながらログに記録、更新範囲をメモ
      const log = [];
      let maxColumn = 0;
      let minColumn = 99999;
      for( i=0 ; i<revise.length ; i++ ){
        // (1) 更新対象項目の列番号を特定、columnに保存
        const column = rv.keys.indexOf(revise[i].column);
        // (2) >maxColumn or <minColumn ならmax/minを更新
        maxColumn = column > maxColumn ? column : maxColumn;
        minColumn = column < minColumn ? column : minColumn;
        // (3) logに更新対象項目/更新前の値/更新後の値を保存
        if( uArr[column] !== revise[i].value ){
          log.push({
            column: revise[i].column,
            before: uArr[column],
            after: revise[i].value,
          });
        }
        // (4) uArr[column]の値を更新
        uArr[column] = revise[i].value;
      }

      // 3.uArrから更新範囲のデータを切り出して更新
      const range = rv.sheet.getRange(rowNum, minColumn+1, 1, maxColumn-minColumn+1);
      const sv = uArr.splice(minColumn, maxColumn-minColumn+1);
      range.setValues([sv]);
      return {isErr:false,result:log};
    } catch(e) {
      return {isErr:true,message:e.message};
    }
  };

  /** append: 行の追加
   * @param {any[]|object[]} arg - anyなら追加行の一次元配列、objectなら項目名＋値
   * @param {string} arg.column - 追加する項目名
   * @param {any} arg.value - 追加する値
   * @returns {object[]} 追加前後の値
   * <ul>
   * <li>isErr {boolean} - エラーならtrue
   * <li>result {object[]} - 追加結果。空なら追加なし
   * <ul>
   * <li>column {string} - 追加した項目名
   * <li>before {any} - 追加前の値(undefined)
   * <li>after {any} - 追加後の値
   * </ul>
   * </ul>
   */
  rv.append = (arg) => {
    let revise = [];
    if( whichType(arg[0]) === 'Object' ){
      revise = arg;
    } else {
      for( let i=0 ; i<arg.length ; i++ ){
        if( String(arg[i]).length > 0 ){
          revise.push({column:rv.keys[i], value:arg[i]});
        }
      }
    }
    return rv.update(null,null,revise,true);
  };

  return rv;
}

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

/** whichType: 変数の型を判定
 * @param {any} arg - 判定対象の変数
 * @returns {string} - 型の名前
 */
function whichType(arg){
  return arg === undefined ? 'undefined'
   : Object.prototype.toString.call(arg)
    .match(/^\[object\s(.*)\]$/)[1];
}