const config = szLib.setConfig(['MasterKey','AuthSheetId','PostURL','PostKey']);

// ===========================================================
// トリガー関数
// ===========================================================

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

/** doGetTest: doGetのテスト
 * <br>
 * 結果はコンソールで確認
 * 
 * @param {} - なし
 * @return {void} なし
 */
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
    doGet({parameter:{v:szLib.encrypt(testData[i],config.MasterKey)}});
  }
};

/** doGet: 暗号化されたパラメータを復号、それに応じて処理を分岐
 * <br>
 * 返値はTextOutputのインスタンス。<br>
 * getContentで中の文字列を取得、parseすれば結果オブジェクトが得られる。<br>
 * GAS公式: [Class TextOutput]{@link https://developers.google.com/apps-script/reference/content/text-output#getcontent}
 *
 * @param {object} e - const config = szLib.setConfig(['PostURL','PostKey']);
 * @param {object} e.parameter - パラメータ文字列
 * @param {object} e.parameter.v - グローバル変数PostKeyで暗号化された文字列。<br>復号すると以下のオブジェクトとなる
 * @param {string} e.parameter.v.func - 'post'固定(他は不正)
 * @param {object} e.parameter.v.data - [postMails]{@link postMails}の引数
 * 
 * @return {object} - 正常終了の場合、分岐先処理の戻り値。異常終了の場合は空配列
 */
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
    case 'post':  // 【要削除】掲示板への投稿
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
 * <br>
 * 予約されたイベント関数なので、アローでは無くfunctionで定義。<br>
 * <br>
 * 受付番号として`range.rowStart`、一意キーとしてタイムスタンプ＋e-mail`values[0]+values[1]`を使用する。<br>
 * ※ namedValuesでも取得できるが、valuesがFormApp.getResponses()と同じ一次元配列なのでベターと判断。<br>
 * <br>
 * <ul>
 * <li>[メールの自動返信]{@link https://blog.hubspot.jp/google-forms-automatic-reply#f}
 * <li>[メールへのファイル添付]{@link https://my-funs.com/gas-mailapp/}
 * <li>[GASでHTMLメールを送る方法とインライン画像を埋め込む(画像挿入)方法]{@link https://auto-worker.com/blog/?p=2827}
 * </ul>
 * 
 * <p style="font-size:1.2rem">■スプレッドシート上のonFormSubmitに渡される引数</p>
 * 
 * <ul>
 * <li>[スプレッドシートのコンテナバインドのフォーム送信時イベントオブジェクト]{@link https://tgg.jugani-japan.com/tsujike/2021/05/gas-form4/#toc2}
 * <li>GAS公式 Google スプレッドシートのイベント[フォーム送信]{@link https://developers.google.com/apps-script/guides/triggers/events#form-submit}
 * </ul>
 * <img src="https://i0.wp.com/tgg.jugani-japan.com/tsujike/wp-content/uploads/210426-001.png?w=1256&ssl=1" width="80%" />
 * <ul>
 * <li>range : [Range]{@link https://developers.google.com/apps-script/reference/spreadsheet/range} Object
 * </ul>
 * 
 * <p style="font-size:1.2rem">■参考：フォーム上のonFormSubmitに渡される引数</p>
 * 
 * <ul>
 * <li>GAS公式 [Google フォームのイベント]{@link https://developers.google.com/apps-script/guides/triggers/events#google_forms_events}
 * <li>[フォームのコンテナバインドのフォーム送信時イベントオブジェクト]{@link https://tgg.jugani-japan.com/tsujike/2021/05/gas-form5/#toc2}
 * </ul>
 * <img src="https://i0.wp.com/tgg.jugani-japan.com/tsujike/wp-content/uploads/210427-001.png?w=1256&ssl=1" width="80%" />
 * <ul>
 * <li>response : [Form Response]{@link https://developers.google.com/apps-script/reference/forms/form-response} Object
 * <ul>
 * <li>[getEditResponseUrl()]{@link https://developers.google.com/apps-script/reference/forms/form-response#geteditresponseurl}
 * <li>[getTimestamp()]{@link https://developers.google.com/apps-script/reference/forms/form-response#gettimestamp}
 * </ul>
 * <li>source : [Form]{@link https://developers.google.com/apps-script/reference/forms/form}
 * </ul>
 * 
 * <p style="font-size:1.2rem">■フォーム編集用URLの取得</p>
 * 
 * <p>参加者の追加・削除やキャンセル登録のため、登録者(参加者)がフォームを編集する必要があるが、編集用URLはGoogle Spreadには記録されず、フォームの登録情報にしか存在しない。<br>
 * そこで①フォームの登録情報を全件取得し、②Google Spreadの登録日時＋e-mailから特定し、③特定された登録情報から編集用URLを取得、という手順を踏む。</p>
 * ※回答シートとフォームで添字が一致しないかと考えたが、結果的には一致していない。よって「タイムスタンプのgetTime()＋e-mail」を検索キーとする。<br>
 * 
 * @param {Object} e - スプレッドシート上のonFormSubmitに渡される引数
 * @returns {object} 郵便局.doPostで処理された結果
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
      template   : '申込への返信',
      data: [{
        recipient  : e.namedValues['メールアドレス'][0],
        variables  : {
          name     : e.namedValues['申請者氏名'][0].match(/^([^　]+)/)[1],  // 姓のみ
          entryNo  : entryNo,
        }
      }],
    }
  };
  const endpoint = config.PostURL + '?v=' + szLib.encrypt(vObj,config.PostKey);

  const response = UrlFetchApp.fetch(endpoint).getContentText();
  console.log('管理局.onFormSubmit end. response='+response);
}

/** onFormSubmitTest: onFormSubmitのテスト
 * <br>
 * 結果はコンソールで確認
 * 
 * @param {} - なし
 * @return {void} なし
 */
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
/** auth1BTest: auth1Bのテスト
 * <br>
 * 結果はコンソールで確認
 * 
 * @param {} - なし
 * @return {void} なし
 */
const auth1BTest = () => {
  const params = ['MasterKey','PostURL','PostKey'];

  const c = szLib.setConfig(params);
  console.log(szLib.setConfig(params));
  console.log(JSON.stringify(c));
  params.forEach(x => {config[x] = c[x]});
  auth1B(1);
}

/** auth1B: 認証第一段階。パスコードを生成してメールで送付
 * @param {object} arg            - POSTで渡されたデータ
 * @param {string} arg.func       - 利用しない('auth1B'固定)
 * @param {string} arg.entryNo    - 利用者が入力した受付番号
 * @param {string} arg.passPhrase - 利用しない(config.Master.Key)
 * @return {object} - 処理結果
 * <ul>
 * <li>isErr {boolean} : エラーならtrue
 * <li>message {string} : エラーの場合はメッセージ。正常終了ならundefined
 * <li>result {object} : 分岐先の処理が正常終了した場合の結果オブジェクト
 * </ul>
 * 
 * @example <caption>引数の例</caption>
 * 管理局.auth1B start. arg={"entryNo":"1.0","func":"auth1B","passPhrase":"GQD*4〜aQ8r"}
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

/** auth2BTest: auth2Bのテスト
 * <br>
 * 結果はコンソールで確認
 * 
 * @param {} - なし
 * @return {void} なし
 */
const auth2BTest = () => {
  const t = {entryNo:3,passCode:988293};
  const rv = auth2B(t);
  console.log(rv);
}

/** auth2B: 認証局から送られた受付番号とパスコードの正当性をチェック
 * @param {object} arg            - POSTで渡されたデータ
 * @param {string} arg.func       - 利用しない('auth1B'固定)
 * @param {string} arg.entryNo    - 利用者が入力した受付番号
 * @param {string} arg.passCode   - 利用者が入力したパスコード
 * @param {string} arg.passPhrase - 利用しない(config.Master.Key)
 * @return {object} - 処理結果
 * <ul>
 * <li>isErr {boolean} - エラーならtrue
 * <li>message {string} - エラーの場合はメッセージ。正常終了ならundefined
 * <li>config {object} - configにセットする値(オブジェクト)
 * <li>menuFlags {number} - メニューの表示/非表示フラグの集合 
 * </ul>
 * 
 * @example <caption>引数の例</caption>
 * 管理局.auth2B start. arg={"func":"auth2B","entryNo":"1.0","passCode":"478608","passPhrase":"GQD*4〜aQ8r"}
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
      revice.push({key:'result',value:'NG'});
      revice.push({key:'message',value:rv.message});
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

/** candidates: 該当者リストの作成
 * 
 * @param {object} data     - 以下のメンバを持つオブジェクト
 * @param {string} data.key - 候補者検索のためのキーワード(受付番号、氏名読み)
 * @returns {object[]}      - 該当者のマスタ上のデータ
 */
const candidates = (data) => {
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

/** updateParticipant: 参加者情報を更新
 * 
 * @param {object} data              - 更新情報
 * @param {object} data.target       - 対象者情報
 * @param {string} data.target.key   - ユニークキーとなる項目名
 * @param {any}    data.target.value - キー値
 * @param {object[]} data.revice     - 更新内容
 * @param {string} data.revice.key   - 更新対象項目名
 * @param {string} data.revice.value - 更新する値
 * @returns {object[]} updateSheetDataの更新結果
 * <ul>
 * <li>column {string} - 更新した項目
 * <li>before {string} - 更新前の値
 * <li>after  {string} - 更新後の値
 * </ul>
 * 
 * @example <caption>引数の例</caption>
 * 管理局.updateParticipant start. {
 *    target: { key: '受付番号', value: 10 },
 *    revice:[
 *      { key: '状態', value: '入場済' },
 *      { key: '参加費', value: '既収' },
 *      { key: '①状態', value: '入場済' },
 *      { key: '③参加費', value: '無し' }
 *    ]
 * }
 * 
 * @example <caption>戻り値の例</caption> 
 * 管理局.updateParticipant end. [
 *    { column: '状態', before: '', after: '入場済' },
 *    { column: '参加費', before: '', after: '既収' },
 *    { column: '①状態', before: '', after: '入場済' },
 *    { column: '③参加費', before: '', after: '無し' }
 * ]
 */
const updateParticipant = (data) => {
  console.log('管理局.updateParticipant start.',data);

  const dObj = szLib.getSheetData('マスタ'); // データをシートから取得
  const rv = szLib.updateSheetData(dObj,data);

  console.log('管理局.updateParticipant end.',rv);
  return rv;
}

/** 【要削除】postMessage: 掲示板への投稿データを作成する
 * 
 * @param {*} arg 
 * @returns {object} 作成されたメールデータ
 * <ul>
 * <li>timestamp {string} - 作成日時
 * <li>from {string} - Fromアドレス
 * <li>to {string} - Toアドレス
 * <li>message {string} - メール本文
 * </ul>
 */
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