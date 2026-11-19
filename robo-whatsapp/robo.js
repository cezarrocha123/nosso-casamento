/**
 * Robô do WhatsApp do casamento
 * - Fica conectado a um número de WhatsApp (como o WhatsApp Web)
 * - A cada X segundos pergunta à planilha se há confirmações novas
 * - Manda cada confirmação nova para os números em config.json
 * - Marca na planilha o que já foi avisado
 */
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const pino = require("pino");
const QRCode = require("qrcode");
const qrcodeTerminal = require("qrcode-terminal");
const baileys = require("@whiskeysockets/baileys");
const makeWASocket = baileys.default || baileys.makeWASocket;
const { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = baileys;

const PASTA = __dirname;
const cfg = JSON.parse(fs.readFileSync(path.join(PASTA, "config.json"), "utf8"));
const INTERVALO = Math.max(15, Number(cfg.intervaloSegundos) || 30) * 1000;

const hora = () => new Date().toLocaleTimeString("pt-BR");
const log = (...a) => console.log(`[${hora()}]`, ...a);

let sock = null;
let conectado = false;
let verificando = false;
const destinos = {}; // numero -> jid

/* ---------------- WhatsApp ---------------- */
async function conectar() {
  const { state, saveCreds } = await useMultiFileAuthState(path.join(PASTA, "sessao-whatsapp"));
  let version;
  try { ({ version } = await fetchLatestBaileysVersion()); } catch { /* usa a versão padrão */ }

  sock = makeWASocket({
    auth: state,
    version,
    logger: pino({ level: "silent" }),
    browser: ["Robo Casamento", "Chrome", "1.0"],
    syncFullHistory: false,
    markOnlineOnConnect: false,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log("\n==============================================");
      console.log(" Escaneie o QR Code com o WhatsApp do ROBÔ:");
      console.log(" WhatsApp > Aparelhos conectados > Conectar um aparelho");
      console.log("==============================================\n");
      qrcodeTerminal.generate(qr, { small: true });
      const arq = path.join(PASTA, "qrcode.png");
      try {
        await QRCode.toFile(arq, qr, { width: 400, margin: 2 });
        console.log(`\n(Se o QR acima ficou ruim, abra o arquivo ${arq})`);
        if (process.platform === "win32") exec(`start "" "${arq}"`);
      } catch {}
    }
    if (connection === "open") {
      conectado = true;
      try { fs.unlinkSync(path.join(PASTA, "qrcode.png")); } catch {}
      log("✅ Conectado ao WhatsApp! Vigiando as confirmações...");
      await resolverDestinos();
      verificar();
    }
    if (connection === "close") {
      conectado = false;
      const codigo = lastDisconnect?.error?.output?.statusCode;
      if (codigo === DisconnectReason.loggedOut) {
        log("❌ O WhatsApp desconectou este aparelho. Apague a pasta 'sessao-whatsapp' e abra o robô de novo para escanear outro QR.");
        process.exit(1);
      }
      log("Conexão caiu, reconectando em 5s...");
      setTimeout(conectar, 5000);
    }
  });
}

/* Descobre o "endereço" de WhatsApp de cada número (no Brasil o 9º dígito às vezes muda) */
async function resolverDestinos() {
  for (const p of cfg.avisar) {
    const num = String(p.numero).replace(/\D/g, "");
    try {
      const [r] = await sock.onWhatsApp(num);
      if (r?.exists) { destinos[num] = r.jid; log(`Destino OK: ${p.nome} (${num})`); continue; }
    } catch {}
    destinos[num] = `${num}@s.whatsapp.net`;
    log(`⚠️  Não confirmei ${p.nome} (${num}) no WhatsApp; vou tentar mesmo assim.`);
  }
}

/* ---------------- Planilha ---------------- */
async function chamarPlanilha(params) {
  const url = cfg.urlPlanilha + "?" + new URLSearchParams({ token: cfg.token, ...params });
  const r = await fetch(url, { redirect: "follow" });
  const txt = await r.text();
  try { return JSON.parse(txt); }
  catch { throw new Error("Resposta estranha da planilha: " + txt.slice(0, 120)); }
}

function montarTexto(c, total) {
  const linhas = [
    "*Nova confirmação de presença* 💍",
    "",
    `Nome: ${c.nome}`,
    `Vai ao casamento? ${c.presenca === "Sim" ? "Sim ✅" : "Não ❌"}`,
  ];
  if (c.presenca === "Sim") linhas.push(`Acompanhantes: ${c.acompanhantes}`);
  linhas.push("", `Total confirmado até agora: ${total} pessoa(s)`);
  return linhas.join("\n");
}

async function verificar() {
  if (!conectado || verificando) return;
  verificando = true;
  try {
    const r = await chamarPlanilha({ acao: "pendentes" });
    if (!r.ok) throw new Error(r.erro || "erro da planilha");
    const enviadas = [];
    for (const c of r.pendentes) {
      const texto = montarTexto(c, r.total);
      let ok = true;
      for (const jid of Object.values(destinos)) {
        try { await sock.sendMessage(jid, { text: texto }); }
        catch (e) { ok = false; log("Falha ao enviar para", jid, "-", e.message); }
        await new Promise((res) => setTimeout(res, 1500)); // calma entre mensagens
      }
      if (ok) { enviadas.push(c.linha); log(`📨 Avisado: ${c.nome} (${c.presenca})`); }
    }
    if (enviadas.length) await chamarPlanilha({ acao: "marcar", linhas: enviadas.join(",") });
  } catch (e) {
    log("Erro ao verificar a planilha:", e.message);
  } finally {
    verificando = false;
  }
}

/* ---------------- Início ---------------- */
console.log("💍 Robô do casamento — deixe esta janela aberta (pode minimizar).");
if (!cfg.token || !cfg.urlPlanilha) {
  console.log("Preencha urlPlanilha e token no config.json."); process.exit(1);
}
setInterval(verificar, INTERVALO);
conectar().catch((e) => { console.error("Erro ao iniciar:", e); process.exit(1); });
