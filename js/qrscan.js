/* ===================================================
  QRスキャン用
=================================================== */

const video = document.querySelector('#js-video');
const canvas = document.querySelector('#js-canvas');
const ctx = canvas.getContext('2d');

(() => {  // QRスキャン用初期化処理
  navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {facingMode:{exact:'environment'}},
  }).then(stream => {
    video.srcObject = stream;
    video.onloadedmetadata = e => video.play();
  }).catch(err => {
    alert('Error'+(err.message.length===0?'':': '+err.message));
  });
})();

const checkImage = (callback) => {  // QRコード撮影
  if( !flags.checkImage )  return;
  // 取得している動画をcanvasに描画
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  // canvasからデータを取得
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  // jsQRに渡す
  const code = jsQR(imageData.data, canvas.width, canvas.height);
  if(code){
    alert("qrscan l.30"
    + "\ncallback typeof: " + whichType(callback)
    + "\ntype: " + whichType(code.data)
    + "\nvalue: " + code.data
    );
    flags.checkImage = false;
    callback(code.data);
  } else {
    setTimeout( () => checkImage(callback), 200);
  }
}