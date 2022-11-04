const config = szLib.setConfig(['BoardKey']);

// ===========================================================
// トリガー関数
// ===========================================================

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
    doGet({parameter:{v:szLib.encrypt(testData[i],config.BoardKey)}});
  }
};

function doGet(e) {
  console.log('放送局.doGet start.',e);

  // 'v'で渡されたクエリを復号
  arg = szLib.decrypt(e.parameter.v,config.BoardKey);
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

function postMessage(data){
  console.log('放送局.postMessage start. data='+JSON.stringify(data));

  const dObj = szLib.getSheetData('ログ');
  const rv = szLib.updateSheetData(dObj,data);
  console.log('放送局.postMessage end.',JSON.stringify(rv));
  return rv;
}

function getMessages(){
  console.log('放送局.getMessages start.');

  const dObj = szLib.getSheetData('ログ');
  const rv = dObj.data;
  console.log('放送局.getMessages end. rv='+JSON.stringify(rv));
  return rv;
}