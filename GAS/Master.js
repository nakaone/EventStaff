const elaps = {account:'shimokitasho.oyaji@gmail.com',department:'管理局'};
const conf = szLib.getConf();

/** doPost: パラメータに応じて処理を分岐
 * @param {object} e - Class UrlFetchApp <a href="https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app#fetchurl,-params">fetch(url, params)</a>の"Make a POST request with a JSON payload"参照
 * @param {object} arg - データ部分。JSON.parse(e.postData.getDataAsString())の結果
 * @param {string} arg.key - 共通鍵。szLib.getUrl()で取得
 * @param {string} arg.from       - 送信元
 * @param {string} arg.to         - 送信先(自分)
 * @param {string} arg.func       - 分岐する処理名
 * @param {string} arg.data       - 処理対象データ
 * @return {object} 正常終了の場合は分岐先処理の戻り値、エラーの場合は以下。
 * <ul>
 * <li>isErr {boolean}  - true(固定)
 * <li>message {string} - エラーメッセージ
 * </ul>
 */
 function doPost(e){
  elaps.startTime = Date.now();  // 開始時刻をセット
  console.log('管理局.doPost start.',e);

  const arg = JSON.parse(e.postData.contents);
  let rv = null;
  if( arg.key === conf.Master.key ){
    try {
      elaps.func = arg.func; // 処理名をセット
      switch( arg.func ){
        case 'auth1B':
          rv = auth1B(arg.data);
          break;
        case 'auth2B':
          rv = auth2B(arg.data);
          break;
        case 'candidates':
          rv = candidates(arg.data);
          break;
        case 'updateParticipant':
          rv = updateParticipant(arg.data);
          break;
      }
    } catch(e) {
      // Errorオブジェクトをrvとするとmessageが欠落するので再作成
      rv = {isErr:true, message:e.name+': '+e.message};
    } finally {
      console.log('管理局.doPost end. rv='+JSON.stringify(rv));
      szLib.elaps(elaps, rv.isErr ? rv.message : 'OK');  // 結果を渡して書き込み
      return ContentService
      .createTextOutput(JSON.stringify(rv,null,2))
      .setMimeType(ContentService.MimeType.JSON);
    }
  } else {
    rv = {isErr:true,message:'invalid key :'+arg.key};
    console.error('管理局.doPost end. '+rv.message);
    console.log('end',elaps);
    szLib.elaps(elaps, rv.isErr ? rv.message : 'OK');
  }
}

const ofsTest = () => {
  onFormSubmit({
    range:{rowStart:3},
  });
}

/** onFormSubmit: フォーム申込み時のメールの自動返信
 * <br>
 * 予約されたイベント関数なので、アローでは無くfunctionで定義。<br>
 * <br>
 * 受付番号として`range.rowStart`、一意キーとしてタイムスタンプ＋e-mail`values[0]+values[1]`を使用する。<br>
 * ※ namedValuesでも取得できるが、valuesがFormApp.getResponses()と同じ一次元配列なのでベターと判断。<br>
 * <br>
 * <ul>
 * <li><a href="https://blog.hubspot.jp/google-forms-automatic-reply#f">メールの自動返信</a>
 * <li><a href="https://my-funs.com/gas-mailapp/">メールへのファイル添付</a>
 * <li><a href="https://auto-worker.com/blog/?p=2827">GASでHTMLメールを送る方法とインライン画像を埋め込む(画像挿入)方法</a>
 * </ul>
 * 
 * <p style="font-size:1.2rem">■スプレッドシート上のonFormSubmitに渡される引数</p>
 * 
 * <ul>
 * <li><a href="https://tgg.jugani-japan.com/tsujike/2021/05/gas-form4/#toc2">スプレッドシートのコンテナバインドのフォーム送信時イベントオブジェクト</a>
 * <li>GAS公式 Google スプレッドシートのイベント<a href="https://developers.google.com/apps-script/guides/triggers/events#form-submit">フォーム送信</a>
 * </ul>
 * <img src="https://i0.wp.com/tgg.jugani-japan.com/tsujike/wp-content/uploads/210426-001.png?w=1256&ssl=1" width="80%" />
 * <ul>
 * <li>range : <a href="https://developers.google.com/apps-script/reference/spreadsheet/range">Range</a> Object
 * </ul>
 * 
 * <p style="font-size:1.2rem">■参考：フォーム上のonFormSubmitに渡される引数</p>
 * 
 * <ul>
 * <li>GAS公式 <a href="https://developers.google.com/apps-script/guides/triggers/events#google_forms_events">Google フォームのイベント</a>
 * <li><a href="https://tgg.jugani-japan.com/tsujike/2021/05/gas-form5/#toc2">フォームのコンテナバインドのフォーム送信時イベントオブジェクト</a>
 * </ul>
 * <img src="https://i0.wp.com/tgg.jugani-japan.com/tsujike/wp-content/uploads/210427-001.png?w=1256&ssl=1" width="80%" />
 * <ul>
 * <li>response : <a href="https://developers.google.com/apps-script/reference/forms/form-response">Form Response</a> Object
 * <ul>
 * <li><a href="https://developers.google.com/apps-script/reference/forms/form-response#geteditresponseurl">getEditResponseUrl()</a>
 * <li><a href="https://developers.google.com/apps-script/reference/forms/form-response#gettimestamp">getTimestamp()</a>
 * </ul>
 * <li>source : <a href="https://developers.google.com/apps-script/reference/forms/form">Form</a>
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
function onFormSubmit(e){
  elaps.startTime = Date.now();  // 開始時刻をセット
  elaps.func = 'onFormSubmit';
  console.log('管理局.onFormSubmit start.',e);
  let rv = null;
  try {
    // 1.引数からシート上の行番号を取得、それを基に登録日時を特定
    const rowNum = e.range.rowStart;
    const sObj = szLib.szSheet('マスタ');
    const timestamp = sObj.raw[rowNum-1][0];
    const tObj = sObj.lookup('タイムスタンプ',timestamp);
    console.log('rowNum='+rowNum+', timestamp='+szLib.getJPDateTime(timestamp)+', tObj='+JSON.stringify(tObj));

    let entryNo;
    let editURL = '';
    if( tObj.entryNo.length === 0 ){  // 新規登録の場合
      // 2.全フォームデータを読み込み、登録日時を基に編集用URLを取得
      const formData = FormApp.openById(conf.Form.id).getResponses();
      for( let i=formData.length-1 ; i>=0 ; i-- ){
        if( formData[i].getTimestamp().getTime() === timestamp.getTime() ){
          editURL = formData[i].getEditResponseUrl();
          break;
        }
      }
      console.log('管理局.editURL='+editURL);

      // 3.受付番号を採番、編集用URLと併せてシートに書き込み
      const entryNoList = sObj.data.map(x => x.entryNo);
      entryNo = Math.max(...entryNoList) + 1;
      console.log('entryNo='+entryNo);
      const updateResult = sObj.update('タイムスタンプ',new Date(timestamp),[
        {column:'entryNo', value:entryNo},
        {column:'editURL', value:editURL},
      ],false);
      console.log('updateResult = '+JSON.stringify(updateResult));
    } else {  // 既存申込の編集の場合
      entryNo = Number(tObj.entryNo);
      editURL = tObj.editURL;
    }

    // 4.返信メールを送信
    rv = szLib.fetchGAS({
      from: 'Master',
      to: 'Post',
      func: 'postMails',
      data: {
        template: '申込への返信',
        data: [{
          recipient: tObj['メールアドレス'],
          variables: {name:tObj['申請者氏名'],entryNo:('000'+entryNo).slice(-4)},
        }],
      }
    });

  } catch(e) {
    // Errorオブジェクトをrvとするとmessageが欠落するので再作成
    rv = {isErr:true, message:e.name+': '+e.message};
  } finally {
    console.log('管理局.onFormSubmit end. rv='+JSON.stringify(rv));
    szLib.elaps(elaps, rv.isErr ? rv.message : 'OK');  // 結果を渡して書き込み
  }
}

/** auth1B: 認証第一段階。パスコードを生成してメールで送付
 * @param {object} arg            - 利用者が入力した受付番号
 * @return {object} - 処理結果
 * <ul>
 * <li>isErr {boolean} : エラーならtrue
 * <li>message {string} : エラーの場合はメッセージ。正常終了ならundefined
 * <li>result {object} : 分岐先の処理が正常終了した場合の結果オブジェクト
 * </ul>
 * 
 * @example <caption>引数の例</caption>
 * 管理局.auth1B start. arg={"entryNo":"1.0","func":"auth1B","key":"GQD*4〜aQ8r"}
 */
const auth1B = (arg) => {
  console.log('管理局.auth1B start. arg='+JSON.stringify(arg));
  let rv = null;
  try {

    // 01.申込者情報の取得とパスコードの生成
    const entryNo = Number(arg);
    const dObj = szLib.szSheet('マスタ');
    const participant = dObj.lookup('entryNo',entryNo);
    console.log('管理局.participant='+JSON.stringify(participant));
    const passCode = ('00000' + Math.floor(Math.random() * 1000000)).slice(-6);
    console.log('管理局.passCode='+passCode);

    // 02.マスタにパスコードを記録
    let r = dObj.update('entryNo',entryNo,[
      {column:'passCode',value:passCode},
      {column:'passTime',value:new Date()},
    ])
    console.log('管理局.update='+JSON.stringify(r));

    // 03.メール送信要求
    rv = szLib.fetchGAS({from:'Master',to:'Post',func:'postMails',data:{
      template: 'パスコード通知',
      data: [{
        recipient: participant['メールアドレス'],
        variables: {passCode : passCode},
      }],
    }});

  } catch(e) {
    // Errorオブジェクトをrvとするとmessageが欠落するので再作成
    rv = {isErr:true, message:e.name+': '+e.message};
  } finally {
    console.log('管理局.auth1B end. rv='+JSON.stringify(rv));
    return rv;
  }
}

/** auth2B: 認証局から送られた受付番号とパスコードの正当性をチェック
 * @param {object} arg            - POSTで渡されたデータ
 * @param {string} arg.func       - 利用しない('auth1B'固定)
 * @param {string} arg.entryNo    - 利用者が入力した受付番号
 * @param {string} arg.passCode   - 利用者が入力したパスコード
 * @param {string} arg.key - 利用しない(config.Master.Key)
 * @return {object} - 処理結果
 * <ul>
 * <li>isErr {boolean} - エラーならtrue
 * <li>message {string} - エラーの場合はメッセージ。正常終了ならundefined
 * <li>config {object} - configにセットする値(オブジェクト)
 * <li>menuFlags {number} - メニューの表示/非表示フラグの集合 
 * </ul>
 * 
 * @example <caption>引数の例</caption>
 * 管理局.auth2B start. arg={"func":"auth2B","entryNo":"1.0","passCode":"478608","key":"GQD*4〜aQ8r"}
 */
const auth2B = (arg) => {
  console.log('管理局.auth2B start. arg='+JSON.stringify(arg));
  let rv = null;
  const dObj = szLib.szSheet({sheetName:'マスタ'});  // finallyで使用なのでtry外で宣言
  const entryNo = Number(arg.entryNo);  // finallyで使用なのでtry外で宣言
  try {

    // 受付番号を基にパスコード・生成日時を取得、検証
    const passCode = Number(arg.passCode);
    const participant = dObj.data.filter(x => {return Number(x.entryNo) === entryNo})[0];
    console.log('管理局.participant='+JSON.stringify(participant));
    const revice = [];

    // パスコードが一致したかの判定
    const validCode = passCode === Number(participant.passCode);
    // 発行日時は一時間以内かの判定
    const validTime = new Date().getTime() - new Date(participant.passTime).getTime() < conf.Master.validTime;
    if(  validCode && validTime ){
      // 検証OK：表示に必要なURLとメニューフラグをconfigとして作成
      // (1) AuthLevelに応じたconfigを作成。管理局「AuthLevel」シートが原本
      //     認証局:1, 放送局:2, 予約局:4, 管理局:8, 郵便局:16
      rv = {isErr:false, config:{}};
      participant.AuthLevel = Number(participant.AuthLevel);
      const AuthLevel = participant.AuthLevel > 0 ? participant.AuthLevel : conf.Master.defaultAuthLevel;
      const cObj = szLib.szSheet({sheetName:'config'});
      cObj.data.forEach(x => {
        if( (x.AuthLevel & AuthLevel) > 0 ){
          rv.config[x.key] = x.value;
        }
      });
      // editParticipantはオブジェクト用の記述なので、正確なJSON形式に整形が必要
      rv.config.editParticipant = JSON.stringify(rv.config.editParticipant);
      // (2) 参加申請フォームの編集用URL
      rv.config.entryURL = participant.editURL;
      // (3) 表示するメニューのフラグ(menuFlags)
      rv.menuFlags = participant.menuFlags || conf.Master.defaultMenuFlags;
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
    /*szLib.updateSheetData(dObj,{
      target:  {key:'entryNo',value: entryNo},
      revice: [{key:'認証成否',value: rv.isErr ? 'NG' : 'OK'}],
    });*/    
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

  const dObj = szLib.szSheet({sheetName:'マスタ'}); // データをシートから取得
  let result = [];
  const sKey = String(data.key);
  if( sKey.match(/^[0-9]+$/) ){
    console.log('管理局.number='+Number(sKey));
    result = dObj.data.filter(x => {return Number(x['受付番号']) === Number(sKey)});
  } else if( sKey.match(/^[ァ-ヾ　]+$/) ){
    console.log('管理局.katakana='+sKey);
    result = dObj.data.filter(x => {return x['読み'].indexOf(sKey) === 0});
  } else if( sKey.match(/^[ぁ-ゟ　]+$/) ){
    console.log('管理局.hiragana='+sKey);
    result = dObj.data.filter(x => {return x['読み'].indexOf(sKey) === 0});
  } else {
    console.log('管理局.kanji='+sKey);
    result = dObj.data.filter(x => {return x['氏名'].indexOf(sKey) === 0});
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
 * 
 * @example <caption>戻り値の例</caption> 
 */
const updateParticipant = (data) => {
  console.log('管理局.updateParticipant start.',data);

  const dObj = szLib.szSheet({sheetName:'マスタ'}); // データをシートから取得
  const rv = dObj.update(data.target.key,data.target.value,revice);

  console.log('管理局.updateParticipant end.',rv);
  return rv;
}