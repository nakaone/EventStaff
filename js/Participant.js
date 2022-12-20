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

      // 01. htmlの生成
      let iHtml = '<div class="table">';  // wrapper start
      // 01.1 申込者識別
      iHtml += '<div class="tr">'
      + '  <div class="td entryNo">' + (('000'+arg.entryNo).slice(-4)) + '</div>'
      + '  <div class="td name">'
      + '    <ruby><rb>' + arg.name00 + '</rb><rt>' + arg.yomi00 + '</rt></ruby>'
      + '  </div>'
      + '  <button name="details">詳細</button>'
      + '</div>';
      // 01.2 詳細情報
      iHtml += '<div name="details" class="tr">'
      + '  <div>受付日時：' + getJPDateTime(arg['タイムスタンプ']) + '</div>'
      + '  <div>e-mail：' + arg['メールアドレス'] + '</div>'
      + '  <div>緊急連絡先：' + arg['緊急連絡先'] + '</div>'
      + '  <div>引取者：' + arg['引取者氏名'] + '</div>'
      + '  <div>備考：' + arg['備考'] + '</div>'
      + '  <div>キャンセル：' + (arg.cancel < 0 ? "取消済" : "( — )") + '</div>'
      + '  <div>申込フォーム：<div class="qrcode"></div></div>'
      + '</div>';
      // 01.3 申請者の状態・参加費
      const maruNo = ['','①','②','③'];  // 丸数字
      for( let i=0 ; i<4 ; i++ ){
        const num = ('0'+i).slice(-2);
        // 空欄の場合、既定値を設定
        if( arg['status'+num].length === 0 ){
          arg['status'+num] = arg['name'+num].length === 0 ? '未登録' : '未入場';
        }
        if( arg['fee'+num].length === 0 ){
          arg['fee'+num] = arg['name'+num].length === 0 ? '無し' : '未収';
        }
        iHtml += '<div>' + maruNo[i] + '</div>';  // 番号
        iHtml += '<div>' + arg['name'+num] + '</div>';  // 氏名
        // 状態
        iHtml += '<div><label>入退場</label><select name="status' + num + '">';
        let opt = ['未入場','入場済','退場済','不参加','未登録'];
        for( let j=0 ; j<opt.length ; j++ ){
          iHtml += '<option value="' + opt[j] + '"'
            + ( arg['status'+num] === opt[j] ? ' selected' : '')
            + '>' + opt[j] + '</option>';
        }
        iHtml += '</select></div>';
        // 参加費
        iHtml += '<div><label>参加費</label><select name="fee' + num + '">';
        opt = ['未収','既収','免除','無し'];
        for( let j=0 ; j<opt.length ; j++ ){
          iHtml += '<option value="' + opt[j] + '"'
            + ( arg['fee'+num] === opt[j] ? ' selected' : '')
            + '>' + opt[j] + '</option>';
        }
        iHtml += '</select></div>';
      }
      iHtml += '<button name="update">登録</button>'
      iHtml += '<button name="cancel">取消</button>'
      iHtml += '</div>';  // wrapper end
      this.dom.main.innerHTML = iHtml;
      // 詳細情報は当初非表示に
      this.dom.main.querySelector('div[name="details"]').style.display = 'none';

      // 02. イベント定義
      // 02.1 「詳細」ボタンクリック
      this.dom.main.querySelector('button[name="details"]').addEventListener('click',() => {
        const btn = this.dom.main.querySelector('button[name="details"]');
        if( btn.value === '詳細' ){
          this.dom.main.querySelector('div[name="details"]').style.display = 'flex';
          btn.value = '閉じる';
        } else {
          this.dom.main.querySelector('div[name="details"]').style.display = 'none';
          btn.value = '詳細';
        }
      });
      // 02.2 「登録」ボタンクリック
      this.dom.main.querySelector('button[name="update"]').addEventListener('click',() => {
        this.updateParticipant();
      });
      // 02.3 「取消」ボタンクリック
      this.dom.main.querySelector('button[name="cancel"]').addEventListener('click',() => {
        this.display();
      });

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

  editParticipant: {tag:"div", class:"table", children:[
    {tag:"div", class:"tr entry", children:[
      {tag:"div", class:"td entryNo", variable:"受付番号"},
      {tag:"div", class:"td name", children:[
        {tag:"ruby", children:[
          {tag:"rb", variable:"氏名"},
          {tag:"rt", variable:"読み"},
        ]},
      ]},
      {tag:"div", children:[
        {tag:"input", type:"button", value:"詳細"},
      ]},
    ]},
    {tag:"div", class:"tr detail", children:[ // 詳細情報
      {tag:"div", text:"受付日時：\t", variable:"登録日時"},
      {tag:"div", text:"e-mail：\t", variable:"メール"},
      {tag:"div", text:"緊急連絡先：\t", variable:"連絡先"},
      {tag:"div", text:"引取者：\t", variable:"引取者"},
      {tag:"div", text:"備考：\t", variable:"備考"},
      {tag:"div", text:"キャンセル：\t", variable:"取消"},
      {tag:"div", class:"form", children:[
        {tag:"div", text:"申込フォーム："},
        {tag:"div", class:"qrcode"},
        {tag:"input", type:"button", value:"申込フォームの表示"},
      ]},
    ]},
    {tag:"div", class:"tr participant", children:[ // 申請者の状態・参加費
      {tag:"div"},
      {tag:"div"},
      {tag:"div", children:[
        {tag:"label", text:"入退場"},
        {tag:"select", class:"status", name:"status00",
          opt:"未入場,入場済,退場済,不参加,未登録", variable:"状態"},
      ]},
      {tag:"div", children:[
        {tag:"label", text:"参加費"},
        {tag:"select", class:"fee", name:"fee00",
          opt:"未収,既収,免除,無し", variable:"参加費"},
      ]},
    ]},
    {tag:'hr'}, // 以下参加者
    {tag:"div", class:"tr participant", children:[
      {tag:"div", text:"①"},
      {tag:"div", variable:"①氏名"},
      {tag:"div", children:[
        {tag:"label", text:"入退場"},
        {tag:"select", class:"status", name:"status01",
          opt:"未入場,入場済,退場済,不参加,未登録", variable:"①状態"},
      ]},
      {tag:"div", children:[
        {tag:"label", text:"参加費"},
        {tag:"select", class:"fee", name:"fee01",
          opt:"未収,既収,免除,無し", variable:"①参加費"},
      ]},
    ]},
    {tag:"div", class:"tr participant", children:[
      {tag:"div", text:"②"},
      {tag:"div", variable:"②氏名"},
      {tag:"div", children:[
        {tag:"label", text:"入退場"},
        {tag:"select", class:"status", name:"status02",
          opt:"未入場,入場済,退場済,不参加,未登録", variable:"②状態"},
      ]},
      {tag:"div", children:[
        {tag:"label", text:"参加費"},
        {tag:"select", class:"fee", name:"fee02",
          opt:"未収,既収,免除,無し", variable:"②参加費"},
      ]},
    ]},
    {tag:"div", class:"tr participant", children:[
      {tag:"div", text:"③"},
      {tag:"div", variable:"③氏名"},
      {tag:"div", children:[
        {tag:"label", text:"入退場"},
        {tag:"select", class:"status", name:"status03",
          opt:"未入場,入場済,退場済,不参加,未登録", variable:"③状態"},
      ]},
      {tag:"div", children:[
        {tag:"label", text:"参加費"},
        {tag:"select", class:"fee", name:"fee03",
          opt:"未収,既収,免除,無し", variable:"③参加費"},
      ]},
    ]},
  ]},





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