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
      </div>    
      <div class="scanner"></div><!-- QRコードスキャナ -->
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
      this.dom.main.innerHTML = '';
      this.entryNo = arg.entryNo;  // 更新時に利用

      // 01. 全体の枠組みを生成
      let o = genChild({class:'wrapper', children:[
        {class:'applicant'},          // 申込概要
        {class:'details none table'}, // 申込詳細
        {class:'members table'},      // 参加者リスト
        {class:'result none'}         // 更新結果表示
      ]});
      if( toString.call(o.result).match(/Error/) ){  // エラーObjが帰ったら
        throw o.result;
      } else if( o.append ){  // 追加フラグがtrueなら親要素に追加
        this.dom.main.appendChild(o.result);
      }

      // 02.申込概要
      // 02.1 空欄・読替処理
      arg.entryNo = ('000'+arg.entryNo).slice(-4);
      // 02.2 追加するテンプレートの作成
      const applicant = [
        {variable:'entryNo'},
        {tag:'ruby', children:[
          {tag:'rb', variable:'name00'},
          {tag:'rt', variable:'yomi00'}
        ]},
        {tag:'button', name:'details', text:'詳細'},
      ];
      // 02.3 追加処理
      for( let i=0 ; i<applicant.length ; i++ ){
        o = genChild(applicant[i],arg,'applicant'+i);
        if( toString.call(o.result).match(/Error/) ){  // エラーObjが帰ったら
          throw o.result;
        } else if( o.append ){  // 追加フラグがtrueなら親要素に追加
          this.dom.main.querySelector('.applicant').appendChild(o.result);
        }
      }
      // 02.4 イベントリスナの定義
      // 「詳細」ボタンクリック
      this.dom.main.querySelector('button[name="details"]').addEventListener('click',() => {
        const btn = this.dom.main.querySelector('button[name="details"]');
        if( btn.textContent === '詳細' ){
          toggleView(this.dom.main.querySelector('div.details'),true);
          btn.textContent = '閉じる';
        } else {
          toggleView(this.dom.main.querySelector('div.details'),false);
          btn.textContent = '詳細';
        }
      });

      // 03.申込詳細
      // 03.1 空欄・読替処理
      arg['タイムスタンプ'] = getJPDateTime(arg['タイムスタンプ']);
      arg.cancel = arg.cancel < 0 ? "取消済" : "( — )";
      // 03.2 追加するテンプレートの作成
      const details = [
        {class:'tr', children:[{class:'th', text:'受付日時'},{class:'td',variable:'タイムスタンプ'}]},
        {class:'tr', children:[{class:'th', text:'e-mail'},{class:'td',variable:'メールアドレス'}]},
        {class:'tr', children:[{class:'th', text:'緊急連絡先'},{class:'td',variable:'緊急連絡先'}]},
        {class:'tr', children:[{class:'th', text:'引取者'},{class:'td',variable:'引取者氏名'}]},
        {class:'tr', children:[{class:'th', text:'備考'},{class:'td',variable:'備考'}]},
        {class:'tr', children:[{class:'th', text:'キャンセル'},{class:'td',variable:'cancel'}]},
        {class:'tr', children:[{class:'th', text:'申込フォーム'},{class:'td qrcode'}]},
      ];
      // 03.3 追加処理
      for( let i=0 ; i<details.length ; i++ ){
        o = genChild(details[i],arg,'details'+i);
        if( toString.call(o.result).match(/Error/) ){  // エラーObjが帰ったら
          throw o.result;
        } else if( o.append ){  // 追加フラグがtrueなら親要素に追加
          this.dom.main.querySelector('.details').appendChild(o.result);
        }
      }
      // 申込フォームへの誘導用QRコード
      let qrcode = new QRCode(this.dom.main.querySelector('.qrcode'),{
        text: config.private.editURL,
        width: 200,
        height: 200,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
      })
      // 03.4 イベントリスナの定義 ⇒ なし

      // 04.参加者リスト(状態・参加費)
      // 04.1 空欄・読替処理
      for( let i=0 ; i<4 ; i++ ){
        const num = ('0'+i).slice(-2);
        if( arg['status'+num].length === 0 ){
          arg['status'+num] = arg['name'+num].length === 0 ? '未登録' : '未入場';
        }
        if( arg['fee'+num].length === 0 ){
          arg['fee'+num] = arg['name'+num].length === 0 ? '無し' : '未収';
        }
      }
      // 04.2 追加するテンプレートの作成
      const maruNo = ['','①','②','③'];  // 丸数字
      const members = [{class:'tr', children:[ // 表のラベル行
        {class:'th no', text:'No'},
        {class:'th name', text:'氏名'},
        {class:'th status', text:'入退場'},
        {class:'th fee', text:'参加費'}
      ]}];
      for( let i=0 ; i<4 ; i++ ){   // 申込者、参加者行
        const num = ('0'+i).slice(-2);
        members.push({class:'tr',children:[
          {class:'td no', text:maruNo[i]},
          {class:'td name', text:arg['name'+num]},
          {class:'td status', children:[
            {tag:'select', name:'status'+num, variable:'status'+num, opt:['未入場','入場済','退場済','不参加','未登録']},
          ]},
          {class:'td fee', children:[
            {tag:'select', name:'fee'+num, variable:'fee'+num, opt:['未収','既収','免除','無し']},

          ]}
        ]});
      }
      members.push({class:'tr', children:[  // 更新・取消ボタン行
        {tag:'button', name:'cancel', text:'取消'},
        {tag:'button', name:'update', text:'更新'}
      ]});
      // 04.3 追加処理
      for( let i=0 ; i<members.length ; i++ ){
        o = genChild(members[i],arg,'members'+i);
        if( toString.call(o.result).match(/Error/) ){  // エラーObjが帰ったら
          throw o.result;
        } else if( o.append ){  // 追加フラグがtrueなら親要素に追加
          this.dom.main.querySelector('.members').appendChild(o.result);
        }
      }
      // 04.4 イベントリスナの定義
      // 「更新」ボタンクリック
      this.dom.main.querySelector('button[name="update"]').addEventListener('click',() => {
        this.updateParticipant();
      });
      // 「取消」ボタンクリック
      this.dom.main.querySelector('button[name="cancel"]').addEventListener('click',() => {
        this.display();
      });

      // 05.更新結果表示
      // 05.1 空欄・読替処理
      // 05.2 追加するテンプレートの作成
      const result = [
        {tag:'p', class:'message', text:''},
        {tag:'button', name:'result', text:'確認'}
      ];
      // 05.3 追加処理
      for( let i=0 ; i<result.length ; i++ ){
        o = genChild(result[i],arg,'result'+i);
        if( toString.call(o.result).match(/Error/) ){  // エラーObjが帰ったら
          throw o.result;
        } else if( o.append ){  // 追加フラグがtrueなら親要素に追加
          this.dom.main.querySelector('.result').appendChild(o.result);
        }
      }
      // 05.4 イベントリスナの定義
      this.dom.main.querySelector('button[name="result"]').addEventListener('click',() => {
        this.display();
      });

      console.log('editParticipant end.');

    } catch(e) {
      console.error('editParticipant abnormal end.\n'+e.message);
      alert(e.message);
    }  
  }
  
  /** updateParticipant: 参加者情報更新
   * @param {void} - なし
   * @returns {void} なし
   */
  updateParticipant(){
    console.log('updateParticipant start.');
    try {

      // 01.更新用のデータオブジェクトの作成
      const data = {};
      for( let i=0 ; i<4 ; i++ ){
        const num = ('0'+i).slice(-2);
        const s = this.dom.main.querySelector('select[name="status'+num+'"]');
        data['status'+num] = s.options[s.selectedIndex].value;
        const f = this.dom.main.querySelector('select[name="fee'+num+'"]');
        data['fee'+num] = f.options[f.selectedIndex].value;
      }
      console.log('l.395 data='+JSON.stringify(data));

      // 02.スプレッドシートの更新
      /* @param {string}   arg.to       - 受信側のコード名(平文)
       * @param {string}   arg.func     - GAS側で処理分岐の際のキー文字列
       * @param {any}      arg.data     - 処理対象データ
       * @param {function} arg.callback - GAS処理結果を受けた後続処理 */
      fetchGAS({
        to: 'Master',
        func: 'updateParticipant',
        data: {
          data: data,
          opt: {key:'entryNo',value:this.entryNo}
        },
        callback: (res) => {
          /* 03.更新結果の表示
            * <li>isErr {boolean} - エラーならtrue
            * <li>message {string} - エラーメッセージ
            * <li>result {object[]} - 更新結果。空なら変更なし
            * <ul>
            * <li>column {string} - 更新した項目名
            * <li>before {any} - 修正前の値
            * <li>after {any} - 修正後の値 */
          this.dom.main.querySelector('div.result').classList.replace('none','flex');
          const msg = this.dom.main.querySelector('.message');
          let message = '';
          if( res.isErr ){
            msg.classList.add('error');
            msg.innerText = res.message;
          } else if( res.result.length === 0 ){
            msg.innerText = '変更はありませんでした。';
          } else {
            msg.innerText = '更新が終了しました。';
          }
          console.log('updateParticipant end.\n'+JSON.stringify(res));
        }
      });
     
    } catch(e) {
      console.error(e.message);
      alert(e.message);
    }
  }
}