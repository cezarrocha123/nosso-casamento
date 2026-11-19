/**
 * Backend gratuito do site de casamento (Google Planilhas + Apps Script)
 * - Salva confirmações de presença, recados e avisos de presente na planilha
 * - Avisa automaticamente no WhatsApp (via CallMeBot, grátis)
 *
 * Instalação: veja o README.md, passo "Ligar a planilha".
 */

/* ======== AVISOS NO WHATSAPP ========
 * Cada pessoa que vai receber os avisos precisa ativar o CallMeBot no próprio WhatsApp
 * e colar aqui o número (com 55 + DDD) e a chave (apikey) que o robô respondeu.
 * Pode deixar uma ou mais pessoas. Para desligar, deixe a lista vazia: [].
 * IMPORTANTE: cole a chave só aqui no Apps Script, nunca no GitHub.
 */
const AVISAR_WHATSAPP = [
  // { numero: "5584988121045", apikey: "COLE_A_CHAVE_DA_LIRIEL" },
  // { numero: "5584987422956", apikey: "COLE_A_CHAVE_DO_CEZAR" },
];

/* Senha que o robô do WhatsApp (no seu PC) usa para ler as confirmações novas.
 * Use a mesma no arquivo config.json do robô. Não publique no GitHub. */
const TOKEN_ROBO = "COLE_O_TOKEN_DO_ROBO";

/* ID da planilha (o código entre /d/ e /edit no endereço). Deixe "" se o script foi criado pelo menu Extensões da planilha. */
const PLANILHA_ID = "";

const ABAS = {
  rsvp:     ["Data", "Nome", "Presença", "Acompanhantes", "Total de pessoas", "Avisado no WhatsApp"],
  recado:   ["Data", "Nome", "Recado", "Aprovado"],
  presente: ["Data", "Nome", "Presente", "Valor", "Mensagem"],
};

function aba_(tipo) {
  const ss = PLANILHA_ID ? SpreadsheetApp.openById(PLANILHA_ID) : SpreadsheetApp.getActiveSpreadsheet();
  const nome = { rsvp: "Confirmações", recado: "Recados", presente: "Presentes" }[tipo];
  let sh = ss.getSheetByName(nome);
  if (!sh) {
    sh = ss.insertSheet(nome);
    sh.appendRow(ABAS[tipo]);
    sh.getRange(1, 1, 1, ABAS[tipo].length).setFontWeight("bold");
    sh.setFrozenRows(1);
  } else if (sh.getLastColumn() < ABAS[tipo].length) {
    sh.getRange(1, 1, 1, ABAS[tipo].length).setValues([ABAS[tipo]]).setFontWeight("bold");
  }
  return sh;
}

function limpa_(v, max) {
  return String(v == null ? "" : v).replace(/^[=+\-@]/, "'$&").slice(0, max || 500);
}

/* Envia um texto para todos os números configurados em AVISAR_WHATSAPP */
function avisarWhatsApp_(texto) {
  AVISAR_WHATSAPP.forEach(function (p) {
    if (!p.numero || !p.apikey || p.apikey.indexOf("COLE_") === 0) return;
    try {
      const url = "https://api.callmebot.com/whatsapp.php?phone=" + encodeURIComponent("+" + p.numero) +
        "&apikey=" + encodeURIComponent(p.apikey) + "&text=" + encodeURIComponent(texto);
      UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    } catch (err) {
      console.error("Falha ao avisar " + p.numero + ": " + err);
    }
  });
}

function textoRSVP_(d) {
  const linhas = [
    "*Nova confirmação de presença* 💍",
    "",
    "Nome: " + d.nome,
    "Vai ao casamento? " + (d.presenca === "Sim" ? "Sim ✅" : "Não ❌"),
  ];
  if (d.presenca === "Sim") {
    linhas.push("Acompanhantes: " + (Number(d.acompanhantes) || 0));
  }
  // Total de confirmados até agora
  try {
    const dados = aba_("rsvp").getDataRange().getValues().slice(1);
    let pessoas = 0;
    dados.forEach(function (r) { pessoas += Number(r[4]) || 0; });
    linhas.push("", "Total confirmado até agora: " + pessoas + " pessoa(s)");
  } catch (e) {}
  return linhas.join("\n");
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  let aviso = null;
  try {
    const d = JSON.parse(e.postData.contents);
    const agora = new Date();
    if (d.tipo === "rsvp") {
      const acomp = d.presenca === "Sim" ? (Number(d.acompanhantes) || 0) : 0;
      aba_("rsvp").appendRow([agora, limpa_(d.nome, 120), limpa_(d.presenca, 5), acomp, d.presenca === "Sim" ? 1 + acomp : 0]);
      aviso = textoRSVP_(d);
    } else if (d.tipo === "recado") {
      aba_("recado").appendRow([agora, limpa_(d.nome, 80), limpa_(d.mensagem, 600), "SIM"]);
    } else if (d.tipo === "presente") {
      aba_("presente").appendRow([agora, limpa_(d.nome, 80), limpa_(d.presente, 120), Number(d.valor) || 0, limpa_(d.mensagem)]);
      aviso = "*Presente avisado* 🎁\n\n" + d.nome + " disse que enviou: " + d.presente +
        " (R$ " + (Number(d.valor) || 0).toFixed(2).replace(".", ",") + ")" +
        (d.mensagem ? "\n\nMensagem: " + d.mensagem : "") + "\n\nConfira no app do banco.";
    }
  } catch (err) {
    return json_({ ok: false, erro: String(err) });
  } finally {
    lock.releaseLock();
  }
  if (aviso) avisarWhatsApp_(aviso);
  return json_({ ok: true });
}

function totalPessoas_() {
  return aba_("rsvp").getDataRange().getValues().slice(1)
    .reduce(function (t, r) { return t + (Number(r[4]) || 0); }, 0);
}

function doGet(e) {
  const acao = e.parameter.acao;

  // ---- usado pelo robô do WhatsApp ----
  if (acao === "pendentes" || acao === "marcar") {
    if (!TOKEN_ROBO || TOKEN_ROBO.indexOf("COLE_") === 0 || e.parameter.token !== TOKEN_ROBO) {
      return json_({ ok: false, erro: "token inválido" });
    }
    const sh = aba_("rsvp");
    if (acao === "marcar") {
      const linhas = String(e.parameter.linhas || "").split(",").map(Number).filter(function (n) { return n >= 2; });
      linhas.forEach(function (n) { sh.getRange(n, 6).setValue(new Date()); });
      return json_({ ok: true, marcadas: linhas.length });
    }
    const valores = sh.getDataRange().getValues();
    const pendentes = [];
    for (let i = 1; i < valores.length; i++) {
      const r = valores[i];
      if (!r[1] || r[5]) continue; // sem nome ou já avisado
      pendentes.push({ linha: i + 1, nome: r[1], presenca: r[2], acompanhantes: Number(r[3]) || 0 });
    }
    return json_({ ok: true, total: totalPessoas_(), pendentes: pendentes });
  }

  if (acao === "recados") {
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

/* Rode esta função no editor (botão ▶ Executar) para testar o aviso no WhatsApp */
function testarWhatsApp() {
  avisarWhatsApp_("Teste do site de casamento ✅ Se chegou, os avisos automáticos estão funcionando!");
}
