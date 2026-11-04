/* Corrida das Cinzas · tela da live. Organiza as rodadas e mostra todo mundo correndo junto.
   Cada celular corre sozinho a mesma pista; aqui a gente refaz a corrida de cada um com os pulos que eles mandam. */
(() => {
  const S = window.SITE, I = S.inscricao, C = window.CORRIDA, $ = id => document.getElementById(id);
  const HER = S.vigiliaHerois, { PASSO, VAGAS } = C;
  const ls = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { } } };
  const rpc = async (n, b, keep) => { const r = await fetch(`${I.supabaseUrl}/rest/v1/rpc/${n}`, { method: 'POST', keepalive: !!keep, headers: { apikey: I.supabaseKey, 'Content-Type': 'application/json' }, body: JSON.stringify(b || {}) }); const t = await r.text(); if (!r.ok) throw new Error(t); return t ? JSON.parse(t) : null; };
  const cv = $('cv');
  // modo leve (#leve=1): desenha em meia resolução e a 30 quadros por segundo, para PCs mais fracos e para o LIVE Studio
  const LEVE = /(^|[#&?])leve=1/.test(location.hash + location.search), ESC = LEVE ? .5 : 1;
  if (LEVE) { cv.width = 960; cv.height = 540; }
  const cx = cv.getContext('2d', { alpha: false });
  const ATRASO = 1.3;            // a live mostra a corrida 1,3 s atrás, para os pulos de todos já terem chegado
  const CONTAGEM = 10000, FIM = 11000, MAX = 300;

  function encaixar() { const k = Math.min(innerWidth / 1920, innerHeight / 1080); $('palco').style.transform = `translate(-50%,-50%) scale(${k})`; }
  addEventListener('resize', encaixar); encaixar();
  let mexeu = 0; addEventListener('mousemove', () => { $('ctrl').classList.remove('some'); clearTimeout(mexeu); mexeu = setTimeout(() => $('ctrl').classList.add('some'), 3000); });

  // ---------- estado ----------
  const doEndereco = decodeURIComponent((location.hash.match(/codigo=([^&]+)/) || [])[1] || '').trim();
  let codigo = doEndereco || ls.get('salao-admin') || '', sala = null, aberto = false, mundo = null, IM = null, conectado = false, msgs = 0;
  const cache = {};
  const R = new Array(VAGAS).fill(null);              // corredores por vaga
  let G = { estado: 'espera', k: 0, seed: 1, inicio: 0, fimEm: 0, pista: null, res: null, quedas: [] };
  const presentes = () => R.filter(Boolean), naCorrida = () => R.filter(r => r && r.k === G.k && G.estado === 'corrida');

  async function validarNick(r, bruto) { try { const n = await rpc('salao_nick', { p: bruto }); if (R[r.slot] === r) r.nick = n; } catch (e) { if (R[r.slot] === r) r.nick = 'Corredor ' + (r.slot + 1); } }

  // ---------- mensagens dos celulares ----------
  function aoJogador(slot, ev, d) {
    msgs += 2; if (!d || typeof d.id !== 'string') return;
    let r = R[slot]; const agora = performance.now();
    if (ev === 'i' || ev === 'b') {
      if (!r) {
        if (!aberto || R.some(q => q && q.id === d.id)) return;
        r = R[slot] = { slot, id: d.id, nick: '...', h: 0, tIn: agora, k: -1, ev: [], morte: null, almas: 0, ult: 0 };
        validarNick(r, String(d.n || '').slice(0, 24));
      }
      if (r.id !== d.id) return;
      r.tIn = agora; if (Number.isInteger(d.h) && d.h >= 0 && d.h < HER.length) r.h = d.h;
      if (ev === 'b' && r.k === G.k && G.estado === 'corrida' && d.k === G.k) {
        for (const e of d.ev || []) if (Array.isArray(e) && e[0] >= (r.ev.length ? r.ev[r.ev.length - 1][0] : 0)) r.ev.push([e[0] | 0, e[1] ? 1 : 0]);
        r.almas = Math.max(0, Math.min(5000, d.a | 0)); r.ult = Math.max(r.ult, d.p | 0);
        if (d.m != null && r.morte == null) { r.morte = d.m | 0; G.quedas.push({ nick: r.nick, h: r.h, passo: r.morte, mostrada: false }); }
      }
    } else if (ev === 'x' && r && r.id === d.id) R[slot] = null;
  }

  // ---------- rodadas ----------
  const tCorrida = () => (performance.now() - G.inicio) / 1000;
  function abrirContagem() { G.estado = 'contagem'; G.k++; G.seed = (Math.random() * 2 ** 31) | 0; G.inicio = performance.now() + CONTAGEM; G.res = null; G.quedas = []; G.pista = C.Pista(G.seed); G.pista.gerarAte(4000); enviar(true); }
  function largar() {
    G.estado = 'corrida';
    for (const r of presentes()) Object.assign(r, { k: G.k, ev: [], morte: null, almas: 0, ult: 0, c: C.novoCorredor(), passo: 0, evI: 0, caiu: null });
    enviar(true);
  }
  function encerrar() {
    const t = tCorrida(), lista = naCorrida(), vivos = lista.filter(r => r.morte == null);
    const venc = lista.length > 1 && vivos.length === 1 ? vivos[0] : lista.length === 1 ? null : null;
    const pts = r => C.pontos(C.dist(r.morte != null ? r.morte * PASSO : t), r.almas, r === venc);
    const ord = lista.map(r => ({ r, p: pts(r) })).sort((a, b) => b.p - a.p);
    G.res = { v: venc ? [venc.nick, HER[venc.h].nome, pts(venc)] : null, l: ord.slice(0, 10).map(o => [o.r.nick, HER[o.r.h].nome, o.p]) };
    G.estado = 'fim'; G.fimEm = performance.now() + FIM; enviar(true);
    const top = ord[0]; if (top && aberto) rpc('arena_resultado', { p_codigo: codigo, p_nick: top.r.nick, p_texto: 'corrida', p_pontos: top.p }).catch(() => { });
  }
  function passo() {
    const agora = performance.now();
    for (const r of presentes()) if (agora - r.tIn > 7000) { if (r.k === G.k && G.estado === 'corrida' && r.morte == null) r.morte = r.ult; R[r.slot] = null; }
    const n = presentes().length;
    if (!aberto || !conectado) { if (G.estado !== 'espera') { G.estado = 'espera'; enviar(true); } return; }
    if (G.estado === 'espera') { if (n) abrirContagem(); }
    else if (G.estado === 'contagem') { if (!n) { G.estado = 'espera'; enviar(true); } else if (agora >= G.inicio) largar(); }
    else if (G.estado === 'corrida') {
      const lista = naCorrida(), vivos = lista.filter(r => r.morte == null), t = tCorrida();
      G.pista.gerarAte(C.dist(t + 8) + 2000);
      if (!lista.length || (lista.length > 1 && vivos.length <= 1) || (lista.length === 1 && vivos.length === 0) || t > MAX) {
        if (!G.fimPend) G.fimPend = agora + ATRASO * 1000 + 600; // deixa a live mostrar a última queda
        if (agora >= G.fimPend) { G.fimPend = 0; encerrar(); }
      }
    }
    else if (G.estado === 'fim' && agora >= G.fimEm) { if (n) abrirContagem(); else { G.estado = 'espera'; enviar(true); } }
  }

  // ---------- envio (1 vez por segundo, mais nas mudanças) ----------
  let ultEnvio = 0;
  function enviar(ja) {
    const agora = performance.now(); if (!mundo || (!ja && agora - ultEnvio < 1000)) return; ultEnvio = agora;
    const t = G.estado === 'corrida' ? tCorrida() : 0;
    const snap = {
      e: aberto ? G.estado : 'fechado', k: G.k, seed: G.seed, em: Math.round(G.inicio - agora),
      j: presentes().map(r => { const dentro = r.k === G.k && G.estado !== 'contagem'; const morto = dentro && r.morte != null; return [r.slot, r.id, r.nick, r.h, dentro ? (morto ? 0 : 1) : 2, dentro ? C.pontos(C.dist(morto ? r.morte * PASSO : t), r.almas, false) : 0]; })
    };
    if (G.res) snap.r = G.res;
    try { mundo.enviar('e', snap); msgs += 1 + presentes().length; } catch (e) { }
  }

  // ---------- desenho ----------
  const CHAO = 900, RX = 500, Z = 1.45; // na live tudo aparece maior
  function texto(t, x, y, tam, cor, al = 'left', fonte = 'Pirata One') { cx.font = `${tam}px "${fonte}", Georgia, serif`; cx.textAlign = al; cx.fillStyle = cor; cx.fillText(t, x, y); }
  function painel(x, y, w, h) { cx.fillStyle = 'rgba(12,10,9,.84)'; cx.fillRect(x, y, w, h); cx.strokeStyle = 'rgba(199,154,79,.55)'; cx.lineWidth = 1.5; cx.strokeRect(x + .5, y + .5, w - 1, h - 1); cx.fillStyle = '#c22a2d'; cx.fillRect(x, y, w, 4); }
  let tAnim = 0, ultQ = performance.now();
  function quadro(agora) {
    if (LEVE && agora - ultQ < 30) { requestAnimationFrame(quadro); return; }
    cx.setTransform(ESC, 0, 0, ESC, 0, 0);
    const dt = Math.min(.1, (agora - ultQ) / 1000); ultQ = agora; tAnim += dt;
    const correndo = G.estado === 'corrida' || G.estado === 'fim';
    const tv = G.estado === 'corrida' ? Math.max(0, tCorrida() - ATRASO) : 0, passoV = Math.floor(tv / PASSO);
    const lista = R.filter(r => r && r.k === G.k && correndo);
    // câmera: segue a distância de quem ainda corre (todos vivos estão no mesmo ponto da pista)
    const dCam = G.estado === 'corrida' ? C.dist(tv) : G.estado === 'fim' ? (G.dFim || 0) : tAnim * 120;
    if (G.estado === 'corrida') G.dFim = dCam;
    const v = { W: 1920, H: 1080, z: Z, d: dCam, rx: RX, chao: CHAO, t: tAnim };
    C.cenario(cx, v, IM, cache);
    if (G.pista && correndo) C.obstaculos(cx, v, G.pista, IM, null);
    // refaz a corrida de cada um até o instante mostrado
    const rot = [];
    const ord = lista.slice().sort((a, b) => a.slot - b.slot);
    for (const r of ord) {
      if (G.estado === 'corrida') while (r.passo < passoV && (r.morte == null || r.passo < r.morte)) { while (r.evI < r.ev.length && r.ev[r.evI][0] <= r.passo) { r.ev[r.evI][1] ? C.apertar(r.c) : C.soltar(r.c); r.evI++; } C.passoFis(r.c); r.passo++; }
      const morreuJa = r.morte != null && r.passo >= r.morte;
      if (morreuJa && r.caiu == null) r.caiu = tAnim;
      const off = (r.slot % 5) * 9, dx = morreuJa ? (C.dist(r.morte * PASSO) - dCam) * Z : 0;
      const caido = morreuJa ? tAnim - r.caiu : null;
      if (caido != null && caido > 1.6) continue;
      C.corredor(cx, IM && IM.herois[r.h], RX + off + dx, CHAO, r.c ? r.c.h : 0, Z, tAnim + r.slot * .13, { alfa: morreuJa ? Math.max(0, 1 - caido / 1.6) : .92, caido });
      if (!morreuJa) rot.push([r.nick, r.c ? r.c.h : 0]);
    }
    // nomes empilhados acima de quem estiver mais alto
    const topo = Math.max(0, ...rot.map(x => x[1]));
    rot.slice(0, 8).forEach(([nick], i) => C.rotulo(cx, nick, RX + 20, CHAO - (topo + 96) * Z - i * 26, false));
    if (rot.length > 8) C.rotulo(cx, `+${rot.length - 8}`, RX + 20, CHAO - (topo + 96) * Z - 8 * 26, false);
    // quedas anunciadas quando a live chega nelas
    for (const q of G.quedas) if (!q.mostrada && q.passo <= passoV) { q.mostrada = true; q.em = tAnim; }
    if (!LEVE) { const vg = cx.createRadialGradient(960, 540, 420, 960, 540, 1150); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.5)'); cx.fillStyle = vg; cx.fillRect(0, 0, 1920, 1080); }
    hud(tv, lista);
    requestAnimationFrame(quadro);
  }
  function hud(tv, lista) {
    const n = presentes().length;
    painel(28, 28, 500, 150);
    cx.fillStyle = '#e04b3c'; cx.beginPath(); cx.arc(52, 58, 7, 0, 7); cx.fill();
    texto('CORRIDA DAS CINZAS · AO VIVO', 68, 65, 20, '#c8742a', 'left', 'IM Fell English');
    texto('Jogue pelo celular', 48, 108, 36, '#f3e7d2');
    cx.fillStyle = '#9b1c1f'; cx.fillRect(48, 122, 330, 40); texto('ashemvow.github.io/salao', 60, 152, 28, '#f3e7d2');
    texto(`${n} ${n === 1 ? 'corredor' : 'corredores'}`, 508, 152, 24, '#c79a4f', 'right');
    if (G.estado === 'corrida') {
      const vivos = lista.filter(r => r.morte == null || r.passo < r.morte).length;
      texto(C.metros(C.dist(tv)), 960, 96, 80, '#f3e7d2', 'center');
      texto(`${vivos} de ${lista.length} ainda correndo · ${Math.round(C.vel(tv) / 3.8)} km/h`, 960, 134, 26, '#c9bfae', 'center', 'IM Fell English');
    }
    // placar
    const t = G.estado === 'corrida' ? tv : 0;
    const placar = lista.map(r => ({ r, vivo: !(r.morte != null && r.passo >= r.morte), p: C.pontos(C.dist(r.morte != null && r.passo >= r.morte ? r.morte * PASSO : t), r.almas, false) })).sort((a, b) => b.p - a.p).slice(0, 10);
    if (placar.length && G.estado === 'corrida') {
      painel(1440, 28, 452, 70 + placar.length * 46); texto('Placar', 1464, 72, 32, '#f3e7d2');
      placar.forEach((o, i) => { const y = 92 + i * 46; cx.fillStyle = i % 2 ? 'rgba(0,0,0,.25)' : 'rgba(0,0,0,.45)'; cx.fillRect(1452, y, 428, 42);
        const img = IM && IM.herois[o.r.h]; if (img) { const k = 36 / img.height; cx.globalAlpha = o.vivo ? 1 : .4; cx.drawImage(img, 1460, y + 3, img.width * k, 36); cx.globalAlpha = 1; }
        texto(o.r.nick, 1500, y + 28, 22, o.vivo ? '#f3e7d2' : '#8f8576', 'left', 'IM Fell English'); texto(o.p.toLocaleString('pt-BR'), 1866, y + 30, 26, o.vivo ? '#c8742a' : '#6f6556', 'right'); });
    }
    // quedas recentes
    const recentes = G.quedas.filter(q => q.mostrada && tAnim - q.em < 4).slice(-4);
    recentes.forEach((q, i) => { const y = 930 - i * 54; painel(28, y, 520, 46); texto(`${q.nick} caiu em ${C.metros(C.dist(q.passo * PASSO))}`, 48, y + 32, 24, '#f3e7d2', 'left', 'IM Fell English'); });
    // mensagens no meio
    const meio = (t1, t2, t3) => { cx.fillStyle = 'rgba(12,10,9,.76)'; const h = t3 ? 300 : 230; cx.fillRect(440, 330, 1040, h); cx.strokeStyle = 'rgba(199,154,79,.6)'; cx.strokeRect(440.5, 330.5, 1039, h - 1);
      texto(t1, 960, 430, 84, '#ffd27a', 'center'); texto(t2, 960, 490, 30, '#d8cdbb', 'center', 'IM Fell English'); if (t3) texto(t3, 960, 552, 26, '#c79a4f', 'center', 'IM Fell English'); };
    if (!conectado) meio('Conectando...', 'Ligando a corrida ao Salão.');
    else if (!aberto) meio('Salão fechado', 'Abra o Salão na página de controle para a corrida funcionar.');
    else if (G.estado === 'espera') meio('Corrida das Cinzas', 'Entre em ashemvow.github.io/salao e corra com o chat. Um toque para pular, segure para pular mais alto.');
    else if (G.estado === 'contagem') { const s = Math.max(1, Math.ceil((G.inicio - performance.now()) / 1000)); meio(`Largada em ${s}`, `${n} ${n === 1 ? 'corredor na linha' : 'corredores na linha'}. Ainda dá tempo de entrar.`, 'O último de pé vence a rodada.'); }
    else if (G.estado === 'fim' && G.res) {
      const r = G.res, falta = Math.max(0, Math.ceil((G.fimEm - performance.now()) / 1000));
      meio(r.v ? `${r.v[0]} venceu!` : 'Fim da corrida', r.v ? `Último de pé, com ${r.v[2].toLocaleString('pt-BR')} pontos.` : r.l.length ? `Melhor: ${r.l[0][0]} com ${r.l[0][2].toLocaleString('pt-BR')} pontos.` : '',
        `${r.l.slice(0, 3).map((x, i) => `${i + 1}º ${x[0]}`).join('   ·   ')}${falta ? `   ·   nova corrida em ${falta}` : ''}`);
    }
  }

  // ---------- laços ----------
  setInterval(() => { passo(); enviar(false); }, 50);
  requestAnimationFrame(quadro);
  setInterval(() => { $('ctrl-st').textContent = `${conectado ? 'No ar' : 'Desconectado'} · ${aberto ? 'Salão aberto' : 'Salão fechado'} · mensagens nesta sessão: ${msgs.toLocaleString('pt-BR')}`; }, 1000);

  // ---------- ligar ----------
  async function status() { try { const s = await rpc('salao_status'); aberto = !!s.aberto; } catch (e) { } }
  async function ligar() {
    $('msg').textContent = 'Conferindo...';
    try {
      const guard = ls.get('arena-sala') || ''; sala = /^[a-z0-9]{10}$/.test(guard) ? guard : Math.random().toString(36).slice(2, 12).padEnd(10, '0');
      await rpc('salao_sala', { p_codigo: codigo, p_sala: sala }); ls.set('salao-admin', codigo); ls.set('arena-sala', sala);
    } catch (e) { $('msg').textContent = /codigo_invalido/.test(e.message) ? 'Código errado.' : 'Sem conexão. Tente de novo.'; $('login').hidden = false; return; }
    $('login').hidden = true; await status();
    IM = await C.carregarTudo();
    try {
      mundo = await window.REDE.canal('cc-' + sala, () => { });
      await Promise.all(Array.from({ length: VAGAS }, (_, i) => window.REDE.canal(`cc-${sala}-${i}`, (ev, d) => aoJogador(i, ev, d))));
      conectado = true;
    } catch (e) { conectado = false; $('ctrl-st').textContent = 'Não consegui ligar o tempo real. Recarregue a página.'; }
    setInterval(() => rpc('salao_sala', { p_codigo: codigo, p_sala: sala }).catch(() => { }), 60000);
    setInterval(status, 10000);
  }
  $('entrar').onclick = () => { codigo = $('cod').value.trim() || codigo; ligar(); };
  $('cod').addEventListener('keydown', e => { if (e.key === 'Enter') $('entrar').click(); });
  $('reiniciar').onclick = () => { if (G.estado === 'corrida') encerrar(); };
  $('desligar').onclick = async () => { try { await rpc('salao_sala', { p_codigo: codigo, p_sala: null }); } catch (e) { } ls.set('arena-sala', ''); location.reload(); };
  addEventListener('pagehide', () => { if (sala && codigo) rpc('salao_sala', { p_codigo: codigo, p_sala: null }, true).catch(() => { }); });
  if (codigo) { $('cod').value = codigo; ligar(); }
  window.__corrida = { G: () => G, R };
})();
