# 💍 Site do nosso casamento

Site de casamento próprio, gratuito e **sem taxa nos presentes**: o PIX cai direto na conta dos noivos.

**Recursos:** capa com contagem regressiva · nossa história · cerimônia e festa com Google Maps/Waze · dress code · hospedagem · confirmação de presença · lista de presentes com QR Code PIX · mural de recados.

---

## 1. Personalizar
Edite só o arquivo **`js/config.js`**: nomes, data, locais, textos, chave PIX e lista de presentes.
- Foto de capa: coloque a imagem em `img/` (ex.: `img/capa.jpg`) e preencha `fotoCapa: "img/capa.jpg"`.
- Presente com foto: `{ nome: "Cafeteira", valor: 280, imagem: "img/cafeteira.jpg" }`.

## 2. Ligar a planilha (confirmações e recados) — grátis
1. Crie uma planilha nova no Google Planilhas (ex.: "Casamento - Convidados").
2. Menu **Extensões › Apps Script**. Apague o que tiver e cole o conteúdo de `apps-script/Code.gs`. Salve.
3. **Implantar › Nova implantação** › tipo **App da Web**
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
4. Autorize, copie a **URL do app da Web** (termina em `/exec`) e cole em `appsScriptUrl` no `config.js`.

A planilha cria sozinha as abas **Confirmações**, **Recados** e **Presentes**.
Para esconder um recado do mural, mude a coluna "Aprovado" para `NÃO`.

> Se alterar o `Code.gs` depois, use **Implantar › Gerenciar implantações › Editar › Nova versão** para manter a mesma URL.

## 3. Publicar no GitHub Pages
1. Suba estes arquivos no repositório (branch `main`).
2. No GitHub: **Settings › Pages › Source: Deploy from a branch › `main` / `(root)`** › Save.
3. Em ~1 minuto o site fica em `https://SEU-USUARIO.github.io/NOME-DO-REPO/`.

Quer um endereço próprio (ex.: `cezarefulana.com.br`)? Registre no registro.br e configure em **Settings › Pages › Custom domain**.

## Sobre os presentes
O QR Code e o "PIX copia e cola" são gerados no próprio site, com o valor do presente já preenchido, no padrão do Banco Central. Não há intermediário nem taxa. Confira os recebimentos no app do seu banco; quem preencher "deixar seu nome" aparece na aba **Presentes** da planilha.
