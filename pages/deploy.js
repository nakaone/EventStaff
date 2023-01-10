const specification = {  // 仕様
/** deploy.js: ページ毎に分割されたページのソースを統合する
 * <br>
 * SPA開発において、ページごとに分割されたCSS/Script/HTMLを統合して index.html を作成する。<br>
 *
 * <h2>処理概要</h2>
 *
 * 01. 各ページファイルの以下の項目を抽出し、dObjに格納
 * <ol>
 * <li>link: 外部スタイルシート定義(<link rel="stylesheet" />)
 * <li>include: 外部スクリプト定義(<script src="〜" />)
 * <li>css: 内部スタイル定義(<style> 〜 </style>)
 * <li>script: 内部スクリプト定義(<script> 〜 </script>)
 * <li>html: 内部HTML(<body> 〜 </body>)
 * </ol>
 *
 * 02. index.htmlのテンプレートとなるhtmlファイルのプレースホルダ行を、dObjの内容で置換
 *
 * <h2>useage</h2>
 * <code>node [-h:xxxx.html] [-c:yyyy.css] [-j:zzzz.js] aaaa.html [bbbb.html ...]</code>
 *
 * <h2>options</h2>
 * <ul>
 * <li>h: index.htmlのテンプレートとなるhtmlファイル。既定値`prototype.html`
 * <li>c: 各ページのCSSを集めたファイル。既定値`css/style.css`
 * <li>j: 各ページのスクリプトを集めたファイル。既定値`lib/script.js`
 * <li>その他のパラメータ: ページごとのhtml
 * </ul>
 *
 * <h2>注意事項</h2>
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

// ===== index.html sample ========================
// <!DOCTYPE html><html lang="ja">
// <head>
//   <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
//   <meta http-equiv="Content-Style-Type" content="text/css">
//   <meta http-equiv="Content-Script-Type" content="text/javascript">
//   <title></title>
//   <!-- ::deploy.link:: -->
//   <style type="text/css">
//     /* ::deploy.css:: */
//   </style>
//   </head>
//   <body>
//     <!-- ::deploy.html:: -->
//   </body>
//   <!-- ::deploy.include:: -->
//   <script type="text/javascript">
//   // ::deploy.script::
//   </script>
// </html>

// ===== page.html sample ========================
// <!DOCTYPE html><html lang="ja">
// <head>
// <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
// <meta http-equiv="Content-Style-Type" content="text/css">
// <meta http-equiv="Content-Script-Type" content="text/javascript">
// <title>proto</title>
// <style type="text/css">
// </style>
// </head>
// <body class="proto">
// </body>
// <script type="text/javascript">
// </script>
// </html>

// ===== deploy.sh sample =========================
// echo '\n\n\n\n\n==============================================================='
// echo `TZ='Asia/Tokyo' date`
// echo '\n'
//
// node deploy.js -h:proto.html a.html b.js c.css > test.html
// #node deploy.js -h:proto.html -c:../css/style.css -j:../lib/script.js information.html
}

/** rex:  ページごとの定義において、その開始/終了を定義した正規表現 */
const rex = {
  link: /^[ \t]*<link .*href=["'](.+)["']/,
  include : /^[ \t]*<script .*src=["'](.+)["']/,
  css: [/^[ \t]*<style type=["'](.+)["']/,/^ *<\/style>/],
  script: [/^[ \t]*<script type=["'](.+)["']/,/^ *<\/script>/],
  html: [/^[ \t]*<body/,/^ *<\/body>/],
}

/* dObj: 要素別に統合したオブジェクト
 * <ul>
 * <li> link {string[]} - 外部スタイルシートへの参照
 * <li> include {string[]} - 外部スクリプトへの参照
 * <li> css {string[]} - index.htmlに追加するスタイルシート定義
 * <li> script {string[]} - index.htmlに追加するスクリプト
 * <li> body {string[]} - index.htmlに追加するhtml
 * </ul> */
const dObj = (()=>{
  const rv = {list:{link:[],include:[]}};
  Object.keys(rex).forEach(x => {rv[x]=[]});
  return rv;
})();

/** conf: htmlのページセクション定義。'_'の部分にbasenameが入る */
const conf = {
  css: {
    header: '\n/* :: page "\t" CSS section start. :::::::::::::::::::::::::::::::::::::: */',
    footer: '/* :: page "\t" CSS section end. :::::::::::::::::::::::::::::::::::::::: */\n',
  },
  script: {
    header: '\n// :: page "\t" Script section start. ::::::::::::::::::::::::::::::::::::::',
    footer: '// :: page "\t" Script section end. ::::::::::::::::::::::::::::::::::::::::\n',
  },
  html: {
    header: '\n<div class="screen \t"><!-- :: page "\t" HTML section start. ::::::::::: -->',
    footer: '</div><!-- page "\t" HTML section end. ::::::::::::::::::::::::::::::::: -->\n',
  },
};

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

/** analyzePath: パス名文字列から構成要素を抽出
 * @param {string} arg - パス文字列
 * @returns {object} 以下のメンバを持つオブジェクト
 * <ul>
 * <li> full {string} - 引数の文字列(フルパス)
 * <li> path {string} - ファイル名を除いたパス文字列
 * <li> file {string} - ファイル名
 * <li> base {string} - 拡張子を除いたベースファイル名
 * <li> suffix {string} - 拡張子
 * </ul>
 */
const analyzePath = (arg) => {
  const rv = {full:arg};
  const m1 = arg.match(/^(.*)\/([^\/]+)$/);
  if( m1 ){
    rv.path = m1[1] + '/';
    rv.file = m1[2];
  } else {
    rv.path = '';
    rv.file = arg;
  }
  const m2 = rv.file.match(/^(.+)\.([^\.]+?)$/);
  if( m2 ){
    rv.base = m2[1];
    rv.suffix = m2[2];
  } else {
    rv.base = rv.file;
    rv.suffix = '';
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
  const fn = analyzePath(filename);
  const on = { // 現在処理中の行が該当する属性
    css   : fn.suffix.toLowerCase() === 'css', // 拡張子がcssなら最初からtrue
    script: fn.suffix.toLowerCase() === 'js',  // 拡張子がjsなら最初からtrue
    html  : false
  };

  ['css','script'].forEach(x => {
    if(on[x]){
      dObj[x].push(conf[x].header.replaceAll('\t',fn.base));
    }
  });

  for( let i=0 ; i<lines.length ; i++ ){
    ['link','include'].forEach(x => {
      const m = lines[i].match(rex[x]);
      if( m ){
        // 既出の場合は登録しない
        if( dObj.list[x].findIndex(y => y === m[1]) < 0 ){
          dObj[x].push(lines[i]);
          dObj.list[x].push(m[1]);
        }
      }
    });
    ['css','script','html'].forEach(x => {
      if( on[x] ){
        if( lines[i].match(rex[x][1]) ){
          on[x] = false;
          dObj[x].push(conf[x].footer.replaceAll('\t',fn.base));
        } else {
          dObj[x].push(lines[i]);
        }
      } else {
        if( lines[i].match(rex[x][0]) ){
          on[x] = true;
          dObj[x].push(conf[x].header.replaceAll('\t',fn.base));
        }
      }
    });
  }
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
 * @param {string} filename - index.html
 * @returns {void} なし
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