
let jogoAtual = null;
let ultimoSinal = 0;
const cooldown = 60;
let analisando = false;
let intervaloGanhos = null;

const modos = ["Normal", "Turbo"];

/* ================== SONS ================== */
const somPop = new Audio("pop.mp3");
const somCash = new Audio("cash.mp3");
somPop.volume = 0.6;
somCash.volume = 0.7;

/* ================== NAVEGAÇÃO ================== */
function entrarNoJogo(jogo) {
  jogoAtual = jogo;
  document.getElementById("tela-jogos").style.display = "none";
  document.getElementById("tela-sinais").style.display = "block";
}

function voltar() {
  document.getElementById("tela-sinais").style.display = "none";
  document.getElementById("tela-jogos").style.display = "grid";
  document.getElementById("signals").innerHTML = "";
  document.getElementById("timer").innerText = "";
  document.getElementById("tabela-ganhos").innerHTML = "";
  ultimoSinal = 0;
}

/* ================== OVERLAY / ANÁLISE ================== */
function iniciarAnalise(callback) {
  const overlay = document.getElementById("overlay-sinal");
  const frases = document.querySelectorAll("#frases-analise span");
  const texto = document.getElementById("texto-analise");
  const barra = document.getElementById("progressBar");
  const percentual = document.getElementById("percentual");

  overlay.style.display = "flex";
  overlay.classList.add("fade-in");

  barra.style.width = "0%";
  percentual.innerText = "0%";

  let progresso = 0;
  let fraseIndex = 0;
  texto.innerText = frases[0].innerText;

  const totalTempo = 3000;
  const intervalo = 100;
  const passos = totalTempo / intervalo;

  const loop = setInterval(() => {
    progresso++;
    const pct = Math.min(100, Math.floor((progresso / passos) * 100));

    barra.style.width = pct + "%";
    percentual.innerText = pct + "%";

    if (progresso % Math.floor(passos / frases.length) === 0) {
      fraseIndex++;
      if (frases[fraseIndex]) {
        texto.innerText = frases[fraseIndex].innerText;
      }
    }

    if (pct >= 100) {
      clearInterval(loop);
      overlay.classList.remove("fade-in");
      overlay.classList.add("fade-out");

      setTimeout(() => {
        overlay.style.display = "none";
        overlay.classList.remove("fade-out");
        callback();
      }, 300);
    }
  }, intervalo);
}

/* ================== GANHOS FAKE PROGRESSIVOS ================== */
function iniciarGanhosFake() {
  const tabela = document.getElementById("tabela-ganhos");
  if (!tabela) return;

  tabela.innerHTML = "";
  let contador = 0;
  const limite = Math.floor(Math.random() * 6) + 4;

  clearInterval(intervaloGanhos);

  intervaloGanhos = setInterval(() => {
    if (contador >= limite) {
      clearInterval(intervaloGanhos);
      return;
    }

    const id = Math.random().toString(36).substring(2, 7).toUpperCase();
    const ganho = Math.floor(Math.random() * 900) + 100;

    const row = document.createElement("tr");
    row.style.opacity = "0";
    row.style.transform = "translateY(8px)";
    row.innerHTML = `
      <td>ID ${id}</td>
      <td class="ganho">+R$${ganho}</td>
    `;

    tabela.appendChild(row);

    somCash.currentTime = 0;
    somCash.play();

    setTimeout(() => {
      row.style.transition = "all .4s ease";
      row.style.opacity = "1";
      row.style.transform = "translateY(0)";
    }, 50);

    contador++;
  }, 5000);
}

/* ================== GERAR SINAL ================== */
function gerarSinal() {
  if (analisando) return;

  const agora = Date.now();
  const diff = Math.floor((agora - ultimoSinal) / 1000);
  const timer = document.getElementById("timer");

  if (diff < cooldown) {
    timer.innerText = `Aguarde ${cooldown - diff}s para novo sinal`;
    return;
  }

  somPop.currentTime = 0;
  somPop.play();

  analisando = true;
  iniciarAnalise(() => {
    analisando = false;
    gerarConteudoDoSinal();
  });
}

function gerarConteudoDoSinal() {
  ultimoSinal = Date.now();

  const btn = document.getElementById("btnSinal");
  const timer = document.getElementById("timer");
  btn.disabled = true;

  let restante = cooldown;
  const intervalo = setInterval(() => {
    restante--;
    timer.innerText = `Próximo sinal em ${restante}s`;

    if (restante <= 0) {
      clearInterval(intervalo);
      timer.innerText = "";
      btn.disabled = false;
    }
  }, 1000);

  const container = document.getElementById("signals");
  container.classList.add("fade-in");

  // ===== AVIATOR =====
  if (jogoAtual === "Aviator") {
    const sair1 = (Math.random() * (1.8 - 1.2) + 1.2).toFixed(1);
    const sair2 = (Math.random() * (4.5 - 2.5) + 2.5).toFixed(1);

    container.innerHTML = `
      <div class="card aviator">
        <div class="sinal-titulo">✈️ AVIATOR</div>
        <div class="sinal-item">SAIA EM <strong>${sair1}x</strong></div>
        <div class="sinal-item alt">OU SEGURE ATÉ <strong>${sair2}x</strong></div>
      </div>
    `;

    iniciarGanhosFake();
    return;
  }

  // ===== SLOTS =====
  const giros = Math.floor(Math.random() * 6) + 2;
  const modo = modos[Math.floor(Math.random() * modos.length)];
  const prob = Math.floor(Math.random() * 8) + 90;

  container.innerHTML = `
    <div class="card slot">
      <div class="sinal-titulo">🎰 ${jogoAtual}</div>
      <div class="sinal-item"><strong>${giros} GIROS</strong></div>
      <div class="sinal-item">MODO <strong>${modo.toUpperCase()}</strong></div>
      <div class="sinal-item prob">ASSERTIVIDADE <strong>${prob}%</strong></div>
    </div>
  `;

  iniciarGanhosFake();
}

/* ================== NOTIFICAÇÕES ================== */
const nomes = [
  "Carlos","Marcos","João","Rafael","Lucas",
  "Bruno","Pedro","Felipe","André","Matheus","Rafaela","Leticia"
];

const valores = [100, 200, 300, 500, 800, 1000];

function mostrarNotificacao() {
  const notif = document.getElementById("notification");
  if (!notif) return;

  const nome = nomes[Math.floor(Math.random() * nomes.length)];
  const valor = valores[Math.floor(Math.random() * valores.length)];

  notif.innerHTML = `
    <strong>${nome}</strong> ganhou <strong>R$${valor}</strong><br>
    usando os sinais
  `;

  somCash.currentTime = 0;
  somCash.play();

  notif.classList.add("show");
  setTimeout(() => notif.classList.remove("show"), 5000);
}

setTimeout(() => {
  mostrarNotificacao();
  setInterval(mostrarNotificacao, 30000);
}, 10000);
