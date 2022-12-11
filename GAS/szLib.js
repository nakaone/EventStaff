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