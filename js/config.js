/* =========================================================
   CONFIGURAÇÃO DO SITE — edite só este arquivo
   ========================================================= */
window.CONFIG = {
  noivo1: "Cezar",
  noivo2: "Liriel",
  // Data e hora da cerimônia no horário de Natal (o -03:00 no fim é o fuso; não apague)
  data: "2027-11-06T16:00-03:00",
  cidade: "Natal / RN",
  // Duração do evento na agenda dos convidados (horas, contando cerimônia + festa)
  duracaoHoras: 7,
  // Foto de capa (coloque o arquivo na pasta img/). Deixe "" para usar o fundo padrão.
  fotoCapa: "",

  frase: "",

  historia: [
    "Nos conhecemos na Comunidade Católica Shalom e de maneira muito tranquila e rápida construímos uma amizade leve, com muitas partilhas no dia a dia e conhecimento um do outro.",
    "Foi crescendo no desejo de cuidar um do outro que foi fluindo um amor tranquilo e baseado na vida de oração, e é com esse mesmo desejo, que gera paz e felicidade, que caminhamos rumo ao altar.",
    "Por isso queremos contar com a sua presença, que é essencial nesse momento tão especial para nós.",
  ],
  // Foto da seção "Nossa história" (pasta img/). Deixe "" para não mostrar.
  historiaFoto: "img/nossa-historia.jpg",

  cerimonia: {
    nome: "Paróquia São Francisco de Assis",
    horario: "16h00",
    endereco: "R. Maracanã, s/n — Pitimbu, Natal/RN",
    // Busca usada nos botões de Google Maps e Waze
    mapa: "Paróquia São Francisco de Assis, R. Maracanã, Pitimbu, Natal - RN",
  },
  festa: {
    nome: "Espaço de Eventos Exemplo",
    horario: "18h00",
    endereco: "Av. Exemplo, 456 — Bairro, Natal/RN",
  },

  dressCode: {
    titulo: "Esporte fino",
    texto: "Sugerimos tons claros e tecidos leves. Por favor, evite branco 🙂",
  },

  hospedagem: [
    { nome: "Hotel Exemplo", detalhe: "A 5 min da festa", link: "" },
  ],

  // Prazo para confirmar presença (texto livre)
  prazoRSVP: "15 de abril de 2027",
  maxAcompanhantes: 4,

  // URL do Google Apps Script (veja o README). Sem ela, o formulário fica em modo de teste.
  appsScriptUrl: "https://script.google.com/macros/s/AKfycbwwvB2Ef_PzOPOL0GWMsTtVM4EQ9QPMcNW-V7pEfYixK7LkoMDLzD3rbWZfmJqZzUgS/exec",

  /* ---------- PIX (presentes caem direto na sua conta, sem taxa) ---------- */
  pix: {
    chave: "seu-email@exemplo.com",   // CPF, e-mail, telefone (+5584...) ou chave aleatória
    nomeRecebedor: "NOME SOBRENOME",  // como aparece no banco (até 25 letras)
    cidade: "NATAL",
  },

  presentes: [
    { nome: "Jantar romântico na lua de mel", valor: 250 },
    { nome: "Passeio de barco", valor: 400 },
    { nome: "Jogo de panelas", valor: 350 },
    { nome: "Cafeteira", valor: 280 },
    { nome: "Jogo de cama", valor: 200 },
    { nome: "Ajuda com a passagem", valor: 600 },
    { nome: "Cota de lua de mel", valor: 150 },
    { nome: "Aspirador robô", valor: 900 },
  ],
};
