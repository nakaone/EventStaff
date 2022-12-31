/** deploy.js: ページ毎に分割されたソースを統合
 * <caution>注意事項</caution>
 * <ol>
 * <li>CSSセレクタに使用するので、必ずbodyタグにベースファイル名をクラスとして指定
 * </ol>
 * 
 * <h2>残課題</h2>
 * <ul>
 * <li>Markdownに記述した内容をソースに入れ込む
 * <li>"link rel", 'script src'で同じ外部ファイルを参照していたら重複削除
 * <li>起動パラメータ"-c, -j"が未指定ならhtmlに入れ込む
 * </ul>
 */

/** analyzeArg: コマンドライン引数を分析
 * @param {void} - なし(process.argv)
 * @returns {object} 以下のメンバを持つオブジェクト
 * <ul>
 * <li> opt {object} - スイッチを持つ引数について、スイッチ：値形式にしたオブジェクト
 * <li> val {string[]} - スイッチを持たない引数の配列
 * </ul>
 */
const analyzeArg = () => {
  const rv = {opt:{},val:[]};
  for( let i=2 ; i<process.argv.length ; i++ ){
    const m = process.argv[i].match(/^(\-*)([0-9a-zA-Z]+):*(.*)$/);
    if( m && m[1].length > 0 ){
      rv.opt[m[2]] = m[3];
    } else {
      rv.val.push(process.argv[i]);
    }
  }
  return rv;
}

/** extract: 個別ページ定義ファイルからCSS/SCRIPT/HTMLを抽出し、dObjに格納
 * <br>
 * @param {string[]} lines - 読み込んだファイルの内容
 * @returns {void} なし
 */
const extract = (filename) => {
  const lines = readfile(filename);
  const m = filename.match(/^(.+)\.([a-zA-Z0-9]+)$/);
  const on = { // 現在処理中の行が該当する属性
    css   : m && m[2].toLowerCase() === 'css', // 拡張子がcssなら最初からtrue
    script: m && m[2].toLowerCase() === 'js',  // 拡張子がjsなら最初からtrue
    html  : false
  };
  const basename = m ? m[1] : null;
  //console.log('base='+basename);

  ['css','script'].forEach(x => {
    if(on[x]){
      dObj[x].push(conf[x].header.replace('\t',basename));
    }
  });

  for( let i=0 ; i<lines.length ; i++ ){
    const is = {
      link : lines[i].match(/^ *<link rel="stylesheet"/),
      include : lines[i].match(/^ *<script src="/),
      cssStart: lines[i].match(/^ *<style type="/),
      cssEnd: lines[i].match(/^ *<\/style>/),
      scriptStart: lines[i].match(/^ *<script type="/),
      scriptEnd: lines[i].match(/^ *<\/script>/),
      htmlStart: lines[i].match(/^ *<body/),
      htmlEnd: lines[i].match(/^ *<\/body>/),
    }
    //console.log(i+': '+lines[i]+'\n             -> is='+JSON.stringify(is));
    if( is.link ){
      dObj.link.push(lines[i]);
    }
    if( is.include ){
      dObj.include.push(lines[i]);
    }
    ['css','script','html'].forEach(x => {
      if( on[x] ){
        if( is[x+'End'] ){
          on[x] = false;
          dObj[x].push(conf[x].footer.replace('\t',basename));
        } else {
          dObj[x].push(lines[i]);
        }
      } else {
        if( is[x+'Start'] ){
          on[x] = true;
          dObj[x].push(conf[x].header.replace('\t',basename));
        }
      }
    });
  }

  ['css','script'].forEach(x => {
    if(on[x]){
      dObj[x].push(conf[x].footer.replace('\t',basename));
    }
  });

}

/** readfile: 指定テキストファイルを読み込み、行毎に分割
 * @param {string} arg - ファイル名
 * @returns {string[]} 行毎に分割された文字列の配列
 */
const readfile = (arg) => {
  const fs = require('fs');
  const content = fs.readFileSync(arg,'utf-8');
  return content.split('\n');
}

/** integrate: ファイルを統合
 * 
 */
const integrate = (filename) => {
  const rv = [];
  const lines = readfile(filename);
  const list = ['link','include','css','script','html'];
  for( let i=0 ; i<lines.length ; i++ ){
    let flag = true;
    list.forEach(x => {
      if( lines[i].match(new RegExp('::deploy.'+x+'::')) ){
        rv.push(...dObj[x]);
        flag = false;
      }
    });
    if( flag ){
      rv.push(lines[i]);
    }
  }
  return rv.join('\n');
}

/** whichType: 変数の型を判定
 * @param {any} arg - 判定対象の変数
 * @returns {string} - 型の名前
 */
const whichType = (arg = undefined) => {
  return arg === undefined ? 'undefined'
   : Object.prototype.toString.call(arg).match(/^\[object\s(.*)\]$/)[1];
}

/* dObj: 要素別に統合したオブジェクト
 * <ul>
 * <li> link {string[]} - 外部スタイルシートへの参照
 * <li> include {string[]} - 外部スクリプトへの参照
 * <li> css {string[]} - index.htmlに追加するスタイルシート定義
 * <li> script {string[]} - index.htmlに追加するスクリプト
 * <li> body {string[]} - index.htmlに追加するhtml
 * </ul> */
const dObj = {link:[],include:[],css:[],script:[],html:[]};

const conf = {  // htmlのページセクション定義。'_'の部分にbasenameが入る
  css: {
    header: '\n/* :: page "\t" CSS section start. :::::::::::::::::::::::::::::::::::::: */\n',
    footer: '\n/* :: page "\t" CSS section end. :::::::::::::::::::::::::::::::::::::::: */\n',
  },
  script: {
    header: '\n// :: page "\t" Script section start. ::::::::::::::::::::::::::::::::::::::\n',
    footer: '\n// :: page "\t" Script section end. ::::::::::::::::::::::::::::::::::::::::\n',
  },
  html: {
    header: '\n<div class="screen \t"><!-- :: page "\t" HTML section start. ::::::::::: -->\n',
    footer: '\n<!-- page "\t" HTML section end. ::::::::::::::::::::::::::::::::: --></div>\n',
  },
};

/** main: 主処理 */
(()=>{
  const arg = analyzeArg();  // コマンドライン引数をargに格納
  //console.log('arg=',arg);

  for( let i=0 ; i<arg.val.length ; i++ ){
    extract(arg.val[i]);
  }
  //console.log('dObj=',dObj);

  const rv = integrate(arg.opt.h);
  console.log(rv);
})();