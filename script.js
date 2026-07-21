// ============================================================
// 1. MATRIX RAIN (Efeito hacker no fundo)
// ============================================================
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%&*()_+{}:<>?';
const charArray = chars.split('');
const fontSize = 18;
const columns = Math.floor(canvas.width / fontSize);
const drops = [];

for (let i = 0; i < columns; i++) {
  drops[i] = Math.floor(Math.random() * -100);
}

function drawMatrix() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#00ff41';
  ctx.font = fontSize + 'px monospace';
  
  for (let i = 0; i < drops.length; i++) {
    const text = charArray[Math.floor(Math.random() * charArray.length)];
    const x = i * fontSize;
    const y = drops[i] * fontSize;
    
    // Brilho nos caracteres
    ctx.shadowColor = '#00ff41';
    ctx.shadowBlur = 6;
    ctx.fillText(text, x, y);
    ctx.shadowBlur = 0;
    
    if (y > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++;
  }
}

setInterval(drawMatrix, 40);

// ============================================================
// 2. DADOS DOS JOGOS (seus jogos aqui)
// ============================================================
const jogos = [
  {
    id: 1,
    titulo: "Cyber Hunter",
    descricao: "Caçada futurista em mundo aberto.",
    link: "download.html?jogo=cyber-hunter"
  },
  {
    id: 2,
    titulo: "Dark Dungeon",
    descricao: "Exploração e sobrevivência em masmorras.",
    link: "download.html?jogo=dark-dungeon"
  },
  {
    id: 3,
    titulo: "Space Racer",
    descricao: "Corrida espacial com naves personalizáveis.",
    link: "download.html?jogo=space-racer"
  }
];

// ============================================================
// 3. RENDERIZAR JOGOS
// ============================================================
const grid = document.getElementById('games-grid');
const count = document.getElementById('games-count');

if (grid) {
  grid.innerHTML = jogos.map(jogo => `
    <div class="game-card">
      <h3>${jogo.titulo}</h3>
      <p>${jogo.descricao}</p>
      <a href="${jogo.link}" class="btn-download">⬇ Download</a>
    </div>
  `).join('');
  
  if (count) {
    count.textContent = `${jogos.length} jogos`;
  }
}

// ============================================================
// 4. TEXTO DINÂMICO (Sobre e Serviços - se tiver os IDs)
// ============================================================
const aboutText = document.getElementById('about-text');
if (aboutText) {
  aboutText.textContent = 'Somos uma comunidade de gamers que busca trazer os melhores jogos exclusivos, com foco em experiência e diversão sem complicação.';
}

const servicesText = document.getElementById('services-text');
if (servicesText) {
  servicesText.textContent = 'Oferecemos downloads diretos, curadoria de jogos indie, suporte rápido e uma comunidade ativa para trocar experiências.';
}

// ============================================================
// 5. MENU MOBILE
// ============================================================
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

// ============================================================
// 6. MÚSICA (toggle)
// ============================================================
const musicToggle = document.getElementById('music-toggle');
let musicaAtiva = false;

if (musicToggle) {
  musicToggle.addEventListener('click', () => {
    musicaAtiva = !musicaAtiva;
    musicToggle.textContent = musicaAtiva ? '🔊' : '🔇';
  });
}

// ============================================================
// 7. ADMIN LOGOUT (simples)
// ============================================================
const logoutBtn = document.querySelector('.admin-logout');
if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('Deseja realmente sair?')) {
      alert('Você foi desconectado (simulação).');
    }
  });
}

console.log('🔥 Unholy Games carregado com estilo HACKER!');
