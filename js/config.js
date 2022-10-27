const config = {
  DateOfExpiry: null, // config情報の有効期限
  scanCode: false,    // スキャン実行フラグ。true時のみスキャン可
  MasterAPI: null,    // 「回答」のGAS Web API の ID。"https://script.google.com/macros/s/〜/exec"
  passPhrase: null,   // GASとの共通鍵
  handleName: '(未定義)',   // お知らせに表示する自分の名前
  BoardAPI: null,     // 「掲示板」のGAS Web API のID
  getMessages: false, // 掲示板データ取得フラグ。true時のみ実行可。
  BoardInterval: 10000, // 掲示板巡回のインターバル。m秒
  BoardIntervalId: null,  // setIntervalのID
}

const localDef = {
  schedule: // 進行予定表の元になるスプレッド
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vT4Y1RoJgfYOLuv4hfNJrf6aYdOaBy7eoSZKwwEibePe04XiLn91rLFGq6LO9_-R-vnPVCTM21RMitE/pubhtml?gid=0&single=true",
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
        {tag:"input", type:"button", value:"申込フォームの表示"},
      ]},
    ]},
    {tag:"div", class:"tr participant", children:[ // 申請者の状態・参加費
      {tag:"div"},
      {tag:"div"},
      {tag:"div", children:[
        {tag:"label", text:"入退場"},
        {tag:"select", class:"status", name:"status00",
          opt:"未入場,入場済,退場済,不参加,未登録", variable:"状態"},
      ]},
      {tag:"div", children:[
        {tag:"label", text:"参加費"},
        {tag:"select", class:"fee", name:"fee00",
          opt:"未収,既収,免除,無し", variable:"参加費"},
      ]},
    ]},
    {tag:'hr'}, // 以下参加者
    {tag:"div", class:"tr participant", children:[
      {tag:"div", text:"①"},
      {tag:"div", variable:"①氏名"},
      {tag:"div", children:[
        {tag:"label", text:"入退場"},
        {tag:"select", class:"status", name:"status01",
          opt:"未入場,入場済,退場済,不参加,未登録", variable:"①状態"},
      ]},
      {tag:"div", children:[
        {tag:"label", text:"参加費"},
        {tag:"select", class:"fee", name:"fee01",
          opt:"未収,既収,免除,無し", variable:"①参加費"},
      ]},
    ]},
    {tag:"div", class:"tr participant", children:[
      {tag:"div", text:"②"},
      {tag:"div", variable:"②氏名"},
      {tag:"div", children:[
        {tag:"label", text:"入退場"},
        {tag:"select", class:"status", name:"status02",
          opt:"未入場,入場済,退場済,不参加,未登録", variable:"②状態"},
      ]},
      {tag:"div", children:[
        {tag:"label", text:"参加費"},
        {tag:"select", class:"fee", name:"fee02",
          opt:"未収,既収,免除,無し", variable:"②参加費"},
      ]},
    ]},
    {tag:"div", class:"tr participant", children:[
      {tag:"div", text:"③"},
      {tag:"div", variable:"③氏名"},
      {tag:"div", children:[
        {tag:"label", text:"入退場"},
        {tag:"select", class:"status", name:"status03",
          opt:"未入場,入場済,退場済,不参加,未登録", variable:"③状態"},
      ]},
      {tag:"div", children:[
        {tag:"label", text:"参加費"},
        {tag:"select", class:"fee", name:"fee03",
          opt:"未収,既収,免除,無し", variable:"③参加費"},
      ]},
    ]},
  ]},
  map: {  // シート上の項目名 <-> HTML上のname 対応表
    sheet: {
      "受付番号 ":"entryNo",
      "氏名 ":"name",
      "読み ":"yomi",
      "登録日時 ":"timestamp",
      "メール ":"email",
      "連絡先 ":"tel",
      "引取者 ":"pickup",
      "備考 ":"note",
      "取消 ":"cancel",
      "状態 ":"status00",
      "参加費 ":"fee00",
      "①氏名":"name01",
      "①状態":"status01",
      "①参加費":"fee01",
      "②氏名":"name02",
      "②状態":"status02",
      "②参加費":"fee02",
      "③氏名":"name03",
      "③状態":"status03",
      "③参加費":"fee03",
    },
    name: {
      "entryNo":"受付番号 ",
      "name":"氏名 ",
      "yomi":"読み ",
      "timestamp":"登録日時 ",
      "email":"メール ",
      "tel":"連絡先 ",
      "pickup":"引取者 ",
      "note":"備考 ",
      "cancel":"取消 ",
      "status00":"状態 ",
      "fee00":"参加費 ",
      "name01":"①氏名",
      "status01":"①状態",
      "fee01":"①参加費",
      "name02":"②氏名",
      "status02":"②状態",
      "fee02":"②参加費",
      "name03":"③氏名",
      "status03":"③状態",
      "fee03":"③参加費",
    },
  },
}