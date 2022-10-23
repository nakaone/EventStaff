const config = {}
const definition = {
  editGuestTemplate:  /* 一行分のデータに対する文書構造の定義
    tag string 1 タグ指定(必須)。"text"の場合は文字列と看做し、createTextNodeで追加する
    children [object] 0..1 子要素の定義。childrenとtextは排他
    text string 0..1 文字列の定義。変数に置換する部分には'\t'を挿入
    skip string 0..1 変数が空白の場合は出力抑止する場合、判断基準となる変数名を指定
    variable string 0..1 入力データの変数名。複数の変数は不可
    max number : 子要素が不定繰返ならその回数、不定繰返ではないなら0(固定、既定値)
      例：members配下に最大5人のメンバがいる場合 ⇒ max:5(添字は0..4となる)
    --- 上記以外は全て属性指定(properties)。以下は処理対象となる属性 -------
    class string 0..1 要素のクラス指定。三項演算子の場合、評価結果をクラスとする
      例： {.., class:"dObj['申込者']==='参加'?'representative':'representative glay'", ..}
    */
    {tag:"div", class:"table", children:[
      {tag:"div", class:"summary", children:[
        {tag:"div", class:"tr",children:[
          {tag:"div", class:"th vth", text:"受付番号"},
          {tag:"div", class:"td entryNo", variable:"受付番号"},
          {tag:"div", id:'img-qr'},
        ]},
        {tag:"div", class:"tr",children:[
          {tag:"div", class:"th vth", text:"申込者"},
          {tag:"div", class:"td name", children:[
            {tag:"ruby", children:[
              {tag:"rb", variable:"氏名"},
              {tag:"rt", variable:"読み"},
            ]},
          ]},
        ]},
        {tag:"div", class:"tr", children:[
          {tag:"div",class:"td", variable:"参加"},
          {tag:"select", class:"td status", name:"status00", opt:"未入場,入場済,退場済,不参加", variable:"状態"},
          {tag:"select", class:"td fee", name:"fee00", opt:"未収,既収,免除", variable:"参加費"},
        ]},
        {tag:"div", class:"tr", children:[
          {tag:"div", class:"th vth", text:"キャンセル"},
          {tag:"div", class:"td", children:[
            {tag:"input", type:"checkbox", name:"cancel", checked:"取消"},
          ]},
        ]},
        {tag:"div", class:"tr", children:[
          {tag:"div", class:"th vth", text:"受付日時"},
          {tag:"div", class:"td", variable:"登録日時"},
        ]},
        {tag:"div", class:"tr", children:[
          {tag:"div", class:"th vth", text:"e-mail"},
          {tag:"div", class:"td", variable:"メール"},
        ]},
        {tag:"div", class:"tr", children:[
          {tag:"div", class:"th vth", text:"緊急連絡先"},
          {tag:"div", class:"td", variable:"連絡先"},
        ]},
        {tag:"div", class:"tr", children:[
          {tag:"div", class:"th vth", text:"引取者"},
          {tag:"div", class:"td", variable:"引取者"},
        ]},
        {tag:"div", class:"tr", children:[
          {tag:"div", class:"th vth", text:"備考"},
          {tag:"div", class:"note", variable:"備考"},
        ]},
      ]},
      {tag:"div", class:"tr",children:[
        {tag:"div", class:"td memNo", text:"①"},
        {tag:"div", class:"td name", name:"name01", children:[
          {tag:"ruby", children:[
            {tag:"rb", variable:"①氏名"},
            {tag:"rt", variable:"①読み"},
          ]},
        ]},
        {tag:"div", class:"td affiliation", name:"affiliation01", text:"\t", variable:"①所属"},
      ]},
      {tag:"div", class:"tr",children:[
        {tag:"select", class:"td status", name:"status01", opt:"未入場,入場済,退場済,不参加", variable:"①状態"},
        {tag:"select", class:"td fee", name:"fee01", opt:"未収,既収,免除", variable:"①参加費"},
      ]},
      {tag:"div", class:"tr",children:[
        {tag:"div", class:"td memNo", text:"②"},
        {tag:"div", class:"td name", name:"name02", children:[
          {tag:"ruby", children:[
            {tag:"rb", variable:"②氏名"},
            {tag:"rt", variable:"②読み"},
          ]},
        ]},
        {tag:"div", class:"td affiliation", name:"affiliation02", text:"\t", variable:"②所属"},
      ]},
      {tag:"div", class:"tr",children:[
        {tag:"select", class:"td status", name:"status02", opt:"未入場,入場済,退場済,不参加,未登録", variable:"②状態"},
        {tag:"select", class:"td fee", name:"fee02", opt:"未収,既収,免除,無し", variable:"②参加費"},
      ]},
      {tag:"div", class:"tr",children:[
        {tag:"div", class:"td memNo", text:"③"},
        {tag:"div", class:"td name", name:"name03", children:[
          {tag:"ruby", children:[
            {tag:"rb", variable:"③氏名"},
            {tag:"rt", variable:"③読み"},
          ]},
        ]},
        {tag:"div", class:"td affiliation", name:"affiliation03", text:"\t", variable:"③所属"},
      ]},
      {tag:"div", class:"tr",children:[
        {tag:"select", class:"td status", name:"status03", opt:"未入場,入場済,退場済,不参加,未登録", variable:"③状態"},
        {tag:"select", class:"td fee", name:"fee03", opt:"未収,既収,免除,無し", variable:"③参加費"},
      ]},
    ]
  },
  dump: () => {
    const o = JSON.parse(JSON.stringify(config));
    // 内容が長すぎるメンバは割愛
    ['editGuestTemplate','show'].forEach(x => delete o[x]);
    return JSON.stringify(o);
  },
};