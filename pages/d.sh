# -h: index.htmlのテンプレートとなるhtmlファイル。既定値`prototype.html`
# その他のパラメータ: ページごとのhtml

echo `TZ='Asia/Tokyo' date`
node deploy.js -h:index.html \
  library.html \
  menu.html \
  authorize.html \
  messageBoard.html \
  reception.html \
  paperForm.html \
  applicationQR.html \
  cornerOperation.html \
  entry.html \
  referState.html \
  information.html \
  enquete.html \
  system.html \
  > ../index.html
#node deploy.js -h:index.html menu.html authorize.html EventStaff.html > ../index.html
#node deploy.js -h:proto.html a.html b.js c.css > test.html
#node deploy.js -h:proto.html -c:../css/style.css -j:../js/script.js information.html

echo '===============================================================\n'