const passPhrase = "Oct.22,2022"; // テスト用共通鍵
const MasterURL = "https://script.google.com/macros/s/AKfycbzldVmiNCPfedSwpjwtEo5FnORzjIoBjnSYdnXe4QiltCbR2e18B_DWQuSukT3Y4uMXjg/exec";

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

  const entryNo = Number(arg.entryNo)
  const passCode = Math.floor(Math.random() * 1000000);

  // ログデータを取得
  const dObj = szLib.getSheetData('log');

  // 受付番号が一致するデータをtimestampの降順に取得
  const list = dObj.data.filter(x => {
    return Number(x.entryNo) === entryNo;
  }).sort((x,y) => {
    return x.timestamp <= y.timestamp ? 1 : -1;
  });
  console.log('認証局.list='+JSON.stringify(list));

  // 結果判定
  let rv = {result:false,message:'<p>直近一時間以内に3回以上失敗しています。<br>時間をおいて再度ログインしてください。</p>'};
  if( list.length < 3 ){
    // 挑戦回数が3回未満
    rv.result = true;
  } else if( list[0].result === 'OK' || list[1].result === 'OK' || list[2].result === 'OK' ){
    // 直近の成功からの失敗が3回未満(=3回連続失敗ではない)
    rv.result = true;
  } else if( new Date(list[2].timestamp).getTime() + 10800000 < new Date().getTime() ){
    // 3回連続失敗後、1時間以上経過
    rv.result = true;
  }
  if( rv.result ){
    rv.message = '<p>パスコードを記載したメールをお送りしました。<br>'
      + '迷惑メールに判定される場合もありますので、ご注意ください。</p>';
  }

  if( rv.result ){  // 管理局APIのauthA2の呼び出し
    const data = {
      passPhrase  : passPhrase,
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
    const response = UrlFetchApp.fetch(MasterURL,options);
    console.log(response.getContentText());
  }
  
  console.log('認証局.authA1 end. rv='+JSON.stringify(rv));
  return rv;
}