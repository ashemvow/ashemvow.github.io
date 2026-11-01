const S = window.SITE, $ = id => document.getElementById(id);
const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h) e.innerHTML = h; return e; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const REDUZIR = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Textos do topo */
$("status").textContent = S.status; $("frase").textContent = S.frase; $("chamada").textContent = S.chamada; $("sobre").textContent = S.sobre;

/* Faixa rotativa: o conteúdo é duplicado para o giro não ter emenda */
const faixa = S.faixa.map(t => `<span>${esc(t)}</span>`).join("");
$("faixa").innerHTML = faixa + faixa.replace(/<span>/g, '<span aria-hidden="true">');

/* Lightbox */
const lb = el("div"); lb.id = "lb"; lb.innerHTML = "<img alt=''>"; document.body.append(lb);
lb.onclick = () => lb.classList.remove("on");
const zoom = src => { lb.querySelector("img").src = src; lb.classList.add("on"); };
addEventListener("keydown", e => { if (e.key === "Escape") lb.classList.remove("on"); });

/* Seis momentos */
const trilho = $("mom-trilho"), total = S.momentos.length;
trilho.append(...S.momentos.map((m, i) => el("figure", "mom", `<img src="${esc(m.img)}" alt="${esc(m.titulo)}" width="1280" height="720" ${i ? 'loading="lazy"' : ""}><figcaption><b>${esc(m.titulo)}</b><span>${esc(m.texto)}</span></figcaption>`)));
let atual = 0;
const irPara = i => { atual = (i + total) % total; trilho.scrollTo({ left: trilho.children[atual].offsetLeft - trilho.offsetLeft, behavior: REDUZIR ? "auto" : "smooth" }); };
const marcar = () => { const w = trilho.clientWidth || 1; atual = Math.round(trilho.scrollLeft / w); $("mom-n").textContent = `${atual + 1} de ${total}`; };
trilho.addEventListener("scroll", () => requestAnimationFrame(marcar), { passive: true }); marcar();
$("mom-ant").onclick = () => irPara(atual - 1); $("mom-prox").onclick = () => irPara(atual + 1);
trilho.addEventListener("keydown", e => { if (e.key === "ArrowRight") { e.preventDefault(); irPara(atual + 1); } if (e.key === "ArrowLeft") { e.preventDefault(); irPara(atual - 1); } });
[...trilho.children].forEach(f => f.querySelector("img").onclick = () => zoom(f.querySelector("img").src));

/* Uma partida e números */
$("partida").append(...S.partida.map((p, i) => el("li", "", `<span class="n">${String(i + 1).padStart(2, "0")}</span><h3>${esc(p.t)}</h3><p>${esc(p.d)}</p>`)));
$("numeros").append(...S.numeros.map(([n, t]) => el("li", "", `<b>${esc(n)}</b><span>${esc(t)}</span>`)));

/* Heróis: retratos + ficha do escolhido */
const det = $("heroi-det"), roster = $("roster");
const mostrar = (p, botao) => {
  roster.querySelectorAll("button").forEach(b => { b.classList.toggle("on", b === botao); b.setAttribute("aria-selected", b === botao); });
  det.innerHTML = `<img class="hp" src="${esc(p.skins[0].img)}" alt="${esc(p.nome)}, ${esc(p.titulo)}"><div class="hd"><h3>${esc(p.nome)}</h3><p class="tit">${esc(p.titulo)}</p>${p.tag ? `<p class="tag">${esc(p.tag)}</p>` : ""}<p><b>${esc(p.habilidade)}.</b> ${esc(p.descricao)}</p><div class="hab"></div><img class="bnr" src="${esc(p.banner)}" alt="Banner de ${esc(p.nome)}" loading="lazy"></div>`;
  det.querySelector(".hab").append(...p.habilidades.map(s => { const b = el("button", "", `<img src="${esc(s.img)}" alt="" loading="lazy"><span>${esc(s.nome)}</span>`); b.type = "button"; b.onclick = () => zoom(s.img); return b; }));
  det.querySelector(".bnr").onclick = e => zoom(e.target.src); det.querySelector(".hp").onclick = e => zoom(e.target.src);
};
S.personagens.forEach((p, i) => {
  const b = el("button", "", `<img src="${esc(p.skins[0].img)}" alt="" loading="lazy"><span>${esc(p.nome)}</span>`);
  b.type = "button"; b.setAttribute("role", "tab"); if (p.tag) b.classList.add("breve");
  b.onclick = () => { mostrar(p, b); if (innerWidth < 860) det.scrollIntoView({ behavior: REDUZIR ? "auto" : "smooth", block: "nearest" }); };
  roster.append(b); if (!i) mostrar(p, b);
});

/* Recursos */
$("recursos").append(...S.recursos.map(r => el("div", "", `<h3>${esc(r.t)}</h3><p>${esc(r.d)}</p>`)));

/* Criaturas (abas por cenário) */
const abas = (idAbas, idBox, lista, render) => {
  const ab = $(idAbas), bx = $(idBox);
  lista.forEach((f, i) => { const b = el("button", i ? "" : "on", esc(f.fase)); b.type = "button"; b.onclick = () => { ab.querySelectorAll("button").forEach(x => x.classList.remove("on")); b.classList.add("on"); bx.replaceChildren(...render(f)); }; ab.append(b); });
  bx.replaceChildren(...render(lista[0]));
};
abas("criaturas-abas", "criaturas-itens", S.criaturas, f => f.criaturas.map(c => { const e = el("figure", c.chefe ? "boss" : "", `<img src="${esc(c.img)}" alt="${esc(c.nome)}" loading="lazy"><figcaption>${esc(c.nome)}</figcaption>`); e.onclick = () => zoom(c.img); return e; }));

/* Telas do jogo */
$("telas-itens").append(...S.galeriaJogo.map(g => { const f = el("figure", "", `<img src="${esc(g.img)}" alt="${esc(g.legenda)}" loading="lazy"><figcaption>${esc(g.legenda)}</figcaption>`); f.onclick = () => zoom(g.img); return f; }));

/* Notícias: as três mais recentes */
$("news").append(...S.novidades.slice(0, 3).map(n => el("article", "", `<time>${esc(n.data)}</time><h3>${esc(n.titulo)}</h3><p>${esc(n.texto)}</p>`)));

/* Perguntas */
$("faq").append(...S.perguntas.map(q => el("details", "", `<summary>${esc(q.p)}</summary><p>${esc(q.r)}</p>`)));

/* Ficha, redes e contato */
$("ficha-tab").innerHTML = S.ficha.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("");
const NOMES = { instagram: "Instagram", youtube: "YouTube", tiktok: "TikTok", twitch: "Twitch", discord: "Discord" };
const redes = Object.entries(S.redes || {}).filter(([, u]) => u);
const botaoRede = ([k, u]) => { const a = el("a", "btn", NOMES[k] || k); a.href = u; a.target = "_blank"; a.rel = "noopener"; return a; };
$("redes").append(...redes.map(botaoRede));
const mail = S.criador.email;
["email", "f-email"].forEach(id => { $(id).href = "mailto:" + mail; }); $("email").textContent = mail;
$("ano").textContent = new Date().getFullYear();

/* Pix */
$("pix-tipo").textContent = S.pix.tipo; $("pix-chave").textContent = S.pix.chave;
$("copiar").onclick = async () => {
  try { await navigator.clipboard.writeText(S.pix.chave); $("copiado").textContent = "Chave copiada. Obrigado pelo apoio!"; }
  catch { $("copiado").textContent = "Não foi possível copiar. Selecione a chave manualmente."; }
};

/* ===== Inscrição (Supabase) ===== */
const I = S.inscricao;
$("vantagens").append(...I.vantagens.map(v => el("li", "", esc(v))));
const rpc = async (nome, corpo) => {
  const r = await fetch(`${I.supabaseUrl}/rest/v1/rpc/${nome}`, { method: "POST", headers: { apikey: I.supabaseKey, "Content-Type": "application/json" }, body: JSON.stringify(corpo || {}) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
};
const atualizarMeta = n => {
  if (typeof n !== "number" || n < I.mostrarAPartirDe) return;
  const alvo = n >= I.meta ? Math.ceil((n + 1) / 100) * 100 : I.meta;
  $("meta").hidden = false; $("meta-n").textContent = n.toLocaleString("pt-BR");
  $("meta-alvo").textContent = `· meta: ${alvo.toLocaleString("pt-BR")}`;
  $("meta-barra").style.width = Math.min(100, n / alvo * 100) + "%";
};
rpc("total_inscritos").then(atualizarMeta).catch(() => {});

const form = $("form-insc"), fmsg = $("f-msg"), enviar = $("f-enviar");
const JA = "ashemvow-inscrito";
const concluir = (dados, novo) => {
  form.hidden = true; $("insc-ok").hidden = false;
  $("ok-txt").textContent = novo === false
    ? "Esse e-mail já estava na lista. Quando o teste abrir, o convite chega nele."
    : "Você está na lista. Quando o teste fechado abrir, mandamos o convite para o seu e-mail. Enquanto isso, acompanhe as novidades:";
  $("ok-redes").replaceChildren(...redes.map(botaoRede));
};
try { if (localStorage.getItem(JA)) concluir(null, false); } catch (e) {}
$("outro").onclick = () => { $("insc-ok").hidden = true; form.hidden = false; form.reset(); fmsg.textContent = ""; $("f-email").focus(); };

form.addEventListener("submit", async e => {
  e.preventDefault();
  const d = new FormData(form), email = String(d.get("email") || "").trim();
  form.querySelectorAll(".erro").forEach(x => x.classList.remove("erro"));
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { $("f-email").closest("label").classList.add("erro"); fmsg.textContent = "Digite um e-mail válido."; $("f-email").focus(); return; }
  if (!d.get("aceite")) { form.querySelector("[name=aceite]").closest("label").classList.add("erro"); fmsg.textContent = "Marque que aceita receber e-mails para concluir."; return; }
  enviar.disabled = true; fmsg.textContent = "Enviando...";
  try {
    const r = await rpc("inscrever", { p_email: email, p_nome: d.get("nome") || null, p_celular: d.get("celular") || null, p_origem: d.get("origem") || null, p_testador: !!d.get("testador") });
    try { localStorage.setItem(JA, "1"); } catch (e) {}
    atualizarMeta(r.total); concluir(d, r.novo); fmsg.textContent = "";
  } catch (err) {
    fmsg.textContent = "Não foi possível enviar agora. Confira a internet e tente de novo.";
  } finally { enviar.disabled = false; }
});

/* Anúncios (Google AdSense): blocos fixos só quando "slot" estiver preenchido em content.js */
const AD = S.anuncios || {};
document.querySelectorAll("[data-ad]").forEach(d => {
  if (AD.client && AD.slot) {
    d.innerHTML = `<ins class="adsbygoogle" style="display:block" data-ad-client="${esc(AD.client)}" data-ad-slot="${esc(AD.slot)}" data-ad-format="auto" data-full-width-responsive="true"></ins>`;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
  } else d.hidden = true;
});

/* Vídeo da saga: só carrega o YouTube ao clicar */
const sv = $("saga-video");
sv.addEventListener("click", () => {
  const f = el("iframe"); f.src = "https://www.youtube-nocookie.com/embed/" + sv.dataset.id + "?autoplay=1&rel=0";
  f.title = "Ashem Vow: a saga"; f.allow = "accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen"; f.allowFullscreen = true;
  sv.replaceChildren(f);
}, { once: true });

/* Brasas */
if (!REDUZIR) {
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

/* Menu móvel, barra de progresso, link ativo e revelar ao rolar */
const menu = $("menu"), links = $("links");
menu.onclick = () => { const o = links.classList.toggle("open"); menu.setAttribute("aria-expanded", o); };
links.onclick = e => { if (e.target.tagName === "A") { links.classList.remove("open"); menu.setAttribute("aria-expanded", false); } };
const prog = $("progress");
addEventListener("scroll", () => { const h = document.documentElement; prog.style.transform = `scaleX(${h.scrollTop / (h.scrollHeight - h.clientHeight || 1)})`; $("nav").classList.toggle("solid", h.scrollTop > 30); }, { passive: true });
const spy = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.querySelectorAll("a").forEach(l => l.classList.toggle("on", l.getAttribute("href") === "#" + e.target.id)); }), { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll("main section[id]").forEach(s => spy.observe(s));
if (REDUZIR) document.documentElement.classList.add("calm");
else {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .08 });
  document.querySelectorAll(".sec, .partida li, .recursos > div, .news-cards article, .insc-form, .heroi-det, .final").forEach(x => { x.classList.add("reveal"); io.observe(x); });
}
