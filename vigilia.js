/* Vigília das Cinzas: mini game de sobrevivência do Salão do Juramento.
   Heróis, criaturas e cenário próprios da Vigília, que não são do jogo (content.js). */
(() => {
  const S = window.SITE, $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ALVO = 300; // segundos até o amanhecer

  // heróis exclusivos da Vigília (não são do jogo), definidos em content.js
  const HEROIS = S.vigiliaHerois, ESTILO = Object.fromEntries(HEROIS.map(h => [h.nome, h]));
  const FASES = [S.vigiliaFase]; // um cenário só

  // ---------- imagens ----------
  const IMG = {};
  const load = src => IMG[src] || (IMG[src] = new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; }));

  // ---------- estado ----------
  const cv = $('vg-canvas'), cx = cv.getContext('2d');
  let W = 0, H = 0, DPR = 1, raf = 0, G = null, escolhaH = 0, escolhaF = 0, paused = false;
  const key = {}; let joy = null;

  function resize() {
    const r = cv.getBoundingClientRect(); DPR = Math.min(2, window.devicePixelRatio || 1);
    W = r.width; H = r.height; cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); cx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  addEventListener('resize', () => { if (G) resize(); });

  // ---------- tela de escolha ----------
  const heroBox = $('vg-herois'), faseBox = $('vg-fases');
  heroBox.innerHTML = HEROIS.map((h, i) => `<button type="button" data-i="${i}" class="${i ? '' : 'on'}"><img src="${esc(h.img)}" alt="" loading="lazy"><span>${esc(h.nome)}</span></button>`).join('');
  faseBox.innerHTML = FASES.map((f, i) => `<button type="button" data-i="${i}" class="${i ? '' : 'on'}">${esc(f.fase)}</button>`).join('');
  const info = () => { const h = HEROIS[escolhaH]; $('vg-info').innerHTML = `<b>${esc(h.nome)}, ${esc(h.titulo)}</b> · ${esc(h.txt)}`; };
  heroBox.onclick = e => { const b = e.target.closest('button'); if (!b) return; escolhaH = +b.dataset.i; heroBox.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); info(); };
  faseBox.onclick = e => { const b = e.target.closest('button'); if (!b) return; escolhaF = +b.dataset.i; faseBox.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); };
  info();

  // ---------- armas ----------
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
  const UPS = [
    { id: 'dano', nome: 'Fúria das Cinzas', d: '+25% de dano em tudo', f: g => { g.mult *= 1.25; } },
    { id: 'cad', nome: 'Ritmo de Batalha', d: 'Ataques 15% mais rápidos', f: g => { g.cad *= .85; } },
    { id: 'area', nome: 'Alcance Profano', d: '+20% de área e alcance', f: g => { g.area *= 1.2; } },
    { id: 'vel', nome: 'Botas de Cinzas', d: '+10% de velocidade', f: g => { g.p.vel *= 1.1; } },
    { id: 'vida', nome: 'Coração de Brasa', d: '+25 de vida máxima e cura total', f: g => { g.p.hpMax += 25; g.p.hp = g.p.hpMax; } },
    { id: 'ima', nome: 'Ímã de Almas', d: 'Atrai cristais de mais longe', f: g => { g.ima *= 1.45; } },
    { id: 'regen', nome: 'Juramento Vivo', d: 'Recupera vida aos poucos', f: g => { g.regen += 1.2; } },
    { id: 'mais', nome: 'Eco do Juramento', d: 'Sua arma principal fica mais forte', f: g => { const a = g.armas[0]; a.nivel++; if (a.tipo === 'bolt') a.count++; else if (a.tipo === 'orbit') a.n++; else if (a.tipo === 'strike') a.count++; else if (a.tipo === 'aura') a.dps *= 1.3; else if (a.tipo === 'pulse') a.dmg *= 1.35; else if (a.tipo === 'pool') a.dur += 1; } },
    { id: 'w-aura', nome: 'Aura de Brasas', d: 'Nova arma: fogo em volta de você', arma: 'aura', cor: '#ff7a2a' },
    { id: 'w-orbit', nome: 'Lâminas Errantes', d: 'Nova arma: lâminas giratórias', arma: 'orbit', cor: '#c9b2ff' },
    { id: 'w-strike', nome: 'Relâmpago Pálido', d: 'Nova arma: raios do céu', arma: 'strike', cor: '#bfe3ff' },
    { id: 'w-bolt', nome: 'Chama Errante', d: 'Nova arma: chamas que perseguem', arma: 'bolt', cor: '#ffb04a', o: { homing: 1 } }
  ];

  // ---------- início ----------
  $('vg-jogar').onclick = iniciar;
  async function iniciar() {
    const h = HEROIS[escolhaH], fase = FASES[escolhaF], es = ESTILO[h.nome];
    $('vg-menu').hidden = true; $('vg-fim').hidden = true; $('vg-carregando').hidden = false;
    const mobs = fase.criaturas.filter(c => !c.chefe), chefes = fase.criaturas.filter(c => c.chefe);
    const imgs = await Promise.all([load(h.img), load(fase.chao), ...mobs.map(m => load(m.img)), ...chefes.map(m => load(m.img))]);
    $('vg-carregando').hidden = true;
    G = {
      h, fase, t: 0, abates: 0, nivel: 1, xp: 0, prox: 6, mult: 1, cad: 1, area: 1, ima: 1, regen: 0,
      heroImg: imgs[0], chao: imgs[1] ? cx.createPattern(imgs[1], 'repeat') : null,
      mobImgs: mobs.map((m, i) => ({ img: imgs[2 + i], nome: m.nome })), chefes: chefes.map((m, i) => ({ img: imgs[2 + mobs.length + i], nome: m.nome })),
      p: { x: 0, y: 0, hp: 100 + (es.hp || 0), hpMax: 100 + (es.hp || 0), vel: 210 * (1 + (es.vel || 0)), dir: 1, hit: 0 },
      armas: [novaArma(es.arma, es.cor, { homing: es.homing || 0, count: es.count || (es.arma === 'bolt' ? 1 : undefined), pierce: es.pierce || 0, speed: 520 * (es.speed || 1), boom: es.boom || 0, slow: es.slow || 0 })],
      inim: [], proj: [], gemas: [], fx: [], textos: [], spawn: 0, chefeIdx: 0, aviso: null, pegos: new Set()
    };
    $('vg-hud').hidden = false; $('vg-pausa').hidden = false; paused = false;
    resize(); cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(loop);
    cv.focus();
  }

  // ---------- controles ----------
  addEventListener('keydown', e => { if (!G) return; const k = e.key.toLowerCase(); if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault(); key[k] = true; if (k === 'p' || k === 'escape') pausar(); });
  addEventListener('keyup', e => { key[e.key.toLowerCase()] = false; });
  cv.addEventListener('pointerdown', e => { if (!G || paused) return; cv.setPointerCapture(e.pointerId); const r = cv.getBoundingClientRect(); joy = { id: e.pointerId, x0: e.clientX - r.left, y0: e.clientY - r.top, x: 0, y: 0 }; });
  cv.addEventListener('pointermove', e => { if (!joy || e.pointerId !== joy.id) return; const r = cv.getBoundingClientRect(); let dx = e.clientX - r.left - joy.x0, dy = e.clientY - r.top - joy.y0; const m = Math.hypot(dx, dy), max = 60; if (m > max) { dx *= max / m; dy *= max / m; } joy.x = dx / max; joy.y = dy / max; });
  const solta = e => { if (joy && e.pointerId === joy.id) joy = null; };
  cv.addEventListener('pointerup', solta); cv.addEventListener('pointercancel', solta);
  $('vg-pausa').onclick = pausar;
  function pausar() { if (!G || G.fim || $('vg-up').hidden === false) return; paused = !paused; $('vg-pausado').hidden = !paused; if (!paused) { last = performance.now(); raf = requestAnimationFrame(loop); } }
  $('vg-continuar').onclick = pausar;
  $('vg-sair').onclick = () => { paused = false; $('vg-pausado').hidden = true; terminar(false); };
  document.addEventListener('visibilitychange', () => { if (document.hidden && G && !G.fim && !paused && $('vg-up').hidden) pausar(); });

  // ---------- laço ----------
  let last = 0;
  function loop(now) {
    if (!G || paused || G.fim) return;
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if ($('vg-up').hidden) atualizar(dt);
    desenhar();
    raf = requestAnimationFrame(loop);
  }
  const rnd = (a, b) => a + Math.random() * (b - a);
  function maisPerto(x, y, max = 1e9) { let m = null, d = max; for (const e of G.inim) { const k = Math.hypot(e.x - x, e.y - y); if (k < d) { d = k; m = e; } } return m; }
  function ferir(e, dmg, slow = 0) {
    if (e.morto) return; e.hp -= dmg * G.mult; e.flash = .1; if (slow) e.lento = Math.max(e.lento || 0, 1.2);
    G.textos.push({ x: e.x + rnd(-8, 8), y: e.y - e.r, t: .6, v: Math.round(dmg * G.mult) });
    if (e.hp <= 0) { e.morto = true; G.abates++; G.gemas.push({ x: e.x, y: e.y, v: e.chefe ? 25 : 1 + (G.t > 120 ? 1 : 0) });
      for (let i = 0; i < (e.chefe ? 40 : 8); i++) G.fx.push({ x: e.x, y: e.y, vx: rnd(-160, 160), vy: rnd(-160, 160), t: rnd(.3, .7), c: e.chefe ? '#ffb04a' : '#e8833a' }); }
  }
  function atualizar(dt) {
    const g = G, p = g.p; g.t += dt;
    // movimento
    let mx = (key['d'] || key['arrowright'] ? 1 : 0) - (key['a'] || key['arrowleft'] ? 1 : 0), my = (key['s'] || key['arrowdown'] ? 1 : 0) - (key['w'] || key['arrowup'] ? 1 : 0);
    if (joy) { mx = joy.x; my = joy.y; }
    const mm = Math.hypot(mx, my); if (mm > 1) { mx /= mm; my /= mm; }
    p.x += mx * p.vel * dt; p.y += my * p.vel * dt; if (mx) p.dir = mx < 0 ? -1 : 1;
    p.hp = Math.min(p.hpMax, p.hp + g.regen * dt); p.hit = Math.max(0, p.hit - dt);
    // surgimento
    const ritmo = .7 + g.t / 30; g.spawn += ritmo * dt;
    while (g.spawn >= 1 && g.inim.length < 160) { g.spawn--; criarInimigo(false); }
    if (g.t >= (g.chefeIdx + 1) * 60 && g.t < ALVO) { g.chefeIdx++; criarInimigo(true); }
    if (g.t >= ALVO) return terminar(true);
    // inimigos
    for (const e of g.inim) {
      const dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1, v = e.vel * (e.lento > 0 ? .5 : 1);
      e.lento = (e.lento || 0) - dt; e.flash = Math.max(0, (e.flash || 0) - dt); e.fase += dt * 3;
      e.x += dx / d * v * dt + Math.cos(e.fase) * 18 * dt; e.y += dy / d * v * dt + Math.sin(e.fase * 1.3) * 18 * dt;
      if (d < e.r + 22) { p.hp -= e.dano * dt; p.hit = .15; }
    }
    // armas
    for (const a of g.armas) usarArma(a, dt);
    // projéteis
    for (const pr of g.proj) {
      if (pr.homing) { const alvo = maisPerto(pr.x, pr.y, 420); if (alvo) { const ang = Math.atan2(alvo.y - pr.y, alvo.x - pr.x); const cur = Math.atan2(pr.vy, pr.vx); let da = ang - cur; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI; const n = cur + Math.max(-5 * dt, Math.min(5 * dt, da)); const sp = Math.hypot(pr.vx, pr.vy); pr.vx = Math.cos(n) * sp; pr.vy = Math.sin(n) * sp; } }
      pr.x += pr.vx * dt; pr.y += pr.vy * dt; pr.t -= dt;
      for (const e of g.inim) { if (e.morto || pr.hits.has(e)) continue; if (Math.hypot(e.x - pr.x, e.y - pr.y) < e.r + 8) {
        pr.hits.add(e); ferir(e, pr.dmg, pr.slow);
        if (pr.boom) { for (const o of g.inim) if (o !== e && Math.hypot(o.x - pr.x, o.y - pr.y) < pr.boom * g.area) ferir(o, pr.dmg * .6); g.fx.push({ ring: 1, x: pr.x, y: pr.y, r: pr.boom * g.area, t: .3, c: pr.cor }); }
        if (pr.pierce-- <= 0) { pr.t = 0; break; } } }
    }
    g.proj = g.proj.filter(pr => pr.t > 0);
    g.inim = g.inim.filter(e => !e.morto && Math.hypot(e.x - p.x, e.y - p.y) < 1600);
    // cristais
    const ima = 90 * g.ima;
    for (const c of g.gemas) { const d = Math.hypot(p.x - c.x, p.y - c.y); if (d < ima) { c.x += (p.x - c.x) / d * 420 * dt; c.y += (p.y - c.y) / d * 420 * dt; } if (d < 22) { c.pego = true; g.xp += c.v; } }
    g.gemas = g.gemas.filter(c => !c.pego);
    if (g.xp >= g.prox) { g.xp -= g.prox; g.nivel++; g.prox = Math.round(g.prox * 1.28 + 2); mostrarUpgrades(); }
    // efeitos
    for (const f of g.fx) { f.t -= dt; if (!f.ring) { f.x += f.vx * dt; f.y += f.vy * dt; } }
    g.fx = g.fx.filter(f => f.t > 0); g.textos.forEach(t => { t.t -= dt; t.y -= 30 * dt; }); g.textos = g.textos.filter(t => t.t > 0);
    if (g.aviso) { g.aviso.t -= dt; if (g.aviso.t <= 0) g.aviso = null; }
    if (p.hp <= 0) terminar(false);
    hud();
  }
  function criarInimigo(chefe) {
    const g = G, ang = rnd(0, Math.PI * 2), dist = Math.hypot(W, H) / 2 + 80;
    if (chefe) { const c = g.chefes[(g.chefeIdx - 1) % g.chefes.length];
      g.inim.push({ chefe: 1, img: c.img, nome: c.nome, x: g.p.x + Math.cos(ang) * dist, y: g.p.y + Math.sin(ang) * dist, r: Math.min(70, W * .14), tam: Math.min(190, W * .38), hp: 650 * (1 + g.t / 90), hpMax: 650 * (1 + g.t / 90), vel: 62 + g.t / 10, dano: 26, fase: 0 });
      g.aviso = { txt: 'Chefe: ' + c.nome, t: 3 }; return; }
    const m = g.mobImgs[Math.floor(Math.random() * g.mobImgs.length)], forte = 1 + g.t / 55;
    g.inim.push({ img: m.img, x: g.p.x + Math.cos(ang) * dist, y: g.p.y + Math.sin(ang) * dist, r: 22, tam: rnd(58, 74), hp: 11 * forte, hpMax: 11 * forte, vel: rnd(66, 100) + g.t * .35, dano: 7 + g.t / 18, fase: rnd(0, 6) });
  }
  function usarArma(a, dt) {
    const g = G, p = g.p; a.t -= dt;
    if (a.tipo === 'bolt' && a.t <= 0) {
      const alvo = maisPerto(p.x, p.y, 640); if (!alvo) return; a.t = a.cd * g.cad;
      const base = Math.atan2(alvo.y - p.y, alvo.x - p.x);
      for (let i = 0; i < a.count; i++) { const ang = base + (i - (a.count - 1) / 2) * .16;
        g.proj.push({ x: p.x, y: p.y - 20, vx: Math.cos(ang) * a.speed, vy: Math.sin(ang) * a.speed, t: 1.4, dmg: a.dmg, pierce: a.pierce, homing: a.homing, boom: a.boom, slow: a.slow, cor: a.cor, hits: new Set() }); }
    } else if (a.tipo === 'aura') {
      const r = a.r * g.area; a.pulso = (a.pulso || 0) + dt;
      if (a.pulso > .25) { a.pulso = 0; for (const e of g.inim) if (Math.hypot(e.x - p.x, e.y - p.y) < r + e.r * .5) ferir(e, a.dps * .25, a.slow); }
    } else if (a.tipo === 'orbit') {
      a.ang = (a.ang || 0) + a.rot * dt; a.tick = (a.tick || 0) - dt; const r = a.r * g.area;
      if (a.tick <= 0) { a.tick = .18 * g.cad; for (let i = 0; i < a.n; i++) { const an = a.ang + i * Math.PI * 2 / a.n, bx = p.x + Math.cos(an) * r, by = p.y + Math.sin(an) * r;
        for (const e of g.inim) if (Math.hypot(e.x - bx, e.y - by) < e.r + 18) ferir(e, a.dmg * .5); } }
    } else if (a.tipo === 'strike' && a.t <= 0) {
      a.t = a.cd * g.cad; const vivos = g.inim.filter(e => Math.hypot(e.x - p.x, e.y - p.y) < 520);
      for (let i = 0; i < a.count && vivos.length; i++) { const e = vivos.splice(Math.floor(Math.random() * vivos.length), 1)[0];
        for (const o of g.inim) if (Math.hypot(o.x - e.x, o.y - e.y) < a.r * g.area) ferir(o, a.dmg);
        g.fx.push({ raio: 1, x: e.x, y: e.y, t: .35, c: a.cor, r: a.r * g.area }); }
    } else if (a.tipo === 'pulse' && a.t <= 0) {
      a.t = a.cd * g.cad; const r = a.r * g.area;
      for (const e of g.inim) if (Math.hypot(e.x - p.x, e.y - p.y) < r) ferir(e, a.dmg);
      g.fx.push({ ring: 1, x: p.x, y: p.y, r, t: .45, c: a.cor });
    } else if (a.tipo === 'pool') {
      if (a.t <= 0) { const alvo = maisPerto(p.x, p.y, 520); if (alvo) { a.t = a.cd * g.cad; (a.poças = a.poças || []).push({ x: alvo.x, y: alvo.y, t: a.dur }); } }
      a.tick = (a.tick || 0) - dt; const r = a.r * g.area;
      for (const pc of a.poças || []) pc.t -= dt; a.poças = (a.poças || []).filter(pc => pc.t > 0);
      if (a.tick <= 0) { a.tick = .3; for (const pc of a.poças) for (const e of g.inim) if (Math.hypot(e.x - pc.x, e.y - pc.y) < r) ferir(e, a.dps * .3, .2); }
    }
  }

  // ---------- desenho ----------
  function desenhar() {
    const g = G, p = g.p; cx.save(); cx.clearRect(0, 0, W, H);
    const ox = W / 2 - p.x, oy = H / 2 - p.y;
    if (g.chao) { cx.save(); cx.translate(ox % 256, oy % 256); cx.fillStyle = g.chao; cx.fillRect(-256, -256, W + 512, H + 512); cx.restore(); } else { cx.fillStyle = '#1a1210'; cx.fillRect(0, 0, W, H); }
    cx.fillStyle = 'rgba(12,10,9,.35)'; cx.fillRect(0, 0, W, H);
    cx.translate(ox, oy);
    // poças e auras
    for (const a of g.armas) {
      if (a.tipo === 'aura') { const r = a.r * g.area, gr = cx.createRadialGradient(p.x, p.y, r * .2, p.x, p.y, r); gr.addColorStop(0, hexA(a.cor, .05)); gr.addColorStop(.8, hexA(a.cor, .22)); gr.addColorStop(1, hexA(a.cor, 0)); cx.fillStyle = gr; cx.beginPath(); cx.arc(p.x, p.y, r, 0, 7); cx.fill();
        cx.strokeStyle = hexA(a.cor, .6); cx.lineWidth = 2; cx.setLineDash([10, 8]); cx.lineDashOffset = -g.t * 40; cx.beginPath(); cx.arc(p.x, p.y, r, 0, 7); cx.stroke(); cx.setLineDash([]); }
      if (a.tipo === 'pool') for (const pc of a.poças || []) { const r = a.r * g.area, gr = cx.createRadialGradient(pc.x, pc.y, 4, pc.x, pc.y, r); gr.addColorStop(0, hexA(a.cor, .45)); gr.addColorStop(1, hexA(a.cor, 0)); cx.fillStyle = gr; cx.beginPath(); cx.ellipse(pc.x, pc.y, r, r * .6, 0, 0, 7); cx.fill(); }
    }
    // cristais
    for (const c of g.gemas) { cx.save(); cx.translate(c.x, c.y); cx.rotate(Math.PI / 4); cx.fillStyle = c.v > 5 ? '#ffd27a' : '#e05a3a'; cx.shadowColor = '#ff7a3a'; cx.shadowBlur = 10; cx.fillRect(-5, -5, 10, 10); cx.restore(); }
    // inimigos
    const ord = g.inim.slice().sort((a, b) => a.y - b.y);
    for (const e of ord) {
      const s = e.tam, img = e.img; cx.save(); cx.translate(e.x, e.y); if (e.x > p.x) cx.scale(-1, 1);
      if (e.chefe) { cx.shadowColor = '#c22a2d'; cx.shadowBlur = 30; }
      if (img) { const k = s / Math.max(img.width, img.height); cx.globalAlpha = 1; cx.drawImage(img, -img.width * k / 2, -img.height * k / 2, img.width * k, img.height * k); if (e.flash > 0) { cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = .6; cx.drawImage(img, -img.width * k / 2, -img.height * k / 2, img.width * k, img.height * k); } }
      else { cx.fillStyle = '#7a2a2a'; cx.beginPath(); cx.arc(0, 0, e.r, 0, 7); cx.fill(); }
      cx.restore();
      if (e.chefe) { const w = 120; cx.fillStyle = 'rgba(0,0,0,.7)'; cx.fillRect(e.x - w / 2, e.y - s / 2 - 16, w, 7); cx.fillStyle = '#b030d0'; cx.fillRect(e.x - w / 2, e.y - s / 2 - 16, w * Math.max(0, e.hp / e.hpMax), 7); }
    }
    // herói
    cx.save(); cx.translate(p.x, p.y); cx.fillStyle = 'rgba(0,0,0,.45)'; cx.beginPath(); cx.ellipse(0, 26, 22, 7, 0, 0, 7); cx.fill();
    if (g.heroImg) { const hh = 84, k = hh / g.heroImg.height, ww = g.heroImg.width * k; cx.scale(p.dir, 1); cx.translate(0, Math.sin(g.t * 9) * (Math.abs(key.d || key.a || key.w || key.s || joy ? 1 : 0)) * 1.5);
      cx.shadowColor = 'rgba(194,42,45,.8)'; cx.shadowBlur = 16; cx.drawImage(g.heroImg, -ww / 2, -hh / 2 - 6, ww, hh);
      if (p.hit > 0) { cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = .5; cx.drawImage(g.heroImg, -ww / 2, -hh / 2 - 6, ww, hh); } }
    cx.restore();
    // lâminas
    for (const a of g.armas) if (a.tipo === 'orbit') { const r = a.r * g.area; for (let i = 0; i < a.n; i++) { const an = a.ang + i * Math.PI * 2 / a.n; cx.save(); cx.translate(p.x + Math.cos(an) * r, p.y + Math.sin(an) * r); cx.rotate(an * 3); cx.fillStyle = a.cor; cx.shadowColor = a.cor; cx.shadowBlur = 14; cx.beginPath(); cx.moveTo(0, -14); cx.lineTo(5, 0); cx.lineTo(0, 14); cx.lineTo(-5, 0); cx.closePath(); cx.fill(); cx.restore(); } }
    // projéteis
    for (const pr of g.proj) { cx.save(); cx.translate(pr.x, pr.y); cx.rotate(Math.atan2(pr.vy, pr.vx)); cx.shadowColor = pr.cor; cx.shadowBlur = 14; cx.fillStyle = pr.cor;
      if (pr.pierce > 1) { cx.fillRect(-16, -2, 32, 4); } else { cx.beginPath(); cx.ellipse(0, 0, pr.boom ? 10 : 8, pr.boom ? 8 : 5, 0, 0, 7); cx.fill(); cx.globalAlpha = .4; cx.beginPath(); cx.ellipse(-10, 0, 10, 3, 0, 0, 7); cx.fill(); } cx.restore(); }
    // efeitos
    for (const f of g.fx) {
      if (f.ring) { cx.strokeStyle = hexA(f.c, Math.min(1, f.t * 3)); cx.lineWidth = 4; cx.beginPath(); cx.arc(f.x, f.y, f.r * (1 - f.t), 0, 7); cx.stroke(); }
      else if (f.raio) { cx.fillStyle = hexA(f.c, f.t * 2.4); cx.fillRect(f.x - 7, f.y - 600, 14, 600); cx.beginPath(); cx.arc(f.x, f.y, f.r * (1.2 - f.t), 0, 7); cx.strokeStyle = hexA(f.c, f.t * 2.4); cx.lineWidth = 3; cx.stroke(); }
      else { cx.fillStyle = hexA(f.c, Math.min(1, f.t * 2)); cx.fillRect(f.x - 2, f.y - 2, 4, 4); }
    }
    cx.font = '600 15px Georgia, serif'; cx.textAlign = 'center';
    for (const t of g.textos) { cx.fillStyle = `rgba(255,235,200,${Math.min(1, t.t * 2)})`; cx.fillText(t.v, t.x, t.y); }
    cx.restore();
    // vinheta e aviso
    const vg = cx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .35, W / 2, H / 2, Math.max(W, H) * .75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, p.hit > 0 ? 'rgba(120,0,0,.55)' : 'rgba(0,0,0,.6)'); cx.fillStyle = vg; cx.fillRect(0, 0, W, H);
    if (g.aviso) { cx.save(); cx.globalAlpha = Math.min(1, g.aviso.t); cx.fillStyle = '#e04b3c'; cx.font = `${Math.round(Math.min(W, 900) / 18)}px "Pirata One", serif`; cx.textAlign = 'center'; cx.shadowColor = '#000'; cx.shadowBlur = 12; cx.fillText(g.aviso.txt, W / 2, H * .22); cx.restore(); }
    if (joy) { cx.save(); cx.globalAlpha = .5; cx.strokeStyle = '#c79a4f'; cx.lineWidth = 2; cx.beginPath(); cx.arc(joy.x0, joy.y0, 60, 0, 7); cx.stroke(); cx.fillStyle = '#c22a2d'; cx.beginPath(); cx.arc(joy.x0 + joy.x * 60, joy.y0 + joy.y * 60, 22, 0, 7); cx.fill(); cx.restore(); }
  }
  function hexA(h, a) { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${Math.max(0, Math.min(1, a))})`; }
  function hud() {
    const g = G, s = Math.floor(g.t), falta = Math.max(0, ALVO - s);
    $('vg-tempo').textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    $('vg-amanhecer').textContent = `Amanhecer em ${Math.floor(falta / 60)}:${String(falta % 60).padStart(2, '0')}`;
    $('vg-abates').textContent = g.abates; $('vg-nivel').textContent = g.nivel;
    $('vg-vida').style.width = Math.max(0, g.p.hp / g.p.hpMax * 100) + '%'; $('vg-xp').style.width = Math.min(100, g.xp / g.prox * 100) + '%';
  }

  // ---------- subida de nível ----------
  function mostrarUpgrades() {
    const g = G, temArma = t => g.armas.some(a => a.tipo === t);
    const pool = UPS.filter(u => !u.arma || (!temArma(u.arma) && g.armas.length < 3));
    const pick = []; while (pick.length < 3 && pool.length) pick.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    const box = $('vg-up'); box.querySelector('h3').textContent = `Nível ${g.nivel}`;
    box.querySelector('.ups').innerHTML = pick.map((u, i) => `<button type="button" data-i="${i}"><b>${esc(u.nome)}</b><span>${esc(u.d)}</span></button>`).join('');
    box.hidden = false; joy = null; Object.keys(key).forEach(k => key[k] = false);
    box.querySelector('.ups').onclick = e => { const b = e.target.closest('button'); if (!b) return; const u = pick[+b.dataset.i];
      if (u.arma) g.armas.push(novaArma(u.arma, u.cor, u.o || {})); else u.f(g);
      box.hidden = true; last = performance.now(); };
    setTimeout(() => box.querySelector('button')?.focus(), 30);
  }

  // ---------- fim ----------
  function terminar(venceu) {
    const g = G; if (!g || g.fim) return; g.fim = true; g.aviso = null; cancelAnimationFrame(raf); desenhar();
    const tempo = Math.min(ALVO, Math.floor(g.t)), pontos = tempo * 10 + g.abates;
    $('vg-hud').hidden = true; $('vg-pausa').hidden = true; $('vg-up').hidden = true;
    const fim = $('vg-fim'); fim.hidden = false; fim.classList.toggle('venceu', venceu);
    $('vg-fim-tit').textContent = venceu ? 'O amanhecer chegou.' : 'Você caiu.';
    $('vg-fim-sub').textContent = venceu ? `${g.h.nome} sobreviveu à vigília inteira no ${g.fase.fase}.` : `${g.h.nome} resistiu ${Math.floor(tempo / 60)}min ${tempo % 60}s no ${g.fase.fase}.`;
    $('vg-fim-pts').textContent = pontos.toLocaleString('pt-BR'); $('vg-fim-abates').textContent = g.abates; $('vg-fim-nivel').textContent = g.nivel;
    $('vg-envio').hidden = false; $('vg-enviado').textContent = '';
    if (window.SALAO.nick()) $('vg-enviar').textContent = `Enviar como ${window.SALAO.nick()}`;
    G.final = { tempo, abates: g.abates, pontos, heroi: g.h.nome };
  }
  $('vg-denovo').onclick = iniciar;
  const box = $('vg');
  $('vg-cheia').onclick = async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else { await box.requestFullscreen(); try { await screen.orientation.lock('landscape'); } catch (e) { } } } catch (e) { box.classList.toggle('cheia'); } setTimeout(() => { if (G) resize(); }, 200); };
  document.addEventListener('fullscreenchange', () => setTimeout(() => { if (G) resize(); }, 150));
  $('vg-trocar').onclick = () => { $('vg-fim').hidden = true; $('vg-menu').hidden = false; G = null; cx.clearRect(0, 0, W, H); };
  $('vg-form').onsubmit = async e => {
    e.preventDefault(); const f = G && G.final; if (!f) return;
    const nick = window.SALAO.nick(); if (!nick) { $('vg-enviado').textContent = 'Primeiro diga seu nome do chat no topo da página.'; window.SALAO.pedirNick(); return; }
    if (!window.SALAO.aberto()) { $('vg-enviado').textContent = 'O Salão fechou. O ranking só aceita partidas durante a live.'; return; }
    $('vg-enviar').disabled = true; $('vg-enviado').textContent = 'Enviando...';
    try { const r = await window.SALAO.rpc('enviar_vigilia', { p_nick: nick, p_heroi: f.heroi, p_tempo: f.tempo, p_abates: f.abates });
      $('vg-enviado').textContent = `Você está em ${r.posicao}º no ranking.`; $('vg-envio').hidden = true; window.SALAO.ranking(); }
    catch (err) { $('vg-enviado').textContent = /salao_fechado/.test(err.message) ? 'O Salão fechou. O ranking só aceita partidas durante a live.' : /nick_/.test(err.message) ? 'Esse nome não pode ser usado. Troque no topo da página.' : 'Não foi possível enviar agora. Tente de novo.'; }
    finally { $('vg-enviar').disabled = false; }
  };
  $('vg-compartilhar').onclick = () => { const f = G && G.final; if (!f) return; window.SALAO.compartilhar(`Fiz ${f.pontos.toLocaleString('pt-BR')} pontos na Vigília das Cinzas de Ashem Vow com ${f.heroi}. Consegue me passar?`, location.origin + location.pathname + '#vigilia'); };
  // teste automatizado
  window.__vigilia = { estado: () => G, iniciar, terminar };
})();
