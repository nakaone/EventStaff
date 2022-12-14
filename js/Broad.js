/** Broadcast: お知らせへの投稿、配信 */
class Broadcast {
  
  /** constructor: お知らせ画面の設定 */
  constructor(dom){
    this.dom = dom;
    this.posts = [];
    this.lastUpdate = getJPDateTime('1901/01/01');
    this.startTime = new Date();
    this.intervalId = null;
    this.start();
  }

  display(){
    this.dom.title.innerText = 'お知らせ';
    // 1.投稿権限がある場合は投稿エリアを表示
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

    // 2.投稿内容の表示
    this.dom.main.innerHTML = this.dom.main.innerHTML + '<div class="broadArea"></div>';
    this.dom.broadArea =this.dom.main.querySelector('.broadArea');

    // 2.1.新規のお知らせが来たら末尾を表示するよう設定
    // https://at.sachi-web.com/blog-entry-1516.html
    const mo = new MutationObserver(() => {
      console.log('mutation detected');
      this.dom.broadArea.scrollTop = this.dom.broadArea.scrollHeight;
    });
    mo.observe(this.dom.broadArea,{
      childList: true,
      attributes: true,
      characterData: true,
      subtree: true,//孫以降のノードの変化も検出
      attributeOldValue: true,//変化前の属性データを記録する
      characterDataOldValue: true,//変化前のテキストノードを記録する
      attributeFilter: [],//配列で記述した属性だけを見張る
    });

    // 2.2.時系列にメッセージを並べ替え
    this.posts.sort((a,b) => a.timestamp < b.timestamp);

    // 2.3.掲示板領域に書き込むHTMLを msg として作成
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
      //console.log('m='+m);
      msg += m;
    }
    // 2.4.掲示板領域に書き込み
    const msgEl = this.dom.main.querySelector('div.broadArea');
    msgEl.innerHTML = msg;
    msgEl.scrollIntoView(false);
  }

  /** getMessages: メッセージの受信、掲示板への表示
   * @param {void} - なし
   * @returns {void} なし
   */
  getMessages(){
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
          //console.log('map='+JSON.stringify(map));
          const mapMax = map.reduce((a,b)=>{return Math.max(a,b)},-Infinity);
          //console.log('mapMax='+mapMax);
          this.lastUpdate = new Date(mapMax);
          this.display();
        }
        //console.log('getMessages lastUpdate='+getJPDateTime(this.lastUpdate)
        //  +'\nposts='+JSON.stringify(this.posts));
      }
    });
   
  }

  /** postMessage: メッセージを投稿
   * @param {void} - なし
   * @returns {void} なし
   */
  postMessage(){
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

  /** start: 定期的処理の開始
   * @param {void} - なし
   * @returns {void} なし
   */
  start(){
    this.getMessages();
    // スリープ時間も含め一定時間毎に実行
    // https://blog-and-destroy.com/28211
    this.intervalId = setInterval(() => {
      if( Date.now() > (this.startTime + config.public.interval - 500) ){
        this.getMessages();
        this.startTime = Date.now();
      }
    },config.public.interval);
    console.log('Broad.start'
      + '\nurl=' + this.url
      + '\nkey=' + this.key
      + '\ninterval=' + config.public.interval
    );
  }

  /** stop: 定期的処理の停止
   * @param {void} - なし
   * @returns {void} なし
   */
  stop(){
    clearInterval(this.intervalId);
    console.log('Broad.end');
  }
}