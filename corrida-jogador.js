/* Corrida das Cinzas · lado do jogador. A corrida roda inteira aqui, sem esperar a internet;
   a cada segundo mandamos para a live só os momentos em que você apertou e soltou o pulo. */
(() => {
  const S = window.SITE, C = window.CORRIDA, $ = id => document.getElementById(id);
  const HER = S.vigiliaHerois, { PASSO, VAGAS } = C;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const st = { get: (k, l) => { try { return (l ? localStorage : sessionStorage).getItem(k); } catch (e) { return null; } }, set: (k, v, l) => { try { (l ? localStorage : sessionStorage).setItem(k, v); } catch (e) { } } };
  const MEU = st.get('corrida-id') || (() => { const v = Math.random().toString(36).slice(2) + Date.now().toString(36); st.set('corrida-id', v); return v; })();

  const cv = $('cc-canvas'), cx = cv.getContext('2d');
  let W = 0, H = 0, DPR = 1, IM = null; const cache = {};
  function medir() { const r = cv.getBoundingClientRect(); DPR = Math.min(matchMedia('(pointer: coarse)').matches ? 1.5 : 2, devicePixelRatio || 1); W = r.width; H = r.height; cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); }
  addEventListener('resize', medir);

  // ---------- estado ----------
  let sala = null, mundo = null, meuCanal = null, vaga = -1, heroi = +(st.get('corrida-heroi', 1) || 0) || 0;
  let modo = 'menu';                 // menu | entrando | sala | treino
  let snap = null, snapEm = 0, entrouEm = 0, ociosoMenu = 0;
  // corrida local (da live ou de treino)
  let R = null;                      // { k, seed, pista, c, passo, inicio, ev, enviados, morte, almas, pegas, treino }

  // ---------- escolha do vigia ----------
  const box = $('cc-herois');
  box.innerHTML = HER.map((h, i) => `<button type="button" data-i="${i}"><img src="${esc(h.img)}" alt="" loading="lazy"><span>${esc(h.nome)}</span></button>`).join('');
  const marcar = () => { box.querySelectorAll('button').forEach((b, i) => b.classList.toggle('on', i === heroi)); $('cc-info').innerHTML = `<b>${esc(HER[heroi].nome)}</b> vai correr por você.`; };
  box.onclick = e => { const b = e.target.closest('button'); if (!b) return; heroi = +b.dataset.i; st.set('corrida-heroi', heroi, 1); marcar(); };
  marcar();

  // ---------- conexão ----------
  function situacao() {
    const s = window.SALAO.estado(), nova = s && s.aberto ? s.sala || null : null;
    if (nova !== sala) { desligar(); sala = nova; }
    if (modo !== 'menu') return;
    $('cc-status').textContent = !s || !s.aberto ? 'A corrida abre quando a live começar' : !sala ? 'A tela da corrida ainda não entrou no ar. Já já começa.' : snap ? textoSala() : 'Corrida no ar. Escolha seu vigia e entre.';
    $('cc-entrar').disabled = !sala;
  }
  const textoSala = () => { const n = snap ? snap.j.length : 0; return n >= VAGAS ? 'A corrida está cheia. Treine enquanto abre uma vaga.' : `Corrida no ar · ${n} ${n === 1 ? 'corredor' : 'corredores'} agora`; };
  addEventListener('salao-status', situacao);
  async function ligarMundo() {
    if (!sala || mundo) return; ociosoMenu = performance.now(); const s = sala;
    try { const c = await window.REDE.canal('cc-' + s, (ev, d) => { if (ev === 'e') receber(d); }); if (s !== sala) { c.sair(); return; } mundo = c; }
    catch (e) { $('cc-status').textContent = 'Não consegui ligar à corrida. Tente de novo.'; }
  }
  function desligar() {
    if (meuCanal) { try { meuCanal.enviar('x', { id: MEU }); } catch (e) { } meuCanal.sair(); meuCanal = null; }
    if (mundo) { mundo.sair(); mundo = null; }
    snap = null; vaga = -1; if (modo === 'sala' || modo === 'entrando') voltarMenu();
  }
  $('cc-entrar').onclick = async () => {
    if (!window.SALAO.nick()) { window.SALAO.pedirNick(); $('cc-status').textContent = 'Primeiro diga seu nome do chat no topo da página.'; return; }
    if (!sala) return;
    $('cc-entrar').disabled = true; $('cc-status').textContent = 'Entrando na corrida...';
    await ligarMundo(); if (!mundo) { $('cc-entrar').disabled = false; return; }
    if (!snap) await new Promise(r => setTimeout(r, 1300)); // espera a primeira notícia da live para ver as vagas
    const ocup = new Set((snap ? snap.j : []).map(j => j[0])), livre = [...Array(VAGAS).keys()].find(i => !ocup.has(i));
    if (livre == null) { $('cc-status').textContent = textoSala(); $('cc-entrar').disabled = false; return; }
    try { meuCanal = await window.REDE.canal(`cc-${sala}-${livre}`, () => { }); }
    catch (e) { $('cc-status').textContent = 'Não consegui entrar. Tente de novo.'; $('cc-entrar').disabled = false; return; }
    vaga = livre; modo = 'entrando'; entrouEm = performance.now(); oi();
  };
  const oi = () => meuCanal && meuCanal.enviar('i', { id: MEU, n: window.SALAO.nick(), h: heroi });
  $('cc-treinar').onclick = () => { modo = 'treino'; abrirJogo(); novoTreino(); };
  $('cc-sair').onclick = () => { if (meuCanal) { try { meuCanal.enviar('x', { id: MEU }); } catch (e) { } meuCanal.sair(); meuCanal = null; } vaga = -1; R = null; voltarMenu(); };
  function voltarMenu() { modo = 'menu'; R = null; $('cc-menu').hidden = false; $('cc-hud').hidden = true; $('cc-sair').hidden = true; $('cc-faixa').hidden = true; $('cc-entrar').disabled = !sala; ociosoMenu = performance.now(); situacao(); }
  function abrirJogo() { $('cc-menu').hidden = true; $('cc-hud').hidden = false; $('cc-sair').hidden = false; medir(); cv.focus(); }

  // ---------- notícias da live ----------
  const minha = () => snap && snap.j.find(j => j[1] === MEU);
  function receber(d) {
    snap = d; snapEm = performance.now();
    const eu = minha();
    if (modo === 'entrando') { if (eu) { modo = 'sala'; abrirJogo(); } else if (performance.now() - entrouEm > 4000) { if (meuCanal) { meuCanal.sair(); meuCanal = null; } voltarMenu(); $('cc-status').textContent = 'A live não respondeu. Tente de novo.'; return; } }
    if (modo === 'sala' && !eu && performance.now() - entrouEm > 4000) { voltarMenu(); $('cc-status').textContent = 'Você saiu da corrida. Entre de novo quando quiser.'; return; }
    if (modo !== 'sala') { if (modo === 'menu') situacao(); return; }
    // largada: prepara a pista da rodada e acerta o relógio
    const agora = performance.now();
    if (d.e === 'contagem' && eu) { if (!R || R.treino || R.k !== d.k) R = novaCorrida(d.k, d.seed, false); R.inicio = agora + d.em; }
    else if (d.e === 'corrida' && eu && eu[4] !== 2) { if (!R || R.treino || R.k !== d.k) { R = novaCorrida(d.k, d.seed, false); R.inicio = agora + d.em; } }
    else if (d.e === 'fim' && R && !R.treino) { if (!R.fimEm) R.fimEm = agora; R.parado = true; if (agora - R.fimEm > 4500) novoTreino(); }
    else if (!R || (!R.treino && (d.e === 'espera' || d.e === 'fechado' || (d.e === 'corrida' && eu && eu[4] === 2)))) novoTreino();
    faixa();
  }

  // ---------- corrida local ----------
  function novaCorrida(k, seed, treino) { const pista = C.Pista(seed); pista.gerarAte(4000); return { k, seed, pista, c: C.novoCorredor(), passo: 0, inicio: performance.now() + (treino ? 900 : 10000), ev: [], enviados: 0, morte: null, almas: 0, pegas: new Set(), treino, largou: false }; }
  function novoTreino() { R = novaCorrida(-1, (Math.random() * 2 ** 31) | 0, true); fila.length = 0; segurando = false; faixa(); }
  const fila = []; let segurando = false;
  function aperta() { if (modo !== 'sala' && modo !== 'treino') return; if (R && R.morte != null && R.treino && performance.now() - R.caiuEm > 500) { novoTreino(); return; } if (!segurando) { segurando = true; fila.push(1); } }
  function solta() { if (segurando) { segurando = false; fila.push(0); } }
  addEventListener('keydown', e => { if (modo !== 'sala' && modo !== 'treino') return; if ([' ', 'ArrowUp', 'w', 'W'].includes(e.key)) { if (document.activeElement === cv || document.activeElement === document.body) e.preventDefault(); if (!e.repeat) aperta(); } });
  addEventListener('keyup', e => { if ([' ', 'ArrowUp', 'w', 'W'].includes(e.key)) solta(); });
  cv.addEventListener('pointerdown', e => { e.preventDefault(); cv.setPointerCapture(e.pointerId); aperta(); });
  cv.addEventListener('pointerup', solta); cv.addEventListener('pointercancel', solta);

  function avancar(agora) {
    if (!R) return;
    const T = (agora - R.inicio) / 1000; if (T < 0) { fila.length = 0; return; }
    R.largou = true;
    const alvo = Math.floor(T / PASSO);
    while (R.passo < alvo && R.morte == null && !R.parado) {
      while (fila.length) { const v = fila.shift(); v ? C.apertar(R.c) : C.soltar(R.c); R.ev.push([R.passo, v]); }
      C.passoFis(R.c); R.passo++;
      const d = C.dist(R.passo * PASSO);
      if (R.passo % 240 === 0) R.pista.gerarAte(d + 6000);
      R.almas += C.pegaAlmas(R.pista, R.c, d, R.pegas);
      if (C.bateu(R.pista, R.c, d)) { R.morte = R.passo; R.caiuEm = agora; if (!R.treino) mandar(true); faixa(); }
    }
  }
  // a cada segundo (ou na queda): pulos novos, almas e onde você está
  let ultMandar = 0, ultOi = 0;
  function mandar(ja) {
    if (!meuCanal || modo !== 'sala') return;
    const agora = performance.now();
    if (R && !R.treino && R.largou && (ja || agora - ultMandar > 1000)) {
      ultMandar = agora; const novos = R.ev.slice(R.enviados); R.enviados = R.ev.length;
      meuCanal.enviar('b', { id: MEU, n: window.SALAO.nick(), h: heroi, k: R.k, ev: novos, a: R.almas, p: R.passo, m: R.morte });
    } else if (agora - ultOi > 2000 && (!R || R.treino || !R.largou)) { ultOi = agora; oi(); }
  }

  // ---------- faixas e HUD ----------
  function faixa() {
    let t = '', s = '';
    const eu = minha(), d = snap;
    if (modo === 'treino' || (R && R.treino)) {
      if (R && R.morte != null) { t = `Caiu em ${C.metros(C.dist(R.morte * PASSO))}`; s = 'Toque ou aperte espaço para tentar de novo.'; }
      else if (modo === 'sala' && d && d.e === 'corrida') { t = ''; s = ''; }
      else if (R && R.passo < 120) { t = modo === 'sala' ? 'Treino' : 'Treino livre'; s = modo === 'sala' ? 'A próxima corrida começa logo. Aquecendo...' : 'Toque para pular, segure para pular mais alto.'; }
    } else if (modo === 'sala' && d) {
      if (d.e === 'contagem') { t = `Largada em ${Math.max(1, Math.ceil((R ? R.inicio - performance.now() : d.em) / 1000))}`; s = 'Toque para pular, segure para pular mais alto. O último de pé vence.'; }
      else if (R && R.morte != null && d.e === 'corrida') { const vivos = d.j.filter(j => j[4] === 1).length; t = `Você caiu em ${C.metros(C.dist(R.morte * PASSO))}`; s = vivos ? `${vivos} ainda ${vivos === 1 ? 'corre' : 'correm'}. Veja na live quem vence!` : 'Esperando o resultado...'; }
      else if (d.e === 'fim' && d.r) { const pos = d.r.l.findIndex(x => x[0] === window.SALAO.nick()); t = d.r.v ? (d.r.v[0] === window.SALAO.nick() ? 'Você venceu!' : `${d.r.v[0]} venceu!`) : 'Fim da corrida'; s = pos >= 0 ? `Você ficou em ${pos + 1}º com ${d.r.l[pos][2].toLocaleString('pt-BR')} pontos. Nova corrida já já.` : 'Nova corrida já já.'; }
      else if (d.e === 'corrida' && eu && eu[4] === 2) { t = 'Corrida em andamento'; s = 'Você entra na próxima largada. Treine enquanto isso.'; }
      else if (d.e === 'fechado') { t = 'Salão fechado'; s = 'A live acabou. Até a próxima!'; }
    }
    $('cc-faixa').hidden = !t; $('cc-faixa-t').textContent = t; $('cc-faixa-s').textContent = s;
  }
  function hud() {
    const d = R ? C.dist(R.morte != null ? R.morte * PASSO : Math.max(0, R.passo * PASSO)) : 0;
    $('cc-metros').textContent = C.metros(d); $('cc-almas').textContent = R ? R.almas : 0; $('cc-pontos').textContent = R ? C.pontos(d, R.almas, false).toLocaleString('pt-BR') : 0;
    const vivos = snap && modo === 'sala' && snap.e === 'corrida' && R && !R.treino ? snap.j.filter(j => j[4] === 1).length : null;
    $('cc-vivos').textContent = vivos != null ? `${vivos} de ${snap.j.filter(j => j[4] !== 2).length} correndo` : R && R.treino ? 'treino' : '';
  }

  // ---------- desenho ----------
  let tAnim = 0, ult = performance.now();
  function quadro(agora) {
    const dt = Math.min(.05, (agora - ult) / 1000); ult = agora; tAnim += dt;
    if (modo === 'menu' && mundo && agora - ociosoMenu > 60000) desligar();
    if (modo === 'sala' && agora - snapEm > 8000 && snapEm) { desligar(); $('cc-status').textContent = 'A conexão com a live caiu. Entre de novo.'; }
    if (modo === 'sala' || modo === 'treino') {
      avancar(agora); mandar(false); desenhar(); hud();
      if ((agora | 0) % 4 === 0) faixa();
    }
    requestAnimationFrame(quadro);
  }
  function desenhar() {
    if (!W) medir();
    const z = Math.max(.55, Math.min(1.15, W / 560, H / 330)), chao = H * .76, rx = W * .15;
    const tr = R ? Math.max(0, (R.morte != null ? R.morte : R.passo) * PASSO) : 0;
    const d = R ? C.dist(tr) : tAnim * 100;
    cx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const v = { W, H, z, d, rx, chao, t: tAnim };
    C.cenario(cx, v, IM, cache);
    if (R) C.obstaculos(cx, v, R.pista, IM, R.pegas);
    const caido = R && R.morte != null ? Math.min(1.6, (performance.now() - R.caiuEm) / 1000) : null;
    C.corredor(cx, IM && IM.herois[heroi], rx, chao, R ? R.c.h : 0, z, R && R.largou ? tAnim : 0, { caido, alfa: caido ? Math.max(.2, 1 - caido / 1.6) : 1 });
    if (!caido) C.rotulo(cx, window.SALAO.nick() || 'você', rx, chao - ((R ? R.c.h : 0) + 96) * z, true);
  }

  // tela cheia
  const caixa = $('cc');
  $('cc-cheia').onclick = async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else { await caixa.requestFullscreen(); try { await screen.orientation.lock('landscape'); } catch (e) { } } } catch (e) { caixa.classList.toggle('cheia'); } setTimeout(medir, 200); };
  document.addEventListener('fullscreenchange', () => setTimeout(medir, 150));
  addEventListener('pagehide', () => { if (meuCanal) try { meuCanal.enviar('x', { id: MEU }); } catch (e) { } });

  C.carregarTudo().then(r => { IM = r; });
  requestAnimationFrame(quadro); situacao();
  window.__corridaJogador = { R: () => R, modo: () => modo, snap: () => snap, MEU };
})();
