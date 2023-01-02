/** sha256: テキストをsha256でハッシュ化
 * 
 * @param {string} text - 暗号化対象のテキスト
 * @param {function} callback - 作成後の後続処理
 * 
 * @returns {void} なし
 */
function sha256(text,callback){
  const sha = async (text) => {
    const uint8  = new TextEncoder().encode(text)
    const digest = await crypto.subtle.digest('SHA-256', uint8)
    return Array.from(new Uint8Array(digest)).map(v => v.toString(16).padStart(2,'0')).join('')
  }
  sha(text).then((hash) => callback(hash));
}