/* ==========================================================================
   UNHOLY GAMES — script.js
   Shared logic for index.html, download.html and admin.html.
   Everything is stored in localStorage — no backend, no PHP, no database.
   ========================================================================== */

/* ---------------- Storage keys ---------------- */
const LS_GAMES = 'ug_games';
const LS_CONTENT = 'ug_content';
const LS_GALLERY = 'ug_gallery';
const SS_ADMIN = 'ug_admin_session';
const ADMIN_PASSWORD = 'admin123';

/* ---------------- Default content (first run) ---------------- */
const DEFAULT_CONTENT = {
  about: 'A Unholy Games nasceu da vontade de reunir, em um único lugar, jogos exclusivos selecionados a dedo para a comunidade. Sem enrolação, sem anúncios invasivos: só o jogo e o botão de download.',
  services: 'Hospedamos e distribuímos jogos com link único e permanente para cada título, estatísticas de download em tempo real e um painel simples para quem administra o catálogo.',
  aboutImage: '',
  servicesImage: ''
};

/* ---------------- Storage helpers ---------------- */
function getGames() {
  try { return JSON.parse(localStorage.getItem(LS_GAMES)) || []; }
  catch (e) { return []; }
}
function saveGames(games) { localStorage.setItem(LS_GAMES, JSON.stringify(games)); }

function getContent() {
  try {
    const stored = JSON.parse(localStorage.getItem(LS_CONTENT));
    return stored ? { ...DEFAULT_CONTENT, ...stored } : { ...DEFAULT_CONTENT };
  } catch (e) { return { ...DEFAULT_CONTENT }; }
}
function saveContent(content) { localStorage.setItem(LS_CONTENT, JSON.stringify(content)); }

function getGallery() {
  try { return JSON.parse(localStorage.getItem(LS_GALLERY)) || []; }
  catch (e) { return []; }
}
function saveGallery(gallery) { localStorage.setItem(LS_GALLERY, JSON.stringify(gallery)); }

function isAdminLoggedIn() { return sessionStorage.getItem(SS_ADMIN) === '1'; }

/* ---------------- Utils ---------------- */
function slugify(str) {
  return str.toString().toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'jogo';
}

function uniqueId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch (e) { return iso; }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : str;
  return div.innerHTML;
}

function downloadLinkFor(game) {
  // Absolute-ish relative link that works from any page depth on GitHub Pages.
  return `download.html?id=${encodeURIComponent(game.id)}`;
}

function fullUrlFor(game) {
  const base = window.location.href.replace(/[^/]*$/, '');
  return base + downloadLinkFor(game);
}

function toast(msg) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2400);
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    // fallback for older browsers / GitHub Pages http contexts
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e2) { /* noop */ }
    document.body.removeChild(ta);
    return true;
  }
}

/* ---------------- Matrix rain (white on black, low opacity) ---------------- */
function initMatrixRain(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ<>/{}[]#$%';
  let cols, drops, fontSize = 16;

  function resize() {
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    cols = Math.floor(canvas.width / fontSize);
    drops = new Array(cols).fill(0).map(() => Math.floor(Math.random() * -50));
  }

  function draw() {
    ctx.fillStyle = 'rgba(26, 26, 26, 0.18)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = fontSize + 'px monospace';
    for (let i = 0; i < cols; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(char, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }

  resize();
  window.addEventListener('resize', resize);
  setInterval(draw, 55);
}

/* ---------------- Background music toggle ---------------- */
function initMusicToggle() {
  const btn = document.getElementById('music-toggle');
  if (!btn) return;
  const audio = new Audio('musica.mp3');
  audio.loop = true;
  audio.volume = 0.4;
  let playing = false;

  function setIcon() { btn.textContent = playing ? '🔊' : '🔇'; }

  audio.play().then(() => { playing = true; setIcon(); }).catch(() => { playing = false; setIcon(); });
  setIcon();

  btn.addEventListener('click', () => {
    if (playing) { audio.pause(); playing = false; }
    else { audio.play().catch(() => {}); playing = true; }
    setIcon();
  });
}

/* ---------------- Mobile nav toggle ---------------- */
function initNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => links.classList.toggle('open'));
}

/* ---------------- Admin bar (shown on public pages when logged in) ---------------- */
function initAdminBar() {
  const bar = document.querySelector('.admin-bar');
  if (!bar) return;
  if (isAdminLoggedIn()) {
    bar.classList.add('show');
    const logout = bar.querySelector('.admin-logout');
    if (logout) logout.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.removeItem(SS_ADMIN);
      location.reload();
    });
  }
}

/* ==========================================================================
   INDEX PAGE
   ========================================================================== */
function initIndexPage() {
  const grid = document.getElementById('games-grid');
  if (!grid) return;

  const content = getContent();
  const aboutText = document.getElementById('about-text');
  const servicesText = document.getElementById('services-text');
  const aboutImg = document.getElementById('about-image');
  const servicesImg = document.getElementById('services-image');

  if (aboutText) aboutText.textContent = content.about;
  if (servicesText) servicesText.textContent = content.services;
  if (aboutImg) {
    if (content.aboutImage) { aboutImg.src = content.aboutImage; aboutImg.style.display = 'block'; }
    else aboutImg.style.display = 'none';
  }
  if (servicesImg) {
    if (content.servicesImage) { servicesImg.src = content.servicesImage; servicesImg.style.display = 'block'; }
    else servicesImg.style.display = 'none';
  }

  const games = getGames().sort((a, b) => b.createdAt - a.createdAt);
  const countEl = document.getElementById('games-count');
  if (countEl) countEl.textContent = `${games.length} JOGO${games.length === 1 ? '' : 'S'} DISPONÍVEL${games.length === 1 ? '' : 'IS'}`;

  if (!games.length) {
    grid.innerHTML = '<div class="empty-state">Nenhum jogo publicado ainda. Volte em breve.</div>';
    return;
  }

  grid.innerHTML = games.map(game => `
    <article class="game-card">
      <div class="game-cover" style="${game.cover ? `background-image:url('${escapeHtml(game.cover)}')` : ''}">
        ${game.cover ? '' : '<div class="placeholder">Sem capa</div>'}
      </div>
      <div class="game-body">
        <h3 class="game-title">${escapeHtml(game.title)}</h3>
        <p class="game-desc">${escapeHtml(truncate(game.description, 110))}</p>
        <div class="game-meta">
          <span>📅 ${formatDate(game.createdAt)}</span>
          <span>⬇️ ${game.downloads || 0}</span>
          ${game.size ? `<span>💾 ${escapeHtml(game.size)}</span>` : ''}
        </div>
        <a class="btn btn-outline btn-block" href="${downloadLinkFor(game)}">Ver Jogo</a>
      </div>
    </article>
  `).join('');
}

function truncate(str, n) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n - 1).trim() + '…' : str;
}

/* ==========================================================================
   DOWNLOAD PAGE
   ========================================================================== */
function initDownloadPage() {
  const root = document.getElementById('download-root');
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const slug = params.get('slug');
  const games = getGames();
  const game = games.find(g => (id && g.id === id) || (slug && g.slug === slug));

  if (!game) {
    root.innerHTML = `
      <div class="not-found">
        <h1 class="download-title">Jogo não encontrado</h1>
        <p class="download-desc">O link que você acessou não corresponde a nenhum jogo publicado.</p>
        <a class="btn btn-dark" href="index.html">← Voltar para a página inicial</a>
      </div>`;
    document.title = 'Jogo não encontrado — Unholy Games';
    return;
  }

  document.title = `${game.title} — Unholy Games`;

  root.innerHTML = `
    <a class="back-link" href="index.html">← voltar para todos os jogos</a>
    <div class="download-layout">
      <div class="download-cover" style="${game.cover ? `background-image:url('${escapeHtml(game.cover)}')` : ''}">
        ${game.cover ? '' : '<div class="placeholder" style="height:100%;display:flex;align-items:center;justify-content:center;color:#888;font-family:monospace;">Sem capa</div>'}
      </div>
      <div>
        <h1 class="download-title">${escapeHtml(game.title)}</h1>
        <p class="download-desc">${escapeHtml(game.description)}</p>
        <div class="stat-row">
          <div class="stat"><span class="label">Publicado em</span><span class="value">${formatDate(game.createdAt)}</span></div>
          <div class="stat"><span class="label">Downloads</span><span class="value" id="download-count">${game.downloads || 0}</span></div>
          ${game.size ? `<div class="stat"><span class="label">Tamanho</span><span class="value">${escapeHtml(game.size)}</span></div>` : ''}
        </div>
        <button class="btn btn-dark btn-lg btn-block" id="download-btn">⬇️ BAIXAR AGORA</button>
      </div>
    </div>
  `;

  document.getElementById('download-btn').addEventListener('click', () => {
    game.downloads = (game.downloads || 0) + 1;
    const idx = games.findIndex(g => g.id === game.id);
    games[idx] = game;
    saveGames(games);
    document.getElementById('download-count').textContent = game.downloads;

    // Trigger the actual download / redirect to the file's URL.
    const a = document.createElement('a');
    a.href = game.downloadUrl;
    a.setAttribute('download', '');
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast('Download iniciado!');
  });
}

/* ==========================================================================
   ADMIN PAGE
   ========================================================================== */
function initAdminPage() {
  const loginWrap = document.getElementById('login-wrap');
  const shell = document.getElementById('admin-shell');
  if (!loginWrap || !shell) return; // not on admin page

  function showShell() {
    loginWrap.style.display = 'none';
    shell.style.display = 'block';
    renderAll();
  }

  if (isAdminLoggedIn()) showShell();

  const form = document.getElementById('login-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const pass = document.getElementById('login-password').value;
    const err = document.getElementById('login-error');
    if (pass === ADMIN_PASSWORD) {
      sessionStorage.setItem(SS_ADMIN, '1');
      err.classList.remove('show');
      showShell();
    } else {
      err.textContent = 'Senha incorreta. Tente novamente.';
      err.classList.add('show');
    }
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem(SS_ADMIN);
    location.reload();
  });

  /* ---- tab navigation ---- */
  document.querySelectorAll('.admin-nav button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-nav button').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.panel).classList.add('active');
    });
  });

  /* ---- texts panel ---- */
  const textForm = document.getElementById('text-form');
  textForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const content = getContent();
    content.about = document.getElementById('about-input').value;
    content.services = document.getElementById('services-input').value;
    saveContent(content);
    toast('Textos salvos!');
  });

  /* ---- images panel ---- */
  const galleryUrlForm = document.getElementById('gallery-url-form');
  galleryUrlForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('gallery-url-input');
    const url = input.value.trim();
    if (!url) return;
    const gallery = getGallery();
    gallery.push({ id: uniqueId(), src: url });
    saveGallery(gallery);
    input.value = '';
    renderGallery();
    toast('Imagem adicionada!');
  });

  document.getElementById('gallery-file-input').addEventListener('change', (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    let pending = files.length;
    const gallery = getGallery();
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        gallery.push({ id: uniqueId(), src: reader.result });
        pending--;
        if (pending === 0) {
          saveGallery(gallery);
          renderGallery();
          toast('Imagem(ns) adicionada(s)!');
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  });

  /* ---- add game panel ---- */
  const gameForm = document.getElementById('game-form');
  gameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('game-title').value.trim();
    const downloadUrl = document.getElementById('game-download-url').value.trim();
    const description = document.getElementById('game-description').value.trim();
    const cover = document.getElementById('game-cover-url').value.trim();
    const size = document.getElementById('game-size').value.trim();

    if (!title || !downloadUrl) { toast('Preencha ao menos título e link de download.'); return; }

    const games = getGames();
    const game = {
      id: uniqueId(),
      slug: slugify(title),
      title,
      downloadUrl,
      description,
      cover,
      size,
      downloads: 0,
      createdAt: Date.now()
    };
    games.push(game);
    saveGames(games);
    gameForm.reset();
    renderGamesList();
    toast('Jogo publicado! Link único gerado.');

    // switch to the games list tab so the user immediately sees the link
    document.querySelector('.admin-nav button[data-panel="panel-games"]').click();
  });

  renderAll();

  function renderAll() {
    const content = getContent();
    document.getElementById('about-input').value = content.about;
    document.getElementById('services-input').value = content.services;
    renderGallery();
    renderGamesList();
  }

  function renderGallery() {
    const gallery = getGallery();
    const grid = document.getElementById('gallery-grid');
    const content = getContent();

    if (!gallery.length) {
      grid.innerHTML = '<p style="color:#888;font-size:13px;">Nenhuma imagem na galeria ainda.</p>';
    } else {
      grid.innerHTML = gallery.map(img => `
        <div class="gallery-item" data-id="${img.id}">
          <img src="${img.src}" alt="Imagem da galeria" />
          <button class="remove" data-remove="${img.id}" title="Remover">✕</button>
        </div>
      `).join('');
    }

    // selection buttons for about/services images
    ['about', 'services'].forEach(section => {
      const select = document.getElementById(`${section}-image-select`);
      if (!select) return;
      select.innerHTML = '<option value="">— nenhuma —</option>' + gallery.map(img =>
        `<option value="${img.id}">${img.id}</option>`
      ).join('');
      const currentSrc = content[`${section}Image`];
      const match = gallery.find(g => g.src === currentSrc);
      select.value = match ? match.id : '';
      select.onchange = () => {
        const chosen = gallery.find(g => g.id === select.value);
        const c = getContent();
        c[`${section}Image`] = chosen ? chosen.src : '';
        saveContent(c);
        toast('Imagem da seção atualizada!');
      };
    });

    grid.querySelectorAll('button[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.remove;
        const newGallery = getGallery().filter(g => g.id !== id);
        saveGallery(newGallery);
        renderGallery();
        toast('Imagem removida.');
      });
    });
  }

  function renderGamesList() {
    const list = document.getElementById('games-list');
    const games = getGames().sort((a, b) => b.createdAt - a.createdAt);
    const countBadge = document.getElementById('games-total');
    if (countBadge) countBadge.textContent = games.length;

    if (!games.length) {
      list.innerHTML = '<p style="color:#888;font-size:13px;">Nenhum jogo cadastrado ainda.</p>';
      return;
    }

    list.innerHTML = games.map(game => `
      <div class="admin-game-row" data-id="${game.id}">
        <div class="admin-game-info">
          <div class="admin-game-thumb" style="${game.cover ? `background-image:url('${escapeHtml(game.cover)}')` : ''}"></div>
          <div class="txt">
            <div class="t">${escapeHtml(game.title)}</div>
            <span class="link">${downloadLinkFor(game)}</span>
          </div>
        </div>
        <div class="row-actions">
          <button class="btn btn-outline btn-sm" data-copy="${game.id}">🔗 Copiar link</button>
          <button class="btn btn-outline btn-sm" data-delete="${game.id}">🗑️ Excluir</button>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('button[data-copy]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const game = getGames().find(g => g.id === btn.dataset.copy);
        if (!game) return;
        await copyToClipboard(fullUrlFor(game));
        toast('Link copiado para a área de transferência!');
      });
    });

    list.querySelectorAll('button[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!confirm('Excluir este jogo? Esta ação não pode ser desfeita.')) return;
        const games = getGames().filter(g => g.id !== btn.dataset.delete);
        saveGames(games);
        renderGamesList();
        toast('Jogo excluído.');
      });
    });
  }

  /* ---- backup panel ---- */
  document.getElementById('export-btn').addEventListener('click', () => {
    const data = { games: getGames(), content: getContent(), gallery: getGallery(), exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.c
