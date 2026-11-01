# Ashem Vow · site oficial

Site estático (HTML, CSS e JS puro). Sem build.

## Como editar
Tudo fica em `content.js`: textos do topo, faixa, Seis momentos, Uma partida, recursos, telas, perguntas, ficha, redes, inscrição, Pix e anúncios.
- Redes: em `redes`, cole o link do TikTok, Twitch ou Discord quando criar. Vazio esconde o botão.
- Notícias: a página mostra as 3 primeiras de `novidades`.

## Inscrições (teste fechado e lançamento)
O formulário grava no Supabase (projeto ashemvow), tabela `inscricoes`, pela função `inscrever`. Ninguém de fora consegue ler a lista.
- Ver e exportar: Supabase > Table Editor > inscricoes > Export to CSV.
- Coluna `testador` = quer entrar no teste fechado. Use esses e-mails no Grupo do Google do teste fechado.
- `inscricao.meta` muda a meta da barra; `inscricao.mostrarAPartirDe` esconde o contador enquanto houver poucos inscritos.
- Nova novidade: copie um bloco em `novidades` e cole no topo.
- Nova imagem: coloque em `assets/` e adicione em `galeria`.
- Instagram: troque `SEU_USUARIO`.
- Anúncios: preencha `client` e `slot` do Google AdSense.

## Publicar (GitHub + Netlify)
1. Crie um repositório no GitHub e envie estes arquivos.
2. No Netlify: Add new site, Import from Git, escolha o repositório.
3. Build command vazio, publish directory `.`. Cada commit atualiza o site.

## Seção "Andamento"
Em `content.js`, o bloco `andamento` tem 3 colunas (já no teste, em produção, planejado). Mova um item de coluna quando ele ficar pronto. Só coloque em "Já no teste jogável" o que realmente roda no jogo.

## Novas seções (v4)
`personagens`, `criaturas` e `cenarios` em `content.js` alimentam as seções do mesmo nome. As imagens estão em `assets/` (WebP com fundo transparente).

## novidades.txt
O jogo lê `novidades.txt` (na raiz do site) na aba Novidades. Edite esse arquivo para atualizar o texto dentro do jogo sem lançar nova versão. Mantenha texto simples.

## Anúncios (Google AdSense)
1. Crie conta em adsense.google.com com o endereço do site e aguarde a aprovação.
2. Em `content.js`, preencha `anuncios.client` (ex.: `ca-pub-1234567890123456`). Com isso o código do AdSense passa a carregar (anúncios automáticos).
3. Para blocos fixos, crie uma unidade "Display" no AdSense e cole o número em `anuncios.slot`.
4. Crie o arquivo `ads.txt` na raiz com: `google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0`
5. No AdSense, ative a mensagem de consentimento em Privacidade e mensagens (exigido para visitantes do Brasil/UE).
Sem `client`, nenhum espaço de anúncio aparece. A página `privacidade.html` já está pronta e linkada no rodapé.
