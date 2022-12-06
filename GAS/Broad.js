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
 * 
 * @param {object} data           - 投稿されたメッセージ
 * @param {string} data.timestamp - 投稿時刻
 * @param {string} data.from      - 発信者名
 * @param {string} data.to        - 宛先
 * @param {string} data.message   - メッセージ
 * @returns {any[]} 追加された行イメージ(一次元配列)
 */
function postMessage(data){
  console.log('放送局.postMessage start. data='+JSON.stringify(data));
  const sheet = SpreadsheetApp.getActive().getSheetByName('掲示板');
  const rv = [data.timestamp,data.from,data.to,data.message,null,null,null];
  sheet.appendRow(rv);
  console.log('放送局.postMessage end.',JSON.stringify(rv));
  return rv;
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