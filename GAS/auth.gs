const config = szLib.setConfig(['MasterKey','MasterURL']);

const doPostTest = () => {
  const testData = ['0010'];
  for( let i=0 ; i<testData.length ; i++ ){
    const response = doPost({parameter:{entryNo:testData[i]}});
    console.log(response.getContent());
  }  
}

/** doPost: パラメータに応じて処理を分岐
 * @param {object} e - メールの中身。以下のメンバを持つオブジェクト
 *    parameter: {
 *      passPhrase: 正当な要求であることを検証するための本APIの秘密鍵
 *      data: 分岐先の処理に渡すオブジェクト
 *    }
 * @return {object} - 処理結果
 *    isErr {boolean} : エラーならtrue
 *    message {string} : エラーの場合はメッセージ。正常終了ならundefined
 *    result {object} : 分岐先の処理が正常終了した場合の結果オブジェクト
 */
function doPost(e){
  console.log('認証局.doPost start. e.postData.contents='+JSON.stringify(e.postData.contents));
  //console.log('認証局.doPost start. e.parameter='+JSON.stringify(e.parameter));
  let rv = null;
  try {

    const arg = JSON.parse(e.postData.contents);

    /* 認証局は誰でもアクセス可なので秘密鍵による拒否は無い
    if( e.parameter.passPhrase !== config.AuthKey ){
      throw new Error('共通鍵が一致しません');
    }*/

    // 共通鍵が一致したら処理分岐
    switch( arg.func ){
      case 'auth1A':
        rv = auth1A(arg.data);
        break;
      case 'auth2A':
        rv = auth2A(arg.data);
        break;
      default:
        rv = {isErr:true, message:'No Function'};
    }

  } catch(e) {
    // Errorオブジェクトをrvとするとmessageが欠落するので再作成
    rv = {isErr:true, message:e.name+': '+e.message};
  } finally {
    console.log('認証局.doPost end. rv='+JSON.stringify(rv));
    return ContentService
    .createTextOutput(JSON.stringify(rv,null,2))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

const auth1ATest = () => {
  const rv = auth1A({entryNo:"1"});
  console.log(rv);
}

/** auth1A: 認証の第一段階
 * @param {object} arg - 
 *    entryNo {string} : 入力された受付番号
 * @return {object} - 処理結果
 *    isErr {boolean} : エラーならtrue
 *    message {string} : エラーの場合はメッセージ。正常終了ならundefined
 */
const auth1A = (arg) => {
  console.log('認証局.auth1A start. arg='+JSON.stringify(arg));
  let rv = null;
  try {

    // 受付番号の取得とパスコードの生成
    const entryNo = Number(arg.entryNo)
    const passCode = Math.floor(Math.random() * 1000000);
  
    // ログから受付番号が一致するデータをtimestampの降順に取得
    const dObj = szLib.getSheetData('log');
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
      const options = {
        'method': 'post',
        'headers': {
          'contentType': 'application/json',
        },
        'payload': {
          passPhrase  : config.MasterKey,
          func: 'auth1B',
          entryNo: entryNo,
        },
      }
      const res = UrlFetchApp.fetch(config.MasterURL,options).getContentText();
      console.log('認証局.res='+res);
      rv = JSON.parse(res);
      console.log('認証局.rv='+rv);
    }

  } catch(e) {
    // Errorオブジェクトをrvとするとmessageが欠落するので再作成
    rv = {isErr:true, message:e.name+': '+e.message};
  } finally {
    console.log('認証局.auth1A end. rv='+JSON.stringify(rv));
    return rv;
  }
}

const auth2ATest = () => {
  console.log('auth2ATest start.');
  const rv = auth2A({entryNo:"1",passCode:"123456"});
  console.log('auth2ATest end.');
}

/** auth2A: 受付番号・パスコードを基にログイン可否を判断
 *  @param {object} arg - 以下のメンバを持つオブジェクト
 *    entryNo
 *    passCode
 *  @return {object} -
 *    isErr
 *    message {string} - エラーメッセージ
 *    result {object}  - ユーザ権限に基づくconfig
 */
const auth2A = (arg) => {
  console.log('auth2A start. arg='+JSON.stringify(arg));
  let rv = null;
  try {

    // 管理局.auth2Bに受付番号とパスコードが正しいか問合せ
    const options = {
      'method': 'post',
      'headers': {
        'contentType': 'application/json',
      },
      'payload': {
        passPhrase  : config.MasterKey,
        func: 'auth2B',
        entryNo: arg.entryNo,
        passCode: arg.passCode,
      },
    }
    const r0 = UrlFetchApp.fetch(config.MasterURL,options);
    const r1 = r0.getContentText();
    console.log('認証局.response='+r1);
    rv = JSON.parse(r1);

    // logシートへの追記
    SpreadsheetApp.getActive().getSheetByName('log').appendRow([
      new Date(),             // timestamp
	    arg.entryNo,            // entryNo
      rv.isErr ? 'NG' : 'OK', // result
      rv.message || ''        // message
    ]);

  } catch(e) {
    // Errorオブジェクトをrvとするとmessageが欠落するので再作成
    rv = {isErr:true, message:e.name+': '+e.message};
  } finally {
    console.log('auth2A end. rv='+JSON.stringify(rv));
    return rv;
  }
}