(function () {
  const C = window.CONFIG;
  const $ = (s) => document.querySelector(s);
  const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const brl = (v) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  /* ---------- Textos ---------- */
  const nomes = `${C.noivo1} <em>&</em> ${C.noivo2}`;
  const dataEvento = new Date(C.data);
  const dataTxt = dataEvento.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  document.title = `${C.noivo1} & ${C.noivo2}`;
  $("#heroNames").innerHTML = nomes;
  $("#footerNames").innerHTML = nomes;
  $("#navLogo").textContent = `${C.noivo1[0]} & ${C.noivo2[0]}`;
  $("#heroDate").textContent = dataTxt;
  $("#footerDate").textContent = `${dataTxt} · ${C.cidade}`;
  $("#heroCity").textContent = C.cidade;
  if (C.frase) $("#frase").textContent = C.frase; else $("#frase").remove();
  if (C.historiaFoto) {
    $("#historiaFoto").innerHTML = `<img src="${esc(C.historiaFoto)}" alt="${esc(C.noivo1)} e ${esc(C.noivo2)}" loading="lazy">`;
  } else $("#historiaFoto").remove();
  $("#historiaTexto").innerHTML = C.historia.map((p) => `<p>${esc(p)}</p>`).join("");
  $("#prazo").textContent = C.prazoRSVP;
  if (C.fotoCapa) $("#inicio").style.backgroundImage = `url('${C.fotoCapa}')`;

  /* ---------- Locais ---------- */
  const local = (titulo, l) => {
    const q = encodeURIComponent(l.mapa || l.endereco);
    return `<div class="card local">
      <h3>${titulo}</h3>
      <p class="destaque">${esc(l.nome)}</p>
      <p class="hora">${esc(l.horario)}</p>
      <p>${esc(l.endereco)}</p>
      <div class="btns">
        <a class="btn btn-sm" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${q}">Google Maps</a>
        <a class="btn btn-sm btn-ghost" target="_blank" rel="noopener" href="https://waze.com/ul?q=${q}&navigate=yes">Waze</a>
      </div></div>`;
  };
  $("#locais").innerHTML = local("Cerimônia", C.cerimonia) + local("Festa", C.festa);
  $("#dressTitulo").textContent = C.dressCode.titulo;
  $("#dressTexto").textContent = C.dressCode.texto;
  $("#hospedagem").innerHTML = C.hospedagem.map((h) =>
    `<li><b>${h.link ? `<a href="${esc(h.link)}" target="_blank" rel="noopener">${esc(h.nome)}</a>` : esc(h.nome)}</b><span>${esc(h.detalhe)}</span></li>`).join("");

  /* ---------- Contagem regressiva ---------- */
  function tick() {
    let s = Math.max(0, Math.floor((dataEvento - new Date()) / 1000));
    $("#cdD").textContent = Math.floor(s / 86400);
    $("#cdH").textContent = Math.floor((s % 86400) / 3600);
    $("#cdM").textContent = Math.floor((s % 3600) / 60);
    $("#cdS").textContent = s % 60;
  }
  tick(); setInterval(tick, 1000);

  /* ---------- Menu ---------- */
  $("#navToggle").onclick = () => $("#nav").classList.toggle("open");
  document.querySelectorAll(".nav-links a").forEach((a) => a.addEventListener("click", () => $("#nav").classList.remove("open")));
  window.addEventListener("scroll", () => $("#nav").classList.toggle("solid", scrollY > 60));

  /* ---------- Envio para a planilha ---------- */
  async function enviar(tipo, dados, statusEl) {
    statusEl.className = "form-status";
    if (!C.appsScriptUrl) {
      console.log("[modo teste]", tipo, dados);
      statusEl.textContent = "Modo de teste: configure o appsScriptUrl para salvar de verdade.";
      statusEl.classList.add("ok");
      return true;
    }
    statusEl.textContent = "Enviando…";
    try {
      await fetch(C.appsScriptUrl, {
        method: "POST", mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ tipo, ...dados }),
      });
      return true;
    } catch (e) {
      statusEl.textContent = "Não foi possível enviar. Tente de novo.";
      statusEl.classList.add("erro");
      return false;
    }
  }
  const dadosForm = (f) => Object.fromEntries(new FormData(f).entries());

  /* ---------- Salvar na agenda ---------- */
  function linksAgenda() {
    const inicio = new Date(C.data);
    const fim = new Date(inicio.getTime() + (Number(C.duracaoHoras) || 7) * 3600 * 1000);
    const utc = (dt) => dt.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const titulo = `Casamento ${C.noivo1} & ${C.noivo2} 💍`;
    const local = `${C.cerimonia.nome} - ${C.cerimonia.endereco}`;
    const detalhes = `Cerimônia: ${C.cerimonia.nome} (${C.cerimonia.horario})\n${C.cerimonia.endereco}\n\n` +
      `Festa: ${C.festa.nome} (${C.festa.horario})\n${C.festa.endereco}\n\nSite: ${location.origin + location.pathname}`;
    const google = "https://calendar.google.com/calendar/render?" + new URLSearchParams({
      action: "TEMPLATE", text: titulo, dates: `${utc(inicio)}/${utc(fim)}`, details: detalhes, location: local,
    });
    const icsEsc = (t) => t.replace(/[\\,;]/g, (m) => "\\" + m).replace(/\n/g, "\\n");
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Casamento//PT-BR", "BEGIN:VEVENT",
      `UID:casamento-${utc(inicio)}@site`, `DTSTAMP:${utc(new Date())}`, `DTSTART:${utc(inicio)}`, `DTEND:${utc(fim)}`,
      `SUMMARY:${icsEsc(titulo)}`, `LOCATION:${icsEsc(local)}`, `DESCRIPTION:${icsEsc(detalhes)}`,
      "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", "DESCRIPTION:Amanhã é o casamento!", "END:VALARM",
      "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    return { google, ics: "data:text/calendar;charset=utf-8," + encodeURIComponent(ics) };
  }

  /* ---------- RSVP (simples: nome + vai/não vai + acompanhantes) ---------- */
  const sel = $("#selAcomp");
  for (let i = 0; i <= C.maxAcompanhantes; i++) sel.innerHTML += `<option value="${i}">${i === 0 ? "Só eu" : "+ " + i}</option>`;
  const fR = $("#formRSVP");
  fR.addEventListener("change", () => {
    $("#extrasSim").style.display = fR.presenca.value === "Não" ? "none" : "";
  });
  fR.addEventListener("submit", async (e) => {
    e.preventDefault();
    const st = $("#statusRSVP");
    if (!fR.checkValidity()) { st.textContent = "Preencha seu nome e diga se vai."; st.className = "form-status erro"; return; }
    const d = dadosForm(fR);
    if (d.presenca === "Não") d.acompanhantes = 0;
    const btn = fR.querySelector("button[type=submit]");
    btn.disabled = true; btn.textContent = "Enviando…";
    if (await enviar("rsvp", d, st)) {
      fR.innerHTML = `<div class="obrigado">
        <h3>${d.presenca === "Sim" ? "Presença confirmada! 🎉" : "Obrigado por avisar 💛"}</h3>
        <p>${d.presenca === "Sim" ? "Mal podemos esperar para celebrar com você!" : "Sentiremos sua falta!"}</p>
        ${d.presenca === "Sim" ? (() => { const a = linksAgenda(); return `
        <a class="btn btn-agenda" href="${a.google}" target="_blank" rel="noopener">📅 Salvar no Google Agenda</a>
        <a class="small link-ics" href="${a.ics}" download="casamento-${C.noivo1}-${C.noivo2}.ics">Usa iPhone ou Outlook? Baixar para outra agenda</a>`; })() : ""}
      </div>`;
    } else { btn.disabled = false; btn.textContent = "Confirmar presença"; }
  });

  /* ---------- Presentes / PIX ---------- */
  const icone = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="8" width="18" height="13" rx="1"/><path d="M3 12h18M12 8v13M12 8S10 3 7.5 4 9 8 12 8zm0 0s2-5 4.5-4S15 8 12 8z"/></svg>`;
  $("#gifts").innerHTML = C.presentes.map((p, i) => `
    <div class="gift card">
      <div class="gift-img">${p.imagem ? `<img src="${esc(p.imagem)}" alt="">` : icone}</div>
      <h4>${esc(p.nome)}</h4>
      <p class="gift-valor">${brl(p.valor)}</p>
      <button class="btn btn-sm" data-i="${i}">Presentear</button>
    </div>`).join("");
  $("#gifts").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-i]");
    if (b) abrirPix(C.presentes[b.dataset.i].nome, C.presentes[b.dataset.i].valor);
  });
  $("#formLivre").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = parseFloat($("#valorLivre").value);
    if (v > 0) abrirPix("Presente com valor livre", v);
  });

  let presenteAtual = null;
  function abrirPix(nome, valor) {
    presenteAtual = { presente: nome, valor };
    const codigo = gerarPix({ chave: C.pix.chave, nome: C.pix.nomeRecebedor, cidade: C.pix.cidade, valor, txid: "CASAMENTO" });
    $("#pixTitulo").textContent = nome;
    $("#pixValor").textContent = brl(valor);
    $("#pixCodigo").value = codigo;
    if (window.qrcode) {
      const qr = qrcode(0, "M"); qr.addData(codigo); qr.make();
      $("#pixQR").innerHTML = qr.createSvgTag({ cellSize: 5, margin: 2, scalable: true });
    } else $("#pixQR").innerHTML = "<p class='small'>Use o código copia e cola abaixo.</p>";
    const fp = $("#formPresente"); fp.reset(); $("#statusPresente").textContent = ""; fp.style.display = "";
    $("#modalPix").classList.add("open"); $("#modalPix").setAttribute("aria-hidden", "false");
  }
  const fechar = () => { $("#modalPix").classList.remove("open"); $("#modalPix").setAttribute("aria-hidden", "true"); };
  $("#fecharPix").onclick = fechar;
  $("#modalPix").addEventListener("click", (e) => { if (e.target.id === "modalPix") fechar(); });
  document.addEventListener("keydown", (e) => e.key === "Escape" && fechar());
  $("#copiarPix").onclick = async () => {
    const inp = $("#pixCodigo");
    try { await navigator.clipboard.writeText(inp.value); } catch { inp.select(); document.execCommand("copy"); }
    $("#copiarPix").textContent = "Copiado!"; setTimeout(() => ($("#copiarPix").textContent = "Copiar"), 2000);
  };
  $("#formPresente").addEventListener("submit", async (e) => {
    e.preventDefault();
    const st = $("#statusPresente");
    if (await enviar("presente", { ...dadosForm(e.target), ...presenteAtual }, st)) {
      st.textContent = "Recebido! Obrigado pelo carinho 💛"; st.className = "form-status ok";
    }
  });

  /* ---------- Mural ---------- */
  function renderMural(lista) {
    $("#mural").innerHTML = lista.length
      ? lista.map((r) => `<div class="recado"><p>“${esc(r.mensagem)}”</p><span>— ${esc(r.nome)}</span></div>`).join("")
      : `<p class="vazio">Seja o primeiro a deixar um recado!</p>`;
  }
  let recados = [];
  async function carregarMural() {
    if (!C.appsScriptUrl) return renderMural(recados);
    try {
      const r = await fetch(C.appsScriptUrl + "?acao=recados");
      recados = await r.json();
    } catch { recados = []; }
    renderMural(recados);
  }
  carregarMural();
  $("#formRecado").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target, st = $("#statusRecado");
    if (!f.checkValidity()) return;
    const d = dadosForm(f);
    if (await enviar("recado", d, st)) {
      recados.unshift(d); renderMural(recados); f.reset();
      if (C.appsScriptUrl) { st.textContent = "Recado publicado 💛"; st.className = "form-status ok"; }
    }
  });
})();
