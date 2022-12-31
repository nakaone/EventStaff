# deploy.js: 分割されたページを統合する

## useage

`node [-h:xxxx.html] [-c:yyyy.css] [-j:zzzz.js] aaaa.html [bbbb.html ...]`

※以下のオプションでのファイル名は、いずれもパス名を含む。

- h: index.htmlのテンプレートとなるhtmlファイル。既定値`prototype.html`
- c: 各ページのCSSを集めたファイル。既定値`css/style.css`
- j: 各ページのスクリプトを集めたファイル。既定値`js/script.js`
- その他のパラメータ: ページごとのhtml

## input

### prototype.html

- `</head>`直前
- `</body>`
### 各ページのhtml

- `<link rel="stylesheet" .*href="css/(.+?)".*>` -> 
- `<script src="(.+?)" defer></script>`
- `<style type="text/css>">`〜`</style>`
- `<script type="text/javascript">`〜`</script>`
- `<div class="xxxx">`〜`</div>`

## output

- `pages/index.html`
- `css/