/* Arena da Vigília · tela da live. Esta página comanda a partida: cria as criaturas, resolve os golpes
   de todos os vigias e manda o estado do mundo para os celulares 4 vezes por segundo. */
(() => {
  const S = window.SITE, I = S.inscricao, A = window.ARENA, $ = id => document.getElementById(id);
  const HER = S.vigiliaHerois, { MUNDO, VAGAS, ALVO, CRIAT, MOBS, CHEFES } = A;
  const ls = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { } } };
  const rpc = async (n, b, keep) => { const r = await fetch(`${I.supabaseUrl}/rest/v1/rpc/${n}`, { method: 'POST', keepalive: !!keep, headers: { apikey: I.supabaseKey, 'Content-Type': 'application/json' }, body: JSON.stringify(b || {}) }); const t = await r.text(); if (!r.ok) throw new Error(t); return t ? JSON.parse(t) : null; };
  const rnd = (a, b) => a + Math.random() * (b - a), cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const cv = $('cv'), cx = cv.getContext('2d');

  // ---------- palco: 1920x1080 encaixado na janela ----------
  function encaixar() { const k = Math.min(innerWidth / 1920, innerHeight / 1080); $('palco').style.transform = `translate(-50%,-50%) scale(${k})`; }
  addEventListener('resize', encaixar); encaixar();
  let mexeu = 0; addEventListener('mousemove', () => { $('ctrl').classList.remove('some'); clearTimeout(mexeu); mexeu = setTimeout(() => $('ctrl').classList.add('some'), 3000); });

  // ---------- estado ----------
  let codigo = ls.get('salao-admin') || '', sala = null, aberto = false, sessao = 0, mundo = null, IM = null, conectado = false, msgs = 0;
  const cacheChao = {};
  const P = new Array(VAGAS).fill(null); // jogadores por vaga (vaga = vigia)
  let G = novoMundo();
  function novoMundo() { return { estado: 'espera', t: 0, cont: 0, fimT: 0, nivel: 1, xp: 0, prox: 8, abates: 0, inim: [], proj: [], fila: [], vis: [], aviso: null, chefeIdx: 0, spawn: 0, id: 1, res: null }; }
  const presentes = () => P.filter(Boolean), vivos = () => P.filter(p => p && !p.caido);

  function posInicial(eu) { const ref = vivos().find(p => p !== eu && Number.isFinite(p.x)); const bx = ref ? ref.x : MUNDO.w / 2, by = ref ? ref.y : MUNDO.h / 2; return { x: cl(bx + rnd(-120, 120), 80, MUNDO.w - 80), y: cl(by + rnd(-90, 90), 80, MUNDO.h - 80) }; }
  function prepararJogador(p) {
    const h = HER[p.slot], o = posInicial(p);
    Object.assign(p, { x: o.x, y: o.y, rx: o.x, ry: o.y, dx: 0, dy: 0, vel: 210 * (1 + (h.vel || 0)), hpMax: 100 + (h.hp || 0), mult: 1, cad: 1, area: 1, regen: 0, armas: [A.armaDoHeroi(h)], caido: false, volta: 0, ferido: 0, dir: 1, sp: (p.sp || 0) + 1 });
    p.hp = p.hpMax;
  }
  async function validarNick(p, bruto) {
    try { const n = await rpc('salao_nick', { p: bruto }); if (P[p.slot] === p) p.nick = n; }
    catch (e) { if (P[p.slot] === p) p.nick = 'Vigia ' + (p.slot + 1); }
  }

  // ---------- mensagens dos celulares ----------
  function aoJogador(slot, ev, d) {
    msgs += 2; if (!d || typeof d.id !== 'string') return;
    let p = P[slot]; const agora = performance.now();
    if (ev === 'i') {
      if (!p) {
        if (!aberto || P.some(q => q && q.id === d.id)) return; // um vigia por pessoa
        p = P[slot] = { slot, id: d.id, nick: '...', abates: 0, pend: 0, tIn: agora, sp: 0 };
        prepararJogador(p); if (G.estado === 'jogo') p.pend = Math.min(5, G.nivel - 1);
        validarNick(p, String(d.n || '').slice(0, 24));
        return;
      }
      if (p.id !== d.id) return;
      p.tIn = agora;
      if (d.sp !== p.sp || p.caido) return;
      const x = cl(+d.x || 0, 40, MUNDO.w - 40), y = cl(+d.y || 0, 40, MUNDO.h - 40);
      if (Math.hypot(x - p.x, y - p.y) < p.vel * 1.5 + 160) { p.x = x; p.y = y; }
      let dx = +d.dx || 0, dy = +d.dy || 0; const m = Math.hypot(dx, dy); if (m > 1) { dx /= m; dy /= m; }
      p.dx = dx; p.dy = dy; if (dx) p.dir = dx < 0 ? -1 : 1;
    } else if (ev === 'u' && p && p.id === d.id && p.pend > 0) {
      const u = A.UPS.find(x => x.id === d.u); if (!u) return;
      const tipos = p.armas.map(a => a.tipo);
      if (u.arma) { if (tipos.includes(u.arma) || tipos.length >= 3) return; p.armas.push(A.novaArma(u.arma, u.cor, u.o || {})); } else u.f(p);
      p.pend--;
    } else if (ev === 'x' && p && p.id === d.id) P[slot] = null;
  }

  // ---------- rodadas ----------
  function iniciarRodada() {
    const n = presentes().length;
    Object.assign(G, { estado: 'jogo', t: 0, nivel: 1, xp: 0, prox: Math.round(6 * (.6 + .4 * n)), abates: 0, inim: [], proj: [], chefeIdx: 0, spawn: 0, res: null, aviso: null });
    for (const p of presentes()) { p.abates = 0; p.pend = 0; prepararJogador(p); }
  }
  function terminarRodada(venceu) {
    const lista = presentes().slice().sort((a, b) => b.abates - a.abates);
    G.res = { v: venceu ? 1 : 0, t: Math.floor(G.t), ab: G.abates, l: lista.map(p => [p.nick, HER[p.slot].nome, p.abates]) };
    for (const e of G.inim) G.fila.push(['k', e.x | 0, e.y | 0, e.chefe ? 1 : 0]);
    G.inim = []; G.proj = []; G.estado = 'fim'; G.fimT = 14; G.aviso = null;
    const mvp = lista[0];
    if (mvp && aberto) rpc('arena_resultado', { p_codigo: codigo, p_nick: mvp.nick, p_texto: venceu ? 'amanhecer' : 'caiu:' + Math.floor(G.t), p_pontos: mvp.abates }).catch(() => { });
  }

  // ---------- simulação ----------
  function maisPerto(x, y, max = 1e9) { let m = null, d = max; for (const e of G.inim) { if (e.morto) continue; const k = Math.hypot(e.x - x, e.y - y); if (k < d) { d = k; m = e; } } return m; }
  function ferir(e, dmg, p, slow = 0) {
    if (e.morto) return; e.hp -= dmg * p.mult; e.flash = .1; if (slow) e.lento = Math.max(e.lento || 0, 1.2);
    if (e.hp <= 0) {
      e.morto = true; G.abates++; p.abates++; G.xp += e.chefe ? 25 : 1;
      G.fila.push(['k', e.x | 0, e.y | 0, e.chefe ? 1 : 0]);
      while (G.xp >= G.prox) { G.xp -= G.prox; G.nivel++; G.prox = Math.round(G.prox * 1.25 + 2 * presentes().length); for (const q of presentes()) q.pend = Math.min(5, q.pend + 1); }
    }
  }
  function criarInimigo(chefe) {
    const n = presentes().length, lado = Math.floor(rnd(0, 4)), m = 60;
    const x = lado === 0 ? -m : lado === 1 ? MUNDO.w + m : rnd(0, MUNDO.w), y = lado === 2 ? -m : lado === 3 ? MUNDO.h + m : rnd(0, MUNDO.h);
    if (chefe) { const tipo = CHEFES[(G.chefeIdx - 1) % CHEFES.length];
      G.inim.push({ id: G.id++, tipo, chefe: 1, x, y, r: 70, tam: 190, hp: 650 * (1 + G.t / 90) * (.6 + .4 * n), hpMax: 650 * (1 + G.t / 90) * (.6 + .4 * n), vel: 62 + G.t / 10, dano: 26, fase: 0 });
      G.aviso = { txt: 'Chefe: ' + CRIAT[tipo].nome, t: 3.5 }; return; }
    const tipo = MOBS[Math.floor(Math.random() * MOBS.length)], forte = (1 + G.t / 55) * (1 + .12 * (n - 1));
    G.inim.push({ id: G.id++, tipo, x, y, r: 22, hp: 11 * forte, hpMax: 11 * forte, vel: rnd(66, 100) + G.t * .35, dano: 7 + G.t / 18, fase: rnd(0, 6) });
  }
  function usarArma(p, a, dt) {
    a.t -= dt;
    if (a.tipo === 'bolt' && a.t <= 0) {
      const alvo = maisPerto(p.x, p.y, 640); if (!alvo) return; a.t = a.cd * p.cad;
      const base = Math.atan2(alvo.y - p.y, alvo.x - p.x), g = a.boom ? 1 : a.pierce > 1 ? 2 : 0;
      for (let i = 0; i < a.count; i++) { const ang = base + (i - (a.count - 1) / 2) * .16;
        G.proj.push({ p, x: p.x, y: p.y - 20, vx: Math.cos(ang) * a.speed, vy: Math.sin(ang) * a.speed, t: 1.4, dmg: a.dmg, pierce: a.pierce, homing: a.homing, boom: a.boom, slow: a.slow, cor: a.cor, g, hits: new Set() });
        G.fila.push(['b', p.x | 0, (p.y - 20) | 0, +ang.toFixed(3), a.speed | 0, 1.4, a.cor, g, a.homing ? 1 : 0]); }
    } else if (a.tipo === 'aura') {
      const r = a.r * p.area; a.pulso = (a.pulso || 0) + dt;
      if (a.pulso > .25) { a.pulso = 0; for (const e of G.inim) if (Math.hypot(e.x - p.x, e.y - p.y) < r + e.r * .5) ferir(e, a.dps * .25, p, a.slow); }
    } else if (a.tipo === 'orbit') {
      a.tick = (a.tick || 0) - dt; const r = a.r * p.area;
      if (a.tick <= 0) { a.tick = .18 * p.cad; const base = G.t * a.rot + p.slot; for (let i = 0; i < a.n; i++) { const an = base + i * Math.PI * 2 / a.n, bx = p.x + Math.cos(an) * r, by = p.y + Math.sin(an) * r;
        for (const e of G.inim) if (Math.hypot(e.x - bx, e.y - by) < e.r + 18) ferir(e, a.dmg * .5, p); } }
    } else if (a.tipo === 'strike' && a.t <= 0) {
      a.t = a.cd * p.cad; const perto = G.inim.filter(e => !e.morto && Math.hypot(e.x - p.x, e.y - p.y) < 520);
      for (let i = 0; i < a.count && perto.length; i++) { const e = perto.splice(Math.floor(Math.random() * perto.length), 1)[0];
        for (const o of G.inim) if (Math.hypot(o.x - e.x, o.y - e.y) < a.r * p.area) ferir(o, a.dmg, p);
        G.fila.push(['s', e.x | 0, e.y | 0, (a.r * p.area) | 0, a.cor]); }
    } else if (a.tipo === 'pulse' && a.t <= 0) {
      a.t = a.cd * p.cad; const r = a.r * p.area;
      for (const e of G.inim) if (Math.hypot(e.x - p.x, e.y - p.y) < r) ferir(e, a.dmg, p);
      G.fila.push(['p', p.x | 0, p.y | 0, r | 0, a.cor]);
    } else if (a.tipo === 'pool') {
      if (a.t <= 0) { const alvo = maisPerto(p.x, p.y, 520); if (alvo) { a.t = a.cd * p.cad; (a.pocas = a.pocas || []).push({ x: alvo.x, y: alvo.y, t: a.dur }); G.fila.push(['o', alvo.x | 0, alvo.y | 0, (a.r * p.area) | 0, a.dur, a.cor]); } }
      a.tick = (a.tick || 0) - dt; const r = a.r * p.area;
      for (const pc of a.pocas || []) pc.t -= dt; a.pocas = (a.pocas || []).filter(pc => pc.t > 0);
      if (a.tick <= 0) { a.tick = .3; for (const pc of a.pocas) for (const e of G.inim) if (Math.hypot(e.x - pc.x, e.y - pc.y) < r) ferir(e, a.dps * .3, p, .2); }
    }
  }
  function passo(dt) {
    const agora = performance.now();
    for (const p of presentes()) if (agora - p.tIn > 8000) P[p.slot] = null; // saiu sem avisar
    const n = presentes().length;
    // jogadores
    for (const p of presentes()) {
      if (p.caido) { p.volta -= dt; if (p.volta <= 0 && G.estado === 'jogo') { const o = posInicial(p); Object.assign(p, { caido: false, hp: p.hpMax * .6, x: o.x, y: o.y, rx: o.x, ry: o.y, dx: 0, dy: 0, sp: p.sp + 1 }); } }
      else { p.x = cl(p.x + p.dx * p.vel * dt, 40, MUNDO.w - 40); p.y = cl(p.y + p.dy * p.vel * dt, 40, MUNDO.h - 40); p.hp = Math.min(p.hpMax, p.hp + p.regen * dt); }
      p.ferido = Math.max(0, p.ferido - dt);
      const k = Math.min(1, dt * 14); p.rx += (p.x - p.rx) * k; p.ry += (p.y - p.ry) * k;
    }
    // rodadas
    if (!aberto || !conectado) { if (G.estado !== 'espera') G = novoMundo(); return; }
    if (G.estado === 'espera') { if (n) { G.estado = 'contagem'; G.cont = 8; } return; }
    if (G.estado === 'contagem') { G.cont -= dt; if (!n) G.estado = 'espera'; else if (G.cont <= 0) iniciarRodada(); return; }
    if (G.estado === 'fim') { G.fimT -= dt; if (G.fimT <= 0) { if (n) { G.estado = 'contagem'; G.cont = 8; } else G.estado = 'espera'; G.res = null; } return; }
    // jogo
    if (!n) { G = novoMundo(); return; }
    G.t += dt;
    if (G.t >= ALVO) return terminarRodada(true);
    if (!vivos().length) return terminarRodada(false);
    const ritmo = (.7 + G.t / 30) * (.6 + .4 * n); G.spawn += ritmo * dt;
    while (G.spawn >= 1 && G.inim.length < 150) { G.spawn--; criarInimigo(false); }
    if (G.t >= (G.chefeIdx + 1) * 60) { G.chefeIdx++; criarInimigo(true); }
    const alvos = vivos();
    for (const e of G.inim) {
      let alvo = null, dm = 1e9; for (const p of alvos) { const d = Math.hypot(p.x - e.x, p.y - e.y); if (d < dm) { dm = d; alvo = p; } }
      e.lento = (e.lento || 0) - dt; e.flash = Math.max(0, (e.flash || 0) - dt); e.fase += dt * 3;
      if (!alvo) continue;
      const dx = alvo.x - e.x, dy = alvo.y - e.y, d = dm || 1, v = e.vel * (e.lento > 0 ? .5 : 1);
      e.x += dx / d * v * dt + Math.cos(e.fase) * 18 * dt; e.y += dy / d * v * dt + Math.sin(e.fase * 1.3) * 18 * dt; e.alvoX = alvo.x;
      if (d < e.r + 22 && !alvo.caido) { alvo.hp -= e.dano * dt; alvo.ferido = .15;
        if (alvo.hp <= 0) { alvo.hp = 0; alvo.caido = true; alvo.volta = 10; alvo.dx = alvo.dy = 0; } }
    }
    for (const p of alvos) for (const a of p.armas) usarArma(p, a, dt);
    for (const pr of G.proj) {
      if (pr.homing) { const alvo = maisPerto(pr.x, pr.y, 420); if (alvo) { const ang = Math.atan2(alvo.y - pr.y, alvo.x - pr.x), cur = Math.atan2(pr.vy, pr.vx); let da = ang - cur; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI; const nn = cur + cl(da, -5 * dt, 5 * dt), sp = Math.hypot(pr.vx, pr.vy); pr.vx = Math.cos(nn) * sp; pr.vy = Math.sin(nn) * sp; } }
      pr.x += pr.vx * dt; pr.y += pr.vy * dt; pr.t -= dt;
      for (const e of G.inim) { if (e.morto || pr.hits.has(e)) continue; if (Math.hypot(e.x - pr.x, e.y - pr.y) < e.r + 8) {
        pr.hits.add(e); ferir(e, pr.dmg, pr.p, pr.slow);
        if (pr.boom) { for (const o of G.inim) if (o !== e && Math.hypot(o.x - pr.x, o.y - pr.y) < pr.boom * pr.p.area) ferir(o, pr.dmg * .6, pr.p); G.fila.push(['p', pr.x | 0, pr.y | 0, (pr.boom * pr.p.area) | 0, pr.cor]); }
        if (pr.pierce-- <= 0) { pr.t = 0; break; } } }
    }
    G.proj = G.proj.filter(pr => pr.t > 0 && pr.x > -200 && pr.x < MUNDO.w + 200 && pr.y > -200 && pr.y < MUNDO.h + 200);
    G.inim = G.inim.filter(e => !e.morto);
    if (G.aviso) { G.aviso.t -= dt; if (G.aviso.t <= 0) G.aviso = null; }
  }

  // ---------- envio do mundo ----------
  let ultEnvio = 0, seq = 0;
  function enviar(agora) {
    const n = presentes().length, intervalo = n ? 250 : 2000;
    if (!mundo || agora - ultEnvio < intervalo) return; ultEnvio = agora;
    const snap = {
      k: ++seq, e: aberto ? G.estado : 'fechado', t: +G.t.toFixed(2), c: Math.ceil(G.cont), nv: G.nivel, xp: Math.round(G.xp / G.prox * 100), ab: G.abates, a: G.aviso ? G.aviso.txt : '',
      j: presentes().map(p => [p.slot, p.id, p.nick, p.x | 0, p.y | 0, Math.ceil(p.hp), p.hpMax | 0, p.caido ? Math.ceil(p.volta) : 0, p.abates, p.vel | 0, p.pend, p.armas.map(a => [a.tipo, a.cor, a.n || 0]), +p.area.toFixed(2), p.sp, p.dir]),
      i: G.inim.map(e => [e.id, e.tipo, e.x | 0, e.y | 0, Math.max(1, Math.round(e.hp / e.hpMax * 100))]),
      f: G.fila
    };
    if (G.res) snap.r = G.res;
    G.vis.push(...G.fila.filter(f => f[0] !== 'b').map(A.novoEfeito).filter(Boolean)); G.fila = [];
    try { mundo.enviar('s', snap); msgs += 1 + n; } catch (e) { }
  }

  // ---------- desenho da tela da live ----------
  function painel(x, y, w, h) { cx.fillStyle = 'rgba(12,10,9,.82)'; cx.fillRect(x, y, w, h); cx.strokeStyle = 'rgba(199,154,79,.55)'; cx.lineWidth = 1.5; cx.strokeRect(x + .5, y + .5, w - 1, h - 1); cx.fillStyle = '#c22a2d'; cx.fillRect(x, y, w, 4); }
  function texto(t, x, y, tam, cor, al = 'left', fonte = 'Pirata One') { cx.font = `${tam}px "${fonte}", Georgia, serif`; cx.textAlign = al; cx.fillStyle = cor; cx.fillText(t, x, y); }
  let tVis = 0;
  function desenhar(dt) {
    tVis += dt; G.vis = A.passoEfeitos(G.vis, dt);
    cx.save(); A.chao(cx, IM && IM.chao, cacheChao);
    A.desenharChao(cx, G.vis);
    for (const p of presentes()) if (!p.caido) A.armasVisuais(cx, p.rx, p.ry, p.armas.map(a => [a.tipo, a.cor, a.n || 0]), p.area, G.t, p.slot);
    const ord = G.inim.slice().sort((a, b) => a.y - b.y);
    for (const e of ord) { const tam = e.chefe ? 190 : A.tamMob(e.id); A.sprite(cx, IM && IM.criat[e.tipo], e.x, e.y, tam, (e.alvoX || 0) < e.x, e.chefe ? '#c22a2d' : null, e.flash > 0); if (e.chefe) A.barraChefe(cx, e.x, e.y, tam, e.hp / e.hpMax); }
    for (const p of presentes().sort((a, b) => a.ry - b.ry)) A.heroi(cx, IM && IM.herois[p.slot], p.rx, p.ry, p.dir, tVis, Math.abs(p.dx) + Math.abs(p.dy) > .1, p.ferido > 0, p.caido, HER[p.slot].cor);
    for (const pr of G.proj) { cx.save(); cx.translate(pr.x, pr.y); cx.rotate(Math.atan2(pr.vy, pr.vx)); cx.shadowColor = pr.cor; cx.shadowBlur = 14; cx.fillStyle = pr.cor; if (pr.g === 2) cx.fillRect(-16, -2, 32, 4); else { cx.beginPath(); cx.ellipse(0, 0, pr.g ? 10 : 8, pr.g ? 8 : 5, 0, 0, 7); cx.fill(); } cx.restore(); }
    A.desenharEfeitos(cx, G.vis);
    for (const p of presentes()) { A.rotulo(cx, p.caido ? `${p.nick} · volta em ${Math.ceil(p.volta)}` : p.nick, p.rx, p.ry - 62, false, p.caido ? null : p.hp / p.hpMax); }
    cx.restore();
    // vinheta
    const vg = cx.createRadialGradient(960, 540, 380, 960, 540, 1150); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)'); cx.fillStyle = vg; cx.fillRect(0, 0, 1920, 1080);
    hud();
  }
  function hud() {
    const n = presentes().length;
    // canto esquerdo: como entrar
    painel(28, 28, 470, 150);
    cx.fillStyle = '#e04b3c'; cx.beginPath(); cx.arc(52, 58, 7, 0, 7); cx.fill();
    texto('ARENA DA VIGÍLIA · AO VIVO', 68, 65, 20, '#c8742a', 'left', 'IM Fell English');
    texto('Jogue pelo celular', 48, 108, 36, '#f3e7d2');
    cx.fillStyle = '#9b1c1f'; cx.fillRect(48, 122, 330, 40); texto('ashemvow.github.io/salao', 60, 152, 28, '#f3e7d2');
    texto(`${n}/${VAGAS} vigias`, 478, 152, 24, '#c79a4f', 'right');
    // centro: tempo
    if (G.estado === 'jogo') {
      const falta = Math.max(0, ALVO - G.t);
      texto(A.tempo(G.t), 960, 92, 76, '#f3e7d2', 'center');
      texto(`Amanhecer em ${A.tempo(falta)}`, 960, 126, 24, '#c9bfae', 'center', 'IM Fell English');
      cx.fillStyle = 'rgba(0,0,0,.7)'; cx.fillRect(760, 140, 400, 8); cx.fillStyle = '#ffd27a'; cx.fillRect(760, 140, 400 * Math.min(1, G.xp / G.prox), 8);
      texto(`Nível do time ${G.nivel} · ${G.abates} abates`, 960, 176, 22, '#c79a4f', 'center', 'IM Fell English');
    }
    // direita: vigias
    const lista = presentes().slice().sort((a, b) => b.abates - a.abates);
    if (lista.length) {
      const h = 64 + lista.length * 58; painel(1440, 28, 452, h); texto('Vigias na arena', 1464, 70, 30, '#f3e7d2');
      lista.forEach((p, i) => { const y = 92 + i * 58; cx.fillStyle = i % 2 ? 'rgba(0,0,0,.25)' : 'rgba(0,0,0,.45)'; cx.fillRect(1452, y, 428, 52);
        const img = IM && IM.herois[p.slot]; if (img) { const k = 46 / img.height; cx.drawImage(img, 1462, y + 3, img.width * k, 46); }
        texto(p.nick, 1508, y + 24, 22, '#f3e7d2', 'left', 'IM Fell English'); texto(p.caido ? `caído · volta em ${Math.ceil(p.volta)}` : HER[p.slot].nome, 1508, y + 45, 17, p.caido ? '#e04b3c' : '#8f8576', 'left', 'IM Fell English');
        texto(String(p.abates), 1866, y + 36, 32, '#c8742a', 'right'); });
    }
    // mensagens no meio
    const meio = (t1, t2, t3) => { cx.fillStyle = 'rgba(12,10,9,.72)'; cx.fillRect(460, 380, 1000, t3 ? 300 : 230); cx.strokeStyle = 'rgba(199,154,79,.6)'; cx.strokeRect(460.5, 380.5, 999, (t3 ? 300 : 230) - 1);
      texto(t1, 960, 480, 84, '#ffd27a', 'center'); texto(t2, 960, 540, 30, '#d8cdbb', 'center', 'IM Fell English'); if (t3) texto(t3, 960, 600, 26, '#c79a4f', 'center', 'IM Fell English'); };
    if (!conectado) meio('Conectando...', 'Ligando a arena ao Salão.');
    else if (!aberto) meio('Salão fechado', 'Abra o Salão na página de controle para a arena funcionar.');
    else if (G.estado === 'espera') meio('A arena espera os vigias', 'Entre em ashemvow.github.io/salao, escolha seu vigia e lute com o chat.');
    else if (G.estado === 'contagem') meio(`A vigília começa em ${Math.max(1, Math.ceil(G.cont))}`, `${n} ${n === 1 ? 'vigia pronto' : 'vigias prontos'}. Ainda dá tempo de entrar.`);
    else if (G.estado === 'fim' && G.res) {
      const r = G.res; meio(r.v ? 'O amanhecer chegou!' : 'A vigília caiu.', r.v ? `O time sobreviveu à noite inteira com ${r.ab} abates.` : `O time resistiu ${A.tempo(r.t)} e derrubou ${r.ab} criaturas.`,
        r.l.length ? `Destaque: ${r.l[0][0]} com ${r.l[0][2]} abates · nova rodada em ${Math.ceil(G.fimT)}` : '');
    }
    if (G.aviso) { cx.save(); cx.globalAlpha = Math.min(1, G.aviso.t); cx.shadowColor = '#000'; cx.shadowBlur = 14; texto(G.aviso.txt, 960, 300, 72, '#e04b3c', 'center'); cx.restore(); }
  }

  // ---------- laços ----------
  let ultSim = performance.now();
  setInterval(() => { const agora = performance.now(); let dt = Math.min(1, (agora - ultSim) / 1000); ultSim = agora; while (dt > 0) { const d = Math.min(.05, dt); passo(d); dt -= d; } enviar(agora); }, 30);
  let ultDes = performance.now();
  function quadro(agora) { const dt = Math.min(.1, (agora - ultDes) / 1000); ultDes = agora; desenhar(dt); requestAnimationFrame(quadro); }
  requestAnimationFrame(quadro);
  setInterval(() => { $('ctrl-st').textContent = `${conectado ? 'No ar' : 'Desconectado'} · ${aberto ? 'Salão aberto' : 'Salão fechado'} · mensagens nesta sessão: ${msgs.toLocaleString('pt-BR')}`; }, 1000);

  // ---------- ligar a arena ----------
  async function status() { try { const s = await rpc('salao_status'); aberto = !!s.aberto; if (s.sessao !== sessao) { sessao = s.sessao; } } catch (e) { } }
  async function ligar() {
    $('msg').textContent = 'Conferindo...';
    try {
      const guard = ls.get('arena-sala') || ''; sala = /^[a-z0-9]{10}$/.test(guard) ? guard : Math.random().toString(36).slice(2, 12).padEnd(10, '0');
      await rpc('salao_sala', { p_codigo: codigo, p_sala: sala }); ls.set('salao-admin', codigo); ls.set('arena-sala', sala);
    } catch (e) { $('msg').textContent = /codigo_invalido/.test(e.message) ? 'Código errado.' : 'Sem conexão. Tente de novo.'; $('login').hidden = false; return; }
    $('login').hidden = true; await status();
    IM = await A.carregarTudo();
    try {
      mundo = await window.REDE.canal('vg-' + sala, () => { });
      for (let i = 0; i < VAGAS; i++) await window.REDE.canal(`vg-${sala}-${i}`, (ev, d) => aoJogador(i, ev, d));
      conectado = true;
    } catch (e) { conectado = false; $('ctrl-st').textContent = 'Não consegui ligar o tempo real. Recarregue a página.'; }
    setInterval(() => rpc('salao_sala', { p_codigo: codigo, p_sala: sala }).catch(() => { }), 60000);
    setInterval(status, 10000);
  }
  $('entrar').onclick = () => { codigo = $('cod').value.trim() || codigo; ligar(); };
  $('cod').addEventListener('keydown', e => { if (e.key === 'Enter') $('entrar').click(); });
  $('reiniciar').onclick = () => { if (G.estado === 'jogo') terminarRodada(false); };
  $('desligar').onclick = async () => { try { await rpc('salao_sala', { p_codigo: codigo, p_sala: null }); } catch (e) { } ls.set('arena-sala', ''); location.reload(); };
  addEventListener('pagehide', () => { if (sala && codigo) rpc('salao_sala', { p_codigo: codigo, p_sala: null }, true).catch(() => { }); });
  if (codigo) { $('cod').value = codigo; ligar(); }
  window.__arena = { G: () => G, P, conectado: () => conectado };
})();
