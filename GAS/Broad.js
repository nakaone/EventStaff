const elaps = {account:'shimokitasho.oyaji@gmail.com',department:'放送局'};
const conf = szLib.getConf();

/** doPost: パラメータに応じて処理を分岐
 * @param {object} e - Class UrlFetchApp [fetch(url, params)]{@link https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app#fetchurl,-params}の"Make a POST request with a JSON payload"参照
 * @param {object} arg - データ部分。JSON.parse(e.postData.getDataAsString())の結果
 * @param {string} arg.passPhrase - 共通鍵。szLib.getUrl()で取得
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
const doPostTest = () => {
  const e = {postData:{contents:JSON.stringify({key:conf.Broad.key,func:'postMessage',data:{
    timestamp:szLib.getJPDateTime(),
    from:'しまづパパ',
    to:'スタッフ全員',
    message:'てすと'
  }})}};
  const res = doPost(e);
  console.log(res);
}
function doPost(e){
  elaps.startTime = Date.now();  // 開始時刻をセット
  console.log('放送局.doPost start.',e);

  const arg = JSON.parse(e.postData.contents);
  console.log('arg='+JSON.stringify(arg));
  console.log('conf='+JSON.stringify(conf));
  console.log('arg.key === conf.Broad.key ? '+(arg.key === conf.Broad.key));
  let rv = null;
  if( arg.key === conf.Broad.key ){
    try {
      elaps.func = arg.func; // 処理名をセット
      switch( arg.func ){
        case 'postMessage':
          rv = postMessage(arg.data);
          break;
        case 'getMessages':
          rv = getMessages(arg.data);
          break;
      }
    } catch(e) {
      // Errorオブジェクトをrvとするとmessageが欠落するので再作成
      rv = {isErr:true, message:e.name+': '+e.message};
    } finally {
      console.log('放送局.doPost end. rv='+JSON.stringify(rv));
      szLib.elaps(elaps, rv.isErr ? rv.message : 'OK');  // 結果を渡して書き込み
      return ContentService
      .createTextOutput(JSON.stringify(rv,null,2))
      .setMimeType(ContentService.MimeType.JSON);
    }
  } else {
    rv = {isErr:true,message:'invalid passPhrase :'+arg.key};
    console.error('放送局.doPost end. '+rv.message);
    console.log('end',elaps);
    szLib.elaps(elaps, rv.isErr ? rv.message : 'OK');
  }
}

/** postMessage: お知らせの投稿
 * <br>
 * 配信局への配信は追加登録された分だけでなく、都度全投稿を配信する。<br>
 * ∵一部配信済/一部未配信のタイミングで投稿された場合や、待機中->稼働中となった配信局は全件登録が必要等、局によって必要となる範囲が変わるため
 * @param {object} data           - 投稿されたメッセージ
 * @param {string} data.timestamp - 投稿時刻
 * @param {string} data.from      - 発信者名
 * @param {string} data.to        - 宛先
 * @param {string} data.message   - メッセージ
 * @returns {object} 以下のメンバを持つオブジェクト(szSheet.appendの戻り値)
 * <ul>
 * <li>isErr {boolean} - szSheet.appendまたはAgent.appendMessagesのいずれかがエラーならtrue
 * <li>arr {any[]} - 追加した行の一次元配列(szSheet.appendの戻り値)
 * <li>obj {object} - 追加した行オブジェクト({項目名1:値1,項目名2:値2,..}形式)
 * <li>dataNum {number} - 追加行のrv.data上の添字
 * <li>rawNum {number} - 追加行のrv.raw上の添字
 * <li>rowNum {number} - 追加行のスプレッドシート上の行番号
 * <li>message {string} - エラーメッセージ。szSheet.appendまたはAgent.appendMessagesでの最初のエラー
 * <li>result {object} - 配信局への配信結果(Agent.appendMessagesの戻り値)
 * </ul>
 */
const postMessageTest = () => {
  postMessage({
    timestamp: szLib.getJPDateTime(),
    from: 'システム',
    to: 'テスタ',
    message: szLib.getJPDateTime()
  });
}
function postMessage(data){
  console.log('放送局.postMessage start. data='+JSON.stringify(data));
  let rv = null;
  try {
    // 放送局「掲示板」シートに投稿内容を追加
    const sheet = szLib.szSheet('掲示板','timestamp');
    rv = sheet.append(data);
    /*
    const sheet = SpreadsheetApp.getActive().getSheetByName('掲示板');
    const rv = [data.timestamp,data.from,data.to,data.message,null,null,null];
    sheet.appendRow(rv);
    */

    /* 稼働中の配信局リストを取得
    * @param {string}   arg.from     - 送信側のコード名(Auth, Master等)
    * @param {string}   arg.to       - 受信側のコード名
    * @param {string}   arg.func     - GAS側で処理分岐の際のキー文字列
    * @param {string}   arg.endpoint - 受信側のコード名からURLが判断できない(配達員の)場合に指定
    * @param {string}   arg.key      - endpoint指定の場合はその鍵も併せて指定
    * @param {any}      arg.data     - 処理対象データ    */
    const list = szLib.fetchGAS({from:'Broad',to:'Agency',func:'listAgents'});
    if( list.isErr ){
      throw new Error(list.message);
    }

    // 稼働中の配信局に投稿内容を配信
    rv.result = [];
    for( let i=0 ; i<list.result.length ; i++ ){
      const res = szLib.fetchGAS({
        from     : 'Broad',
        to       : list.result[i].account,
        func     : 'appendMessages',
        endpoint : list.result[i].endpoint,
        key      : list.result[i].key,
        data     : sheet.data
      });
      rv.isErr = res.isErr ? true : rv.isErr;
      rv.message = rv.message || res.message;
      rv.result.push(res);
    }

  } catch(e) {
    rv.message = e.message;
  } finally {
    console.log('放送局.postMessage end.',JSON.stringify(rv));
    return rv;  
  }
}

/** getMessages: お知らせの取得
 * @param   {@} void - なし
 * @returns {object[]} 投稿メッセージシートの全データ
 */
function getMessages(){
  console.log('放送局.getMessages start.');
  const dObj = szLib.szSheet('ログ');
  const rv = dObj.data;
  console.log('放送局.getMessages end. rv='+JSON.stringify(rv));
  return rv;
}