echo '\n\n\n\n\n==============================================================='
echo `TZ='Asia/Tokyo' date`
echo '\n'

# -h: index.htmlのテンプレートとなるhtmlファイル。既定値`prototype.html`
# -c: 各ページのCSSを集めたファイル。既定値`css/style.css`
# -j: 各ページのスクリプトを集めたファイル。既定値`js/script.js`
# その他のパラメータ: ページごとのhtml

node deploy.js -h:index.html menu.html authorize.html messageBoard.html reception.html cornerOperation.html entry.html referState.html information.html enquete.html system.html > ../index.html
#node deploy.js -h:index.html menu.html authorize.html EventStaff.html > ../index.html
#node deploy.js -h:proto.html a.html b.js c.css > test.html
#node deploy.js -h:proto.html -c:../css/style.css -j:../js/script.js information.html

