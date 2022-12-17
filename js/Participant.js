class Participant {

  constructor(dom){
    this.dom = dom;
  }

  /** display: 受付業務画面の表示
   * @param {void} - なし
   * @returns {void} なし
   */
  display(){
    this.dom.title.innerText = '受付業務';
    this.dom.main.innerHTML = `
      <div>
        <button name="formQR">登録フォーム誘導</button>
        <button name="scanDoc">紙申請処理</button>
      </div>
      <div class="screen"><!-- 該当者検索 -->
        <input type="text" placeholder="&#x1F50D受付番号または氏名読み(最初の数文字)" />
        <button name="search">検索</button>
        <div class="scanner"></div><!-- QRコードスキャナ -->
      </div>    
    `;
    this.dom.formQRBtn = this.dom.main.querySelector('button[name="formQR"]');
    this.dom.scanDocBtn = this.dom.main.querySelector('button[name="scanDoc"]');
    this.dom.keyWordArea = this.dom.main.querySelector('input[type="text"]');
    this.dom.searchBtn = this.dom.main.querySelector('input[type="button"]');
    document.addEventListener('click',(e)=>{
      switch( e.target.name ){
        case 'formQR':
          this.formQR();
          break;
        case 'scanDoc':
          this.scanDoc();
          break;
        case 'search':
          this.searchKey();
          break;
      }
    });

    // スキャナのセットアップ
    this.scanner = new webScanner({
      /* @param {object} arg.parent - 親要素
       * @param {number} arg.interval - 動画状態で撮像、読み込めなかった場合の時間間隔
       * @param {object} arg.RegExp - QRコードスキャン時、内容が適切か判断
       * @param {boolean} arg.alert - 読み込み完了時に内容をalert表示するか */
      parent: this.dom.main.querySelector('.scanner'),
      interval: 0.25,
    });
    this.scanner.scanQR((code)=>{  // QRコード読込後の処理
      console.log('scanned => '+code);
      this.searchKey(code);
    },{
      RegExp: /^[0-9]+$/,
      alert: true
    });
  }

  /** formQR: 未申請者へ申請フォームのURLをQRコードで表示
   * @param {void} - なし
   * @returns {void} なし
   */
  formQR(){
    console.log('formQR clicked.');
    this.dom.main.innerHTML = `
    <p>スマホをお持ちの場合、以下のフォームから申請をお願いします。</p>
    <div class="qrcode"></div>
    <button name="display">受付業務に戻る</button>
    `;
    let qrcode = new QRCode(this.dom.main.querySelector('div.qrcode'),{
      text: config.public.FormURL,
      width: 300,
      height: 300,
      colorDark : "#000000",
      colorLight : "#ffffff",
      correctLevel : QRCode.CorrectLevel.H
    })
    document.addEventListener('click',(e)=>{
      switch( e.target.name ){
        case 'display':
          this.display();
          break;
      }
    });
  }

  /** scanDoc: 紙媒体での申請処理
   * @param {void} - なし
   * @returns {void} なし
   */
  scanDoc(){
    console.log('scanDoc clicked.');
    this.dom.main.innerHTML = `
    <h1>(未実装)</h1>
    <button name="display">受付業務に戻る</button>
    `;
    document.addEventListener('click',(e)=>{
      switch( e.target.name ){
        case 'display':
          this.display();
          break;
      }
    });
  }

  /** searchKey: 検索キー(受付番号または氏名の一部)で検索
   * @param {string|undefined} - 検索キーとなる受付番号または氏名の一部
   * @returns {object} 検索結果のオブジェクト
   * <ul>
   * <li>isErr {boolean} - エラーならtrue
   * <li>message {string} - エラーの場合はメッセージ。正常終了ならundefined
   * <li>result {object[]} - 検索キーにマッチした申込の配列。[{項目名:値,..},{..},..]形式
   * </ul>
  */
  searchKey(arg=''){
    console.log('Participant.search start. arg='+JSON.stringify(arg));
    this.dom.title.innerText = '該当者の検索';

    this.dom.main.innerHTML = '<img src="img/loading.gif" />';

    /* fetchGAS
    * @param {object}   arg          - 引数
    * @param {string}   arg.to       - 受信側のコード名(平文)
    * @param {string}   arg.func     - GAS側で処理分岐の際のキー文字列
    * @param {any}      arg.data     - 処理対象データ
    * @param {function} arg.callback - GAS処理結果を受けた後続処理 */
    fetchGAS({
      to: 'Master',
      func: 'candidates',
      data: arg.length > 0 ? arg : this.dom.keyWordArea.value,
      callback: (res => {
        if( res.isErr ){
          this.dom.main.innerHTML = '<h1 class="error">' + res.message + '</h1>';
          return;
        } else {
          if( res.result.length === 0 ){
            alert("該当する参加者は存在しませんでした");
            this.display();
          } else if( res.result.length > 1){
            this.selectParticipant(res.result);  // 該当が複数件なら選択画面へ
          } else {
            this.editParticipant(res.result[0]);  // 該当が1件のみなら編集画面へ
          }
        }
      })
    });
  }

  /** inputSearchKey: 参加者の検索キーを入力
   * 
  inputSearchKey(){
    console.log('inputSearchKey start.');
    changeScreen('inputSearchKey','該当者の検索');
  
    // スキャンまたは値入力時の動作を定義
    const strEl = document.querySelector('#inputSearchKey input[type="text"]');
  
    // スキャナから読み込まれた文字列をinput欄にセット
    const callback = (keyPhrase) => {
      changeScreen('loading');
      config.scanCode = false;  // スキャンを停止
      document.querySelector('#inputSearchKey .scanner')
        .innerHTML = ''; // スキャナ用DIV内を除去
      doGet(config.MasterURL,config.MasterKey,{func:'search',data:{key:keyPhrase}},(data) => {
        if( data.length === 0 ){
          alert("該当する参加者は存在しませんでした");
        } else if( data.length > 1){
          selectParticipant(data);  // 該当が複数件なら選択画面へ
        } else {
          editParticipant(data[0]);  // 該当が1件のみなら編集画面へ
        }
      });
    };
  
    // スキャナを起動
    config.scanCode = true;
    scanCode((code) => {
      console.log('scanCode: ' + code);
      strEl.value = code; // 念の為入力欄にもセット
      callback(code);
    },{
      selector:'#inputSearchKey .scanner',  // 設置位置指定
      RegExp:/^[0-9]+$/,  // 数字かチェック
      alert: false,  // 読み込み時、内容をalert表示しない
    });
  
    // キーワード入力欄の値が変わったら検索するよう設定
    document.querySelector('#inputSearchKey input[type="button"]')
    .addEventListener('click',() => {
      const keyPhrase = convertCharacters(strEl.value,false);
      console.log('keyPhrase: '+ strEl.value + ' -> ' + keyPhrase );
      callback(keyPhrase);
    });
  
    console.log('inputSearchKey end.');
  }
  */
  
  /** selectParticipant: 複数検索結果からの選択
   * @param {object[]} arg - 候補者のオブジェクトの配列。[{項目名:値,..},{..},..]形式
   * @returns {void} なし
   */
  selectParticipant(arg){
    console.log('selectParticipant start. arg='+JSON.stringify(arg));
    this.dom.title.innerText = '対象者の選択';
    try {
      const editArea = this.dom.main;
      editArea.innerHTML = '<p>検索結果が複数あります。選択してください。</p>';
      for( let i=0 ; i<arg.length ; i++ ){
        const o = document.createElement('div');
        o.innerText = arg[i]['氏名'] + '(' + arg[i]['読み'] + ')';
        o.addEventListener('click',() => {
          editParticipant(arg[i]);  // 選択後編集画面へ
        });
        editArea.appendChild(o);
      }
      console.log('selectParticipant end.');
    } catch(e) {
      console.error('selectParticipant abnormal end.\n'+e.message);
      alert(e.message);
    }
  }
  
  /** editParticipant: 検索結果の内容編集
   * @param {object} - 編集対象のオブジェクト。{項目名:値,..}形式
   * @returns {void} なし
   */
  editParticipant(arg){
    console.log('editParticipant start. arg='+JSON.stringify(arg));
    this.dom.title.innerText = '参加者情報の編集';
    try {

      // [01] データクレンジング
      arg.entryNo = ('000'+arg.entryNo).slice(-4);  // 0パディング
      arg.timestamp = getJPDateTime(arg['タイムスタンプ']);
      /* 「取消」の文字列が入っていればtrue
      arg['取消'] = arg['取消'].length === 0 ? "無し" : "有り";
      ['','①','②','③'].forEach(x => {
        if( arg[x+'状態'].length === 0 )
          arg[x+'状態'] = arg[x+'氏名'].length === 0 ? '未登録' : '未入場';
        if( arg[x+'参加費'].length === 0 )
          arg[x+'参加費'] = arg[x+'氏名'].length === 0 ? '無し' : '未収';
      });*/

      /*
+ '<div class="table">'

// 申込者識別
+ '  <div class="tr">'
+ '    <div class="td entryNo">' + arg.entryNo + '</div>'
+ '    <div class="td name">'
+ '      <ruby><rb>' + arg.name00 + '</rb><rt>' + arg.yomi00 + '</rt></ruby>'
+ '    </div>'
+ '    <button name="details">詳細</button>'
+ '  </div>'

// 詳細情報
+ '  <div class="tr">'
+ '    <div>受付日時：' + arg['タイムスタンプ'] + '</div>'
+ '    <div>e-mail：' + arg['メールアドレス'] + '</div>'
+ '    <div>緊急連絡先：' + arg['緊急連絡先'] + '</div>'
+ '    <div>引取者：' + arg['引取者氏名'] + '</div>'
+ '    <div>備考：' + arg['備考'] + '</div>'
+ '    <div>キャンセル：' + arg['キャンセル'] + '</div>'
+ '    <div>申込フォーム：<div class="qrcode"></div></div>'
+ '  </div>'

// 申請者の状態・参加費
+ '  <div></div>'
+ '</div>'

// 関数化？
+ '    <label>入退場</label>'
+ '    <select name="status00">'
+ '    </select>'
+ '  </div>'
      */

      console.log('editParticipant end.');

    } catch(e) {
      console.error('editParticipant abnormal end.\n'+e.message);
      alert(e.message);
    }
    
    /* 該当が1件のみなら編集画面へ
    const editArea = document.querySelector('#editParticipant .edit');
    editArea.innerHTML = '';
  
  
    // [02] 各要素への値設定
  
    // 要素の作成とセット
    let o = genChild(config.editParticipant,arg,'root');  // 全体の定義と'root'を渡す
    if( toString.call(o.result).match(/Error/) ){  // エラーObjが帰ったら
      throw o.result;
    } else if( o.append ){  // 追加フラグがtrue
      // 親要素に追加
      editArea.appendChild(o.result);
  
      // 「詳細」ボタンクリック時の処理を定義
      document.querySelector('#editParticipant .entry input[type="button"]')
      .addEventListener('click', () => {
        const detail = document.querySelector('#editParticipant .detail');
        const button = document.querySelector('#editParticipant .entry input[type="button"]');
        if( button.value === '詳細' ){
          button.value = '閉じる';
          detail.style.display = 'block';
        } else {
          button.value = '詳細';
          detail.style.display = 'none';
        }
      });
  
      // 編集用URLをQRコードで表示
      // https://saitodev.co/article/QRCode.js%E3%82%92%E8%A9%A6%E3%81%97%E3%81%A6%E3%81%BF%E3%81%9F/
      setQRcode('#editParticipant .qrcode',{text:arg['編集用URL']});
  
      // 「申込フォームを表示」ボタンクリック時の遷移先を定義
      document.querySelector('#editParticipant .form input[type="button"]')
        .onclick = () => window.open(arg['編集用URL'], '_blank');
    } */
  
  }
  
  /** updateParticipant: 参加者情報更新
   * @param {void} - なし
   */
  updateParticipant(){
    console.log('updateParticipant start.');
  
    const sList = {
      status:'#editParticipant [name="status0_"]',
      fee:'#editParticipant [name="fee0_"]',
    };
    const prefix = ['','①','②','③'];
  
    // 更新用のデータオブジェクトの作成
    const postData = {func:'update',data:{
      target:{
        key: '受付番号',  //更新対象のレコードを特定する為の項目名
        value: Number(document.querySelector("#editParticipant .entryNo")
          .innerText), //キーの値
      } ,
      revice: [],
    }};
    for( let i=0 ; i<4 ; i++ ){
      const s = document.querySelector(sList.status.replace('_',i));
      postData.data.revice.push({
        key: prefix[i]+'状態',  // 更新対象の項目名
        value: s.options[s.selectedIndex].value,  // 更新後の値
      });
      const f = document.querySelector(sList.fee.replace('_',i));
      postData.data.revice.push({
        key: prefix[i]+'参加費',
        value: f.options[f.selectedIndex].value,
      });
    }
    doGet(config.MasterURL,config.MasterKey,postData,(data) => {
      // 結果表示
      let result = '<p>以下の変更を行いました。</p>';
      if( data.length > 0 ){
        for( let i=0 ; i<data.length ; i++ ){
          result += '<p>_1 : _2 => _3</p>'
            .replace('_1',data[i].column)
            .replace('_2',data[i].before)
            .replace('_3',data[i].after);
        }
      } else {
        result = '<p>変更点はありませんでした。</p>';
      }
      document.querySelector('#editParticipant .result').innerHTML = result;
      console.log('updateParticipant end.',JSON.stringify(data));
    });
  }

}