echo '\n\n\n\n\n==============================================================='
echo `TZ='Asia/Tokyo' date`
echo '\n'

node deploy.js -h:../prototype/deploy/proto.html ../prototype/deploy/a.html ../prototype/deploy/b.js ../prototype/deploy/c.css
#node deploy.js -h:proto.html a.html b.js c.css > test.html
#node deploy.js -h:proto.html -c:../css/style.css -j:../js/script.js information.html

