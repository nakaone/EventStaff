class Menu {
  constructor(arg){
    this.dom = {};
    arg.title.innerText = 'メニュー初期化';
    this.dom.icon = arg.menuIcon;
    this.dom.nav = arg.nav;
    this.status = true; // メニューが開いている状態ならtrue
    this.closeMenu();

    this.menuObj = [
      {title:'お知らせ', func:'messageBoard', flag:3},
      {title:'受付業務', func:'reception', flag:28},
      {title:'コーナー運営', func:'cornerOperation', flag:32},
      {title:'参加受付', func:'entry', flag:192},
      {title:'予約状況参照', func:'referState', flag:768},
      {title:'お役立ち情報', func:'information', flag:7168},
      {title:'参加者アンケート', func:'enquete', flag:8192},
      {title:'システム設定', func:'system', flag:49152}
    ];
    this.dom.ol = document.createElement('ol');
    this.menuObj.forEach(x => {
      if( (x.flag & config.menuFlags) > 0 ){
        const li = document.createElement('li');
        li.appendChild(document.createTextNode(x.title));
        li.addEventListener('click',() => this.dispatch(x.title));
        this.dom.ol.appendChild(li);
      }
    });
    this.dom.nav.appendChild(this.dom.ol);
  }

  /** closeMenu: 開いているメニューを閉じる */
  closeMenu = () => {
    console.log('Menu.closeMenu start');
    if( this.status === false ){  // 既に閉じているなら何もしない
      return;
    }
    this.dom.icon.innerHTML = '<img src="img/menu1.svg" />';
    this.dom.icon.querySelector('img').onclick = this.openMenu;
    this.dom.nav.style.display = 'none';
    this.status = false;
    console.log('Menu.closeMenu end');
  }

  /** openMenu: 閉じているメニューを開く */
  openMenu = () => {
    console.log('Menu.openMenu start');
    if( this.status === true ){   // 既に開いているなら何もしない
      return;
    }
    this.dom.icon.innerHTML = '<img src="img/menu2.svg" />';
    this.dom.icon.querySelector('img').onclick = this.closeMenu;
    this.dom.nav.style.display = 'block';
    this.status = true;
    console.log('Menu.openMenu end');
  }

  dispatch = (arg) => {
    console.log('dispatch start. arg='+arg);
    this.closeMenu();
    switch(arg){

    }
  }
}