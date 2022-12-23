/** PeriodicProcess: 定期的処理 */
class PeriodicProcess {
  
  constructor(url=config.BroadURL,key=config.BroadKey,interval=config.BroadInterval){
    this.url = url;
    this.key = key;
    this.interval = interval;
    this.startTime = 978274800000;  // 2001/01/01 00:00:00
    console.log('Broad.constructor end.'
      + '\nurl=' + this.url
      + '\nkey=' + this.key
      + '\ninterval=' + this.interval
    );

    // お知らせ画面「投稿する」ボタンの動作を定義
    const postButton = document.querySelector('#home .PostArea input');
    postButton.addEventListener('click',() => {
      const post = document.querySelector('#home .postMessage');
      if( postButton.value === '投稿する' ){
        postButton.value = '閉じる';
        post.style.display = 'block';
      } else {
        postButton.value = '投稿する';
        post.style.display = 'none';
      }
    });

    // 新規のお知らせが来たら末尾を表示するよう設定
    // https://at.sachi-web.com/blog-entry-1516.html
    const msgArea = document.getElementById('BroadArea');
    const mo = new MutationObserver(() => {
      console.log('mutation detected');
      msgArea.scrollTop = msgArea.scrollHeight;
    });
    mo.observe(msgArea,{
      childList: true,
      attributes: true,
      characterData: true,
      subtree: true,//孫以降のノードの変化も検出
      attributeOldValue: true,//変化前の属性データを記録する
      characterDataOldValue: true,//変化前のテキストノードを記録する
      attributeFilter: [],//配列で記述した属性だけを見張る
    });

    // 掲示板定期更新開始
    config.Broad = new Broad(config.BroadURL,config.BroadKey,config.BroadInterval);
    config.Broad.start();
  }

  start(){
    this.onGoing = true;
    // スリープ時間も含め一定時間毎に実行
    // https://blog-and-destroy.com/28211
    this.IntervalId = setInterval(() => {
      if( Date.now() > (this.startTime + this.interval - 500) ){
        this.periodical();
        this.startTime = Date.now();
      }
    },this.interval);
    this.periodical();
    console.log('Broad.start'
      + '\nurl=' + this.url
      + '\nkey=' + this.key
      + '\ninterval=' + this.interval
    );
  }

  stop(){
    this.onGoing = false;
    clearInterval(this.IntervalId);
    this.IntervalId = null;
    console.log('Broad.end');
  }

  periodical(){
    console.log('Broad.periodical'
      + '\nurl=' + this.url
      + '\nkey=' + this.key
      + '\ninterval=' + this.interval
    );
    doGet(this.url,this.key,{func:'getMessages',data:{}},(response) => {
      console.log('getMessages response='+JSON.stringify(response));
      // 時系列にメッセージを並べ替え
      response.sort((a,b) => a.timestamp < b.timestamp);
      console.log(response);
      // 掲示板領域に書き込むHTMLを msg として作成
      let msg = '';
      let lastMesDate = '1900/01/01';
      const t = '<p class="title">[_time] From:_from　To:_to</p><p>_message</p>';
      for( let i=0 ; i<response.length ; i++ ){
        const dt = new Date(response[i].timestamp);
        if( dt.toLocaleDateString('ja-JP') !== lastMesDate ){
          lastMesDate = dt.toLocaleDateString('ja-JP');
          msg += '<p class="date">' + lastMesDate + '</p>';
        }
        const hms = ('0'+dt.getHours()).slice(-2)
          + ':' + ('0'+dt.getMinutes()).slice(-2)
          + ':' + ('0'+dt.getSeconds()).slice(-2);
        const m = t.replace('_time',hms)
          .replace('_from',response[i].from)
          .replace('_to',response[i].to)
          .replace('_message',response[i].message)
          .replace(/\n/g,'<br>');
        console.log('m='+m);
        msg += m;
      }
      // 掲示板領域に書き込み
      const msgEl = document.getElementById('BroadArea');
      msgEl.innerHTML = msg;
      msgEl.scrollIntoView(false);
      console.log('getMessages periodical end: '+msg);
    })
  }

  /** postMessage: メッセージを投稿
   * 
   */
  postMessage(){
    console.log('postMessage start.');
  
    // 投稿領域を閉める
    document.querySelector('#home .PostArea input').value = '投稿する';
    document.querySelector('#home .postMessage').style.display = 'none';
  
    const msg = {
      timestamp: (()=>{
        const tObj = new Date();
        return tObj.toLocaleString('ja-JP') + '.' + tObj.getMilliseconds();
      })(),
      from: document.querySelector('#home .postMessage [name="from"]').value,
      to: '',
      message: document.querySelector('#home .postMessage [name="message"]').value,
    }
    const toEl = document.querySelector('#home .postMessage [name="to"]');
    const toNum = toEl.selectedIndex;
    msg.to = toEl.options[toNum].value;
  
    doGet(config.BroadURL,config.BroadKey,{func:'postMessage',data:msg},(response) => {
      console.log(response);
      config.Broad.periodical(); // 掲示板を更新
    });
    console.log('postMessage end.',JSON.stringify(msg));
  }
}