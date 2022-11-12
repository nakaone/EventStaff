const config = szLib.setConfig(['BroadKey']);

// ===========================================================
// トリガー関数
// ===========================================================
/** doGetTest: doGetのテスト
 * @param {*} x - なし
 * @returns void - 結果はコンソールで確認
 */
const doGetTest = () => {
  const tStr = (x) => {
    return x.toLocaleString('ja-JP') + '.' + x.getMilliseconds();
  };
  const testData = [
    {func:'postMessage',data:{
      timestamp: tStr(new Date()),
      from: '嶋津パパ',
      to: '嶋津ママ',
      message: '追加のテスト',
    }},
    {func:'getMessages',data:{}},
  ];
  for( let i=0 ; i<testData.length ; i++ ){
    doGet({parameter:{v:szLib.encrypt(testData[i],config.BroadKey)}});
  }
};

/** doGet: 放送局への配信依頼受付
 * <br>
 * 返値はTextOutputのインスタンス。<br>
 * getContentで中の文字列を取得、parseすれば結果オブジェクトが得られる。<br>
 * GAS公式: [Class TextOutput]{@link https://developers.google.com/apps-script/reference/content/text-output#getcontent}
 *
 * @param {object} e - const config = szLib.setConfig(['PostURL','PostKey']);
 * @param {object} e.parameter - パラメータ文字列
 * @param {object} e.parameter.v - グローバル変数PostKeyで暗号化された文字列。<br>復号すると以下のオブジェクトとなる
 * @param {string} e.parameter.v.func - 'post'固定(他は不正)
 * @param {object} e.parameter.v.data - [postMails]{@link postMails}の引数
 * 
 * @return {object} - 正常終了の場合はpostMessage/getMessagesの戻り値。エラーの場合は空配列。
 * 
 * @example <caption>引数の例</caption>
 * 放送局.doGet start. {
 *   contextPath: '',
 *   parameter: { v: 'VTJG〜E9PQ==' },
 *   parameters: { v: [ 'VTJG〜E9PQ==' ] },
 *   queryString: 'v=VTJG〜E9PQ==',
 *   contentLength: -1
 * }
 */
function doGet(e) {
  console.log('放送局.doGet start.',e);

  // 'v'で渡されたクエリを復号
  arg = szLib.decrypt(e.parameter.v,config.BroadKey);
  console.log('放送局.arg',szLib.whichType(arg),arg);

  let rv = [];
  switch( arg.func ){  // 処理指定により分岐
    case 'postMessage':  // 掲示板への投稿
      rv = postMessage(arg.data);
      break;
    case 'getMessages':  // 掲示板からメッセージの取得
      rv = getMessages();
      break;
  }

  // 結果をJSON化して返す
  rv = JSON.stringify(rv,null,2);
  console.log('放送局.doGet end.',rv);
  return ContentService
  .createTextOutput(rv)
  .setMimeType(ContentService.MimeType.JSON);
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

  const dObj = szLib.getSheetData('ログ');
  const rv = szLib.updateSheetData(dObj,data);
  console.log('放送局.postMessage end.',JSON.stringify(rv));
  return rv;
}

/** getMessages: お知らせの取得
 * @param   {@} void - なし
 * @returns {object[]} 投稿メッセージシートの全データ
 */
function getMessages(){
  const elaps = szLib.getElaps();
  elaps.start({department:'放送局',func:'getMessages'});
  console.log('放送局.getMessages start.');

  const dObj = szLib.getSheetData('ログ');
  const rv = dObj.data;
  console.log('放送局.getMessages end. rv='+JSON.stringify(rv));
  elaps.end();
  return rv;
}