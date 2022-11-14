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

/** doPost: パラメータに応じて処理を分岐
 * 
 * @param {object} e - POSTされたデータ
 * @param {object} e.parameter - 実データ
 * @param {string} e.parameter.passPhrase - 正当な要求であることを検証するための本APIの秘密鍵
 * @param {object} e.parameter.data - 分岐先の処理に渡すオブジェクト
 * 
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
  // toString
  const toString = e.postData.getDataAsString();
  console.log('toString',toString);
  console.log(typeof toString);
  console.log(JSON.stringify(toString));
  console.log(JSON.parse(toString));
  // contents 
  const contents = e.postData.contents;
  console.log('contents',contents);
  console.log(typeof contents);
  console.log(JSON.stringify(contents));
  console.log(JSON.parse(contents));

  const arg = JSON.parse(e.postData.getDataAsString());
  let rv = null;
  if( arg.passPhrase === config.MasterKey ){
    try {
      switch( arg.func ){
        case 'scanDoc':
          rv = scanDoc(arg.data);
          break;
      }
    } catch(e) {
      // Errorオブジェクトをrvとするとmessageが欠落するので再作成
      rv = {isErr:true, message:e.name+': '+e.message};
    } finally {
      return ContentService
      .createTextOutput(JSON.stringify(rv,null,2))
      .setMimeType(ContentService.MimeType.JSON);
    }
  } else {
    rv = {isErr:true,message:'invalid passPhrase :'+e.parameter.passPhrase};
    console.error(rv.message);
  }
  console.log('scanDoc.doPost end. rv='+JSON.stringify(rv));
  elaps.end(rv.isErr ? rv.message : 'OK');
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