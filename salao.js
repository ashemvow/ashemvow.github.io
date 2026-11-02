/* Salão do Juramento: estado ao vivo, nome do chat, ranking, quiz e desafio dos chefes. */
(() => {
  const S = window.SITE, I = S.inscricao, $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const REDUZIR = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ls = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { } } };

  async function rpc(nome, corpo) {
    const r = await fetch(`${I.supabaseUrl}/rest/v1/rpc/${nome}`, { method: 'POST', headers: { apikey: I.supabaseKey, 'Content-Type': 'application/json' }, body: JSON.stringify(corpo || {}) });
    const txt = await r.text(); if (!r.ok) throw new Error(txt); return txt ? JSON.parse(txt) : null;
  }

  // ---------- estado ao vivo ----------
  let estado = { aberto: false, evento: '', sessao: 0 }, conhecido = false;
  async function status() {
    try { estado = await rpc('salao_status'); conhecido = true; } catch (e) { if (!conhecido) estado = { aberto: false, evento: '', sessao: 0 }; }
    const ab = !!estado.aberto;
    document.body.classList.toggle('sl-aberto', ab); document.body.classList.toggle('sl-fechado-b', !ab);
    $('sl-estado').textContent = ab ? 'Ao vivo agora · Salão aberto' : 'Salão fechado · abre nas lives';
    $('sl-selo').classList.toggle('vivo', ab);
    if (estado.evento) $('sl-evento').textContent = ab ? `Esta noite: ${estado.evento}` : 'Jogue com o chat durante as lives de Ashem Vow.';
    $('sl-fechado').hidden = ab;
    if (!ab && window.__vigilia && window.__vigilia.estado() && !window.__vigilia.estado().fim) { /* deixa terminar a partida em andamento */ }
    ranking();
  }
  const redes = Object.entries(S.redes || {}).filter(([k, u]) => u && ['twitch', 'instagram', 'youtube', 'tiktok'].includes(k));
  const NOMES = { twitch: 'Seguir na Twitch', instagram: 'Instagram', youtube: 'YouTube', tiktok: 'TikTok' };
  $('sl-redes').innerHTML = redes.map(([k, u]) => `<a class="btn${k === 'twitch' ? ' red' : ''}" href="${esc(u)}" target="_blank" rel="noopener">${NOMES[k]}</a>`).join('');

  // ---------- nome do chat ----------
  const NK = 'salao-nick';
  const valido = n => /^[\p{L}\p{N}_.-]{2,16}$/u.test(n);
  function nick() { return ls.get(NK) || ''; }
  function mostrarNick() {
    const n = nick(); $('sl-nick').value = n;
    $('sl-nick-msg').innerHTML = n ? `Você está no Salão como <b>${esc(n)}</b>. Pode trocar quando quiser.` : 'É com esse nome que você aparece no ranking e na live.';
    $('sl-nick-ok').textContent = n ? 'Trocar nome' : 'Entrar no Salão';
  }
  $('sl-nick-ok').onclick = () => {
    const n = $('sl-nick').value.trim().replace(/\s+/g, '_');
    if (!valido(n)) { $('sl-nick-msg').textContent = 'Use de 2 a 16 letras, números, _ . ou -'; $('sl-nick').focus(); return; }
    ls.set(NK, n); mostrarNick();
  };
  $('sl-nick').addEventListener('keydown', e => { if (e.key === 'Enter') $('sl-nick-ok').click(); });
  function pedirNick() { $('sl-nickbox').scrollIntoView({ behavior: REDUZIR ? 'auto' : 'smooth', block: 'center' }); $('sl-nickbox').classList.add('pisca'); setTimeout(() => $('sl-nickbox').classList.remove('pisca'), 1600); $('sl-nick').focus(); }
  mostrarNick();

  // registra no overlay da live (só com o Salão aberto e nome definido)
  async function registrar(tipo, texto, pontos) { if (!estado.aberto || !nick()) return; try { await rpc('registrar_salao', { p_tipo: tipo, p_nick: nick(), p_texto: texto, p_pontos: pontos || 0 }); } catch (e) { } }

  // ---------- ranking ----------
  let aba = 'live';
  $('rk-abas').onclick = e => { const b = e.target.closest('button'); if (!b) return; aba = b.dataset.r; $('rk-abas').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); ranking(); };
  async function ranking() {
    const box = $('rk');
    if (aba === 'live' && !estado.aberto) { box.innerHTML = '<li class="vazio">O ranking da live aparece quando o Salão abrir.</li>'; return; }
    try {
      const rows = await rpc('top_vigilia', { p_limit: 10, p_sessao: aba === 'live' ? estado.sessao : null });
      box.innerHTML = rows.length ? rows.map((r, i) => `<li class="${r.nick === nick() ? 'eu' : ''}"><span class="pos">${i + 1}</span><b>${esc(r.nick)}</b><span class="hr">${esc(r.heroi)}</span><span class="tm">${Math.floor(r.tempo / 60)}:${String(r.tempo % 60).padStart(2, '0')}</span><span class="pt">${r.pontos.toLocaleString('pt-BR')}</span></li>`).join('') : '<li class="vazio">Ninguém sobreviveu ainda. Seja o primeiro.</li>';
    } catch (e) { box.innerHTML = '<li class="vazio">Não deu para carregar o ranking agora.</li>'; }
  }

  // ---------- compartilhar ----------
  async function compartilhar(texto, url) {
    try { if (navigator.share) { await navigator.share({ title: 'Ashem Vow', text: texto, url }); return; } } catch (e) { return; }
    try { await navigator.clipboard.writeText(`${texto} ${url}`); toast('Texto copiado. Cole onde quiser.'); } catch (e) { toast(url); }
  }
  function toast(t) { const d = document.createElement('div'); d.className = 'sl-toast'; d.textContent = t; document.body.append(d); setTimeout(() => d.classList.add('on'), 20); setTimeout(() => { d.classList.remove('on'); setTimeout(() => d.remove(), 400); }, 2600); }

  window.SALAO = { rpc, ranking, compartilhar, nick, pedirNick, aberto: () => !!estado.aberto };

  // ---------- QUIZ ----------
  const PERFIL = {
    'Garrick': { v: { fogo: 2, protetor: 2, forca: 1 }, frase: 'Você protege os seus até o fim, mesmo que o mundo queime em volta.' },
    'Yurinn': { v: { fogo: 2, magia: 2, distancia: 1 }, frase: 'Paciente e certeira, você tece o destino com fios de fogo.' },
    'Brann': { v: { luz: 2, protetor: 2, forca: 2 }, frase: 'Firme como pedra: lento para começar, impossível de derrubar.' },
    'Selka': { v: { sombra: 2, rapido: 2, caos: 1 }, frase: 'Rápida, imprevisível e um pouco perigosa. Ninguém te alcança.' },
    'Orun': { v: { morte: 2, magia: 1, forca: 1 }, frase: 'Você conversa com o que os outros temem. Os mortos trabalham para você.' },
    'Sombras das Cinzas': { v: { fogo: 1, sombra: 2, magia: 2, caos: 1 }, frase: 'Mistério puro. Ninguém sabe de onde você veio, só que deixa tudo em chamas.' },
    'Ysolde': { v: { gelo: 3, magia: 1, distancia: 1 }, frase: 'Fria por fora, estratégica por dentro. Você congela o problema antes de resolvê-lo.' },
    'Kaelor': { v: { natureza: 2, distancia: 1, forca: 1, protetor: 1 }, frase: 'Caçador paciente. Você prepara o terreno e deixa a presa vir até você.' },
    'Mordrek': { v: { natureza: 1, caos: 2, magia: 1, morte: 1 }, frase: 'Curioso e meio caótico. Seus experimentos às vezes funcionam bem demais.' },
    'Lyra': { v: { distancia: 3, luz: 1, rapido: 1 }, frase: 'Olhar distante, mira perfeita. Você resolve antes de alguém perceber.' },
    'Irmão Brasa': { v: { fogo: 1, forca: 2, protetor: 1, rapido: 1 }, frase: 'Disciplina e fúria na mesma medida. Seu silêncio fala alto.' },
    'Vesper': { v: { som: 3, sombra: 1, magia: 1, morte: 1 }, frase: 'Sua voz ecoa onde ninguém mais chega. Você transforma dor em canção.' }
  };
  const PERG = [
    ['A horda desce do céu. O que você faz primeiro?', [['Fico na frente e protejo quem está atrás.', { protetor: 2, forca: 1 }], ['Ataco de longe antes que cheguem.', { distancia: 2 }], ['Corro entre eles e corto tudo.', { rapido: 2, sombra: 1 }], ['Preparo uma armadilha e espero.', { natureza: 1, magia: 1, caos: 1 }]]],
    ['Escolha um elemento.', [['Fogo', { fogo: 2 }], ['Gelo', { gelo: 2 }], ['Sombra', { sombra: 2 }], ['Luz', { luz: 2 }]]],
    ['Qual arma parece feita para você?', [['Uma lâmina pesada.', { forca: 2 }], ['Arco, dardos ou flechas.', { distancia: 2 }], ['As próprias mãos e um pouco de magia.', { magia: 2 }], ['Frascos, espinhos e coisas estranhas.', { natureza: 1, caos: 1 }]]],
    ['Onde você se sente em casa?', [['Numa catedral em ruínas.', { luz: 1, morte: 1, som: 1 }], ['Numa floresta morta.', { natureza: 2 }], ['Na Geleira dos Esquecidos.', { gelo: 2 }], ['No Abismo de Brasas.', { fogo: 2 }]]],
    ['Seus amigos diriam que você é...', [['Leal até o fim.', { protetor: 2 }], ['Imprevisível.', { caos: 2 }], ['Calmo e calculista.', { gelo: 1, distancia: 1 }], ['Intenso em tudo.', { fogo: 1, forca: 1 }]]],
    ['Um segredo antigo cai nas suas mãos. Você...', [['Guarda a sete chaves.', { protetor: 1, luz: 1 }], ['Usa a seu favor.', { sombra: 1, magia: 1 }], ['Testa para ver o que acontece.', { caos: 2 }], ['Pergunta aos mortos.', { morte: 2 }]]],
    ['Que som combina com você?', [['Um sino rachado ao longe.', { som: 2, morte: 1 }], ['O estalo do fogo.', { fogo: 2 }], ['O vento sobre o gelo.', { gelo: 1, rapido: 1 }], ['O silêncio antes do golpe.', { rapido: 1, sombra: 1, distancia: 1 }]]],
    ['No fim, diante do selo, você...', [['Renova o juramento, custe o que custar.', { protetor: 2, luz: 1 }], ['Quebra o selo e encara o que vier.', { caos: 1, forca: 1, fogo: 1 }], ['Faz o selo trabalhar para você.', { magia: 2 }], ['Deixa o destino decidir.', { morte: 1, sombra: 1, som: 1 }]]]
  ];
  const HER = Object.fromEntries(S.personagens.map(p => [p.nome, p]));
  const qz = $('qz'); let qi = 0, pts = {};
  function quizInicio() {
    qz.innerHTML = `<div class="qz-ini"><div class="qz-rostos">${Object.keys(PERFIL).map(n => `<img src="${esc(HER[n].skins[0].img)}" alt="" loading="lazy">`).join('')}</div><button type="button" class="btn red grande" id="qz-go">Começar o quiz</button></div>`;
    $('qz-go').onclick = () => { qi = 0; pts = {}; pergunta(); };
  }
  function pergunta() {
    const [p, ops] = PERG[qi];
    qz.innerHTML = `<div class="qz-q"><div class="qz-prog">${PERG.map((_, i) => `<i class="${i < qi ? 'ok' : i === qi ? 'at' : ''}"></i>`).join('')}</div><p class="k">Pergunta ${qi + 1} de ${PERG.length}</p><h3>${esc(p)}</h3><div class="qz-ops">${ops.map((o, i) => `<button type="button" data-i="${i}"><b>${'ABCD'[i]}</b>${esc(o[0])}</button>`).join('')}</div></div>`;
    qz.querySelector('.qz-ops').onclick = e => { const b = e.target.closest('button'); if (!b) return; b.classList.add('on');
      for (const [k, v] of Object.entries(ops[+b.dataset.i][1])) pts[k] = (pts[k] || 0) + v;
      qz.querySelectorAll('.qz-ops button').forEach(x => x.disabled = true);
      setTimeout(() => { qi++; qi < PERG.length ? pergunta() : resultado(); }, 380); };
  }
  function resultado() {
    let melhor = null, mv = -1;
    for (const [n, p] of Object.entries(PERFIL)) { let v = 0; for (const [k, w] of Object.entries(p.v)) v += (pts[k] || 0) * w; v += Math.random() * .5; if (v > mv) { mv = v; melhor = n; } }
    const h = HER[melhor], p = PERFIL[melhor];
    qz.innerHTML = `<div class="qz-res"><div class="qz-arte"><img class="bg" src="${esc(h.habilidades[0].img)}" alt=""><img class="pt" src="${esc(h.skins[0].img)}" alt="${esc(h.nome)}"></div>
      <div class="qz-txt"><p class="k">Seu juramento</p><h3>${esc(h.nome)}</h3><p class="tit">${esc(h.titulo)}</p><p class="frase">${esc(p.frase)}</p>
      <p class="hab"><b>${esc(h.habilidade)}.</b> ${esc(h.descricao.replace(/^(Herói|Exclusiv)[^.]*\.\s*/i, ''))}</p>
      <div class="qz-sk">${h.habilidades.map(s => `<figure><img src="${esc(s.img)}" alt=""><figcaption>${esc(s.nome)}</figcaption></figure>`).join('')}</div>
      <div class="btns"><button type="button" class="btn red" id="qz-share">Compartilhar</button><button type="button" class="btn" id="qz-again">Refazer</button><a class="btn" href="#vigilia">Jogar a Vigília</a></div></div></div>`;
    $('qz-share').onclick = () => compartilhar(`Fiz o quiz de Ashem Vow e meu herói é ${h.nome}, ${h.titulo}. E o seu?`, location.origin + location.pathname + '#quiz');
    $('qz-again').onclick = () => { qi = 0; pts = {}; pergunta(); };
    registrar('quiz', h.nome, 0);
  }
  quizInicio();

  // ---------- QUE CHEFE É ESSE? ----------
  const CHEFES = S.criaturas.flatMap(f => f.criaturas.filter(c => c.chefe).map(c => ({ ...c, fase: f.fase })));
  const ch = $('ch'); let ronda = [], ci = 0, acertos = 0, seq = 0, timer = 0;
  const TITULOS = [[10, 'Mestre do Bestiário'], [8, 'Caçador de Chefes'], [5, 'Sentinela Atento'], [0, 'Aprendiz do Juramento']];
  function chefesInicio() {
    ch.innerHTML = `<div class="ch-ini"><div class="ch-sil">${CHEFES.slice(0, 6).map(c => `<img src="${esc(c.img)}" alt="" loading="lazy">`).join('')}</div><button type="button" class="btn red grande" id="ch-go">Começar o desafio</button></div>`;
    $('ch-go').onclick = comecar;
  }
  function comecar() { ronda = CHEFES.slice().sort(() => Math.random() - .5).slice(0, 10); ci = 0; acertos = 0; seq = 0; rodada(); }
  function rodada() {
    const c = ronda[ci], ops = [c, ...CHEFES.filter(x => x.nome !== c.nome).sort(() => Math.random() - .5).slice(0, 3)].sort(() => Math.random() - .5);
    ch.innerHTML = `<div class="ch-q"><div class="ch-topo"><span>Chefe ${ci + 1} de 10</span><span>Acertos <b>${acertos}</b>${seq > 1 ? ` · sequência ${seq}` : ''}</span></div><div class="ch-tempo"><i id="ch-t"></i></div>
      <div class="ch-palco"><img id="ch-img" class="sombra" src="${esc(c.img)}" alt="Silhueta de um chefe"></div><p class="ch-fase" id="ch-fase">&nbsp;</p>
      <div class="ch-ops">${ops.map(o => `<button type="button" data-n="${esc(o.nome)}">${esc(o.nome)}</button>`).join('')}</div></div>`;
    const t0 = performance.now(), dur = 10000; cancelAnimationFrame(timer);
    const tick = () => { const k = Math.min(1, (performance.now() - t0) / dur); const bar = $('ch-t'); if (!bar) return; bar.style.width = (100 - k * 100) + '%'; if (k >= 1) responder(null, c); else timer = requestAnimationFrame(tick); };
    timer = requestAnimationFrame(tick);
    ch.querySelector('.ch-ops').onclick = e => { const b = e.target.closest('button'); if (b) responder(b, c); };
  }
  function responder(b, c) {
    cancelAnimationFrame(timer); const ok = b && b.dataset.n === c.nome;
    if (ok) { acertos++; seq++; } else seq = 0;
    ch.querySelectorAll('.ch-ops button').forEach(x => { x.disabled = true; if (x.dataset.n === c.nome) x.classList.add('certo'); else if (x === b) x.classList.add('errado'); });
    $('ch-img').classList.remove('sombra'); $('ch-img').classList.add('revela');
    $('ch-fase').innerHTML = `${ok ? 'Acertou!' : b ? 'Errou.' : 'O tempo acabou.'} <b>${esc(c.nome)}</b>, chefe do ${esc(c.fase)}.`;
    setTimeout(() => { ci++; ci < ronda.length ? rodada() : chefesFim(); }, 1700);
  }
  function chefesFim() {
    const titulo = TITULOS.find(([m]) => acertos >= m)[1];
    ch.innerHTML = `<div class="ch-fim"><p class="k">Resultado</p><h3>${acertos} de 10</h3><p class="tit">${titulo}</p><div class="ch-sil">${ronda.map(c => `<img src="${esc(c.img)}" alt="${esc(c.nome)}" title="${esc(c.nome)}">`).join('')}</div>
      <div class="btns" style="justify-content:center"><button type="button" class="btn red" id="ch-share">Compartilhar</button><button type="button" class="btn" id="ch-again">Jogar de novo</button></div></div>`;
    $('ch-share').onclick = () => compartilhar(`Reconheci ${acertos} de 10 chefes de Ashem Vow e virei ${titulo}. Duvido você acertar mais.`, location.origin + location.pathname + '#chefes');
    $('ch-again').onclick = comecar;
    registrar('chefes', titulo, acertos);
  }
  chefesInicio();

  // ---------- geral ----------
  status(); setInterval(status, 20000);
  setInterval(() => { if (estado.aberto) ranking(); }, 30000);
  $('ano').textContent = new Date().getFullYear();
  const menu = $('menu'), links = $('links');
  menu.onclick = () => { const o = links.classList.toggle('open'); menu.setAttribute('aria-expanded', o); };
  links.onclick = e => { if (e.target.tagName === 'A') { links.classList.remove('open'); menu.setAttribute('aria-expanded', false); } };
  if (!REDUZIR) {
    const c = $('embers'), x = c.getContext('2d'); let p = [];
    const fit = () => { c.width = innerWidth; c.height = innerHeight; }; fit(); addEventListener('resize', fit);
    const mk = () => ({ x: Math.random() * c.width, y: c.height + 10, r: Math.random() * 2 + .5, v: Math.random() * .8 + .3, d: Math.random() * 2 - 1 });
    for (let i = 0; i < 40; i++) { const e = mk(); e.y = Math.random() * c.height; p.push(e); }
    (function t() { x.clearRect(0, 0, c.width, c.height); p.forEach((e, i) => { e.y -= e.v; e.x += Math.sin(e.y / 40) * .4 + e.d * .1; if (e.y < -10) p[i] = mk(); x.fillStyle = `rgba(230,120,40,${Math.min(1, e.y / c.height + .1) * .7})`; x.beginPath(); x.arc(e.x, e.y, e.r, 0, 7); x.fill(); }); requestAnimationFrame(t); })();
  }
})();
