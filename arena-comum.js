/* Arena cooperativa da Vigília: peças usadas pela tela da live (arena.js) e pelo celular (arena-jogador.js). */
(() => {
  const S = window.SITE;
  const MUNDO = { w: 1920, h: 1080 };
  const VAGAS = S.vigiliaHerois.length; // uma vaga por vigia
  const ALVO = 300;
  const CRIAT = S.vigiliaFase.criaturas; // 0..4 criaturas, 5..7 chefes
  const MOBS = CRIAT.map((c, i) => i).filter(i => !CRIAT[i].chefe), CHEFES = CRIAT.map((c, i) => i).filter(i => CRIAT[i].chefe);

  function novaArma(tipo, cor, o = {}) {
    const base = {
      bolt: { dmg: 12, cd: .75, count: 1, pierce: 0, speed: 520, homing: 0, boom: 0, slow: 0 },
      aura: { dps: 26, r: 95, slow: 0 },
      orbit: { n: 3, r: 85, dmg: 16, rot: 3.2 },
      strike: { cd: 1.6, dmg: 46, r: 55, count: 1 },
      pulse: { cd: 2.2, dmg: 30, r: 190 },
      pool: { cd: 2.0, dps: 34, r: 70, dur: 3.2 }
    }[tipo];
    return Object.assign({ tipo, cor, t: 0, nivel: 1 }, base, Object.fromEntries(Object.entries(o).filter(([, x]) => x !== undefined)));
  }
  function armaDoHeroi(h) {
    return novaArma(h.arma, h.cor, { homing: h.homing || 0, count: h.count, pierce: h.pierce || 0, speed: 520 * (h.speed || 1), boom: h.boom || 0, slow: h.slow || 0 });
  }
  // melhorias da arena (sem cristais: o XP é do time)
  const UPS = [
    { id: 'dano', nome: 'Fúria das Cinzas', d: '+25% de dano em tudo', f: p => { p.mult *= 1.25; } },
    { id: 'cad', nome: 'Ritmo de Batalha', d: 'Ataques 15% mais rápidos', f: p => { p.cad *= .85; } },
    { id: 'area', nome: 'Alcance Profano', d: '+20% de área e alcance', f: p => { p.area *= 1.2; } },
    { id: 'vel', nome: 'Botas de Cinzas', d: '+10% de velocidade', f: p => { p.vel *= 1.1; } },
    { id: 'vida', nome: 'Coração de Brasa', d: '+25 de vida máxima e cura total', f: p => { p.hpMax += 25; p.hp = p.hpMax; } },
    { id: 'regen', nome: 'Juramento Vivo', d: 'Recupera vida aos poucos', f: p => { p.regen += 1.2; } },
    { id: 'mais', nome: 'Eco do Juramento', d: 'Sua arma principal fica mais forte', f: p => { const a = p.armas[0]; a.nivel++; if (a.tipo === 'bolt') a.count++; else if (a.tipo === 'orbit') a.n++; else if (a.tipo === 'strike') a.count++; else if (a.tipo === 'aura') a.dps *= 1.3; else if (a.tipo === 'pulse') a.dmg *= 1.35; else if (a.tipo === 'pool') a.dur += 1; } },
    { id: 'w-aura', nome: 'Aura de Brasas', d: 'Nova arma: fogo em volta de você', arma: 'aura', cor: '#ff7a2a' },
    { id: 'w-orbit', nome: 'Lâminas Errantes', d: 'Nova arma: lâminas giratórias', arma: 'orbit', cor: '#c9b2ff' },
    { id: 'w-strike', nome: 'Relâmpago Pálido', d: 'Nova arma: raios do céu', arma: 'strike', cor: '#bfe3ff' },
    { id: 'w-bolt', nome: 'Chama Errante', d: 'Nova arma: chamas que perseguem', arma: 'bolt', cor: '#ffb04a', o: { homing: 1 } }
  ];
  // sorteia 3 melhorias possíveis para quem tem estas armas (tipos)
  function opcoes(tipos) {
    const pool = UPS.filter(u => !u.arma || (!tipos.includes(u.arma) && tipos.length < 3));
    const pick = []; while (pick.length < 3 && pool.length) pick.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    return pick;
  }

  // ---------- imagens ----------
  const IMG = {};
  const carregar = src => IMG[src] || (IMG[src] = new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; }));
  async function carregarTudo() {
    const [chao, ...resto] = await Promise.all([carregar(S.vigiliaFase.chao), ...S.vigiliaHerois.map(h => carregar(h.img)), ...CRIAT.map(c => carregar(c.img))]);
    return { chao, herois: resto.slice(0, VAGAS), criat: resto.slice(VAGAS) };
  }

  // ---------- desenho ----------
  const hexA = (h, a) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${Math.max(0, Math.min(1, a))})`; };
  const tamMob = id => 58 + (id * 7919 % 17); // tamanho estável por inimigo
  function chao(cx, img, cache) {
    if (img && !cache.p) cache.p = cx.createPattern(img, 'repeat');
    cx.fillStyle = cache.p || '#1a1210'; cx.fillRect(0, 0, MUNDO.w, MUNDO.h);
    cx.fillStyle = 'rgba(12,10,9,.3)'; cx.fillRect(0, 0, MUNDO.w, MUNDO.h);
    // muro do cemitério
    cx.strokeStyle = 'rgba(199,154,79,.45)'; cx.lineWidth = 6; cx.strokeRect(3, 3, MUNDO.w - 6, MUNDO.h - 6);
    const g = cx.createLinearGradient(0, 0, 0, 60); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); cx.fillStyle = g; cx.fillRect(0, 0, MUNDO.w, 60);
  }
  function sprite(cx, img, x, y, tam, vira, brilho, flash) {
    if (!img) { cx.fillStyle = '#7a2a2a'; cx.beginPath(); cx.arc(x, y, tam / 3, 0, 7); cx.fill(); return; }
    const k = tam / Math.max(img.width, img.height), w = img.width * k, h = img.height * k;
    cx.save(); cx.translate(x, y); if (vira) cx.scale(-1, 1); if (brilho) { cx.shadowColor = brilho; cx.shadowBlur = 26; }
    cx.drawImage(img, -w / 2, -h / 2, w, h);
    if (flash) { cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = .55; cx.drawImage(img, -w / 2, -h / 2, w, h); }
    cx.restore();
  }
  function heroi(cx, img, x, y, dir, t, andando, ferido, morto, cor) {
    cx.save(); cx.translate(x, y);
    cx.fillStyle = 'rgba(0,0,0,.45)'; cx.beginPath(); cx.ellipse(0, 30, 24, 8, 0, 0, 7); cx.fill();
    if (morto) cx.globalAlpha = .35;
    if (img) { const hh = 88, k = hh / img.height, ww = img.width * k; cx.scale(dir || 1, 1); cx.translate(0, andando ? Math.sin(t * 9) * 1.6 : 0);
      cx.shadowColor = cor || 'rgba(194,42,45,.8)'; cx.shadowBlur = 18; cx.drawImage(img, -ww / 2, -hh / 2 - 6, ww, hh);
      if (ferido) { cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = .5; cx.drawImage(img, -ww / 2, -hh / 2 - 6, ww, hh); } }
    cx.restore();
  }
  function rotulo(cx, txt, x, y, eu, vida) {
    cx.save(); cx.font = `600 ${eu ? 17 : 15}px Georgia, serif`; cx.textAlign = 'center';
    const w = cx.measureText(txt).width + 14;
    cx.fillStyle = eu ? 'rgba(155,28,31,.9)' : 'rgba(12,10,9,.78)'; cx.fillRect(x - w / 2, y - 18, w, 22);
    cx.strokeStyle = eu ? '#ffd27a' : 'rgba(199,154,79,.6)'; cx.lineWidth = 1; cx.strokeRect(x - w / 2 + .5, y - 17.5, w - 1, 21);
    cx.fillStyle = '#f3e7d2'; cx.fillText(txt, x, y - 2);
    if (vida != null) { cx.fillStyle = 'rgba(0,0,0,.75)'; cx.fillRect(x - 30, y + 6, 60, 6); cx.fillStyle = vida > .35 ? '#d63a35' : '#ff9a3a'; cx.fillRect(x - 30, y + 6, 60 * Math.max(0, vida), 6); }
    cx.restore();
  }
  // auras e lâminas a partir da descrição compacta das armas [tipo, cor, n]
  function armasVisuais(cx, x, y, w, area, t, fase) {
    for (const a of w || []) {
      if (a[0] === 'aura') { const r = 95 * area, gr = cx.createRadialGradient(x, y, r * .2, x, y, r); gr.addColorStop(0, hexA(a[1], .05)); gr.addColorStop(.8, hexA(a[1], .22)); gr.addColorStop(1, hexA(a[1], 0)); cx.fillStyle = gr; cx.beginPath(); cx.arc(x, y, r, 0, 7); cx.fill();
        cx.strokeStyle = hexA(a[1], .6); cx.lineWidth = 2; cx.setLineDash([10, 8]); cx.lineDashOffset = -t * 40; cx.beginPath(); cx.arc(x, y, r, 0, 7); cx.stroke(); cx.setLineDash([]); }
      if (a[0] === 'orbit') { const r = 85 * area, n = a[2] || 3, base = t * 3.2 + (fase || 0); for (let i = 0; i < n; i++) { const an = base + i * Math.PI * 2 / n; cx.save(); cx.translate(x + Math.cos(an) * r, y + Math.sin(an) * r); cx.rotate(an * 3); cx.fillStyle = a[1]; cx.shadowColor = a[1]; cx.shadowBlur = 14; cx.beginPath(); cx.moveTo(0, -14); cx.lineTo(5, 0); cx.lineTo(0, 14); cx.lineTo(-5, 0); cx.closePath(); cx.fill(); cx.restore(); } }
    }
  }
  // efeitos que a tela da live manda: tiros, raios, pulsos, poças, mortes
  function novoEfeito(f) {
    const [k] = f;
    if (k === 'b') return { k, x: f[1], y: f[2], vx: Math.cos(f[3]) * f[4], vy: Math.sin(f[3]) * f[4], t: f[5], c: f[6], g: f[7], h: f[8] };
    if (k === 's') return { k, x: f[1], y: f[2], r: f[3], c: f[4], t: .35 };
    if (k === 'p') return { k, x: f[1], y: f[2], r: f[3], c: f[4], t: .45 };
    if (k === 'o') return { k, x: f[1], y: f[2], r: f[3], c: f[5], t: f[4], tot: f[4] };
    if (k === 'k') { const ps = []; for (let i = 0; i < (f[3] ? 40 : 8); i++) ps.push({ x: f[1], y: f[2], vx: (Math.random() - .5) * 320, vy: (Math.random() - .5) * 320, t: .3 + Math.random() * .4 }); return { k, ps, c: f[3] ? '#ffb04a' : '#e8833a', t: .7 }; }
    return null;
  }
  function passoEfeitos(lista, dt) {
    for (const e of lista) { e.t -= dt; if (e.k === 'b') { e.x += e.vx * dt; e.y += e.vy * dt; } if (e.k === 'k') for (const p of e.ps) { p.t -= dt; p.x += p.vx * dt; p.y += p.vy * dt; } }
    return lista.filter(e => e.t > 0);
  }
  function desenharChao(cx, lista) {
    for (const e of lista) if (e.k === 'o') { const a = Math.min(1, e.t / .5), gr = cx.createRadialGradient(e.x, e.y, 4, e.x, e.y, e.r); gr.addColorStop(0, hexA(e.c, .45 * a)); gr.addColorStop(1, hexA(e.c, 0)); cx.fillStyle = gr; cx.beginPath(); cx.ellipse(e.x, e.y, e.r, e.r * .6, 0, 0, 7); cx.fill(); }
  }
  function desenharEfeitos(cx, lista) {
    for (const e of lista) {
      if (e.k === 'b') { cx.save(); cx.translate(e.x, e.y); cx.rotate(Math.atan2(e.vy, e.vx)); cx.shadowColor = e.c; cx.shadowBlur = 14; cx.fillStyle = e.c;
        if (e.g === 2) cx.fillRect(-16, -2, 32, 4); else { cx.beginPath(); cx.ellipse(0, 0, e.g === 1 ? 10 : 8, e.g === 1 ? 8 : 5, 0, 0, 7); cx.fill(); cx.globalAlpha = .4; cx.beginPath(); cx.ellipse(-10, 0, 10, 3, 0, 0, 7); cx.fill(); } cx.restore(); }
      else if (e.k === 's') { cx.fillStyle = hexA(e.c, e.t * 2.4); cx.fillRect(e.x - 7, e.y - 600, 14, 600); cx.beginPath(); cx.arc(e.x, e.y, e.r * (1.2 - e.t), 0, 7); cx.strokeStyle = hexA(e.c, e.t * 2.4); cx.lineWidth = 3; cx.stroke(); }
      else if (e.k === 'p') { cx.strokeStyle = hexA(e.c, Math.min(1, e.t * 3)); cx.lineWidth = 4; cx.beginPath(); cx.arc(e.x, e.y, e.r * (1 - e.t / .45), 0, 7); cx.stroke(); }
      else if (e.k === 'k') for (const p of e.ps) if (p.t > 0) { cx.fillStyle = hexA(e.c, Math.min(1, p.t * 2)); cx.fillRect(p.x - 2, p.y - 2, 4, 4); }
    }
  }
  function barraChefe(cx, x, y, tam, frac) { const w = 140; cx.fillStyle = 'rgba(0,0,0,.7)'; cx.fillRect(x - w / 2, y - tam / 2 - 16, w, 8); cx.fillStyle = '#b030d0'; cx.fillRect(x - w / 2, y - tam / 2 - 16, w * Math.max(0, frac), 8); }
  const tempo = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s) % 60).padStart(2, '0')}`;

  window.ARENA = { MUNDO, VAGAS, ALVO, CRIAT, MOBS, CHEFES, novaArma, armaDoHeroi, UPS, opcoes, carregarTudo, hexA, tamMob, chao, sprite, heroi, rotulo, armasVisuais, novoEfeito, passoEfeitos, desenharChao, desenharEfeitos, barraChefe, tempo };
})();
