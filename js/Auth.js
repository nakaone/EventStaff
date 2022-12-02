class Auth {
  constructor(dom){
    this.dom = dom;
    this.dom.title.innerText = '参加者認証';
    this.dom.main.innerHTML
      = '<div class="entryNo">'
      +   '<p>受付番号を入力してください</p>'
      +   '<input type="text" />'
      +   '<input type="button" value="送信" />'
      +   '<div class="message"></div>'
      + '</div>'
      + '<div class="passCode">'
      +   '<p>確認のメールを送信しました。記載されているパスコード(数字6桁)を入力してください。<br>'
      +   '※まれに迷惑メールと判定される場合があります。メールが来ない場合、そちらもご確認ください。</p>'
      +   '<input type="text" />'
      +   '<input type="button" value="送信" />'
      +   '<div class="message">※パスコードの有効期限は1時間です</div>'
      + '</div>';
    this.dom.entryNo = this.dom.main.querySelector('.entryNo');
    this.dom.entryNo.querySelector('input[type="button"]').onclick = this.getEntryNo;

    this.dom.passCode = this.dom.main.querySelector('.passCode');
    this.dom.passCode.style.display = 'none';
    this.dom.passCode.querySelector('input[type="button"]').onclick = this.getPassCode;
  }

  getEntryNo = () => {
    console.log('getEntryNo start.');

    // 受付番号のボタンを不活性化
    this.dom.entryNo.querySelector('input[type="button"]').disabled = 'disabled';
    // メッセージ設定
    this.dom.entryNo.querySelector('.message').innerHTML = '<p>暫くお待ちください...</p>';

    const inputValue = this.dom.entryNo.querySelector('input[type="text"]').value;
    if( !inputValue.match(/^[0-9]{1,4}$/) ){
      alert("不適切な受付番号です");
      // 入力欄をクリア
      this.dom.entryNo.querySelector('input[type="text"]').value = '';
      // 受付番号のボタンを活性化
      this.dom.entryNo.querySelector('input[type="button"]').disabled = null;
      return;
    }
    config.entryNo = Number(inputValue);
    config.entryStr = ('000'+this.entryNo).slice(-4);
    const res = fetchGAS({
      to       : 'Auth',
      func     : 'auth1A',
      data     : config.entryNo,
      callback : (response) => {
        console.log('getEntryNo response = '+JSON.stringify(response));
        if( response.isErr ){
          this.dom.entryNo.querySelector('.message').innerHTML
            = '<p class="error">' + response.message + '</p>';
        } else {
          // 受付番号入力欄を隠蔽
          this.dom.entryNo.style.display = 'none';
          // パスコード入力画面を開く
          this.dom.passCode.style.display = 'block';
        }
      },
    });
    console.log('getEntryNo end. res='+JSON.stringify(res));
  }

  getPassCode(){
    console.log('getPassCode start');
    console.log('getPassCode end');
  }
}