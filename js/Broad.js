/** Broadcast: お知らせへの投稿、配信 */
class Broadcast {
  
  /** constructor: お知らせ画面の設定 */
  constructor(dom){
    this.dom = dom;
    this.posts = [];
    this.lastUpdate = getJPDateTime('1901/01/01');
    this.getMessages();
    this.display();
  }

  display = () => {
    this.dom.title.innerText = 'お知らせ';
    // 投稿権限がある場合は投稿エリアを表示
    if( (config.private.menuFlags & 2) > 0 ){
      this.dom.main.innerHTML = `
        <input type="button" name="postButton" value="投稿する" />
        <div class="postArea" style="display:none">
          <div class="fromto">
            <label>From</label>
            <input type="text" name="from" width="100%"
              placeholder="ハンドルネームを入力"
              onchange="config.handleName=this.value"
            />
          </div>
          <div class="fromto">
            <label>To</label>
            <select name="to">
              <option value="スタッフ全員">スタッフ全員</option>
              <option value="本部">本部</option>
              <option value="カレー担当">カレー担当</option>
              <option value="校内探検担当">校内探検担当</option>
              <option value="受付担当">受付担当</option>
              <option value="金魚すくい担当">金魚すくい担当</option>
              <option value="射的担当">射的担当</option>
            </select>
          </div>
          <div>
            <textarea name="message"></textarea>
          </div>
          <div class="submit">
            <input type="button" name="sendMessage" value="送信" />
          </div>
        </div>
      `;
      // 動的要素なのでdocumentに対してイベントリスナを設定
      document.addEventListener('click',(e)=>{
        const postArea = this.dom.main.querySelector('div.postArea');
        const postButton = this.dom.main.querySelector('input[name="postButton"]');
        switch( e.target.name ){
          case 'postButton':
            if( postButton.value === '投稿する' ){
              postButton.value = '閉じる'
              postArea.style.display = 'block';
            } else {
              postButton.value = '投稿する'
              postArea.style.display = 'none';
            }
            break;
          case 'sendMessage':
            postButton.value = '投稿する'
            postArea.style.display = 'none';
            this.postMessage();
            break;
        }
      });
      // 二回目以降の投稿ではハンドルネームをセット
      if( config.handleName ){
        this.dom.main.querySelector('input[name="from"]').value = config.handleName;
      }
    }

    // 表示用CSSの定義　いまここ
    const style = document.createElement('style');
    document.head.appendChild(style);
    style.sheet.insertRule(`
    .postArea {
      display: none;
      width: calc(100% - 1rem);
      padding: 0.5rem;
      background-color: #deecc6;
    }
    .postArea .fromto label {
      display: block;
      float: left;
      width: 4rem;
    }
    .postArea .fromto input, select {
      width: 8rem;
    }
    .postArea textarea {
      width: 90%;
      height: 4rem;
    }
    .broadArea {
      width: 100%;
      height: 100%;
      overflow: auto;
    }
    .broadArea p {
      width: 100%;
      margin-top: 0;
      margin-bottom: 0.5rem;
    }
    .broadArea p.date {
      padding-left: 1rem;
      background-color: forestgreen;
      color: white;  
    }
    .broadArea p.title {
      margin-bottom: 0.2rem;
      background-color: #a0c238;
      font-size: 0.8rem;
    }
    `);



    // 投稿内容の表示
    this.dom.main.innerHTML = this.dom.main.innerHTML + '<div class="broadArea"></div>';
    // 時系列にメッセージを並べ替え
    this.posts.sort((a,b) => a.timestamp < b.timestamp);
    // 掲示板領域に書き込むHTMLを msg として作成
    let msg = '';
    let lastMesDate = '1900/01/01';  // 投稿日が変わったら日付を表示するよう制御
    const t = '<p class="title">[_time] From:_from　To:_to</p><p>_message</p>';
    for( let i=0 ; i<this.posts.length ; i++ ){
      const dt = new Date(this.posts[i].timestamp);
      if( dt.toLocaleDateString('ja-JP') !== lastMesDate ){
        lastMesDate = dt.toLocaleDateString('ja-JP');
        msg += '<p class="date">' + lastMesDate + '</p>';
      }
      const hms = ('0'+dt.getHours()).slice(-2)
        + ':' + ('0'+dt.getMinutes()).slice(-2)
        + ':' + ('0'+dt.getSeconds()).slice(-2);
      const m = t.replace('_time',hms)
        .replace('_from',this.posts[i].from)
        .replace('_to',this.posts[i].to)
        .replace('_message',this.posts[i].message)
        .replace(/\n/g,'<br>');
      console.log('m='+m);
      msg += m;
    }
    // 掲示板領域に書き込み
    const msgEl = this.dom.main.querySelector('div.broadArea');
    msgEl.innerHTML = msg;
    msgEl.scrollIntoView(false);
  }

  /** getMessages: メッセージの受信
   * @param {void} - なし
   * @returns {void} なし
   */
  getMessages = () => {
    console.log('getMessages start.');

    /* 配信局へ配信要求
    * @param {string}   arg.to       - 受信側のコード名(平文)
    * @param {string}   arg.func     - GAS側で処理分岐の際のキー文字列
    * @param {any}      arg.data     - 処理対象データ
    * @param {function} arg.callback - GAS処理結果を受けた後続処理 */
    fetchGAS({
      to: 'Agent',
      func: 'castMessages',
      data: this.lastUpdate,
      callback: (res) => {
        console.log('getMessages res='+JSON.stringify(res));
        if( !res.isErr ){
          this.posts = this.posts.concat(res.posts);
          const map = res.posts.map(x => new Date(x.timestamp).getTime());
          console.log('map='+JSON.stringify(map));
          const mapMax = map.reduce((a,b)=>{return Math.max(a,b)},-Infinity);
          console.log('mapMax='+mapMax);
          this.lastUpdate = new Date(mapMax);
          this.display();
        }
        console.log('getMessages lastUpdate='+getJPDateTime(this.lastUpdate)
          +'\nposts='+JSON.stringify(this.posts));
      }
    });
   
  }

  /** postMessage: メッセージを投稿
   * @param {void} - なし
   * @returns {void} なし
   */
  postMessage = () => {
    console.log('postMessage start.');
    config.handleName = this.dom.main.querySelector('[name="from"]').value;
    const toEl = this.dom.main.querySelector('[name="to"]');

    fetchGAS({
      to: 'Broad',
      func: 'postMessage',
      data: {
        timestamp: getJPDateTime(),
        from: config.handleName,
        to: toEl.options[toEl.selectedIndex].value,
        message: this.dom.main.querySelector('[name="message"]').value,
      },
      callback: (res) => {
        this.getMessages();  // 掲示板を更新
        console.log('postMessage end. res='+JSON.stringify(res));
      }
    });
  }
}