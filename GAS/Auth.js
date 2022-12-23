const elaps = {account:'shimokitasho.oyaji@gmail.com',department:'認証局'};
const conf = szLib.getConf();

/** doPost: パラメータに応じて処理を分岐
 * <br>
 * なお認証局は誰でもアクセス可なので、秘密鍵のチェックは行わない
 * 
 * @param {object} e - Class UrlFetchApp [fetch(url, params)]{@link https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app#fetchurl,-params}の"Make a POST request with a JSON payload"参照
 * @param {object} arg - データ部分。JSON.parse(e.postData.getDataAsString())の結果
 * @param {string} arg.passPhrase - 共通鍵。szLib.getUrl()で取得
 * @param {string} arg.from       - 送信元
 * @param {string} arg.to         - 送信先(自分)
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
  console.log('認証局.doPost start.',e);

  const arg = JSON.parse(e.postData.getDataAsString()); // contentsでも可
  let rv = null;
  try {
    elaps.func = arg.func; // 処理名をセット
    switch( arg.func ){
      case 'auth1A':
        rv = auth1A(arg.data);
        break;
      case 'auth2A':
        rv = auth2A(arg.data);
        break;
    }
  } catch(e) {
    // Errorオブジェクトをrvとするとmessageが欠落するので再作成
    rv = {isErr:true, message:e.name+': '+e.message};
  } finally {
    console.log('認証局.doPost end. rv='+JSON.stringify(rv));
    szLib.elaps(elaps, rv.isErr ? rv.message : 'OK');  // 結果を渡して書き込み
    return ContentService
    .createTextOutput(JSON.stringify(rv,null,2))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

/** auth1A: 認証の第一段階
 * @param {object} arg - 引数オブジェクト
 * @param {string} arg.entryNo - 入力された受付番号
 * @return {object} - 処理結果
 * <ul>
 * <li>isErr {boolean} : エラーならtrue
 * <li>message {string} : エラーの場合はメッセージ。正常終了ならundefined
 * </ul>
 */
const auth1A = (arg) => {
  console.log('認証局.auth1A start. arg='+JSON.stringify(arg));
  let rv = null;
  try {

    // 受付番号の取得
    const entryNo = Number(arg)
  
    // ログから受付番号が一致するデータをtimestampの降順に取得
    const dObj = szLib.szSheet('log');
    const list = dObj.data.filter(x => {
      return Number(x.entryNo) === entryNo;
    }).sort((x,y) => {
      return x.timestamp <= y.timestamp ? 1 : -1;
    });
    console.log('認証局.list='+JSON.stringify(list));
  
    // 3回連続失敗後1時間以内ならチャレンジ不可判定
    rv = {isErr:true};
    if( list.length < 3 ){
      // 挑戦回数が3回未満
      rv.isErr = false;
    } else if( list[0].result === 'OK' || list[1].result === 'OK' || list[2].result === 'OK' ){
      // 直近の成功からの失敗が3回未満(=3回連続失敗ではない)
      rv.isErr = false;
    } else if( new Date(list[2].timestamp).getTime() + 10800000 < new Date().getTime() ){
      // 3回連続失敗後、1時間以上経過
      rv.isErr = false;
    }
  
    if( rv.isErr ){
      rv.message = '3回連続ログイン失敗後、1時間経過していません';
    } else {  // 管理局APIのauth1Bの呼び出し
      rv = szLib.fetchGAS({from:'Auth',to:'Master',func:'auth1B',data:entryNo});
    }

  } catch(e) {
    // Errorオブジェクトをrvとするとmessageが欠落するので再作成
    rv = {isErr:true, message:e.name+': '+e.message};
  } finally {
    console.log('認証局.auth1A end. rv='+JSON.stringify(rv));
    return rv;
  }
}

/** auth2A: 受付番号・パスコードを基にログイン可否を判断
 * @param {object} arg - 以下のメンバを持つオブジェクト
 * @param {string} arg.entryNo - 受付番号
 * @param {string} arg.passCode - パスコード
 * @return {object} 処理結果
 * <ul>
 * <li>isErr {boolean} - trueならエラー
 * <li>message {string} - エラーメッセージ
 * <li>result {object}  - ユーザ権限に基づくconfig
 * </ul>
 */
const auth2A = (arg) => {
  console.log('auth2A start. arg='+JSON.stringify(arg));
  let rv = null;
  try {

    // 管理局.auth2Bに受付番号とパスコードが正しいか問合せ
    rv = szLib.fetchGAS({from:'Auth',to:'Master',func:'auth2B',data:{
      entryNo: arg.entryNo,
      passCode: arg.passCode,
    }});

    // logシートへの追記
    const dObj = szLib.szSheet({sheetName:'log'});
    dObj.append([
      {column:'timestamp',value:new Date()},
      {column:'entryNo',value:arg.entryNo},
      {column:'result',value:(rv.isErr ? 'NG' : 'OK')},
      {column:'message',value:(rv.message || '')},
    ]);

  } catch(e) {
    // Errorオブジェクトをrvとするとmessageが欠落するので再作成
    rv = {isErr:true, message:e.name+': '+e.message};
  } finally {
    console.log('auth2A end. rv='+JSON.stringify(rv));
    return rv;
  }
}