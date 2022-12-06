/** Broadcast: お知らせへの投稿、配信 */
class Broadcast {
  
  /** constructor: お知らせ画面の設定 */
  constructor(dom){
    this.dom = dom;
    this.messages = '';
    this.display();
  }

  display = () => {
    this.dom.title.innerText = 'お知らせ';
    // 投稿権限がある場合は投稿エリアを表示
    if( (config.menuFlags & 2) > 0 ){
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
      })
    }
    this.dom.main.innerHTML = this.dom.main.innerHTML + '<div class="BroadArea"></div>';
  }

  /** getMessages: メッセージの受信
   * 
   */
  getMessages = () => {

  }

  /** postMessage: メッセージを投稿
   * 
   */
  postMessage = () => {
    console.log('postMessage start.');
    config.handleName = this.dom.main.querySelector('[name="from"]').value;
    const toEl = this.dom.main.querySelector('[name="to"]');

    fetchGAS({
      to: 'Braod',
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