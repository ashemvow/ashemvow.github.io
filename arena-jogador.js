/* Arena da Vigília · lado do jogador (celular ou computador).
   O seu vigia anda aqui mesmo, sem atraso; criaturas, golpes e vida vêm da tela da live. */
(() => {
  const S = window.SITE, A = window.ARENA, $ = id => document.getElementById(id);
  const HER = S.vigiliaHerois, { MUNDO, VAGAS, ALVO, CRIAT } = A;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const ss = { get: k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) { } } };
  const MEU = ss.get('arena-id') || (() => { const v = Math.random().toString(36).slice(2) + Date.now().toString(36); ss.set('arena-id', v); return v; })();

  const cv = $('ar-canvas'), cx = cv.getContext('2d');
  let W = 0, H = 0, DPR = 1, IM = null, cacheChao = {};
  function medir() { const r = cv.getBoundingClientRect(); DPR = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height; cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); }
  addEventListener('resize', medir);

  // ---------- estado ----------
  let sala = null, mundo = null, meuCanal = null, escolha = 0, modo = 'menu'; // menu | entrando | jogo
  let snap = null, snapEm = 0, ocupados = {}, entrouEm = 0, ociosoMenu = 0;
  const ini = new Map(), outros = new Map(); let efeitos = [];
  const eu = { x: MUNDO.w / 2, y: MUNDO.h / 2, sp: -1, dir: 1, vel: 210, hp: 100, hpMax: 100, caido: 0, abates: 0, w: [], area: 1, pend: 0, ferido: 0 };
  let tLocal = 0, upsMostrando = null, upsAte = 0, upsEspera = 0;

  // ---------- escolha do vigia ----------
  const box = $('ar-herois');
  box.innerHTML = HER.map((h, i) => `<button type="button" data-i="${i}" class="${i ? '' : 'on'}"><img src="${esc(h.img)}" alt="" loading="lazy"><span>${esc(h.nome)}</span></button>`).join('');
  box.onclick = e => { const b = e.target.closest('button'); if (!b || b.classList.contains('ocupado')) return; escolha = +b.dataset.i; marcar(); ligarMundo(); };
  function marcar() {
    box.querySelectorAll('button').forEach((b, i) => { const dono = ocupados[i]; b.classList.toggle('on', i === escolha); b.classList.toggle('ocupado', !!dono && dono !== MEU); b.querySelector('span').textContent = dono && dono !== MEU ? (snap && (snap.j.find(j => j[0] === i) || [])[2]) || 'ocupado' : HER[i].nome; });
    const h = HER[escolha]; $('ar-info').innerHTML = `<b>${esc(h.nome)}, ${esc(h.titulo)}</b> · ${esc(h.txt)}`;
  }
  marcar();

  // ---------- conexão ----------
  function situacao() {
    const st = window.SALAO.estado();
    const novaSala = st && st.aberto ? st.sala || null : null;
    if (novaSala !== sala) { desligar(); sala = novaSala; }
    const msg = !st || !st.aberto ? 'A arena abre quando a live começar' : !sala ? 'A tela da arena ainda não entrou no ar. Já já começa.' : mundo ? (snap ? textoVagas() : 'Conectando à arena...') : 'Arena no ar. Escolha seu vigia.';
    $('ar-status').textContent = msg; $('ar-entrar').disabled = !sala;
  }
  const textoVagas = () => { const n = snap ? snap.j.length : 0; return n >= VAGAS ? 'Arena cheia. Espere uma vaga ou jogue a Vigília solo.' : `Arena no ar · ${n}/${VAGAS} vigias lutando agora`; };
  addEventListener('salao-status', situacao);
  async function ligarMundo() {
    if (!sala || mundo) return; ociosoMenu = performance.now();
    const s = sala;
    try { const c = await window.REDE.canal('vg-' + s, (ev, d) => { if (ev === 's') receber(d); }); if (s !== sala) { c.sair(); return; } mundo = c; }
    catch (e) { $('ar-status').textContent = 'Não consegui ligar à arena. Tente de novo.'; }
    situacao();
  }
  function desligar() {
    if (meuCanal) { try { meuCanal.enviar('x', { id: MEU }); } catch (e) { } meuCanal.sair(); meuCanal = null; }
    if (mundo) { mundo.sair(); mundo = null; }
    snap = null; ocupados = {}; ini.clear(); outros.clear(); efeitos = []; if (modo !== 'menu') voltarMenu(); marcar();
  }

  $('ar-entrar').onclick = async () => {
    if (!window.SALAO.nick()) { window.SALAO.pedirNick(); $('ar-status').textContent = 'Primeiro diga seu nome do chat no topo da página.'; return; }
    if (!sala) return;
    await ligarMundo(); if (!mundo) return;
    if (ocupados[escolha] && ocupados[escolha] !== MEU) { $('ar-status').textContent = 'Esse vigia já tem dono. Escolha outro.'; return; }
    if (snap && snap.j.length >= VAGAS) { $('ar-status').textContent = textoVagas(); return; }
    $('ar-entrar').disabled = true; $('ar-status').textContent = 'Entrando na arena...';
    try { meuCanal = await window.REDE.canal(`vg-${sala}-${escolha}`, () => { }); }
    catch (e) { $('ar-status').textContent = 'Não consegui entrar. Tente de novo.'; $('ar-entrar').disabled = false; return; }
    modo = 'entrando'; entrouEm = performance.now(); eu.sp = -1;
    meuCanal.enviar('i', { id: MEU, n: window.SALAO.nick(), x: 0, y: 0, dx: 0, dy: 0, sp: -1 });
  };
  $('ar-sair').onclick = () => { if (meuCanal) { try { meuCanal.enviar('x', { id: MEU }); } catch (e) { } meuCanal.sair(); meuCanal = null; } voltarMenu(); };
  function voltarMenu() { modo = 'menu'; $('ar-menu').hidden = false; $('ar-hud').hidden = true; $('ar-sair').hidden = true; $('ar-faixa').hidden = true; esconderUps(); $('ar-entrar').disabled = !sala; ociosoMenu = performance.now(); situacao(); }
  function comecarJogo() { modo = 'jogo'; $('ar-menu').hidden = true; $('ar-hud').hidden = false; $('ar-sair').hidden = false; medir(); cv.focus(); }

  // ---------- mundo recebido ----------
  function receber(d) {
    const agora = performance.now(), antes = snap; snap = d; snapEm = agora;
    ocupados = {}; for (const j of d.j) ocupados[j[0]] = j[1];
    tLocal = d.t;
    // inimigos
    const vistos = new Set();
    for (const [id, tipo, x, y, hp] of d.i) { vistos.add(id); const e = ini.get(id); if (e) { e.tx = x; e.ty = y; if (hp < e.hp) e.flash = .1; e.hp = hp; } else ini.set(id, { id, tipo, x, y, tx: x, ty: y, hp }); }
    for (const id of ini.keys()) if (!vistos.has(id)) ini.delete(id);
    // jogadores
    const presentes = new Set(); let achei = null;
    for (const j of d.j) {
      const [slot, id, nick, x, y, hp, hpMax, volta, abates, vel, pend, w, area, sp, dir] = j; presentes.add(slot);
      if (id === MEU) { achei = j; continue; }
      const o = outros.get(slot); if (o && o.id === id) Object.assign(o, { tx: x, ty: y, nick, hp, hpMax, volta, w, area, dir, mov: Math.hypot(x - o.tx, y - o.ty) > 2 }); else outros.set(slot, { slot, id, nick, x, y, tx: x, ty: y, hp, hpMax, volta, w, area, dir });
    }
    for (const s of outros.keys()) if (!presentes.has(s) || (achei && achei[0] === s)) outros.delete(s);
    for (const f of d.f || []) { const e = A.novoEfeito(f); if (e) efeitos.push(e); }
    if (achei) {
      const [slot, , , x, y, hp, hpMax, volta, abates, vel, pend, w, area, sp] = achei;
      if (modo === 'entrando') comecarJogo();
      if (sp !== eu.sp) { eu.x = x; eu.y = y; eu.sp = sp; }
      if (hp < eu.hp && !volta) eu.ferido = .2;
      Object.assign(eu, { slot, hp, hpMax, caido: volta, abates, vel, w, area });
      if (pend !== eu.pend) upsEspera = 0; eu.pend = pend;
    } else if (modo === 'jogo') { voltarMenu(); $('ar-status').textContent = 'Você saiu da arena. Escolha um vigia para voltar.'; }
    else if (modo === 'entrando' && agora - entrouEm > 3500) {
      if (meuCanal) { meuCanal.sair(); meuCanal = null; } voltarMenu(); $('ar-status').textContent = ocupados[escolha] ? 'Alguém pegou esse vigia antes. Escolha outro.' : 'A arena não respondeu. Tente de novo.';
    }
    if (modo === 'menu') { marcar(); situacao(); }
    faixa(); hud();
  }

  // ---------- controles ----------
  const key = {}; let joy = null;
  addEventListener('keydown', e => { if (modo !== 'jogo') return; const k = e.key.toLowerCase(); if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k) && document.activeElement === cv) e.preventDefault(); key[k] = true; });
  addEventListener('keyup', e => { key[e.key.toLowerCase()] = false; });
  cv.addEventListener('pointerdown', e => { if (modo !== 'jogo') return; cv.setPointerCapture(e.pointerId); const r = cv.getBoundingClientRect(); joy = { id: e.pointerId, x0: e.clientX - r.left, y0: e.clientY - r.top, x: 0, y: 0 }; });
  cv.addEventListener('pointermove', e => { if (!joy || e.pointerId !== joy.id) return; const r = cv.getBoundingClientRect(); let dx = e.clientX - r.left - joy.x0, dy = e.clientY - r.top - joy.y0; const m = Math.hypot(dx, dy), max = 60; if (m > max) { dx *= max / m; dy *= max / m; } joy.x = dx / max; joy.y = dy / max; });
  const solta = e => { if (joy && e.pointerId === joy.id) joy = null; };
  cv.addEventListener('pointerup', solta); cv.addEventListener('pointercancel', solta);

  // envio da posição: na mudança de direção e de tempos em tempos
  let ultEnvio = 0, ultDir = '', mx = 0, my = 0;
  function enviarPosicao(agora) {
    if (!meuCanal || modo !== 'jogo') return;
    const dirTxt = eu.caido ? 'x' : `${Math.round(mx * 4)},${Math.round(my * 4)}`, andando = Math.abs(mx) + Math.abs(my) > .05;
    const tempo = agora - ultEnvio, mudou = dirTxt !== ultDir;
    if ((mudou && tempo > 220) || (andando && tempo > 400) || tempo > 1000) {
      ultEnvio = agora; ultDir = dirTxt;
      meuCanal.enviar('i', { id: MEU, n: window.SALAO.nick(), x: Math.round(eu.x), y: Math.round(eu.y), dx: +mx.toFixed(2), dy: +my.toFixed(2), sp: eu.sp });
    }
  }

  // ---------- melhorias (não pausam o jogo) ----------
  function mostrarUps() {
    if (upsMostrando || eu.pend <= 0 || eu.caido || performance.now() < upsEspera) return;
    const ops = A.opcoes((eu.w || []).map(a => a[0])); if (!ops.length) return;
    upsMostrando = ops; upsAte = performance.now() + 12000;
    $('ar-ups-in').innerHTML = ops.map((u, i) => `<button type="button" data-i="${i}"><b>${esc(u.nome)}</b><span>${esc(u.d)}</span></button>`).join('');
    $('ar-ups-n').textContent = eu.pend > 1 ? `(${eu.pend})` : ''; $('ar-ups').hidden = false;
  }
  function escolherUp(i) {
    if (!upsMostrando || !meuCanal) return; const u = upsMostrando[i] || upsMostrando[0];
    meuCanal.enviar('u', { id: MEU, u: u.id }); esconderUps(); upsEspera = performance.now() + 1500;
  }
  function esconderUps() { upsMostrando = null; $('ar-ups').hidden = true; }
  $('ar-ups-in').onclick = e => { const b = e.target.closest('button'); if (b) escolherUp(+b.dataset.i); };
  addEventListener('keydown', e => { if (upsMostrando && ['1', '2', '3'].includes(e.key)) escolherUp(+e.key - 1); });

  // ---------- faixas e HUD ----------
  function faixa() {
    if (modo !== 'jogo' || !snap) { $('ar-faixa').hidden = true; return; }
    let t = '', s = '';
    if (snap.e === 'espera') { t = 'Esperando vigias'; s = 'A rodada começa assim que a arena tiver gente.'; }
    else if (snap.e === 'contagem') { t = `Começa em ${Math.max(1, snap.c)}`; s = 'Ande pela arena e se prepare. Fiquem juntos.'; }
    else if (snap.e === 'fim' && snap.r) { t = snap.r.v ? 'O amanhecer chegou!' : 'A vigília caiu.'; s = snap.r.l.length ? `Destaque: ${snap.r.l[0][0]} com ${snap.r.l[0][2]} abates. Nova rodada já já.` : ''; }
    else if (snap.e === 'fechado') { t = 'Salão fechado'; s = 'A live acabou. Até a próxima!'; }
    else if (eu.caido) { t = 'Você caiu.'; s = `Volta em ${eu.caido}s. O time ainda está de pé.`; }
    else if (snap.a) { t = snap.a; s = 'Derrubem juntos!'; }
    $('ar-faixa').hidden = !t; $('ar-faixa-t').textContent = t; $('ar-faixa-s').textContent = s;
  }
  function hud() {
    if (modo !== 'jogo' || !snap) return;
    const t = snap.e === 'jogo' ? tLocal : 0, falta = Math.max(0, ALVO - t);
    $('ar-tempo').textContent = A.tempo(t); $('ar-amanhecer').textContent = snap.e === 'jogo' ? `Amanhecer em ${A.tempo(falta)}` : '';
    $('ar-nivel').textContent = snap.nv; $('ar-xp').style.width = Math.min(100, snap.xp) + '%'; $('ar-abates').textContent = eu.abates;
    $('ar-vida').style.width = Math.max(0, eu.hp / eu.hpMax * 100) + '%';
  }

  // ---------- laço ----------
  let ult = performance.now(), tAnim = 0;
  function quadro(agora) {
    const dt = Math.min(.05, (agora - ult) / 1000); ult = agora; tAnim += dt;
    if (modo === 'menu' && mundo && agora - ociosoMenu > 45000) desligar(); // não fica gastando mensagens parado no menu
    if (modo === 'jogo') {
      if (agora - snapEm > 7000) { desligar(); $('ar-status').textContent = 'A conexão com a arena caiu. Tente entrar de novo.'; }
      else { atualizar(dt, agora); desenhar(dt); }
    }
    requestAnimationFrame(quadro);
  }
  function atualizar(dt, agora) {
    if (snap && snap.e === 'jogo') tLocal += dt;
    mx = (key['d'] || key['arrowright'] ? 1 : 0) - (key['a'] || key['arrowleft'] ? 1 : 0); my = (key['s'] || key['arrowdown'] ? 1 : 0) - (key['w'] || key['arrowup'] ? 1 : 0);
    if (joy) { mx = joy.x; my = joy.y; }
    const m = Math.hypot(mx, my); if (m > 1) { mx /= m; my /= m; }
    if (eu.caido) { mx = my = 0; }
    eu.x = cl(eu.x + mx * eu.vel * dt, 40, MUNDO.w - 40); eu.y = cl(eu.y + my * eu.vel * dt, 40, MUNDO.h - 40); if (mx) eu.dir = mx < 0 ? -1 : 1;
    eu.ferido = Math.max(0, eu.ferido - dt);
    const k = Math.min(1, dt * 9);
    for (const e of ini.values()) { e.x += (e.tx - e.x) * k; e.y += (e.ty - e.y) * k; e.flash = Math.max(0, (e.flash || 0) - dt); }
    for (const o of outros.values()) { o.x += (o.tx - o.x) * k; o.y += (o.ty - o.y) * k; }
    // tiros que perseguem: seguem o inimigo mais perto daqui
    for (const b of efeitos) if (b.k === 'b') {
      let alvo = null, dm = b.h ? 420 : 40; for (const e of ini.values()) { const d = Math.hypot(e.x - b.x, e.y - b.y); if (d < dm) { dm = d; alvo = e; } }
      if (alvo && b.h) { const ang = Math.atan2(alvo.y - b.y, alvo.x - b.x), cur = Math.atan2(b.vy, b.vx); let da = ang - cur; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI; const n = cur + cl(da, -5 * dt, 5 * dt), sp = Math.hypot(b.vx, b.vy); b.vx = Math.cos(n) * sp; b.vy = Math.sin(n) * sp; }
      if (b.g !== 2 && alvo && Math.hypot(alvo.x - b.x, alvo.y - b.y) < 30) b.t = 0;
    }
    efeitos = A.passoEfeitos(efeitos, dt);
    if (upsMostrando) { $('ar-ups-t').textContent = `${Math.max(0, Math.ceil((upsAte - agora) / 1000))}s`; if (agora > upsAte) escolherUp(Math.floor(Math.random() * upsMostrando.length)); }
    else mostrarUps();
    enviarPosicao(agora); hud(); if (eu.caido) faixa();
  }
  function desenhar() {
    if (!W) medir();
    const z = cl(Math.min(W, H) / 560, .55, 1);
    cx.setTransform(DPR, 0, 0, DPR, 0, 0); cx.fillStyle = '#050404'; cx.fillRect(0, 0, W, H);
    cx.save(); cx.translate(W / 2, H / 2); cx.scale(z, z); cx.translate(-eu.x, -eu.y);
    A.chao(cx, IM && IM.chao, cacheChao);
    A.desenharChao(cx, efeitos);
    for (const o of outros.values()) if (!o.volta) A.armasVisuais(cx, o.x, o.y, o.w, o.area, tLocal, o.slot);
    if (!eu.caido) A.armasVisuais(cx, eu.x, eu.y, eu.w, eu.area, tLocal, eu.slot);
    const lista = [...ini.values()].sort((a, b) => a.y - b.y);
    for (const e of lista) { const chefe = CRIAT[e.tipo].chefe, tam = chefe ? 190 : A.tamMob(e.id); A.sprite(cx, IM && IM.criat[e.tipo], e.x, e.y, tam, e.x > eu.x, chefe ? '#c22a2d' : null, e.flash > 0); if (chefe) A.barraChefe(cx, e.x, e.y, tam, e.hp / 100); }
    for (const o of outros.values()) { A.heroi(cx, IM && IM.herois[o.slot], o.x, o.y, o.dir, tAnim, o.mov, false, o.volta, HER[o.slot].cor); A.rotulo(cx, o.volta ? `${o.nick} · ${o.volta}s` : o.nick, o.x, o.y - 62, false, o.volta ? null : o.hp / o.hpMax); }
    A.heroi(cx, IM && IM.herois[eu.slot], eu.x, eu.y, eu.dir, tAnim, Math.abs(mx) + Math.abs(my) > .05, eu.ferido > 0, eu.caido, HER[eu.slot] && HER[eu.slot].cor);
    A.rotulo(cx, window.SALAO.nick() || 'você', eu.x, eu.y - 62, true, null);
    A.desenharEfeitos(cx, efeitos);
    cx.restore();
    const vg = cx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .35, W / 2, H / 2, Math.max(W, H) * .75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, eu.ferido > 0 ? 'rgba(120,0,0,.55)' : 'rgba(0,0,0,.55)'); cx.fillStyle = vg; cx.fillRect(0, 0, W, H);
    if (joy) { cx.save(); cx.globalAlpha = .5; cx.strokeStyle = '#c79a4f'; cx.lineWidth = 2; cx.beginPath(); cx.arc(joy.x0, joy.y0, 60, 0, 7); cx.stroke(); cx.fillStyle = '#c22a2d'; cx.beginPath(); cx.arc(joy.x0 + joy.x * 60, joy.y0 + joy.y * 60, 22, 0, 7); cx.fill(); cx.restore(); }
  }

  // tela cheia
  const caixa = $('ar');
  $('ar-cheia').onclick = async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else { await caixa.requestFullscreen(); try { await screen.orientation.lock('landscape'); } catch (e) { } } } catch (e) { caixa.classList.toggle('cheia'); } setTimeout(medir, 200); };
  document.addEventListener('fullscreenchange', () => setTimeout(medir, 150));
  addEventListener('pagehide', () => { if (meuCanal) try { meuCanal.enviar('x', { id: MEU }); } catch (e) { } });

  A.carregarTudo().then(r => { IM = r; });
  requestAnimationFrame(quadro); situacao();
  window.__arenaJogador = { eu, modo: () => modo, snap: () => snap, escolher: i => { escolha = i; marcar(); }, MEU };
})();
