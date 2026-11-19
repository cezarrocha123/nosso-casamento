/**
 * Backend gratuito do site de casamento (Google Planilhas + Apps Script)
 * Salva confirmações de presença, recados e avisos de presente.
 * Instalação: veja o README.md, passo "Ligar a planilha".
 */
const ABAS = {
  rsvp:     ["Data", "Nome", "WhatsApp", "Presença", "Acompanhantes", "Nomes acompanhantes", "Restrição alimentar", "Mensagem"],
  recado:   ["Data", "Nome", "Recado", "Aprovado"],
  presente: ["Data", "Nome", "Presente", "Valor", "Mensagem"],
};

function aba_(tipo) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const nome = { rsvp: "Confirmações", recado: "Recados", presente: "Presentes" }[tipo];
  let sh = ss.getSheetByName(nome);
  if (!sh) {
    sh = ss.insertSheet(nome);
    sh.appendRow(ABAS[tipo]);
    sh.getRange(1, 1, 1, ABAS[tipo].length).setFontWeight("bold");
    sh.setFrozenRows(1);
  }
  return sh;
}

function limpa_(v, max) {
  return String(v == null ? "" : v).replace(/^[=+\-@]/, "'$&").slice(0, max || 500);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    const agora = new Date();
    if (d.tipo === "rsvp") {
      aba_("rsvp").appendRow([agora, limpa_(d.nome, 120), limpa_(d.telefone, 30), limpa_(d.presenca, 5),
        Number(d.acompanhantes) || 0, limpa_(d.nomesAcompanhantes), limpa_(d.restricao), limpa_(d.mensagem)]);
    } else if (d.tipo === "recado") {
      aba_("recado").appendRow([agora, limpa_(d.nome, 80), limpa_(d.mensagem, 600), "SIM"]);
    } else if (d.tipo === "presente") {
      aba_("presente").appendRow([agora, limpa_(d.nome, 80), limpa_(d.presente, 120), Number(d.valor) || 0, limpa_(d.mensagem)]);
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, erro: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  if (e.parameter.acao === "recados") {
    const valores = aba_("recado").getDataRange().getValues().slice(1);
    const lista = valores
      .filter(r => String(r[3]).toUpperCase() !== "NÃO" && String(r[3]).toUpperCase() !== "NAO")
      .reverse()
      .slice(0, 200)
      .map(r => ({ nome: r[1], mensagem: r[2] }));
    return json_(lista);
  }
  return json_({ ok: true });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
