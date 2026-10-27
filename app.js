const S = window.SITE, $ = id => document.getElementById(id);
const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h) e.innerHTML = h; return e; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

$("status").textContent = S.status; $("frase").textContent = S.frase; $("sobre").textContent = S.sobre;
const mkNews = n => el("article", "reveal", `<time>${esc(n.data)}</time><h3>${esc(n.titulo)}</h3><p>${esc(n.texto)}</p>`);
const SHOW = 5, nb = $("news"), nm = $("news-more");
nb.append(...S.novidades.slice(0, SHOW).map(mkNews));
if (S.novidades.length > SHOW) { nm.hidden = false; nm.onclick = () => { nb.append(...S.novidades.slice(SHOW).map(mkNews)); nm.hidden = true; observe(); }; }
$("stats").append(...[[S.personagens.length,"heróis"],[S.cenarios.length,"cenários"],[S.criaturas.reduce((n,f)=>n+f.criaturas.length,0),"criaturas e chefes"],[8,"poções"]].map(([n,t]) => el("li","",`<b>${n}</b><span>${t}</span>`)));
$("andamento-itens").append(...S.andamento.map(g => el("div", "", `<h3>${esc(g.titulo)}</h3><ul>${g.itens.map(i => `<li>${esc(i)}</li>`).join("")}</ul>`)));
$("recursos").append(...S.recursos.map(r => el("div", "", `<h3>${esc(r.t)}</h3><p>${esc(r.d)}</p>`)));

const lb = el("div"); lb.id = "lb"; lb.innerHTML = "<img alt=''>"; document.body.append(lb);
lb.onclick = () => lb.classList.remove("on");
const card = g => {
  const f = el("figure", "", `<img src="${esc(g.img)}" alt="${esc(g.legenda)}" loading="lazy"><figcaption>${g.data ? `<time>${esc(g.data)}</time>` : ""}${esc(g.legenda)}</figcaption>`);
  f.onclick = () => { lb.querySelector("img").src = g.img; lb.classList.add("on"); };
  return f;
};
addEventListener("keydown", e => { if (e.key === "Escape") lb.classList.remove("on"); });
const zoom = src => { lb.querySelector("img").src = src; lb.classList.add("on"); };
$("personagens-itens").append(...S.personagens.map(p => {
  const d = el("article", "heroi", `<img class="hp" src="${esc(p.skins[0].img)}" alt="${esc(p.nome)}, ${esc(p.titulo)}" loading="lazy"><div><h3>${esc(p.nome)}</h3><p class="tit">${esc(p.titulo)}</p><p><b>${esc(p.habilidade)}.</b> ${esc(p.descricao)}</p><div class="hab"></div><img class="bnr" src="${esc(p.banner)}" alt="Banner de ${esc(p.nome)}" loading="lazy"></div>`);
  const main = d.querySelector(".hp");
  d.querySelector(".hab").append(...p.habilidades.map(s => { const b = el("button", "", `<img src="${esc(s.img)}" alt="${esc(s.nome)}" loading="lazy"><span>${esc(s.nome)}</span>`); b.onclick = () => zoom(s.img); return b; }));
  const bn = d.querySelector(".bnr"); bn.onclick = () => zoom(p.banner);
  main.onclick = () => zoom(main.src);
  return d;
}));
const abas = (idAbas, idBox, lista, render) => {
  const ab = $(idAbas), bx = $(idBox);
  lista.forEach((f, i) => { const b = el("button", i ? "" : "on", esc(f.fase)); b.onclick = () => { ab.querySelectorAll("button").forEach(x => x.classList.remove("on")); b.classList.add("on"); bx.replaceChildren(...render(f)); }; ab.append(b); });
  bx.replaceChildren(...render(lista[0]));
};
abas("criaturas-abas", "criaturas-itens", S.criaturas, f => f.criaturas.map(c => { const e = el("figure", c.chefe ? "boss" : "", `<img src="${esc(c.img)}" alt="${esc(c.nome)}" loading="lazy"><figcaption>${esc(c.nome)}</figcaption>`); e.onclick = () => zoom(c.img); return e; }));
abas("cenarios-abas", "cenarios-itens", S.cenarios, f => [el("figure", "chao", `<img src="${esc(f.chao)}" alt="Chão de ${esc(f.fase)}" loading="lazy"><figcaption>Chão</figcaption>`), ...f.objetos.map(o => { const e = el("figure", "", `<img src="${esc(o)}" alt="Objeto de cenário" loading="lazy">`); e.onclick = () => zoom(o); return e; })]);
$("galeria-itens").append(...S.galeria.map(card));
$("projeto-intro").textContent = S.projeto.intro;
$("projeto-itens").append(...(S.projeto.itens.length ? S.projeto.itens.map(card) : [el("p", "lead", "Fotos do projeto em breve.")]));

$("pix-tipo").textContent = S.pix.tipo; $("pix-chave").textContent = S.pix.chave;
$("copiar").onclick = async () => {
  try { await navigator.clipboard.writeText(S.pix.chave); $("copiado").textContent = "Chave copiada. Obrigado pelo apoio!"; }
  catch { $("copiado").textContent = "Não foi possível copiar. Selecione a chave manualmente."; }
};

$("c-nome").textContent = S.criador.nome; $("c-bio").textContent = S.criador.bio; $("f-nome").textContent = S.criador.nome;
$("c-email").href = "mailto:" + S.criador.email; $("c-email").textContent = S.criador.email;
$("c-insta").href = S.instagram; $("ano").textContent = new Date().getFullYear();

/* Anúncios (Google AdSense): blocos fixos. O código do AdSense está no <head>; aqui só ligamos os blocos quando "slot" estiver preenchido em content.js */
const AD = S.anuncios || {};
document.querySelectorAll("[data-ad]").forEach(d => {
  if (AD.client && AD.slot) {
    d.innerHTML = `<ins class="adsbygoogle" style="display:block" data-ad-client="${esc(AD.client)}" data-ad-slot="${esc(AD.slot)}" data-ad-format="auto" data-full-width-responsive="true"></ins>`;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
  } else d.hidden = true;   // sem bloco configurado: não mostra espaço vazio
});
if (AD.client && !document.querySelector('script[src*="adsbygoogle.js"]')) {
  const s = el("script"); s.async = true; s.crossOrigin = "anonymous";
  s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + AD.client;
  document.head.append(s);
}

/* Brasas */
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const c = $("embers"), x = c.getContext("2d"); let p = [];
  const fit = () => { c.width = innerWidth; c.height = innerHeight; }; fit(); addEventListener("resize", fit);
  const mk = () => ({ x: Math.random() * c.width, y: c.height + 10, r: Math.random() * 2 + .5, v: Math.random() * .8 + .3, d: Math.random() * 2 - 1 });
  for (let i = 0; i < 50; i++) { const e = mk(); e.y = Math.random() * c.height; p.push(e); }
  (function t() {
    x.clearRect(0, 0, c.width, c.height);
    p.forEach((e, i) => { e.y -= e.v; e.x += Math.sin(e.y / 40) * .4 + e.d * .1; if (e.y < -10) p[i] = mk();
      x.fillStyle = `rgba(230,120,40,${Math.min(1, e.y / c.height + .1) * .7})`; x.beginPath(); x.arc(e.x, e.y, e.r, 0, 7); x.fill(); });
    requestAnimationFrame(t);
  })();
}

/* Veja o jogo: carrossel de prints */
const pr = (S.projeto.itens || []).filter(i => /print-jogo|print-boss|print-herois|print-preparar|print-loja|print-diario/.test(i.img));
$("prints").append(...pr.map(i => { const f = el("figure", "", `<img src="${esc(i.img)}" alt="${esc(i.legenda)}" loading="lazy"><figcaption>${esc(i.legenda)}</figcaption>`); f.onclick = () => zoom(i.img); const im = f.querySelector("img"); im.onload = () => { if (im.naturalWidth > im.naturalHeight) f.classList.add("land"); }; return f; }));

/* Menu móvel, barra de progresso, link ativo e revelar ao rolar */
const menu = $("menu"), links = $("links");
menu.onclick = () => { const o = links.classList.toggle("open"); menu.setAttribute("aria-expanded", o); };
links.onclick = e => { if (e.target.tagName === "A") { links.classList.remove("open"); menu.setAttribute("aria-expanded", false); } };
const prog = $("progress");
addEventListener("scroll", () => { const h = document.documentElement; prog.style.transform = `scaleX(${h.scrollTop / (h.scrollHeight - h.clientHeight || 1)})`; $("nav").classList.toggle("solid", h.scrollTop > 30); }, { passive: true });
const secs = [...document.querySelectorAll("main section[id]")];
const spy = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.querySelectorAll("a").forEach(l => l.classList.toggle("on", l.getAttribute("href") === "#" + e.target.id)); }), { rootMargin: "-45% 0px -50% 0px" });
secs.forEach(s => spy.observe(s));
let io;
function observe() {
  if (!io) io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .08 });
  document.querySelectorAll(".reveal:not(.in), .sec, .recursos > div, .heroi, .andamento > div, .box, .criador").forEach(x => { x.classList.add("reveal"); io.observe(x); });
}
if (matchMedia("(prefers-reduced-motion: reduce)").matches) document.querySelectorAll("body").forEach(() => document.documentElement.classList.add("calm")); else observe();
