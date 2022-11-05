const config = szLib.setConfig(['MasterKey','MasterURL']);

const doPostTest = () => {
  const testData = ['0010'];
  for( let i=0 ; i<testData.length ; i++ ){
    const response = doPost({parameter:{entryNo:testData[i]}});
    console.log(response.getContent());
  }  
}

function doPost(e) {
  console.log('認証局.doPost start. e.postData.contents='+JSON.stringify(e.postData.contents));

  const arg = JSON.parse(e.postData.contents);
  let rv;
  switch( arg.func ){
    case 'authA1':
      rv = authA1(arg.data);
      break;
    case 'authB1':
      rv = authB1(arg.data);
      break;
  }

  const response = JSON.stringify(rv,null,2);
  console.log('認証局.doPost end.',response);
  return ContentService
  .createTextOutput(response)
  .setMimeType(ContentService.MimeType.JSON);
}

const authA1Test = () => {
  const rv = authA1({entryNo:"1"});
  console.log(rv);
}

const authA1 = (arg) => {
  console.log('認証局.authA1 start. arg='+JSON.stringify(arg));

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
  let rv = {isErr:true};
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
  } else {  // 管理局APIのauthA2の呼び出し
    const data = {
      passPhrase  : config.MasterKey,
      func: 'authA2',
      entryNo: entryNo,
    };
    const options = {
      'method': 'post',
      'headers': {
        'contentType': 'application/json',
      },
      'payload': data,
    }
    const r0 = UrlFetchApp.fetch(config.MasterURL,options);
    const r1 = r0.getContentText();
    const res = JSON.parse(r1);
    console.log('認証局.response='+r1);
    if( res.isErr ){
      rv = {isErr:true,message:res.message};
    } else {
      rv = {isErr:false};
    }
  }
  
  console.log('認証局.authA1 end. rv='+JSON.stringify(rv));
  return rv;
}

const authB1Test = () => {
  console.log('authB1Test start.');
  const rv = authB1({entryNo:"1",passCode:"123456"});
  console.log('authB1Test end.');
}

/** authB1: 受付番号・パスコードを基にログイン可否を判断
 *  @param {object} arg - 以下のメンバを持つオブジェクト
 *    entryNo
 *    passCode
 *  @return {object} -
 *    isErr
 *    message {string} - エラーメッセージ
 *    config {object}  - ユーザ権限に基づくconfig
 */
const authB1 = (arg) => {
  console.log('authB1 start. arg='+JSON.stringify(arg));
  let rv = null;
  try {
    // 管理局.authB2に受付番号とパスコードが正しいか問合せ
    const options = {
      'method': 'post',
      'headers': {
        'contentType': 'application/json',
      },
      'payload': {
        passPhrase  : config.MasterKey,
        func: 'authB2',
        entryNo: arg.entryNo,
        passCode: arg.passCode,
      },
    }
    const r0 = UrlFetchApp.fetch(config.MasterURL,options);
    const r1 = r0.getContentText();
    const res = JSON.parse(r1);
    console.log('認証局.response='+r1);
    if( res.isErr ){
      // 正しくない場合、エラー通知
      rv = {isErr:true,message:res.message};
    } else {
      // 正しい場合、AuthLevelに応じたconfigを作成、返信
      rv = {isErr:false,config:res.config};
    }
  } catch(e) {
    // Errorオブジェクトをrvとするとmessageが欠落するので再作成
    rv = {isErr:true, message:e.name+': '+e.message};
  } finally {
    console.log('authB1 end. rv='+JSON.stringify(rv));
    return rv;
  }
}