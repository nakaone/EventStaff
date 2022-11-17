/* ================================================================
「配達員」の使用方法
  1. elapsの内容を更新
  2. authorization を実行してメール送信権限を付与(宛先は適宜修正)
  3. 本シートのpassPhraseを郵便局の「配達員」シート"passPhrase"に登録
  4. ウェブアプリとしてデプロイ。郵便局の「配達員」シート"endpointにIDを登録
================================================================== */

const elaps = {account:'shimokitasho.oyaji@gmail.com',department:'配達員'};
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
 function doPost(e){
  elaps.startTime = Date.now();  // 開始時刻をセット
  console.log('配達員.doPost start.',e);

  const arg = JSON.parse(e.postData.getDataAsString()); // contentsでも可
  let rv = null;
  if( arg.passPhrase === conf.Master.key ){
    try {
      elaps.func = arg.func; // 処理名をセット
      switch( arg.func ){
        case 'sendMail':
          rv = sendMail(arg.data);
          break;
      }
    } catch(e) {
      // Errorオブジェクトをrvとするとmessageが欠落するので再作成
      rv = {isErr:true, message:e.name+': '+e.message};
    } finally {
      console.log('配達員.doPost end. rv='+JSON.stringify(rv));
      szLib.elaps(elaps, rv.isErr ? rv.message : 'OK');  // 結果を渡して書き込み
      return ContentService
      .createTextOutput(JSON.stringify(rv,null,2))
      .setMimeType(ContentService.MimeType.JSON);
    }
  } else {
    rv = {isErr:true,message:'invalid passPhrase :'+e.parameter.passPhrase};
    console.error('配達員.doPost end. '+rv.message);
    console.log('end',elaps);
    szLib.elaps(elaps, rv.isErr ? rv.message : 'OK');
  }
}

/** sendMail: メールを送信
 * <br>
 * Class [GmailApp]{@link https://developers.google.com/apps-script/reference/gmail/gmail-app}
 * [sendEmail(recipient, subject, body, options)]{@link https://developers.google.com/apps-script/reference/gmail/gmail-app#sendEmail(String,String,String,Object)}
 * 
 * @param {object} arg - 送信するメールのオブジェクト
 * @return {object} - 処理結果
 *    isErr {boolean} : エラーならtrue
 *    message {string} : エラーの場合はメッセージ。正常終了ならundefined
 *    result {object} : 分岐先の処理が正常終了した場合の結果オブジェクト
 */
 const sendMail = (arg) => {
  console.log('配達員.sendMail start. arg='+JSON.stringify(arg));
  let rv = null;
  try {

    GmailApp.sendEmail(
      arg.recipient,  // recipient {String} 受信者のアドレス
      arg.subject,    // subject {String} 件名（最大 250 文字）
      arg.body,       // body {String} メールの本文
      arg.options,    // options {Object} 高度なパラメータを指定するJavaScript オブジェクト
    );
    rv = {isErr:false};  // 正常終了
  
  } catch(e) {
    // Errorオブジェクトをrvとするとmessageが欠落するので再作成
    rv = {isErr:true, message:e.name+': '+e.message};
  } finally {
    console.log('配達員.sendMail end. rv='+JSON.stringify(rv));
    return rv;
  }
}