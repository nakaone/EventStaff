/** class Auth: クライアント側の認証 */
class Auth {
  /** constructor: 認証画面の生成
   * @param {object} dom - 生成先の要素
   * @param {object} dom.title - タイトル
   * @param {object} dom.main - 生成先の要素
   * @returns {void} 戻り値は無し
   */
  constructor(dom){
    this.dom = dom;
    this.dom.title.innerText = '参加者認証';
    initClass(this.dom.main,'auth');
    this.dom.main.innerHTML
      = '<div class="entryNo">'
      +   '<p>受付番号を入力してください</p>'
      +   '<div><input type="text" />'
      +   '<input type="button" value="送信" /></div>'
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

  /** getEntryNo: 受付番号を入力、認証局に問合せ
   * @param {void} - なし
   * @returns {void} - なし
   */
  getEntryNo = () => {
    console.log('getEntryNo start.');

    // 受付番号のボタンを不活性化
    this.dom.entryNo.querySelector('input[type="button"]').disabled = 'disabled';
    // メッセージ設定
    this.dom.entryNo.querySelector('.message').innerHTML = '<p>暫くお待ちください...</p>';

    const inputValue = this.dom.entryNo.querySelector('input[type="text"]').value;
    // 受付番号が適切かチェック、不適切なら処理中断
    if( !inputValue.match(/^[0-9]{1,4}$/) ){
      alert("不適切な受付番号です");
      // 入力欄をクリア
      this.dom.entryNo.querySelector('input[type="text"]').value = '';
      // 受付番号のボタンを活性化
      this.dom.entryNo.querySelector('input[type="button"]').disabled = null;
      return;
    }

    config.entryNo = Number(inputValue);
    config.entryStr = ('000'+config.entryNo).slice(-4);
    const res = fetchGAS({
      to       : 'Auth',
      func     : 'auth1A',
      data     : config.entryNo,
      callback : (response) => {
        console.log('getEntryNo response = '+JSON.stringify(response));
        if( response.isErr ){
          const d = this.dom.entryNo.querySelector('.message');
          d.innerHTML = '';
          for( let i=0 ; i<response.faild.length ; i++ ){
            d.innerHTML = d.innerHTML + '<p class="error">'
              + response.faild[i].recipient + ' : '
              + response.faild[i].message + '</p>';
          }
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

  /** getPassCode: パスコード入力
   * @param {void} - なし
   * @returns {void} なし
   */
  getPassCode = () => {
    console.log('getPassCode start');

    // パスコードのボタンを不活性化
    this.dom.passCode.querySelector('input[type="button"]').disabled = 'disabled';

    // パスコードの形式が適切かチェック、	不適切なら処理中断
    const inputValue = this.dom.passCode.querySelector('input[type="text"]').value;
    if( !inputValue.match(/^[0-9]{6}$/) ){
      alert("不適切なパスコードです");
      // 入力欄をクリア
      this.dom.passCode.querySelector('input[type="text"]').value = '';
      // パスコードのボタンを活性化
      this.dom.passCode.querySelector('input[type="button"]').disabled = null;
      return;
    }

    const rv = fetchGAS({
      to: 'Auth',
      func: 'auth2A',
      data: {entryNo:config.entryNo, passCode:inputValue},
      callback: (response) => {
        console.log('getPassCode response = '+JSON.stringify(response));
        if( response.isErr ){
          this.dom.passCode.querySelector('.message').innerHTML
            = '<p class="error">' + response.message + '</p>';
        } else {
          // configの内容を更新
          for( let x in response.config ){
            if( whichType(response.config[x]) === 'Object' ){
              if( config[x] === undefined ){
                config[x] = {};
              }
              for( let y in response.config[x] ){
                config[x][y] = response.config[x][y];
              }
            } else {
              config[x] = response.config[x];
            }
          }
          this.dom.main.innerHTML = ''; // 主表示域をクリア
          console.log('config='+JSON.stringify(config));
          // 初期設定を呼び出す
          initialize(response);
        }
      }
    });

    console.log('getPassCode end');
  }
}