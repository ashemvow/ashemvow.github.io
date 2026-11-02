/* Corrida das Cinzas: peças usadas pela tela da live (corrida-live.js) e pelo celular (corrida-jogador.js).
   A pista sai de uma semente: todo mundo corre exatamente a mesma pista, cada um no seu aparelho. */
(() => {
  const S = window.SITE;
  const PASSO = 1 / 120;                 // física em passos fixos: o celular e a live chegam no mesmo resultado
  const FIS = { g: 2600, v0: 900, segura: .22, leve: .45, buffer: .12 };
  const CORPO = { meia: 14, alt: 62 };   // caixa de colisão do corredor (um pouco menor que o desenho)
  const VAGAS = 20;

  // ---------- velocidade e distância ----------
  const V0 = 380, AC = 16, VMAX = 950, TC = (VMAX - V0) / AC, DC = V0 * TC + AC / 2 * TC * TC;
  const vel = t => Math.min(VMAX, V0 + AC * t);
  const dist = t => t < TC ? V0 * t + AC / 2 * t * t : DC + VMAX * (t - TC);
  const tempoEm = d => d < DC ? (-V0 + Math.sqrt(V0 * V0 + 2 * AC * d)) / AC : TC + (d - DC) / VMAX;

  // ---------- sorteio com semente ----------
  function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  // ---------- pista ----------
  // tipos: lapide (pule), dupla (pule longo), cruz (pule alto), fosso (não pise), morcego baixo (pule), morcego alto (não pule)
  const TIPOS = {
    lapide: { w: 34, y0: 0, y1: 46 },
    dupla: { w: 92, y0: 0, y1: 46 },
    cruz: { w: 30, y0: 0, y1: 118 },
    fosso: { w: 120, y0: 0, y1: 0 },
    mbaixo: { w: 54, y0: 26, y1: 72 },
    malto: { w: 54, y0: 92, y1: 146 }
  };
  function Pista(seed) {
    const r = rng(seed), obst = [], almas = []; let x = 900, n = 0;
    function escolher(x) {
      const op = [['lapide', 5]];
      if (x > 1400) op.push(['cruz', 3]);
      if (x > 2400) op.push(['fosso', 3]);
      if (x > 3200) op.push(['dupla', 2]);
      if (x > 4200) op.push(['mbaixo', 3]);
      if (x > 6000) op.push(['malto', 2.5]);
      let tot = op.reduce((s, o) => s + o[1], 0), k = r() * tot;
      for (const [t, p] of op) { if ((k -= p) <= 0) return t; } return 'lapide';
    }
    function gerarAte(lim) {
      while (x < lim) {
        const v = vel(tempoEm(x)), tipo = escolher(x), b = TIPOS[tipo];
        const w = tipo === 'fosso' ? Math.round(100 + r() * 40 + v * .06) : b.w;
        obst.push({ id: n++, tipo, x, w, y0: b.y0, y1: b.y1 });
        // almas: um arco por cima ou uma fileira no chão depois do obstáculo
        if (r() < .45) { const alto = tipo !== 'malto' && r() < .5; for (let i = 0; i < 3; i++) almas.push({ id: n++, x: alto ? x + w / 2 + (i - 1) * 44 : x + w + 150 + i * 46, h: alto ? 150 + (i === 1 ? 26 : 0) : 26 }); }
        x += w + v * (.95 + r() * .8) + 60;
      }
    }
    return { obst, almas, gerarAte };
  }

  // primeiro item com x >= alvo (busca binária: a pista fica longa)
  function desde(arr, alvo) { let a = 0, b = arr.length; while (a < b) { const m = (a + b) >> 1; if (arr[m].x < alvo) a = m + 1; else b = m; } return a; }

  // ---------- corredor ----------
  const novoCorredor = () => ({ h: 0, vy: 0, seg: false, ht: 0, buf: 0 });
  function apertar(c) { if (c.h <= 0) { c.vy = FIS.v0; c.ht = 0; } else c.buf = FIS.buffer; c.seg = true; }
  function soltar(c) { c.seg = false; c.buf = 0; }
  function passoFis(c) {
    let g = FIS.g;
    if (c.seg && c.vy > 0 && c.ht < FIS.segura) { g *= FIS.leve; c.ht += PASSO; }
    c.h += c.vy * PASSO; c.vy -= g * PASSO;
    if (c.h <= 0) { c.h = 0; c.vy = 0; if (c.buf > 0) { c.vy = FIS.v0; c.ht = 0; c.buf = 0; } }
    if (c.buf > 0) c.buf -= PASSO;
  }
  // bateu? (d = distância do corredor no momento)
  function bateu(pista, c, d) {
    for (let i = desde(pista.obst, d - 260); i < pista.obst.length; i++) { const o = pista.obst[i];
      if (o.x > d + 40) break; if (o.x + o.w < d - 40) continue;
      if (o.tipo === 'fosso') { if (c.h <= 0 && d > o.x + 12 && d < o.x + o.w - 12) return o; continue; }
      const sobe = o.tipo[0] === 'm' ? Math.sin(d / 90 + o.id) * 6 : 0;
      if (d + CORPO.meia > o.x + 4 && d - CORPO.meia < o.x + o.w - 4 && c.h < o.y1 + sobe - 4 && c.h + CORPO.alt > o.y0 + sobe + 4) return o;
    }
    return null;
  }
  function pegaAlmas(pista, c, d, pegas) {
    let n = 0; for (let i = desde(pista.almas, d - 40); i < pista.almas.length; i++) { const a = pista.almas[i]; if (a.x > d + 40) break; if (a.x < d - 40 || pegas.has(a.id)) continue;
      if (Math.abs(a.x - d) < 30 && a.h > c.h - 10 && a.h < c.h + CORPO.alt + 14) { pegas.add(a.id); n++; } }
    return n;
  }
  const pontos = (d, almas, venceu) => Math.floor(d / 10) + almas * 25 + (venceu ? 150 : 0);

  // ---------- imagens ----------
  const IMG = {};
  const carregar = src => IMG[src] || (IMG[src] = new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; }));
  async function carregarTudo() {
    const morcego = S.vigiliaFase.criaturas.find(c => /Morcego/.test(c.nome));
    const [chao, bat, ...her] = await Promise.all([carregar(S.vigiliaFase.chao), carregar(morcego ? morcego.img : ''), ...S.vigiliaHerois.map(h => carregar(h.img))]);
    return { chao, bat, herois: her };
  }

  // ---------- desenho ----------
  // v = { W, H, z (escala), d (distância da câmera), rx (x do corredor na tela), chao (y do chão na tela), t }
  function cenario(cx, v, im, cache) {
    const { W, H, z, d, chao } = v;
    const ceu = cx.createLinearGradient(0, 0, 0, chao); ceu.addColorStop(0, '#0b0607'); ceu.addColorStop(.7, '#2a0d0c'); ceu.addColorStop(1, '#3a1410');
    cx.fillStyle = ceu; cx.fillRect(0, 0, W, chao);
    // lua vermelha
    const lx = W * .78 - (d * .01 * z) % (W * 1.6), ly = chao * .3, lr = 70 * Math.max(.6, z);
    const lu = cx.createRadialGradient(lx, ly, lr * .2, lx, ly, lr * 2.4); lu.addColorStop(0, 'rgba(255,90,60,.55)'); lu.addColorStop(1, 'rgba(255,60,40,0)'); cx.fillStyle = lu; cx.fillRect(lx - lr * 2.4, ly - lr * 2.4, lr * 4.8, lr * 4.8);
    cx.fillStyle = '#c4362c'; cx.beginPath(); cx.arc(lx, ly, lr, 0, 7); cx.fill();
    // montanhas e cerca do cemitério (paralaxe)
    camada(cx, W, chao, d * .15 * z, 260 * z, '#1a0a0a', 140 * z, 7);
    camada(cx, W, chao, d * .4 * z, 160 * z, '#120808', 70 * z, 13);
    cerca(cx, W, chao, d * .7 * z, z);
    // chão
    if (im && im.chao && !cache.p) cache.p = cx.createPattern(im.chao, 'repeat');
    cx.save(); cx.translate(-(d * z) % 400, chao); cx.fillStyle = cache.p || '#1e1410'; cx.fillRect(0, 0, W + 400, H - chao); cx.restore();
    cx.fillStyle = 'rgba(12,10,9,.35)'; cx.fillRect(0, chao, W, H - chao);
    cx.fillStyle = '#5a2a1a'; cx.fillRect(0, chao - 2, W, 3);
  }
  function camada(cx, W, chao, off, alt, cor, amp, sem) {
    cx.fillStyle = cor; cx.beginPath(); cx.moveTo(0, chao); const passo = 120;
    const ini = Math.floor(off / passo) - 1;
    for (let i = ini; i < ini + W / passo + 3; i++) { const x = i * passo - off, k = Math.sin(i * sem * 1.37) * .5 + Math.sin(i * sem * .71) * .5; cx.lineTo(x, chao - alt + k * amp); }
    cx.lineTo(W, chao); cx.closePath(); cx.fill();
  }
  function cerca(cx, W, chao, off, z) {
    cx.strokeStyle = '#241210'; cx.fillStyle = '#241210'; cx.lineWidth = Math.max(1, 3 * z); const passo = 46 * z, ini = Math.floor(off / passo) - 1;
    cx.beginPath(); cx.moveTo(0, chao - 30 * z); cx.lineTo(W, chao - 30 * z); cx.stroke();
    for (let i = ini; i < ini + W / passo + 2; i++) { const x = i * passo - off; cx.fillRect(x, chao - 52 * z, 3 * z, 52 * z); cx.beginPath(); cx.moveTo(x - 3 * z, chao - 52 * z); cx.lineTo(x + 1.5 * z, chao - 60 * z); cx.lineTo(x + 6 * z, chao - 52 * z); cx.fill();
      if (i % 7 === 0) { cx.fillRect(x + 14 * z, chao - 74 * z, 4 * z, 44 * z); cx.fillRect(x + 6 * z, chao - 64 * z, 20 * z, 4 * z); } }
  }
  function obstaculos(cx, v, pista, im, pegas) {
    const { W, z, d, rx, chao } = v, ini = d - rx / z - 200, fim = d + (W - rx) / z + 200;
    for (let i = desde(pista.obst, ini - 260); i < pista.obst.length; i++) { const o = pista.obst[i];
      if (o.x + o.w < ini) continue; if (o.x > fim) break;
      const sx = rx + (o.x - d) * z;
      if (o.tipo === 'fosso') { const w = o.w * z; cx.fillStyle = '#050303'; cx.fillRect(sx, chao - 2, w, 400); const g = cx.createLinearGradient(0, chao + 40 * z, 0, chao + 160 * z); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(255,90,30,.45)'); cx.fillStyle = g; cx.fillRect(sx, chao, w, 400);
        cx.fillStyle = '#3a1a10'; cx.fillRect(sx - 3 * z, chao - 2, 4 * z, 30 * z); cx.fillRect(sx + w - 1, chao - 2, 4 * z, 30 * z); continue; }
      if (o.tipo === 'lapide' || o.tipo === 'dupla') { const n = o.tipo === 'dupla' ? 2 : 1; for (let i = 0; i < n; i++) lapide(cx, sx + i * 58 * z, chao, z, o.id + i); continue; }
      if (o.tipo === 'cruz') { cruz(cx, sx, chao, z); continue; }
      const sobe = Math.sin(o.x / 90 + o.id) * 6, cy = chao - ((o.y0 + o.y1) / 2 + sobe) * z, bat = im && im.bat;
      if (bat) { const ww = 76 * z, k = ww / bat.width, bate = Math.sin(v.t * 18 + o.id) * .18 + 1; cx.save(); cx.translate(sx + o.w / 2 * z, cy); cx.scale(1, bate); cx.drawImage(bat, -ww / 2, -bat.height * k / 2, ww, bat.height * k); cx.restore(); }
      else { cx.fillStyle = '#6a1a1a'; cx.beginPath(); cx.ellipse(sx + o.w / 2 * z, cy, 26 * z, 14 * z, 0, 0, 7); cx.fill(); }
    }
    for (let i = desde(pista.almas, ini); i < pista.almas.length; i++) { const a = pista.almas[i];
      if (a.x > fim) break; if (pegas && pegas.has(a.id)) continue;
      const sx = rx + (a.x - d) * z, sy = chao - a.h * z, p = 1 + Math.sin(v.t * 6 + a.id) * .15;
      const g = cx.createRadialGradient(sx, sy, 1, sx, sy, 16 * z * p); g.addColorStop(0, 'rgba(255,240,200,1)'); g.addColorStop(.35, 'rgba(255,180,90,.9)'); g.addColorStop(1, 'rgba(255,90,30,0)');
      cx.fillStyle = g; cx.beginPath(); cx.arc(sx, sy, 16 * z * p, 0, 7); cx.fill();
    }
  }
  function lapide(cx, x, chao, z, s) {
    const w = 34 * z, h = 46 * z; cx.fillStyle = '#4a4440'; cx.beginPath(); cx.moveTo(x, chao); cx.lineTo(x, chao - h + w / 2); cx.arc(x + w / 2, chao - h + w / 2, w / 2, Math.PI, 0); cx.lineTo(x + w, chao); cx.closePath(); cx.fill();
    cx.fillStyle = '#2e2a27'; cx.fillRect(x + w * .44, chao - h * .78, w * .12, h * .5); cx.fillRect(x + w * .28, chao - h * .64, w * .44, h * .1);
    cx.fillStyle = 'rgba(0,0,0,.35)'; cx.fillRect(x + w * .75, chao - h + w / 2, w * .25, h - w / 2);
    if (s % 3 === 0) { cx.fillStyle = '#5a2a1a'; cx.fillRect(x - 3 * z, chao - 4 * z, w + 6 * z, 4 * z); }
  }
  function cruz(cx, x, chao, z) {
    cx.fillStyle = '#3a2a22'; cx.fillRect(x + 10 * z, chao - 118 * z, 10 * z, 118 * z); cx.fillRect(x, chao - 96 * z, 30 * z, 9 * z);
    cx.fillStyle = 'rgba(194,42,45,.55)'; cx.fillRect(x + 12 * z, chao - 60 * z, 6 * z, 22 * z);
  }
  // corredor: retrato do vigia correndo, inclinando no pulo
  function corredor(cx, img, x, chao, h, z, t, opts = {}) {
    const y = chao - h * z, alt = 78 * z;
    cx.save(); cx.globalAlpha = opts.alfa ?? 1;
    const sombra = Math.max(.2, 1 - h / 300); cx.fillStyle = `rgba(0,0,0,${.45 * sombra})`; cx.beginPath(); cx.ellipse(x, chao + 2, 20 * z * sombra, 5 * z * sombra, 0, 0, 7); cx.fill();
    cx.translate(x, y - alt / 2);
    if (opts.caido != null) { cx.rotate(Math.min(1.4, opts.caido * 4)); cx.translate(opts.caido * 40 * z, opts.caido * opts.caido * 300 * z); }
    else cx.rotate(h > 0 ? -.12 : Math.sin(t * 18) * .05);
    const bob = h > 0 ? 0 : Math.abs(Math.sin(t * 18)) * -3 * z;
    if (img) { const k = alt / img.height; cx.drawImage(img, -img.width * k / 2, -alt / 2 + bob, img.width * k, alt); }
    else { cx.fillStyle = '#c22a2d'; cx.fillRect(-10 * z, -alt / 2, 20 * z, alt); }
    cx.restore();
  }
  function rotulo(cx, txt, x, y, eu) {
    cx.save(); cx.font = `600 ${eu ? 16 : 14}px Georgia, serif`; cx.textAlign = 'center'; const w = cx.measureText(txt).width + 12;
    cx.fillStyle = eu ? 'rgba(155,28,31,.92)' : 'rgba(12,10,9,.78)'; cx.fillRect(x - w / 2, y - 16, w, 20);
    cx.strokeStyle = eu ? '#ffd27a' : 'rgba(199,154,79,.55)'; cx.strokeRect(x - w / 2 + .5, y - 15.5, w - 1, 19);
    cx.fillStyle = '#f3e7d2'; cx.fillText(txt, x, y - 1); cx.restore();
  }
  const metros = d => `${Math.floor(d / 10).toLocaleString('pt-BR')} m`;

  window.CORRIDA = { PASSO, VAGAS, vel, dist, Pista, novoCorredor, apertar, soltar, passoFis, bateu, pegaAlmas, pontos, carregarTudo, cenario, obstaculos, corredor, rotulo, metros };
})();
