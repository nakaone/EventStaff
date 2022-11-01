const passPhrase = "Oct.22,2022"; // テスト用共通鍵
const postoffice = "https://script.google.com/macros/s/AKfycbxLsm58FzWqC789J8GHzRElSYHv4WUoRoRJXFimKwKW_kAMrmSutdlEH4Ev244I1lP8/exec";

// ===========================================================
// トリガー関数
// ===========================================================

const doGetTest = () => {
  const testData = [
    //{func:'test',data:{from:'嶋津',to:'スタッフ',message:'ふがふが'}},
    //{func:'search',data:{key:'ナ'}},
    {func:'update',data:{target:{key:'受付番号',value:12},revice:[
      {key:'状態',value:'参加'},
      {key:'参加費',value:'既収'},
    ]}},
  ];
  for( let i=0 ; i<testData.length ; i++ ){
    doGet({parameter:{v:encrypt(testData[i],passPhrase)}});
  }
};

function doGet(e) {
  console.log('doGet start.',e);

  // 'v'で渡されたクエリを復号
  arg = decrypt(e.parameter.v,passPhrase);
  console.log('arg',whichType(arg),arg);

  let rv = [];
  switch( arg.func ){  // 処理指定により分岐
    case 'search':  // 該当者の検索
      rv = candidates(arg.data);
      break;
    case 'update':  // 参加者情報の更新
      rv = updateParticipant(arg.data);
      break;
    case 'post':  // 掲示板への投稿
      rv = postMessage(arg.data);
      break;
    case 'test':  // テスト用
      rv = arg.data;  // 何もせず、そのまま返す
      break;
  }

  // 結果をJSON化して返す
  rv = JSON.stringify(rv,null,2);
  console.log('doGet end.',rv);
  return ContentService
  .createTextOutput(rv)
  .setMimeType(ContentService.MimeType.JSON);
}

/** メールの自動返信
 * @param {Object} e - 
 */
function onFormSubmit(  // メールの自動返信
  e={namedValues:{'メールアドレス':['nakaone.kunihiro@gmail.com']}} // テスト用既定値
) {
  console.log(e.namedValues);

  // 1.受付番号の採番
  // 「回答」シート上で書き込まれた行番号＋「当日」上のデータ件数−ヘッダ1行×2シート
  let entryNo = e.range.rowStart - 2
    + SpreadsheetApp.getActiveSpreadsheet().getSheetByName('当日').getLastRow();
  // シートに受付番号を記入
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('回答');
  sheet.getRange("S"+e.range.rowStart).setValue(entryNo); // 受付番号はS列
  entryNo = ('0000'+entryNo).slice(-4);

  // 2.編集用URLの取得
  // 2.1.シート側のキーを生成
  const sKey = sheet.getRange("A"+e.range.rowStart).getValue().getTime()
    + e.namedValues['メールアドレス'][0];
  /* 以下だと秒単位でミリ秒が無いためフォームと一致しない
  const sKey = new Date(e.namedValues['タイムスタンプ'][0]).getTime()
    + e.namedValues['メールアドレス'][0]; */
  console.log('sKey = '+sKey);

  // 2.2.フォームデータを全件読み込み
  // FormIdはフォームの編集画面。入力画面、回答後の「回答を記録しました」画面とは異なる。
  const FormId = "1hnQLsY3lRh0gQMGfXoJJqAL_yBpKR6T0h2RFRc8tUEA";
  const formData = FormApp.openById(FormId).getResponses();

  // 2.3.フォームデータを順次検索
  let editURL = '';
  for( let i=formData.length-1 ; i>=0 ; i++ ){
    const fKey = formData[i].getTimestamp().getTime()
      + formData[i].getRespondentEmail();
    console.log(i,fKey);
    if( sKey === fKey ){
      console.log('formData',formData[i]);
      editURL = formData[i].getEditResponseUrl();
      break;
    }
  }
  console.log('editURL = '+editURL);

  // 2.4.シートに編集用URLを保存
  sheet.getRange("T"+e.range.rowStart).setValue(editURL); // 編集用URLはT列

  // 3.本文の編集
  const firstName = e.namedValues['申請者氏名'][0].match(/^([^　]+)/)[1];
  const body = 'dummy';

  // 3.2.htmlメールの編集
  const options = {
    name: '下北沢小学校おやじの会',
    replyTo: 'shimokitasho.oyaji@gmail.com',
    //attachments: createQrCode(entryNo),
    htmlBody: htmlPattern
      .replace("::firstName::",firstName)
      .replace("::entryNo::",entryNo)
      .replace("::editURL::",editURL),
    inlineImages: {
      qr_code: createQrCode(entryNo),
    }
  }

  GmailApp.sendEmail(
    e.namedValues['メールアドレス'][0],  // to
    '【完了】QR受付テストへの登録',     // subject
    body,
    options
  );
}

const htmlPattern = `
<p>::firstName:: 様</p>

<p>下北沢小学校おやじの会です。この度は参加登録、ありがとうございました。</p>

<p>当日は検温後に受付に行き、以下を受付担当者にお示しください。</p>
<div style="
  position: relative;
  margin: 2rem;
  padding: 0.5rem 1rem;
  border: solid 4px #95ccff;
  border-radius: 8px;
">
  <span style="
    position: absolute;
    display: inline-block;
    top: calc(-0.5rem - 2px);
    left: 2rem;
    padding: 0 0.5rem;
    line-height: 1;
    background: #fff;
    color: #95ccff;
    font-weight: bold;
  ">受付番号</span>
  <p style="
    text-align:center;
    font-size: 3rem;
    font-weight: bold;
  ">
    ::entryNo::
  </p>
  <p style="text-align: center;">
    <img src='cid:qr_code' />
  </p>
</div>

<p>もし登録いただいた参加メンバの追加・欠席、または申込みのキャンセルがあった場合、
以下から修正してください。</p>

<p><a href="::editURL::" style="
  display: inline-block;
  padding: 20px 50px 20px 50px;
  text-decoration: none;
  color: white;
  background: blue;
  font-weight: bold;
  border: solid 4px blue;
  border-radius: 8px;">参加申込の修正</a></p>

<p>なお当日の注意事項・持ち物リストは適宜追加されることがありますので、
イベント前日に「<a href="::boardURL::">開催案内</a>」のページで
再度ご確認いただけますようお願い申し上げます。</p>

<p>当日のお越しをお待ちしております。</p>
`;

const createQrCode = (code_data) => { // QRコード生成
  let url = 'https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=' + code_data;
  let option = {
      method: "get",
      muteHttpExceptions: true
    };
  let ajax = UrlFetchApp.fetch(url, option);
  console.log(ajax.getBlob())
  return ajax.getBlob();
};

const onFormSubmitTest = () => {
  const testData = [
    undefined,
    true,0,'abc',
    //42n,
    Symbol('foo'),
    (a) => a*2,
    new Date(),new RegExp('^.+'),[1,2],
    [undefined,true,0,'abc',Symbol('foo'),(a) => a*2,new Date(),new RegExp('^.+'),[1,2]],
    {a:10,b:{c:true,d:['abc',Symbol('baa')],e:(x)=>x*4},f:new Date()},
  ];
  for( let i=0 ; i<testData.length ; i++ ){
    try {
      console.log(testData[i] + ' => ' + szLib.inspect(testData[i]));
    } catch(e) {
      console.log(JSON.stringify(testData[i]) + ' => ' + szLib.inspect(testData[i]));
    }
  }
}

// ===========================================================
// トリガーから呼ばれる関数・定義
// ===========================================================

const candidates = (data) => {  // 該当者リストの作成
  console.log('candidates start.',data);

  const dObj = getSheetData('マスタ'); // データをシートから取得
  let result = [];
  const sKey = String(data.key);
  if( sKey.match(/^[0-9]+$/) ){
    console.log('number='+Number(sKey));
    result = dObj.data.filter(x => {return Number(x['受付番号']) === Number(sKey)});
  } else if( sKey.match(/^[ァ-ヾ　]+$/) ){
    console.log('kana='+sKey);
    result = dObj.data.filter(x => {return x['読み'].indexOf(sKey) === 0});
  }

  console.log('candidates end. result='+JSON.stringify(result));
  return result;
};

const updateParticipant = (data) => { // 参加者情報を更新
  console.log('updateParticipant start.',data);

  const dObj = getSheetData('マスタ'); // データをシートから取得
  const rv = updateSheetData(dObj,data);

  console.log('updateParticipant end.',rv);
  return rv;
}

const postMessage = (arg) => {
  console.log('postMessage start. arg='+JSON.stringify(arg));
  const v = {
    timestamp: new Date().toLocaleString('ja-JP'),
    from: arg.from,
    to: arg.to,
    message: arg.message,
  }
  console.log('postMessage end. v='+JSON.stringify(v));  
  return v;
};