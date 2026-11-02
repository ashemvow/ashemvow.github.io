/* Rede da Arena: canais de transmissão em tempo real (Supabase Realtime, modo broadcast).
   Em testes locais (window.REDE_LOCAL = true) usa BroadcastChannel entre abas do mesmo navegador. */
(() => {
  const I = window.SITE.inscricao;
  const LIB = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.0/dist/umd/supabase.js';
  let cliente = null, carregando = null;
  // a biblioteca do tempo real só é baixada quando alguém entra na arena
  function biblioteca() {
    if (window.supabase) return Promise.resolve();
    return carregando || (carregando = new Promise((ok, falha) => { const s = document.createElement('script'); s.src = LIB; s.onload = ok; s.onerror = () => { carregando = null; falha(new Error('rede_lib')); }; document.head.append(s); }));
  }
  function sb() {
    if (!cliente) cliente = window.supabase.createClient(I.supabaseUrl, I.supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } });
    return cliente;
  }
  // abre um canal; onMsg(evento, dados). Resolve quando estiver conectado.
  const abertos = {};
  function canal(topico, onMsg) {
    if (!window.REDE_LOCAL) {
      // mesmo tópico na mesma página: reaproveita a conexão e soma quem escuta
      if (abertos[topico]) { abertos[topico].ouvintes.push(onMsg); return abertos[topico].p; }
      const reg = abertos[topico] = { ouvintes: [onMsg] };
      reg.p = abrir(topico, (ev, d) => reg.ouvintes.forEach(f => { try { f(ev, d); } catch (e) { } }), reg).catch(e => { delete abertos[topico]; throw e; });
      return reg.p;
    }
    return abrir(topico, onMsg);
  }
  function abrir(topico, onMsg, reg) {
    if (window.REDE_LOCAL) {
      const bc = new BroadcastChannel('rede-' + topico);
      bc.onmessage = e => onMsg(e.data.ev, e.data.p);
      return Promise.resolve({ enviar: (ev, p) => bc.postMessage({ ev, p }), sair: () => bc.close() });
    }
    return biblioteca().then(() => new Promise((ok, falha) => {
      const ch = sb().channel(topico, { config: { broadcast: { self: false, ack: false } } });
      ch.on('broadcast', { event: '*' }, m => onMsg(m.event, m.payload));
      let feito = false;
      ch.subscribe(st => {
        if (st === 'SUBSCRIBED' && !feito) { feito = true; ok({ enviar: (ev, p) => ch.send({ type: 'broadcast', event: ev, payload: p }), sair: () => { if (reg) delete abertos[topico]; sb().removeChannel(ch); } }); }
        else if ((st === 'CHANNEL_ERROR' || st === 'TIMED_OUT') && !feito) { feito = true; sb().removeChannel(ch); falha(new Error('rede_' + st)); }
        else if ((st === 'CHANNEL_ERROR' || st === 'TIMED_OUT' || st === 'CLOSED') && feito && reg && abertos[topico] === reg) {
          // caiu depois de conectar: refaz a conexão sozinho
          delete abertos[topico]; sb().removeChannel(ch);
          setTimeout(() => { const ouv = reg.ouvintes; canal(topico, ouv[0]).then(c => { ouv.slice(1).forEach(f => abertos[topico] && abertos[topico].ouvintes.push(f)); reg.p = Promise.resolve(c); }).catch(() => { }); }, 3000);
        }
      });
    }));
  }
  window.REDE = { canal };
})();
