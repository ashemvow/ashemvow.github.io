// Login opcional com a mesma conta do jogo (Supabase + Google) e resgate de recompensas raras.
const SB_URL = "https://vokffayvytyoojsysqyq.supabase.co";
const SB_KEY = "sb_publishable_oBEi0zH9jANY1WYMamRmSg_C4Wm7BHo"; // chave pública (anon), segura para ficar no site
// Mesmos ids do jogo (data.gd) e do SQL (recompensas_site.sql)
const REWARDS = [
  { id: "banner_brasa", tipo: "Banner de perfil", nome: "Deserto de Ossos", desc: "Alcance a maestria máxima com um herói.", img: "assets/rw-banner_brasa.webp" },
  { id: "banner_lua", tipo: "Banner de perfil", nome: "Firmamento Partido", desc: "Vença as 6 fases do jogo.", img: "assets/rw-banner_lua.webp" },
  { id: "badge_ceifador", tipo: "Insígnia", nome: "Ceifador de Mil Almas", desc: "Abata 10000 inimigos no total.", img: "assets/rw-badge_ceifador.webp", ic: true },
  { id: "badge_maldito", tipo: "Insígnia", nome: "Selo do Maldito", desc: "Vença 5 partidas com a Maldição do dia.", img: "assets/rw-badge_maldito.webp", ic: true }
];
const $ = (id) => document.getElementById(id);
const msg = (t) => { $("msg").textContent = t || ""; };
const sb = window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: true, detectSessionInUrl: true } });
let status = {};

function draw() {
  $("lista").innerHTML = "";
  for (const r of REWARDS) {
    const s = status[r.id]; // undefined | earned | claimed
    const d = document.createElement("div");
    d.className = "card rw" + (s ? "" : " off");
    d.innerHTML = `<img class="${r.ic ? "ic" : ""}" src="${r.img}" alt="${r.nome}"><div><small>${r.tipo.toUpperCase()} · EXCLUSIVO DO SITE</small><h3>${r.nome}</h3><p>${r.desc}</p></div><div class="st"></div>`;
    const st = d.querySelector(".st");
    if (s === "claimed") { st.className = "st ok"; st.textContent = "Resgatada. Já está na sua conta."; }
    else if (s === "earned") {
      const b = document.createElement("button"); b.className = "btn2"; b.textContent = "Resgatar";
      b.onclick = () => claim(r, b); st.append(b);
    } else { st.className = "st lock"; st.textContent = USER ? "Cumpra a tarefa no jogo" : "Entre para ver o seu progresso"; }
    $("lista").append(d);
  }
  document.querySelectorAll("ins.adsbygoogle").forEach((el) => { if (!el.dataset.done) { el.dataset.done = 1; try { (adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {} } });
}

let USER = null;
async function load() {
  status = {};
  if (USER) {
    const { data, error } = await sb.from("site_rewards").select("reward_id,status");
    if (error) msg("Não deu para carregar as recompensas. Tente de novo em instantes.");
    else for (const row of data) status[row.reward_id] = row.status;
  }
  draw();
}

async function claim(r, btn) {
  btn.disabled = true; msg("Resgatando...");
  const { error } = await sb.rpc("claim_site_reward", { rid: r.id });
  if (error) { msg("Não foi possível resgatar agora. Tente de novo."); btn.disabled = false; return; }
  msg("Resgatado! Abra o jogo e toque em Atualizar em Missões, Recompensas do site.");
  await load();
}

function show(user) {
  USER = user;
  $("out").hidden = !!user; $("in").hidden = !user;
  if (user) $("who").textContent = user.email || "sua conta";
  load();
}

$("entrar").onclick = async () => {
  msg("Abrindo o Google...");
  const { error } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.origin + location.pathname } });
  if (error) msg("Não foi possível entrar agora. Tente de novo.");
};
$("sair").onclick = async () => { await sb.auth.signOut(); msg(""); show(null); };
sb.auth.onAuthStateChange((_e, session) => show(session ? session.user : null));
sb.auth.getSession().then(({ data }) => show(data.session ? data.session.user : null));
draw();
