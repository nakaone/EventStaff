/** szLib 使用上の注意
 * <ul>
 * <li>「共有」の設定(アクセス権)は各局を配置したアカウントのみに限定する
 * </ul>
 */

/** authorize: 各種権限の取得
 * シートの参照(シート毎)
 * メールの発信
 */
 const authorize = () => {
  const rv = elaps({startTime:Date.now()-1000,account:'test@gmail.com',department:'テスト局',func:'elaps'},'result=hoge');
  console.log(rv);
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

/** elaps: 資源局ログシートへの書き込み
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
  const conf = getConf();
  const res = fetchGAS({
    from: arg.department,
    to: 'Agency',
    func: 'logElaps',
    data: {
      timestamp: getJPDateTime(arg.startTime),
      account: arg.account,
      requester: arg.department,
      function: arg.func,
      elaps: Date.now() - arg.startTime + conf.Agency.overhead,
      result: result,
    }
  });
  console.log('elaps end.',res);
}

/** fetchGAS: GASのdoPostを呼び出す
 * <br>
 * 処理内部で使用する公開鍵・秘密鍵はszLib.getConf()で取得。<br>
 * なおhtml版のarg.callbackはGAS版では存在しない。
 * 
 * @param {object}   arg          - 引数
 * @param {string}   arg.from     - 送信側のコード名(Auth, Master等)
 * @param {string}   arg.to       - 受信側のコード名
 * @param {string}   arg.func     - GAS側で処理分岐の際のキー文字列
 * @param {string}   arg.endpoint - 受信側のコード名からURLが判断できない(配達員の)場合に指定
 * @param {string}   arg.key      - endpoint指定の場合はその鍵も併せて指定
 * @param {any}      arg.data     - 処理対象データ
 * @returns {object} 処理先からの返信
 */
 function fetchGAS(arg){
  console.log('fetchGAS start. arg='+JSON.stringify(arg));
  const conf = getConf();
  const endpoint = arg.endpoint || conf[arg.to].url;
  const key = arg.key || conf[arg.to].key;

  const res = UrlFetchApp.fetch(endpoint,{
    'method': 'post',
    'contentType': 'application/json',
    'muteHttpExceptions': true, // https://teratail.com/questions/64619
    'payload' : JSON.stringify({
      key  : key,
      from: arg.from,
      to: arg.to,
      func: arg.func,
      data: arg.data,
    }),  
  }).getContentText();
  console.log('fetchGAS end. res='+res)
  const rObj = JSON.parse(res);
  return rObj;
}

/** getConf: おまつり奉行用の各種パラメータを取得
 * @param {void} - なし
 * @returns {object} おまつり奉行用の各種パラメータ
 * 
 * 当初ソースに直接埋込したが、URL変更の都度szLibの再デプロイが必要になるため、
 * 参照の都度別ファイルを見に行く形式に変更した。
 */
 function getConf(){
  // IdはGoogle Drive上の"config.json"のファイルId
  const res = DriveApp.getFileById('1-Q38GWnJo3YbR1xKF_On9lpc_LOxyfxD').getBlob().getDataAsString('utf8');
  const str = res.replace(/ *\/\/ .+?\n/g,'');  // '// '以降行末まで削除
  console.log('getConf end. str='+str);
  return JSON.parse(str);
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

/** readJson: おまつり奉行設定ファイル(config.json)の内容取得
 * @param {void} - なし
 * @returns {object} オブジェクト化したconfig.json
 */
const readJson = () => {
  const res = DriveApp.getFileById('1-Q38GWnJo3YbR1xKF_On9lpc_LOxyfxD').getBlob().getDataAsString('utf8');
  const str = res.replace(/ *\/\/ .+?\n/g,'');
  const obj = JSON.parse(str);
  console.log('readJson -> '+JSON.stringify(obj));
  return obj;
}

/** szSheet: データ取得等、シートのCRUDを行う
 * <br>
 * GAS用擬似クラス。CRUD用メソッドを持つオブジェクトを生成する。
 * @param {object|string} arg - 文字列の場合「コンテナのシートでヘッダ行は1行目」と看做す
 * @param {string} arg.spreadId - 外部スプレッドシートのID
 * @param {string} arg.sheetName - シート名
 * @param {number} arg.headerRow - ヘッダ行の行番号(>0)。既定値1。項目名は重複不可
 * @param {string} key - プライマリキーとなる項目名
 * @returns {object} 取得したシートのデータ
 * <ul>
 * <li>sheet  {object}   - getSheetで取得したシートのオブジェクト
 * <li>headerRow {number} - ヘッダ行番号
 * <li>lastRow {number} - データが存在する最下行の行番号(>0)
 * <li>keys   {string[]} - ヘッダ行の一次元配列
 * <li>raw    {any[][]}  - 取得した生データ(二次元配列)
 * <li>data   {object[]} - データ行を[{ラベル1:値, ラベル2:値, ..},{..},..]形式にした配列
 * <li>search {function} - メソッド。行の検索。主に内部利用を想定
 * <li>lookup {function} - メソッド。search結果を基に項目名'key'の値がvalueである行Objを返す
 * <li>update {function} - メソッド。行の更新
 * <li>append {function} - メソッド。行の追加
 * <ul>
 */
function szSheet(arg,key=null){
  const rv = {};
  if( typeof arg === 'string' ){  // 文字列のみ ⇒ シート名の指定
    rv.sheet = SpreadsheetApp.getActive().getSheetByName(arg);
    rv.headerRow = 1; // ヘッダ行は1行目(固定)
  } else {
    if( 'spreadId' in arg ){
      rv.sheet = SpreadsheetApp.openById(arg.spreadId).getSheetByName(arg.sheetName);
    } else {
      rv.sheet = SpreadsheetApp.getActive().getSheetByName(arg.sheetName);
    }  
    rv.headerRow = arg.headerRow || 1;  // ヘッダ行の既定値は1行目
  }
  rv.key = key;

  // データの取得・加工
  rv.raw = rv.sheet.getDataRange().getValues();
  const raw = JSON.parse(JSON.stringify(rv.raw));
  rv.keys = raw.splice(rv.headerRow-1,1)[0];
  rv.data = raw.splice(rv.headerRow-1).map(row => {
    const obj = {};
    row.map((item, index) => {
      obj[String(rv.keys[index])] = String(item);
    });
    return obj;
  });
  rv.lastRow = rv.raw.length;
  
  /** search: 項目名'key'の値がvalueである行Objを検索する
   * @param {any}    value - キー値
   * @param {string} key   - キーとなる項目名。既定値はキー項目名(rv.key)
   * @returns {object} 以下のメンバを持つオブジェクト
   * <ul>
   * <li>match {number} - 存在しなければ0、複数存在すれば>0
   * <li>obj {object} - 最初にマッチした行オブジェクト({項目名1:値1,項目名2:値2,..}形式)
   * <li>dataNum {number} - rv.data上の添字
   * <li>rawNum {number} - rv.raw上の添字
   * <li>rowNum {number} - スプレッドシート上の行番号
   * </ul>
   */
  rv.search = (value,key=rv.key) => {
    let r = {match:0};
    const vType = whichType(value).toLowerCase();
    console.log('vType='+vType)
    for( let i=0 ; i<rv.data.length ; i++ ){
      let flag = false;
      switch( vType ){
        case 'date':
          flag = new Date(rv.data[i][key]).getTime() === value.getTime();
          break;
        case 'number':
          flag = Number(rv.data[i][key]) === value;
          break;
        default:
          flag = String(rv.data[i][key]) === String(value);
      }
      if( flag ){
        if( r.match === 0 ){  // 最初にマッチした場合
          r.obj = rv.data[i];
          r.dataNum = i;
          r.rawNum = i + rv.headerRow;
          r.rowNum = r.rawNum + 1;
        }
        r.match += 1;
      }
    }
    console.log('szSheet.search('+value+','+key+') -> '+JSON.stringify(r));
    return r;
  };

  /** lookup: 項目名'key'の値がvalueである行Objを返す
   * @param {any}    value - キー値
   * @param {string} key   - キーとなる項目名。既定値はキー項目名
   * @returns {object} 行オブジェクト({項目名1:値1,項目名2:値2,..}形式)
   */
  rv.lookup = (value,key=rv.key) => {
    let searchResult = rv.search(value,key);
    return searchResult.match === 1 ? searchResult.obj : {};
  };

  /** update: 該当する行の値を変更する
   * <br>
   * key/valueにマッチする行が複数あった場合、最初の行のみ更新。<br>
   * 複数行の一括更新は対応しない(複数回updateを呼び出す)<br>
   * any[]型の更新データには対応しない(修正位置が不明確になるため)
   * @param {object} data - 更新データ。{項目名：設定値,..}形式
   * @param {object|any} opt - オプション指定。非objならkey=rv.key,value=opt,append=trueと看做す
   * @param {string} opt.key - キーとなる項目名。既定値rv.key
   * @param {any}    opt.value - キー値
   * @param {boolean} opt.append - true(既定値)ならキー値が存在しない場合は追加
   * 
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
  rv.update = (data,opt) => {
    try {
      // オプションに既定値セット
      if( whichType(opt).toLocaleLowerCase() === 'object' ){
        opt.key = opt.key || rv.key;
        opt.append = opt.append || true;
      } else {
        opt = {key:rv.key,value:opt,append:true};
      }

      // 何行目のデータを更新するか特定するし、更新対象行のデータをuArrに保存する
      const searchResult = rv.search(opt.value,opt.key);
      if( searchResult.match === 0 ){
        if( opt.append ){
          return rv.append(data);
        } else {
          throw new Error('更新対象行が見つかりません');
        }
      }
      const uArr = JSON.parse(JSON.stringify(rv.raw[searchResult.rawNum]));
      console.log('uArr='+JSON.stringify(uArr));

      // uArrのデータを順次更新しながらログに記録、更新範囲をメモ
      const log = [];
      let maxColumn = 0;
      let minColumn = 99999;
      for( let x in data ){
        // (1) 更新対象項目の列番号を特定、columnに保存
        const column = rv.keys.indexOf(x);
        // (2) >maxColumn or <minColumn ならmax/minを更新
        maxColumn = column > maxColumn ? column : maxColumn;
        minColumn = column < minColumn ? column : minColumn;
        // (3) logに更新対象項目/更新前の値/更新後の値を保存
        if( uArr[column] !== data[x] ){
          log.push({
            column: x,
            before: uArr[column],
            after: data[x],
          });
        }
        // (4) uArr[column]の値を更新
        uArr[column] = data[x];

      }
      console.log('log='+JSON.stringify(log)+'\nuArr='+JSON.stringify(uArr));

      // 3.uArrから更新範囲のデータを切り出して更新
      const range = rv.sheet.getRange(searchResult.rowNum, minColumn+1, 1, maxColumn-minColumn+1);
      const sv = uArr.splice(minColumn, maxColumn-minColumn+1);
      range.setValues([sv]);
      console.log('szSheet.update(data='+JSON.stringify(data)+',opt='+JSON.stringify(opt)+') -> '+JSON.stringify({isErr:false,result:log}));
      return {isErr:false,result:log};
      
    } catch(e) {
      console.error('szSheet.update(data='+JSON.stringify(data)+',opt='+JSON.stringify(opt)+') -> '+JSON.stringify({isErr:true,message:e.message}));
      return {isErr:true,message:e.message};
    }
  };

  /** append: 行の追加
   * <br>
   * 複数行の一括追加はロジックが煩雑になるため、本メソッドでは対応しない。
   * @param {any[]|object} arg - anyなら追加行の一次元配列、objectなら項目名＋値
   * @returns {object} 以下のメンバを持つオブジェクト
   * <ul>
   * <li>isErr {boolean} - エラーならtrue
   * <li>arr {any[]} - 追加した行の一次元配列
   * <li>obj {object} - 追加した行オブジェクト({項目名1:値1,項目名2:値2,..}形式)
   * <li>dataNum {number} - 追加行のrv.data上の添字
   * <li>rawNum {number} - 追加行のrv.raw上の添字
   * <li>rowNum {number} - 追加行のスプレッドシート上の行番号
   * </ul>
   */
  rv.append = (data) => {
    const r = {isErr:false,obj:{},arr:[]};
    // 追加する行の配列・オブジェクトを作成
    switch( whichType(data) ){
      case 'Array':
        for( let i=0 ; i<rv.keys.length ; i++ ){
          r.arr.push(data[i] || null);
          r.obj[rv.keys[i]] = data[i];
        }
        break;
      case 'Object':
        for( let i=0 ; i<rv.keys.length ; i++ ){
          r.arr.push(data[rv.keys[i]] || null);
        }
        r.obj = data;
        break;
      default:
        r.isErr = true;
    }
    if( !r.isErr ){
      // 追加位置の計算とシートへの追加
      r.dataNum = rv.data.length;
      rv.data.push(r.obj);
      r.rawNum = rv.raw.length;
      rv.raw.push(r.arr);
      r.rowNum = r.rawNum + 1;
      rv.lastRow += 1;
      rv.sheet.appendRow(r.arr);
    }
    console.log('szSheet.append('+JSON.stringify(data)+') -> '+JSON.stringify(r));
    return r;
  }

  console.log('szSheet(arg='+JSON.stringify(arg)+',key='+key+') -> '+JSON.stringify(rv));
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