config = {
  MasterKey: 'vR4sw$P(*ZBex/Hp',
  MasterURL: 'https://script.google.com/macros/s/AKfycbxvHrwr7MvnTUv_vh4DyTuxddznVEZv5_ubgj67Vp_0uesqhVfOXzOR0ToaM2aMGA_QbA/exec'
};

const GasPostTest = () => {
  const testdata = [
    {a:10,b:'abc'},
  ];
  for( let i=0 ; i<testdata.length ; i++ ){
    fetchGAS({
      from: 'GasPostTest',
      to: 'scanDoc',
      func: 'scanDoc',
      data: testdata[i],
    });
  }
}

/** fetchGAS: GASのdoPostを呼び出し、後続処理を行う
 * <br>
 * 処理内部で使用する公開鍵・秘密鍵はszLib.getUrlKey()で取得。<br>
 * なおhtml版のarg.callbackはGAS版では存在しない。
 * 
 * @param {object}   arg          - 引数
 * @param {string}   arg.from     - 送信側のコード名(平文)
 * @param {string}   arg.to       - 受信側のコード名(平文)
 * @param {string}   arg.func     - GAS側で処理分岐の際のキー文字列
 * @param {any}      arg.data     - 処理対象データ
 * @returns {void} なし
 */
const fetchGAS = (arg) => {
  console.log('fetchGAS start. arg='+JSON.stringify(arg));
  const options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify({
      passPhrase  : szLib.getUrl(),
      from: arg.from,
      to: arg.to,
      func: arg.func,
      data: arg.data,
    }),
  }
  const res = UrlFetchApp.fetch(config.MasterURL,options).getContentText();
  console.log('sender.GasPost.res=',typeof res,res);
  const rObj = JSON.parse(res);
  console.log('sender.GasPost.rObj',typeof rObj,rObj);
  return rObj;
}