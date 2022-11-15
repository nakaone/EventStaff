//const config = szLib.setConfig(['MasterKey','AuthSheetId','PostURL','PostKey']);
config = {MasterKey: 'vR4sw$P(*ZBex/Hp'};

const doPostTest = () => {
  const postData = {parameter:{
    passPhrase: config.MasterKey,
    func: 'scanDoc',
    data: {a:10,b:'abc'},
  }};
  doPost(postData);
}

const GasPost = (arg) => {
  console.log('scanDoc.GasPost start. arg='+JSON.stringify(arg));
  let rv = null;
  arg.hoge = '11:06';
  rv = {isErr:false,arg:arg};
  console.log('scanDoc.GasPost end. rv='+JSON.stringify(rv));
  return rv;
}

/** doPost: パラメータに応じて処理を分岐
 * ■GASが送信する場合
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
  const elaps = szLib.getElaps();
  elaps.start({department:'scanDoc',func:'doPost'});
  console.log('scanDoc.doPost start.',e);

  const arg = JSON.parse(e.postData.getDataAsString()); // contentsでも可
  let rv = null;
  if( arg.passPhrase === szLib.getUrl() ){
    try {
      switch( arg.func ){
        case 'scanDoc':
          rv = scanDoc(arg.data);
          break;
        case 'GasPost':
          rv = GasPost(arg.data);
          break;
      }
    } catch(e) {
      // Errorオブジェクトをrvとするとmessageが欠落するので再作成
      rv = {isErr:true, message:e.name+': '+e.message};
    } finally {
      console.log('scanDoc.doPost end. rv='+JSON.stringify(rv));
      elaps.end(rv.isErr ? rv.message : 'OK');
      return ContentService
      .createTextOutput(JSON.stringify(rv,null,2))
      .setMimeType(ContentService.MimeType.JSON);
    }
  } else {
    rv = {isErr:true,message:'invalid passPhrase :'+e.parameter.passPhrase};
    console.error('scanDoc.doPost end. '+rv.message);
    elaps.end(rv.isErr ? rv.message : 'OK');
  }
}

/** scanDoc: 
 * @param {object} arg - 
 * @return {object} - 処理結果
 *    isErr {boolean} : エラーならtrue
 *    message {string} : エラーの場合はメッセージ。正常終了ならundefined
 *    result {object} : 分岐先の処理が正常終了した場合の結果オブジェクト
 */
const scanDoc = (arg) => {
  console.log('scanDocTest.scanDoc start. arg='+JSON.stringify(arg));
  let rv = null;
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('list');

    /* 画像としてシートに貼り付ける場合
    const decoded = Utilities.base64Decode(arg.image);
    const blob = Utilities.newBlob(decoded,'image/png',String(Date.now())+'.png');
    const rowNum = sheet.getLastRow() + 1;
    sheet.getRange(rowNum,1).setValue(new Date(arg.timestamp));
    sheet.insertImage(blob,2,rowNum);
    */
    sheet.appendRow([arg.timestamp,arg.image]);
    rv = {isErr:false};

  } catch(e) {
    // Errorオブジェクトをrvとするとmessageが欠落するので再作成
    rv = {isErr:true, message:e.name+': '+e.message};
  } finally {
    console.log('scanDocTest.scanDoc end. rv='+JSON.stringify(rv));
    return rv;
  }
}

/**
 * Class Sheet [getImages]{@link https://developers.google.com/apps-script/reference/spreadsheet/sheet?hl=ja#getimages}
 * [Class OverGridImage]{@link https://developers.google.com/apps-script/reference/spreadsheet/over-grid-image}
 */
const refDoc = () => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('list');
  const images = sheet.getImages();
  for( let image of images ){
    console.log('A1='+image.getAnchorCell().getA1Notation());
    console.log('URL='+image.getUrl());
  }
}