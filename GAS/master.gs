const config = szLib.setConfig(['MasterKey','AuthSheetId','PostURL','PostKey']);

// ===========================================================
// トリガー関数
// ===========================================================

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
  console.log('管理局.doPost start. e.parameter='+JSON.stringify(e.parameter));
  let rv = null;
  try {

    // 秘密鍵が一致しなければ配送拒否
    if( e.parameter.passPhrase !== config.MasterKey ){
      throw new Error('鍵が一致しません');
    }

    // 秘密鍵が一致したら処理分岐
    switch( e.parameter.func ){
      case 'auth1B':
        rv = auth1B(e.parameter);
        break;
      case 'auth2B':
        rv = auth2B(e.parameter);
        break;
    }

  } catch(e) {
    // Errorオブジェクトをrvとするとmessageが欠落するので再作成
    rv = {isErr:true, message:e.name+': '+e.message};
  } finally {
    console.log('管理局.doPost end. rv='+JSON.stringify(rv));
    return ContentService
    .createTextOutput(JSON.stringify(rv,null,2))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

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
    doGet({parameter:{v:encrypt(testData[i],config.MasterKey)}});
  }
};

function doGet(e) {
  console.log('管理局.doGet start.',e);

  // 'v'で渡されたクエリを復号
  arg = szLib.decrypt(e.parameter.v,config.MasterKey);
  console.log('管理局.arg',szLib.whichType(arg),arg);

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
  console.log('管理局.doGet end.',rv);
  return ContentService
  .createTextOutput(rv)
  .setMimeType(ContentService.MimeType.JSON);
}

/** フォーム申込み時のメールの自動返信
 * @param {Object} e - 
 */
function onFormSubmit(
  e={namedValues:{'メールアドレス':['nakaone.kunihiro@gmail.com']}} // テスト用既定値
) {
  console.log('管理局.onFormSubmit start. e.namedValues='+JSON.stringify(e.namedValues));

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
  console.log('管理局.sKey = '+sKey);

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
      console.log('管理局.formData',formData[i]);
      editURL = formData[i].getEditResponseUrl();
      break;
    }
  }
  console.log('管理局.editURL = '+editURL);

  // 2.4.シートに編集用URLを保存
  sheet.getRange("T"+e.range.rowStart).setValue(editURL); // 編集用URLはT列

  /* 3. 返信メールの送付
    v = {func:'post',data:{
      passPhrase string : 共通鍵
      template  string : テンプレート名。郵便局スプレッドシートのシート名
      recipient string : 宛先メールアドレス
      variables {        テンプレートで置換する{変数名:実値}オブジェクト
        name string    : 申請者名
        entryNo string : 受付番号(0パディングした4桁の数字)
      }
    }}
  */
  const vObj = {
    func: 'post',
    data: {
      passPhrase : config.PostKey,
      template   : '申込への返信',
      recipient  : e.namedValues['メールアドレス'][0],
      variables  : {
        name     : e.namedValues['申請者氏名'][0].match(/^([^　]+)/)[1],  // 姓のみ
        entryNo  : entryNo,
      }
    }
  };
  const endpoint = config.PostURL + '?v=' + szLib.encrypt(vObj,config.PostKey);

  const response = UrlFetchApp.fetch(endpoint).getContentText();
  console.log('管理局.onFormSubmit end. response='+response);
}

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
const auth1BTest = () => {
  const params = ['MasterKey','PostURL','PostKey'];

  const c = szLib.setConfig(params);
  console.log(szLib.setConfig(params));
  console.log(JSON.stringify(c));
  params.forEach(x => {config[x] = c[x]});
  auth1B(1);
}

/** auth1B: 認証第一段階。パスコードを生成してメールで送付
 * @param {object} arg - 
 *    entryNo {string} : 利用者が入力した受付番号
 * @return {object} - 処理結果
 *    isErr {boolean} : エラーならtrue
 *    message {string} : エラーの場合はメッセージ。正常終了ならundefined
 *    result {object} : 分岐先の処理が正常終了した場合の結果オブジェクト
 */
const auth1B = (arg) => {
  console.log('管理局.auth1B start. arg='+JSON.stringify(arg));
  let rv = null;
  try {

    // 01.申込者情報の取得とパスコードの生成
    const entryNo = Number(arg.entryNo);
    const dObj = szLib.getSheetData('マスタ');
    const participant = dObj.data.filter(x => {return Number(x['受付番号']) === entryNo})[0];
    console.log('管理局.participant='+JSON.stringify(participant));
    const passCode = ('00000' + Math.floor(Math.random() * 1000000)).slice(-6);
    //console.log('管理局.passCode='+passCode);

    // 02.マスタにパスコードを記録
    const regData = {
      target: {key:'受付番号',value:entryNo},
      revice: [
        {key:'パスコード',value:passCode},
        {key:'発行日時',value:new Date()},
      ]
    };
    console.log('管理局.regData='+JSON.stringify(regData));
    szLib.updateSheetData(dObj,regData);

    // 03.メール送信要求
    //  postMails: 依頼された定型メールの配信
    // @param {object} arg - 以下のメンバを持つオブジェクト
    //    template (string) : メールのテンプレートが定義された郵便局のシート名
    //    data : [{
    //      recipient (string) : 宛先メールアドレス
    //      variables {label1:value1, label2:value2, ...}
    //    },{..},..]
    const vObj = {
      func: 'post',
      data: {
        template: 'パスコード通知',
        data: [{
          recipient: participant['メール'],
          variables: {passCode : passCode},
        }],
      }
    };
    console.log('管理局.vObj='+JSON.stringify(vObj));
    const endpoint = config.PostURL + '?v=' + szLib.encrypt(vObj,config.PostKey);
    console.log('管理局.endpoint='+endpoint+'\nconfig='+JSON.stringify(config));
    const response = JSON.parse(UrlFetchApp.fetch(endpoint).getContentText());
    console.log('管理局.response='+JSON.stringify(response));
    if( response.length === 0 ){
      rv = {isErr:false};
    } else {
      rv = {isErr:true,message:response[0].recipient+'\n'+response[0].message};
    }

  } catch(e) {
    // Errorオブジェクトをrvとするとmessageが欠落するので再作成
    rv = {isErr:true, message:e.name+': '+e.message};
  } finally {
    console.log('管理局.auth1B end. rv='+JSON.stringify(rv));
    return rv;
  }
}

const auth2BTest = () => {
  const t = {entryNo:3,passCode:988293};
  const rv = auth2B(t);
  console.log(rv);
}
/** auth2B: 認証局から送られた受付番号とパスコードの正当性をチェック
 * @param {object} arg - 以下のメンバを持つオブジェクト
 *    entryNo: 利用者が入力した受付番号
 *    passCode: 利用者が入力したパスコード
 * @return {object} - 処理結果
 *    isErr {boolean} : エラーならtrue
 *    message {string} : エラーの場合はメッセージ。正常終了ならundefined
 *    config {object} : configにセットする値(オブジェクト)
 *    menuFlags {number} : メニューの表示/非表示フラグの集合 
 */
const auth2B = (arg) => {
  console.log('管理局.auth2B start. arg='+JSON.stringify(arg));
  let rv = null;
  const dObj = szLib.getSheetData('マスタ');  // finallyで使用なのでtry外で宣言
  const entryNo = Number(arg.entryNo);  // finallyで使用なのでtry外で宣言
  try {

    // 受付番号を基にパスコード・生成日時を取得、検証
    const passCode = Number(arg.passCode);
    const participant = dObj.data.filter(x => {return Number(x['受付番号']) === entryNo})[0];
    console.log('管理局.participant='+JSON.stringify(participant));
    const revice = [];

    // パスコードが一致したかの判定
    const validCode = passCode === Number(participant['パスコード']);
    // 発行日時は一時間以内かの判定
    const validTime = new Date().getTime() - new Date(participant['発行日時']).getTime() < 3600000;
    if(  validCode && validTime ){
      // 検証OK：表示に必要なURLとメニューフラグをconfigとして作成
      // (1) AuthLevelに応じたconfigを作成
      //     認証局:1, 放送局:2, 予約局:4, 管理局:8, 郵便局:16
      rv = {isErr:false, config:{}};
      participant.AuthLevel = Number(participant.AuthLevel);
      const AuthLevel = participant.AuthLevel > 0 ? participant.AuthLevel : 6; // 既定値「参加者」
      const cObj = szLib.getSheetData('config');
      cObj.data.forEach(x => {
        if( (x.AuthLevel & AuthLevel) > 0 ){
          rv.config[x.key] = x.value;
        }
      });
      // editParticipantはオブジェクト用の記述なので、正確なJSON形式に整形が必要
      rv.config.editParticipant = JSON.stringify(rv.config.editParticipant);
      // (2) 参加申請フォームの編集用URL
      rv.config.entryURL = participant['編集用URL'];
      // (3) 表示するメニューのフラグ(menuFlags)
      rv.menuFlags = participant.menuFlags || 8431; // 既定値「参加者」
    } else {
      // 検証NG：エラー通知
      rv = {
        isErr: true,
        message: !validCode ? 'パスコードが一致しません' : 'パスコードの有効期限が切れています',
      };
      // 検証結果記録用オブジェクトを作成
      revice.push({key:'result',value:'NG'}).push({key:'message',value:rv.message});
    }

  } catch(e) {
    // Errorオブジェクトをrvとするとmessageが欠落するので再作成
    rv = {isErr:true, message:e.name+': '+e.message};
  } finally {
    // 「認証成否」に検証結果を記録
    szLib.updateSheetData(dObj,{
      target:  {key:'受付番号',value: entryNo},
      revice: [{key:'認証成否',value: rv.isErr ? 'NG' : 'OK'}],
    });    
    console.log('管理局.auth2B end. rv='+JSON.stringify(rv));
    return rv;
  }
}

const candidates = (data) => {  // 該当者リストの作成
  console.log('管理局.candidates start.',data);

  const dObj = szLib.getSheetData('マスタ'); // データをシートから取得
  let result = [];
  const sKey = String(data.key);
  if( sKey.match(/^[0-9]+$/) ){
    console.log('管理局.number='+Number(sKey));
    result = dObj.data.filter(x => {return Number(x['受付番号']) === Number(sKey)});
  } else if( sKey.match(/^[ァ-ヾ　]+$/) ){
    console.log('管理局.kana='+sKey);
    result = dObj.data.filter(x => {return x['読み'].indexOf(sKey) === 0});
  }

  console.log('管理局.candidates end. result='+JSON.stringify(result));
  return result;
};

const updateParticipant = (data) => { // 参加者情報を更新
  console.log('管理局.updateParticipant start.',data);

  const dObj = szLib.getSheetData('マスタ'); // データをシートから取得
  const rv = szLib.updateSheetData(dObj,data);

  console.log('管理局.updateParticipant end.',rv);
  return rv;
}

const postMessage = (arg) => {
  console.log('管理局.postMessage start. arg='+JSON.stringify(arg));
  const v = {
    timestamp: new Date().toLocaleString('ja-JP'),
    from: arg.from,
    to: arg.to,
    message: arg.message,
  }
  console.log('管理局.postMessage end. v='+JSON.stringify(v));  
  return v;
};