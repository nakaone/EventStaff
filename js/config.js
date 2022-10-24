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
        ]},
      ]},
      {tag:"div", children:[
        {tag:"input", type:"button", value:"詳細"},
      ]},
    ]},
    {tag:"div", class:"tr detail", children:[ // 詳細情報
      {tag:"div", text:"受付日時：\t", variable:"登録日時"},
      {tag:"div", text:"e-mail：\t", variable:"メール"},
      {tag:"div", text:"緊急連絡先：\t", variable:"連絡先"},
      {tag:"div", text:"引取者：\t", variable:"引取者"},
      {tag:"div", text:"備考：\t", variable:"備考"},
      {tag:"div", text:"キャンセル：\t", variable:"取消"},
      {tag:"div", class:"form", children:[
        {tag:"div", text:"申込フォーム："},
        {tag:"div", class:"qrcode"},
        {tag:"input", type:"button", value:"遷移"},
      ]},
    ]},
    {tag:"div", class:"tr participant", children:[ // 申請者の状態・参加費
      {tag:"div"},
      {tag:"div"},
      {tag:"div", children:[
        {tag:"select", class:"status", name:"status00",
          opt:"未入場,入場済,退場済,不参加,未登録", variable:"状態"},
      ]},
      {tag:"div", children:[
        {tag:"select", class:"fee", name:"fee00",
          opt:"未収,既収,免除,無し", variable:"参加費"},
      ]},
    ]},
    {tag:'hr'}, // 以下参加者
    {tag:"div", class:"tr participant", children:[
      {tag:"div", text:"①"},
      {tag:"div", variable:"①氏名"},
      {tag:"div", children:[
        {tag:"select", class:"status", name:"status01",
          opt:"未入場,入場済,退場済,不参加,未登録", variable:"①状態"},
      ]},
      {tag:"div", children:[
        {tag:"select", class:"fee", name:"fee01",
          opt:"未収,既収,免除,無し", variable:"①参加費"},
      ]},
    ]},
    {tag:"div", class:"tr participant", children:[
      {tag:"div", text:"②"},
      {tag:"div", variable:"②氏名"},
      {tag:"div", children:[
        {tag:"select", class:"status", name:"status02",
          opt:"未入場,入場済,退場済,不参加,未登録", variable:"②状態"},
      ]},
      {tag:"div", children:[
        {tag:"select", class:"fee", name:"fee02",
          opt:"未収,既収,免除,無し", variable:"②参加費"},
      ]},
    ]},
    {tag:"div", class:"tr participant", children:[
      {tag:"div", text:"③"},
      {tag:"div", variable:"③氏名"},
      {tag:"div", children:[
        {tag:"select", class:"status", name:"status03",
          opt:"未入場,入場済,退場済,不参加,未登録", variable:"③状態"},
      ]},
      {tag:"div", children:[
        {tag:"select", class:"fee", name:"fee03",
          opt:"未収,既収,免除,無し", variable:"③参加費"},
      ]},
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