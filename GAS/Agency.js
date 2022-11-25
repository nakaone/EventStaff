const elaps = {account:'nakaone.kunihiro@gmail.com',department:'資源局'};
const conf = szLib.getConf();

/** authorize: 初期化処理 */
const authorize = () => {
  const res = doPost({postData:{contents:JSON.stringify({
    func: 'listAgents',
    passPhrase: conf.Agency.key,
    data:null
  })}});
  console.log('res:',res.getContent());
}

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
  console.log('資源局.doPost start.',e);

  //const arg = JSON.parse(e.postData.getDataAsString()); // contentsでも可
  const arg = JSON.parse(e.postData.contents);
  let rv = null;
  if( arg.passPhrase === conf.Agency.key ){
    try {
      elaps.func = arg.func; // 処理名をセット
      switch( arg.func ){
        case 'listAgents':
          rv = listAgents();
          break;
      }
    } catch(e) {
      // Errorオブジェクトをrvとするとmessageが欠落するので再作成
      rv = {isErr:true, message:e.name+': '+e.message};
    } finally {
      console.log('資源局.doPost end. rv='+JSON.stringify(rv));
      szLib.elaps(elaps, rv.isErr ? rv.message : 'OK');  // 結果を渡して書き込み
      return ContentService
      .createTextOutput(JSON.stringify(rv,null,2))
      .setMimeType(ContentService.MimeType.JSON);
    }
  } else {
    rv = {isErr:true,message:'invalid passPhrase :'+e.parameter.passPhrase};
    console.error('資源局.doPost end. '+rv.message);
    console.log('end',elaps);
    szLib.elaps(elaps, rv.isErr ? rv.message : 'OK');
  }
}

/** listAgents: 配送局のリストを返す
 * @param {void} - なし
 * @return {object} - 処理結果
 *    isErr {boolean} : エラーならtrue
 *    message {string} : エラーの場合はメッセージ。正常終了ならundefined
 *    result {object} : szLib.szSheet().data
 */
const listAgents = (arg) => {
  console.log('資源局.listAgents start. arg='+JSON.stringify(arg));
  let rv = null;
  try {
    rv = {isErr: false, result: szLib.szSheet('配送局').data};
  } catch(e) {
    // Errorオブジェクトをrvとするとmessageが欠落するので再作成
    rv = {isErr:true, message:e.name+': '+e.message};
  } finally {
    console.log('資源局.listAgents end. rv='+JSON.stringify(rv));
    return rv;
  }
}