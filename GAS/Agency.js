const elaps = {account:'nakaone.kunihiro@gmail.com',department:'資源局'};
const conf = szLib.getConf();

/** authorize: 初期化処理 */
const authorize = () => {
  let rv = listAgents();
  console.log(rv);
  rv = logElaps({timestamp:Date.now(), account:'fuga@gmail.com', requester:'テスト局', function:'testFunc()', elaps:1000, result:'OK'});
  console.log(rv);
}

/** doPost: パラメータに応じて処理を分岐
 * @param {object} e - Class UrlFetchApp [fetch(url, params)]{@link https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app#fetchurl,-params}の"Make a POST request with a JSON payload"参照
 * @param {object} arg - データ部分。JSON.parse(e.postData.getDataAsString())の結果
 * @param {string} arg.key - 共通鍵。szLib.getUrl()で取得
 * @param {string} arg.from       - 送信先(自分)
 * @param {string} arg.to         - 送信元
 * @param {string} arg.func       - 分岐する処理名
 * @param {string} arg.data       - 処理対象データ
 * @return {object} 正常終了の場合は分岐先処理の戻り値、エラーの場合は以下。
 * <ul>
 * <li>isErr {boolean}  - true(固定)
 * <li>message {string} - エラーメッセージ
 * </ul>
 */
 function doPost(e){
  elaps.startTime = Date.now();  // 開始時刻をセット
  console.log('資源局.doPost start.',e);

  //const arg = JSON.parse(e.postData.getDataAsString()); // contentsでも可
  const arg = JSON.parse(e.postData.contents);
  let rv = null;
  if( arg.key === conf.Agency.key ){
    try {
      elaps.func = arg.func; // 処理名をセット
      switch( arg.func ){
        case 'listAgents':
          rv = listAgents();
          break;
        case 'logElaps':
          rv = logElaps(arg.data);
          break;
      }
    } catch(e) {
      // Errorオブジェクトをrvとするとmessageが欠落するので再作成
      rv = {isErr:true, message:e.name+': '+e.message};
    } finally {
      console.log('資源局.doPost end. rv='+JSON.stringify(rv));
      localElaps(elaps, rv.isErr ? rv.message : 'OK');  // 結果を渡して書き込み
      return ContentService
      .createTextOutput(JSON.stringify(rv,null,2))
      .setMimeType(ContentService.MimeType.JSON);
    }
  } else {
    rv = {isErr:true,message:'invalid key :'+e.parameter.key};
    console.error('資源局.doPost end. '+rv.message);
    console.log('end',elaps);
    localElaps(elaps, rv.isErr ? rv.message : 'OK');
  }
}

/** listAgents: 配送局のリストを返す
 * @param {void} - なし
 * @return {object} - 処理結果
 *    isErr {boolean} : エラーならtrue
 *    message {string} : エラーの場合はメッセージ。正常終了ならundefined
 *    result {object} : szLib.szSheet().data
 */
const listAgents = () => {
  console.log('資源局.listAgents start.');
  let rv = null;
  try {
    rv = {isErr: false, result: szLib.szSheet('局一覧').data};
  } catch(e) {
    // Errorオブジェクトをrvとするとmessageが欠落するので再作成
    rv = {isErr:true, message:e.name+': '+e.message};
  } finally {
    console.log('資源局.listAgents end. rv='+JSON.stringify(rv));
    return rv;
  }
}

/** logElaps: 実行時間(elaps)をログシートに出力
 * @param {object} arg
 * @param {number} arg.timestamp - 実行日時
 * @param {string} arg.account - 賦課アカウント
 * @param {string} arg.requester - 局名。「管理局」等
 * @param {string} arg.function - function/method名
 * @param {number} arg.elaps - 実行時間。ミリ秒
 * @param {string} arg.result - 結果。'OK' or エラーメッセージ
 * @returns {object} - 処理結果
 * <ul>
 * <li>isErr {boolean} : エラーならtrue
 * <li>message {string} : エラーの場合はメッセージ。正常終了ならundefined
 * <li>result {object} : 分岐先の処理が正常終了した場合の結果オブジェクト
 * </ul>
 */
const logElaps = (arg) => {
  console.log('資源局.logElaps start. arg='+JSON.stringify(arg));
  let rv = null;
  try {
    const line = [
      new Date(arg.timestamp),
      arg.account,
      arg.requester,
      arg.function,
      arg.elaps,
      arg.result,
    ];
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ログ').appendRow(line);
    rv = {isErr:false,result:line};

  } catch(e) {
    // Errorオブジェクトをrvとするとmessageが欠落するので再作成
    rv = {isErr:true, message:e.name+': '+e.message};
  } finally {
    console.log('資源局.logElaps end. rv='+JSON.stringify(rv));
    return rv;
  }
}

const test = () => {
  localElaps({startTime:Date.now()-1000,account:'fuga@gmail.com',department:'test',func:'testfunc'});
}

/** localElaps: 【資源局内部用】ログシートへの書き込み
 * <br>
 * 通常szLib.elapsだが、資源局は自シートなのでコンテナ関数を使用
 * @param {object} arg 
 * @param {number} arg.startTime - 開始時刻
 * @param {string} arg.account - 実行アカウント名
 * @param {string} arg.department - 局名
 * @param {string} arg.func - function/method名
 * @param {string} result - 結果
 * @returns {void} - なし
 */
const localElaps = (arg,result='') => {
  console.log('localElaps start arg='+JSON.stringify(arg));
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ログ').appendRow([
    szLib.getJPDateTime(arg.startTime),   // timestamp
    arg.account,     // account
    arg.department,  // department
    arg.func,        // function/method
    Date.now() - arg.startTime + conf.Agency.overhead, // elaps
    result          // result
  ]);
}