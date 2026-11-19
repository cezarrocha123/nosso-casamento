/* Gera o código "PIX copia e cola" (BR Code / EMV) — padrão do Banco Central */
(function () {
  function tlv(id, valor) {
    return id + String(valor.length).padStart(2, "0") + valor;
  }
  function limpar(txt, max) {
    return txt.normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^A-Za-z0-9 ]/g, "").toUpperCase().trim().slice(0, max);
  }
  function crc16(str) {
    let crc = 0xffff;
    for (let i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
        crc &= 0xffff;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
  }
  window.gerarPix = function ({ chave, nome, cidade, valor, descricao, txid }) {
    let conta = tlv("00", "br.gov.bcb.pix") + tlv("01", chave.trim());
    if (descricao) conta += tlv("02", limpar(descricao, 40));
    let p = tlv("00", "01") + tlv("26", conta) + tlv("52", "0000") + tlv("53", "986");
    if (valor) p += tlv("54", Number(valor).toFixed(2));
    p += tlv("58", "BR") + tlv("59", limpar(nome, 25)) + tlv("60", limpar(cidade, 15));
    p += tlv("62", tlv("05", (txid || "***").replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***"));
    p += "6304";
    return p + crc16(p);
  };
  window._crc16 = crc16;
})();
