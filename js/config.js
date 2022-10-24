const config = {
  DateOfExpiry: null, // config情報の有効期限
  scanCode: false,    // スキャン実行フラグ。true時のみスキャン可
  GASwebAPId: null,   // GAS Web API の ID。"https://script.google.com/macros/s/〜/exec"
  passPhrase: null,   // GASとの共通鍵
}

const definition = {
  editGuestTemplate: {tag:"div", class:"table", children:[
    {tag:"div", class:"tr entry", children:[
      {tag:"div", class:"td entryNo", variable:"受付番号"},
      {tag:"div", class:"td name", children:[
        {tag:"ruby", children:[
          {tag:"rb", variable:"氏名"},
          {tag:"rt", variable:"読み"},
          {tag:"input", type:"button", value:"詳細"},
        ]},
      ]},
    ]},
    {tag:"div", class:"tr detail", children:[
      {tag:"div", class:"tr", children:[
        {tag:"input", type:"button", value:"閉じる"},
        {tag:"p", text:"受付日時：\t", variable:"登録日時"},
        {tag:"p", text:"e-mail：\t", variable:"メール"},
        {tag:"p", text:"緊急連絡先：\t", variable:"連絡先"},
        {tag:"p", text:"引取者：\t", variable:"引取者"},
        {tag:"p", text:"備考：\t", variable:"備考"},
        {tag:"p", text:"キャンセル：\t", variable:"取消"},
        {tag:"p", text:"申込フォーム", children:[
          {tag:"div", class:"qrcode"},
        ]},
        {tag:"input", type:"button", value:"閉じる"},
      ]},
    ]},
    {tag:"div", class:"tr participant", children:[
      {tag:"div", variable:"①氏名"},
      {tag:"label", text:'①状態'},
      {tag:"select", class:"td status", name:"status01",
        opt:"未入場,入場済,退場済,不参加,未登録", variable:"①状態"},
      {tag:"label", text:'①参加費'},
      {tag:"select", class:"td fee", name:"fee01",
        opt:"未収,既収,免除,無し", variable:"①参加費"},
    ]},
    {tag:"div", class:"tr participant", children:[
      {tag:"div", variable:"②氏名"},
      {tag:"label", text:'②状態'},
      {tag:"select", class:"td status", name:"status02",
        opt:"未入場,入場済,退場済,不参加,未登録", variable:"②状態"},
      {tag:"label", text:'②参加費'},
      {tag:"select", class:"td fee", name:"fee02",
        opt:"未収,既収,免除,無し", variable:"②参加費"},
    ]},
    {tag:"div", class:"tr participant", children:[
      {tag:"div", variable:"③氏名"},
      {tag:"label", text:'③状態'},
      {tag:"select", class:"td status", name:"status03",
        opt:"未入場,入場済,退場済,不参加,未登録", variable:"③状態"},
      {tag:"label", text:'③参加費'},
      {tag:"select", class:"td fee", name:"fee03",
        opt:"未収,既収,免除,無し", variable:"③参加費"},
    ]},
  ]},
  opt: {  // ドロップダウンの選択肢のリスト
    status: // 状態
      ['未入場','入場済','退場済','不参加','未登録'],
    fee:  // 参加費
      ['未収','既収','免除','無し'],
  },
}

//const definition = {a:'hoge'};