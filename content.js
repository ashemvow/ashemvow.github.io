/* ============================================================
   EDITE AQUI. Todo o conteúdo do site vem deste arquivo.
   Salve e faça commit no GitHub: o site atualiza sozinho.
   ============================================================ */
window.SITE = {
  status: "Teste fechado no Android · inscrições abertas",
  frase: "Um juramento forjado em cinzas.",
  chamada: "Ação e sobrevivência em pixel art dark fantasy. Enfrente hordas sem fim em partidas de até 15 minutos e chegue vivo ao amanhecer.",
  sobre: "Ashem Vow é um jogo de ação e sobrevivência em pixel art para Android, ambientado num mundo sombrio de guerra, sacrifício e vingança. Escolha um entre doze heróis, cada um com habilidades próprias, e resista a hordas de criaturas voadoras em seis cenários sob a lua vermelha, com três chefes por fase.",

  /* Inscrição. A lista de inscritos fica no Supabase, tabela "inscricoes" (Table Editor). */
  inscricao: {
    supabaseUrl: "https://vokffayvytyoojsysqyq.supabase.co",
    supabaseKey: "sb_publishable_oBEi0zH9jANY1WYMamRmSg_C4Wm7BHo", // chave pública, pode ficar no site
    meta: 12,                // meta da barra: o Google Play pede 12 testadores no teste fechado
    mostrarAPartirDe: 5,     // o contador só aparece quando houver pelo menos este número de inscritos
    vantagens: [
      "Convite para o teste fechado no Android antes de todo mundo",
      "Aviso por e-mail no dia do lançamento na Google Play",
      "Insígnia exclusiva de Testador Fundador no seu perfil"
    ]
  },

  /* Redes. Deixe "" para esconder o botão. */
  redes: {
    instagram: "https://www.instagram.com/ashemvow",
    youtube: "https://www.youtube.com/@ashemvow2d",
    tiktok: "",
    twitch: "",
    discord: ""
  },

  /* Faixa rotativa abaixo do topo */
  faixa: ["12 heróis jogáveis", "6 cenários dark fantasy", "18 chefes", "Partidas de até 15 minutos", "Português, inglês e espanhol", "Tutorial para quem chega", "Ranking geral online", "Suporte a controle", "Progresso salvo na nuvem", "Sem pagar para vencer"],

  /* Carrossel "Seis momentos" */
  momentos: [
    { img: "assets/print-jogo_garrick.webp", titulo: "A horda desce do céu.", texto: "Toda criatura voa. Em poucos minutos, a tela inteira está contra você." },
    { img: "assets/print-jogo_orun.webp", titulo: "Cada herói luta do seu jeito.", texto: "Orun mistura golpes de perto com almas arremessadas na Geleira dos Esquecidos." },
    { img: "assets/print-boss_floresta.webp", titulo: "Mãe das Raízes.", texto: "Três chefes por fase, cada um maior e mais forte que o anterior." },
    { img: "assets/print-boss_gelo.webp", titulo: "Wyrm da Nevasca.", texto: "Os avisos chegam antes do mergulho. Quem presta atenção sobrevive." },
    { img: "assets/print-boss_vulcanica.webp", titulo: "Fênix Negra.", texto: "O Abismo de Brasas guarda o chefe mais feroz do juramento." },
    { img: "assets/print-fim.webp", titulo: "Você sobreviveu.", texto: "Cinzas, fragmentos e um baú que muda conforme o seu desempenho." }
  ],

  /* "Uma partida": os quatro passos */
  partida: [
    { t: "Escolha.", d: "Um entre doze heróis e duas poções para levar à batalha." },
    { t: "Sobreviva.", d: "Hordas de criaturas voadoras atacam de todos os lados por até 15 minutos." },
    { t: "Evolua.", d: "Suba de nível no meio da luta e solte as três habilidades do herói na hora certa." },
    { t: "Vença.", d: "Derrote os três chefes da fase e abra o baú da vitória." }
  ],

  /* Números grandes */
  numeros: [[12, "heróis"], [6, "cenários"], [18, "chefes"], [15, "minutos por partida"]],

  /* "Além da partida" */
  recursos: [
    { t: "Ranking geral", d: "Seus melhores tempos de todas as fases somados num ranking só, com apelido único." },
    { t: "Missões e Maldição do dia", d: "Missões diárias e semanais, e uma maldição nova por dia que paga mais cinzas a quem aceita o desafio." },
    { t: "Passe de Catedral", d: "Temporadas de 45 dias com 30 níveis, trilha grátis e Premium, títulos com insígnia própria, molduras e heróis exclusivos. As missões também dão XP do Passe." },
    { t: "Em três idiomas", d: "Jogue em português, inglês ou espanhol. Troque quando quiser em Opções." },
    { t: "Maestria e insígnias", d: "Cada herói fica mais forte conforme você joga com ele. Desafios liberam banners, e 46 insígnias enfeitam o perfil." },
    { t: "Jogue com controle", d: "Conecte um controle Bluetooth, mude os botões como preferir e veja as dicas na tela." },
    { t: "Fácil de começar", d: "Quem é novo ganha uma apresentação do menu e um tutorial na primeira partida. Segure qualquer habilidade para ver o que ela faz." },
    { t: "Sem pagar para vencer", d: "O jogo é grátis. Poções têm poder limitado e os anúncios são sempre opcionais." }
  ],

  /* Galeria de telas do jogo */
  galeriaJogo: [
    { img: "assets/print-home.webp", legenda: "Tela inicial com o cartão do jogador" },
    { img: "assets/print-apresentacao.webp", legenda: "Apresentação do menu para quem é novo" },
    { img: "assets/print-tutorial.webp", legenda: "Tutorial da primeira partida" },
    { img: "assets/print-segurar-habilidade.webp", legenda: "Segure a habilidade para ver o que ela faz" },
    { img: "assets/print-maestria.webp", legenda: "Heróis e maestria" },
    { img: "assets/print-preparar.webp", legenda: "Preparar: fase e poções" },
    { img: "assets/print-missoes.webp", legenda: "Missões e Maldição do dia" },
    { img: "assets/print-passe.webp", legenda: "Passe de Catedral: trilha Premium e grátis" },
    { img: "assets/print-roleta.webp", legenda: "Roleta da Catedral" },
    { img: "assets/print-perfil.webp", legenda: "Perfil com tudo numa barra só" },
    { img: "assets/print-desafios.webp", legenda: "Desafios do perfil" },
    { img: "assets/print-insignias.webp", legenda: "Insígnias" },
    { img: "assets/print-loja.webp", legenda: "Loja" },
    { img: "assets/print-idioma-en.webp", legenda: "O jogo em inglês" }
  ],

  /* Perguntas frequentes */
  perguntas: [
    { p: "Quanto custa?", r: "Ashem Vow é grátis. Há compras opcionais, como heróis da loja e o Passe Premium, mas nada que faça alguém vencer só por pagar." },
    { p: "Em quais aparelhos dá para jogar?", r: "Em celulares Android, pela Google Play. O jogo é jogado com o celular na horizontal." },
    { p: "Quando o jogo lança?", r: "Logo depois do teste fechado. Quem se inscreve recebe o aviso por e-mail no dia do lançamento." },
    { p: "Como entro no teste fechado?", r: "Inscreva-se com o e-mail da conta Google que você usa na Play Store. Quando o teste abrir, mandamos o convite com o link para instalar." },
    { p: "Preciso de conta?", r: "Você entra com a sua conta Google. Assim o progresso fica salvo na nuvem e você não perde nada ao trocar de celular." },
    { p: "Em quais idiomas dá para jogar?", r: "Português, inglês e espanhol. Na primeira vez o jogo usa o idioma do celular, e você troca quando quiser em Opções." },
    { p: "Posso trocar meu apelido?", r: "O apelido é escolhido uma vez e é único no ranking. Para trocar depois, há uma troca de apelido por R$ 1,99 na própria tela do perfil (às vezes em promoção na Roleta)." },
    { p: "Dá para jogar com controle?", r: "Sim. Funciona com controle Bluetooth, os botões podem ser trocados e as dicas na tela seguem o padrão do controle de PS4." },
    { p: "Posso gravar vídeos e fazer lives?", r: "Pode, e a gente adora ver. Marque @ashemvow nas redes para aparecer no nosso perfil." }
  ],

  /* Ficha do jogo (imprensa) */
  ficha: [
    ["Gênero", "Ação e sobrevivência (survivors-like)"],
    ["Visual", "Pixel art 2D, dark fantasy"],
    ["Plataforma", "Android (Google Play)"],
    ["Partidas", "Até 15 minutos"],
    ["Modelo", "Grátis, com compras opcionais"],
    ["Idiomas", "Português, inglês e espanhol"],
    ["Controles", "Toque na tela ou controle Bluetooth"],
    ["Fase", "Teste fechado"]
  ],

  andamento: [
    { titulo: "Já no jogo (versão 11)", itens: [
      "Jogo em três idiomas: português, inglês e espanhol, com troca em Opções",
      "Apresentação do menu e tutorial da primeira partida para quem é novo (dá para rever em Opções)",
      "Segure o botão de uma habilidade para ver o nome, o que ela faz e o tempo de recarga",
      "Botões da partida reagem ao toque, com brilho e onda",
      "Passe de Catedral redesenhado, com vitrine do prêmio principal, trilha Premium e grátis e temporadas de 45 dias que começam no lançamento",
      "Missões diárias e semanais também dão XP do Passe",
      "Títulos do Passe com insígnia própria, uma para cada título",
      "Roleta nova: a roda gira inteira e o prêmio aparece com a quantidade",
      "Promoção surpresa na Roleta: heróis da loja, Passe Premium ou troca de apelido com desconto por 24 horas",
      "Perfil com todas as abas numa barra só no topo: visão geral, estatísticas, banner, avatar, títulos, desafios e insígnias",
      "Cartão do jogador na tela inicial com banner, moldura, nível, título e insígnias",
      "Ranking geral: soma dos melhores tempos em todas as fases",
      "Apelido escolhido uma vez, com confirmação; trocar depois custa R$ 1,99",
      "Compras e anúncios reais do Google Play conectados, em teste",
      "Jogo atualizado para a Godot 4.7, no padrão exigido pela Google Play",
      "Cenas da história removidas para deixar o jogo mais leve",
      "Missões diárias (3) e semanais (3), com cinzas, fragmentos e XP do Passe, e indicador no menu quando há recompensa para resgatar",
      "Maldição do dia: um efeito novo por dia (horda, inimigos mais fortes, mais rápidos, sem cura ou herói mais frágil) que rende 75% a mais de cinzas, ligado por você em Preparar",
      "Maestria de herói: 5 níveis por herói, com bônus exclusivo de cada um, mostrados na tela de Heróis",
      "Fim de partida com Baú de Bronze, Prata ou Ouro e o aviso Quase lá, que mostra a insígnia ou missão mais perto de ser concluída",
      "Desafios para liberar banners e avatares, com cartões, filtros e Resgatar tudo (só na sua conta)",
      "46 insígnias para colecionar e exibir até 5 no perfil, vistas também por outros jogadores",
      "Perfil com banner inteiro e botão Ocultar painel",
      "Heróis de magia lançam projéteis automáticos que perfuram; Lyra atira flechas e Orun mistura golpe corpo a corpo com almas",
      "Velocidade das animações de correr, atacar e parado acertada herói por herói, e tela de Opções corrigida",
      "Reforma visual dos heróis: novo design de corpo inteiro, banners de perfil e 3 avatares por herói (o primeiro com máscara nos heróis que usam uma)",
      "Animações novas de parado, correr e atacar do Garrick, da Yurinn, do Brann e do Orun, e parado novo do Sombras das Cinzas",
      "Correr e atacar separados: a animação de ataque só toca quando você ataca (botão, botão segurado ou ataque automático)",
      "Queda do herói ao ser derrotado",
      "Correção do analógico que travava para um lado durante a partida",
      "Correção da rolagem por arrasto no Passe, nos avatares, no ranking e nas outras listas",
      {"data": "25/10/2026", "img": "assets/print-passe.webp", "legenda": "Passe de Catedral: 30 níveis, trilha grátis e Premium"},
      {"data": "25/10/2026", "img": "assets/print-roleta.webp", "legenda": "Roleta da Catedral: 1 giro grátis por dia"},
      {"data": "25/10/2026", "img": "assets/print-heroi-passe.webp", "legenda": "Banner do Irmão Brasa, exclusivo do Passe (nível 15)"},
      {"data": "25/10/2026", "img": "assets/print-heroi-loja.webp", "legenda": "Banner do Sombras das Cinzas na Loja"},
      "12 heróis com habilidade própria, banner e retrato oficiais (5 liberados com cinzas, 5 na loja e 2 exclusivos do Passe)",
      "Passe de Catedral com 30 níveis, trilha grátis e Premium",
      "Perfil de jogador com banner, avatar, moldura e título",
      "Roleta com 1 giro grátis por dia e giros extras por vídeo",
      "Fragmentos de Vitral: moeda rara que, com cinzas, libera heróis",
      "Títulos que se desbloqueiam com abates e molduras de perfil por herói",
      "Banners de herói na Loja e no Passe, com foto, atributos e habilidades",
      "6 fases com cenário, 9 criaturas voadoras próprias e 3 chefes cada (18 chefes no total)",
      "Dificuldade reequilibrada: ataques à distância mais lentos e avisos antes dos mergulhos",
      "Habilidades e efeitos (explosões, itens, armas) desenhados por código, mais longos e visíveis até o fim",
      "8 poções temporárias, escolhidas antes da partida",
      "Recompensa diária de 7 dias (faltar um dia só pausa a sequência)",
      "Loja, aba de novidades, trilha e efeitos em volumes separados",
      "Anúncios opcionais para ganhar recompensas",
      "Login com conta Google, apelido escolhido no primeiro acesso e progresso salvo na nuvem",
      "Opção de sair da conta ou excluir a conta e os dados dentro do jogo"
    ]},
    { titulo: "Em produção", itens: [
      "Recompensas raras do site com login Google opcional (página de conta pronta, em teste), com banners e insígnias exclusivos",
      "Animações novas de correr e atacar do Sombras das Cinzas, do Irmão Brasa e da Vesper, e de parado do Irmão Brasa e da Vesper",
      "Teste fechado na Google Play com 12 testadores",
      "Trilhas próprias para Floresta, Pântano e Geleira",
      "Ajustes de equilíbrio dos chefes e testes em celulares reais",
      "Mais idiomas"
    ]},
    { titulo: "Planejado", itens: [
      "Códigos de resgate com recompensas exclusivas, com conta de login",
      "Recompensa por horas jogadas",
            "Lançamento na Google Play (Android)"
    ]}
  ],
  /* Novas novidades: copie um bloco e coloque no TOPO da lista */
  novidades: [
    { data: "08/11/2026", titulo: "Versão 11: o jogo agora fala inglês e espanhol", texto: "Ashem Vow pode ser jogado em português, inglês ou espanhol. Na primeira vez ele usa o idioma do celular, e dá para trocar quando quiser em Opções. Menus, heróis, habilidades, armas, missões e maldições foram traduzidos." },
    { data: "08/11/2026", titulo: "Apresentação do menu e tutorial para quem chega", texto: "Quem abre o jogo pela primeira vez vê uma apresentação rápida do menu, com cada parte iluminada e explicada. Depois, a primeira partida ensina a andar, atacar, ligar o ataque automático, subir de nível e usar as habilidades. Tudo pode ser pulado e revisto em Opções." },
    { data: "08/11/2026", titulo: "Segure a habilidade para saber o que ela faz", texto: "Na partida, um toque rápido usa a habilidade. Segurando o botão aparece o nome, o que ela faz e o tempo de recarga, sem gastar a carga. As 39 habilidades dos 13 heróis têm explicação. Os botões também ganharam um brilho e uma onda ao toque, para mostrar que foram apertados." },
    { data: "08/11/2026", titulo: "Passe de Catedral redesenhado e com temporadas", texto: "O Passe ganhou uma vitrine com o prêmio principal, trilha Premium em cima e grátis embaixo, e títulos com insígnia própria. As temporadas duram 45 dias e começam a contar no lançamento oficial. As missões diárias e semanais agora também dão XP do Passe." },
    { data: "08/11/2026", titulo: "Roleta nova com promoções surpresa", texto: "A roda gira inteira e o prêmio aparece na tela com a quantidade. A fatia de promoção agora sorteia um desconto de 24 horas no que você ainda não tem: um herói da loja, o Passe Premium ou a troca de apelido." },
    { data: "08/11/2026", titulo: "Perfil, cartão do jogador e ranking geral", texto: "O perfil reúne tudo numa barra só no topo. A tela inicial tem um cartão do jogador com o seu banner, moldura, nível, título e insígnias. O ranking virou geral: soma os seus melhores tempos de todas as fases. O apelido é escolhido uma vez, com confirmação, e trocar depois custa R$ 1,99." },
    { data: "27/10/2026", titulo: "Recompensas raras do site, com login opcional", texto: "O site ganhou uma página de conta. Entrando com o mesmo login Google do jogo (opcional), você resgata itens raros que só existem aqui: duas insígnias exclusivas (banners exclusivos chegam em breve). Para liberar cada um é preciso cumprir uma tarefa difícil dentro do jogo, como abater 10 mil inimigos. Depois de resgatar no site, o item cai direto na sua conta no jogo." },
    { data: "27/10/2026", titulo: "Versão 10: missões, maldição do dia e maestria", texto: "Três missões diárias e três semanais renovam sozinhas e pagam cinzas, fragmentos e XP do Passe. Cada dia traz uma Maldição nova (mais inimigos, mais vida, mais dano, mais velocidade, sem cura ou você mais frágil): ligue em Preparar e ganhe 75% a mais de cinzas. Cada herói também tem maestria de 5 níveis, com um bônus só dele, que sobe conforme você abate com ele." },
    { data: "27/10/2026", titulo: "Baú no fim da partida e o aviso Quase lá", texto: "Toda partida termina com um baú de bronze, prata ou ouro, de acordo com o seu desempenho, com cinzas, fragmentos ou XP do Passe. O jogo também mostra a insígnia ou missão que está mais perto de ser concluída, para você saber o que falta." },
    { data: "27/10/2026", titulo: "Desafios, banners e insígnias", texto: "Uma tela nova de Desafios libera banners e avatares ao cumprir metas, como vencer uma fase ou abater inimigos com um herói. Há também 46 insígnias para colecionar, com até 5 expostas no perfil. Heróis que você ainda não tem não aparecem nas listas, e a tela de desafios é só da sua conta. Veja os prints na seção Do projeto." },
    { data: "27/10/2026", titulo: "Magos e arqueira atiram de longe", texto: "Os heróis de magia agora lançam projéteis que buscam o inimigo mais próximo e atravessam quem estiver na frente, e ficam mais fortes conforme você sobe de nível. Lyra dispara flechas e Orun mistura golpes corpo a corpo com almas arremessadas. A velocidade das animações foi ajustada herói por herói." },
    { data: "27/10/2026", titulo: "Perfil: banner inteiro e Ocultar painel", texto: "O banner do perfil agora mostra o herói do lado certo, e um botão Ocultar painel esconde a caixa central para você ver o banner todo. A tela de Opções também foi corrigida para caber em qualquer celular." },
    { data: "27/10/2026", titulo: "Versão 9: reforma visual dos heróis e novas animações", texto: "Os heróis ganharam um novo design de corpo inteiro, com mais detalhe em armaduras, capas, armas e rostos, além de banners e três avatares refeitos. Garrick, Yurinn, Brann e Orun também têm animações novas de parado, correr e atacar, desenhadas quadro a quadro, e o Sombras das Cinzas ganhou um parado novo. Os outros heróis recebem as deles nas próximas versões." },
    { data: "27/10/2026", titulo: "Ysolde, Kaelor, Mordrek e Lyra já estão no jogo", texto: "Os quatro heróis novos entram na loja por R$ 6,99 cada, com retrato, banner, avatares, animações e três habilidades próprias. Agora são doze heróis jogáveis. Veja a ficha de cada um na seção Personagens." },
    { data: "27/10/2026", titulo: "Dravik, o Penitente da Tinta, vem no próximo Passe", texto: "O novo herói é um tanque rápido que luta com os punhos e tem dano alto. Suas habilidades são o Selo de Tinta, as Correntes de Tinta e a Chuva de Tinta, todas desenhadas só por código. Ele será o herói exclusivo do Passe da próxima temporada. A ficha já está na seção Personagens." },
    { data: "27/10/2026", titulo: "Correr e atacar agora são animações separadas", texto: "Enquanto você só move o analógico, o herói corre. A animação de ataque aparece apenas quando você ataca: no botão, segurando o botão ou com o ataque automático ligado. Ao ser derrotado, o herói cai para trás e fica no chão." },
    { data: "27/10/2026", titulo: "Correções: analógico e rolagem dos menus", texto: "O analógico não trava mais para um lado durante a partida, mesmo ao pausar ou soltar o dedo sobre um botão. Nos menus, dá para arrastar a tela para ver o Passe, os avatares, o ranking e as outras listas mesmo começando o arrasto em cima de um botão." },
    { data: "27/10/2026", titulo: "Quatro heróis novos a caminho: Ysolde, Kaelor, Mordrek e Lyra", texto: "Ysolde, a Bruxa da Geleira, Kaelor, o Caçador de Espinhos, Mordrek, o Alquimista da Peste, e Lyra, a Arqueira Lunar, já têm visual, banner, avatares e animações prontos. Eles chegam ao jogo em breve. Os banners estão na seção Do projeto." },
    { data: "25/10/2026", titulo: "Login com Google e progresso na nuvem", texto: "O jogo agora tem conta: você entra com o Google, escolhe seu apelido e o progresso fica salvo na nuvem, então dá para trocar de celular sem perder nada. Dentro das Opções existem sair da conta e excluir a conta, que apaga login, progresso e ranking. Veja os detalhes na política de privacidade." },
    { data: "25/10/2026", titulo: "Versão 8: só criaturas voadoras e 18 chefes", texto: "Todas as criaturas agora voam, e cada cenário tem espécies únicas, desenhadas nas cores do próprio chão da fase. Cada fase ganhou três chefes, 18 no total, que aparecem em ciclo a cada 3 minutos, cada um mais forte que o anterior. Veja o novo bestiário na seção Criaturas." },
    { data: "25/10/2026", titulo: "Ataques mais justos e habilidades mais bonitas", texto: "Os ataques dos inimigos foram reequilibrados para as fases ficarem difíceis, mas possíveis: tiros mais lentos, avisos antes dos mergulhos e chefes com disparos menos pesados. As habilidades duram mais e ficam visíveis até o fim, e explosões, itens e armas agora são efeitos desenhados em detalhe, sem imagens prontas." },
    { data: "25/10/2026", titulo: "Teste no celular e preparação para a Google Play", texto: "O jogo já foi exportado e testado em um celular Android real. A página da loja e a política de privacidade estão sendo preparadas para o lançamento." },
    { data: "23/10/2026", titulo: "Versão 7: Passe, Roleta e Fragmentos", texto: "O Passe de Catedral chega com 30 níveis. A trilha grátis dá cinzas e poções; o Premium (R$ 14,99) libera molduras de perfil, 19 títulos e dois heróis exclusivos. A Roleta da Catedral dá 1 giro grátis por dia, mais 3 por vídeo, com cinzas, poções, fragmentos e uma promoção relâmpago do Sombras das Cinzas. Os Fragmentos de Vitral caem de elites e chefes e, junto de 1200 cinzas, liberam heróis novos." },
    { data: "23/10/2026", titulo: "Dois heróis novos: Irmão Brasa e Vesper", texto: "Irmão Brasa, o Monge do Machado, gira o machado em um círculo de brasas e vem no nível 15 do Passe Premium. Vesper, a Cantora do Sino Negro, faz o sino rachado ressoar e vem no nível 30. Agora o jogo tem oito heróis." },
    { data: "23/10/2026", titulo: "Banners de herói e artes novas", texto: "Heróis pagos e do Passe ganharam um banner com a foto, a vida, a velocidade, o dano e as três habilidades. Toque no herói na Loja ou no ícone dele no Passe para ver. As fotos de escolha de herói foram trocadas por artes de corpo inteiro." },
    { data: "23/10/2026", titulo: "Títulos por abates e molduras de perfil", texto: "Cada título do Passe fica escuro no perfil até você atingir a meta de abates com o herói dele. As molduras agora enquadram a foto do herói escolhido no perfil." },
    { data: "23/10/2026", titulo: "Novo herói a caminho: Sombras das Cinzas", texto: "Um mago feito de sombra e cinza, com bolas de fogo, chuva de cinzas e explosões. Será o primeiro herói vendido na loja, por R$ 3,99. A ficha oficial já está na galeria." },
    { data: "23/10/2026", titulo: "Arte oficial dos cinco heróis", texto: "Cada herói ganhou sua ficha oficial, com retrato, expressões, habilidades e banner de perfil. As skins foram removidas por enquanto: cada herói tem só o visual original. Novos heróis chegam em breve." },
    { data: "20/10/2026", titulo: "Versão 6: a atualização das Cinzas", texto: "Cinco heróis jogáveis (Garrick, Yurinn, Brann, Selka e Orun), cada um com habilidade única. Seis fases, cada uma com cenário, música, 10 criaturas e um chefe." },
    { data: "20/10/2026", titulo: "Juramento de Cinzas: a história em cenas narradas", texto: "Cenas com imagens, narração e música entre as fases, e um final em que você escolhe entre renovar o Selo ou quebrá-lo. Sem spoilers por aqui." },
    { data: "20/10/2026", titulo: "Poções, recompensa diária e loja nova", texto: "Oito poções temporárias para levar à partida, sete dias de recompensa diária (se faltar um dia, a sequência só pausa) e uma loja com heróis, pacotes de cinzas e poções." },
    { data: "20/10/2026", titulo: "Anúncios só se você quiser", texto: "Vídeos servem para ganhar recompensas ou continuar após cair, sempre opcionais. O anúncio de tela cheia é raro, nunca aparece durante a partida e existe a opção de removê-lo." },
    { data: "20/10/2026", titulo: "Novas seções: Personagens, Criaturas e Cenários", texto: "O site agora mostra os heróis, o bestiário de cada fase e os objetos de cada cenário, além de prints do jogo na seção Do projeto." },
    { data: "20/10/2026", titulo: "Em breve: códigos de resgate, perfil e ranking", texto: "Vem aí um código exclusivo com personagem limitado, conta de login, perfil com nick único e ranking global." },
    { data: "17/10/2026", titulo: "Em produção · Novos heróis e habilidades únicas", texto: "Além de Garrick, o jogo vai ganhar Yurinn, a Tecelã de Brasas, Brann, o Sentinela do Selo, Selka, a Lâmina Errante, e Orun, o Coveiro. Cada um com uma habilidade só dele e variações de cor para escolher." },
    { data: "17/10/2026", titulo: "Em produção · Seis cenários e um bestiário para cada um", texto: "Campo de Cinzas, Floresta Morta, Catedral em Ruínas, Pântano de Sangue, Geleira dos Esquecidos e Abismo de Brasas. Cada cenário terá criaturas e um chefe próprios." },
    { data: "17/10/2026", titulo: "Em produção · A história de Ashem Vow", texto: "Um juramento antigo mantém uma fome selada sob uma catedral, e o preço de manter esse juramento é mais alto do que parece. A história será contada em cutscenes, falas e lembranças que o jogador coleciona. Sem spoilers por aqui." },
    { data: "17/10/2026", titulo: "Em produção · Loja redesenhada e poções", texto: "A nova interface da loja está em conceito, com poções de efeito temporário (vida, velocidade, dano, XP e mais). Tudo pensado para não virar pagar para vencer." },
    { data: "17/10/2026", titulo: "Planejado · Anúncios com respeito ao jogador", texto: "Nada de enxurrada de anúncios. Os anúncios serão opcionais, em troca de recompensas, e haverá uma opção para removê-los de vez." },
    { data: "17/10/2026", titulo: "Trilha mais baixa e sons mais suaves", texto: "O jogo terá música imersiva, com volume contido e uma faixa por cenário, feita para ouvir por muito tempo sem cansar." },
    { data: "16/10/2026", titulo: "Teste jogável: personagens maiores e 10 criaturas animadas", texto: "Garrick ficou mais alto, cada criatura ganhou tamanho próprio, os arqueiros passaram a atirar de longe, e há um chefe a cada 3 minutos. Também já estão no teste a loja de skins de herói e de espada, os sons e a trilha." },
    { data: "16/10/2026", titulo: "Bestiário revelado: 10 criaturas de cinzas", texto: "Seis mobs terrestres (Soldado de Cinzas, Lâmina Vivente, Husk de Ossos, Besta de Cinzas, Colosso de Fogo e Arqueiro) e quatro voadores (Corvo da Ruína, Spectro Alado, Serpe Aérea e o chefe Demônio Alado)." },
    { data: "16/10/2026", titulo: "Conheça o Guardião das Cinzas", texto: "A ficha do personagem principal já tem animações de idle, andar, correr, pulo, ataque básico, ataque pesado e habilidades, além de variações de cor da armadura." },
    { data: "15/10/2026", titulo: "O site de Ashem Vow está no ar", texto: "Este é o ponto central para acompanhar o desenvolvimento, ver a arte e apoiar o projeto." },
    { data: "15/10/2026", titulo: "Esqueleto do jogo em construção", texto: "A base do projeto está pronta: movimento, câmera e estrutura das fases." }
  ],
  /* Galeria de artes. Imagens ficam na pasta assets */
  galeria: [
    { img: "assets/logo-ashem-vow.webp", legenda: "Juramento de Cinzas sob a Lua Rubra" },
    { img: "assets/ficha-garrick.webp", legenda: "Ficha oficial, Garrick: Warden of Ashes" },
    { img: "assets/ficha-yurinn.webp", legenda: "Ficha oficial, Yurinn: Ember Weaver" },
    { img: "assets/ficha-brann.webp", legenda: "Ficha oficial, Brann: Sentinel of the Pale Light" },
    { img: "assets/ficha-selka.webp", legenda: "Ficha oficial, Selka: Shadow Dancer" },
    { img: "assets/ficha-orun.webp", legenda: "Ficha oficial, Orun: Gravedigger of Souls" },
    { img: "assets/ficha-sombras.webp", legenda: "Ficha oficial, Sombras das Cinzas: Shadow of Ashes (em breve)" }
  ],

  /* Seção "Do projeto": fotos e prints do desenvolvimento.
     Para adicionar: envie a imagem para assets/ e copie uma linha abaixo (a mais nova no topo). */
  projeto: {
    intro: "Prints do jogo, folhas de arte e conceitos de Ashem Vow. Tudo em andamento e sujeito a mudanças.",
    itens: [
      {"data": "08/11/2026", "img": "assets/print-apresentacao.webp", "legenda": "Apresentação do menu para jogadores novos"},
      {"data": "08/11/2026", "img": "assets/print-tutorial.webp", "legenda": "Tutorial da primeira partida"},
      {"data": "08/11/2026", "img": "assets/print-segurar-habilidade.webp", "legenda": "Segurando a habilidade: nome, efeito e recarga"},
      {"data": "08/11/2026", "img": "assets/print-idioma-en.webp", "legenda": "Loja em inglês"},
      {"data": "08/11/2026", "img": "assets/print-passe.webp", "legenda": "Passe de Catedral redesenhado"},
      {"data": "08/11/2026", "img": "assets/print-roleta.webp", "legenda": "Roleta nova"},
      {"data": "08/11/2026", "img": "assets/print-home.webp", "legenda": "Tela inicial com o cartão do jogador"},
      {"data": "08/11/2026", "img": "assets/print-perfil.webp", "legenda": "Perfil com todas as abas no topo"},
      {"data": "27/10/2026", "img": "assets/print-missoes.webp", "legenda": "Missões diárias e semanais, com a Maldição do dia"},
      {"data": "27/10/2026", "img": "assets/print-fim.webp", "legenda": "Fim de partida: Maldição ativa, Quase lá e Baú de Prata"},
      {"data": "27/10/2026", "img": "assets/print-maestria.webp", "legenda": "Maestria do herói na tela de Heróis"},
      {"data": "27/10/2026", "img": "assets/print-desafios.webp", "legenda": "Desafios: banners e avatares para liberar"},
      {"data": "27/10/2026", "img": "assets/print-insignias.webp", "legenda": "Insígnias para colecionar e exibir no perfil"},
      {"data": "27/10/2026", "img": "assets/insignias-todas.webp", "legenda": "As 46 insígnias do jogo"},
      {"data": "27/10/2026", "img": "assets/b-ysolde.webp", "legenda": "Em breve: Ysolde, a Bruxa da Geleira"},
      {"data": "27/10/2026", "img": "assets/b-kaelor.webp", "legenda": "Em breve: Kaelor, o Caçador de Espinhos"},
      {"data": "27/10/2026", "img": "assets/b-mordrek.webp", "legenda": "Em breve: Mordrek, o Alquimista da Peste"},
      {"data": "27/10/2026", "img": "assets/b-lyra.webp", "legenda": "Em breve: Lyra, a Arqueira Lunar"},
      {"data": "25/10/2026", "img": "assets/print-jogo_garrick.webp", "legenda": "Garrick no Campo de Cinzas, enfrentando criaturas voadoras"},
      {"data": "25/10/2026", "img": "assets/print-jogo_yurinn.webp", "legenda": "Yurinn na Floresta Morta"},
      {"data": "25/10/2026", "img": "assets/print-jogo_brann.webp", "legenda": "Brann na Catedral em Ruínas"},
      {"data": "25/10/2026", "img": "assets/print-jogo_selka.webp", "legenda": "Selka no Pântano de Sangue"},
      {"data": "25/10/2026", "img": "assets/print-jogo_orun.webp", "legenda": "Orun na Geleira dos Esquecidos"},
      {"data": "25/10/2026", "img": "assets/print-jogo_sombras.webp", "legenda": "Sombras das Cinzas no Abismo de Brasas"},
      {"data": "25/10/2026", "img": "assets/print-boss_campo.webp", "legenda": "Chefe do Campo de Cinzas: Arauto das Cinzas"},
      {"data": "25/10/2026", "img": "assets/print-boss_floresta.webp", "legenda": "Chefe da Floresta Morta: Mãe das Raízes"},
      {"data": "25/10/2026", "img": "assets/print-boss_ruinas.webp", "legenda": "Chefe da Catedral em Ruínas: Bispo Sem Rosto"},
      {"data": "25/10/2026", "img": "assets/print-boss_pantano.webp", "legenda": "Chefe do Pântano de Sangue: Rei do Lodo"},
      {"data": "25/10/2026", "img": "assets/print-boss_gelo.webp", "legenda": "Chefe da Geleira dos Esquecidos: Wyrm da Nevasca"},
      {"data": "25/10/2026", "img": "assets/print-boss_vulcanica.webp", "legenda": "Chefe do Abismo de Brasas: Fênix Negra"},
      {"data": "25/10/2026", "img": "assets/print-home.webp", "legenda": "Tela inicial, com Roleta e Passe"},
      {"data": "25/10/2026", "img": "assets/print-loja.webp", "legenda": "Loja de heróis por dinheiro real"},
      {"data": "25/10/2026", "img": "assets/print-herois.webp", "legenda": "Escolha de heróis"},
      {"data": "25/10/2026", "img": "assets/print-perfil.webp", "legenda": "Perfil do jogador"},
      {"data": "25/10/2026", "img": "assets/print-banner.webp", "legenda": "Escolha do banner do perfil"},
      {"data": "25/10/2026", "img": "assets/print-preparar.webp", "legenda": "Preparar partida: fase e poções"},
      {"data": "25/10/2026", "img": "assets/print-diario.webp", "legenda": "Recompensa diária"},
      {"data": "25/10/2026", "img": "assets/print-novidades.webp", "legenda": "Aba de novidades dentro do jogo"},
      { data: "17/10/2026", img: "assets/bestiario-campo.webp", legenda: "Bestiário do Campo de Cinzas, versão de trabalho" },
      { data: "16/10/2026", img: "assets/bestiario.webp", legenda: "Bestiário de monstros terrestres e voadores" }
    ]
  },
  /* Personagens, criaturas e cenários: gerados a partir do jogo. Imagens em assets/ */
  // A saga completa (mesmo texto narrado no vídeo da saga). O Vigia usa para responder sobre a história.
  saga: [{"titulo": "Capítulo I · Lua Rubra", "texto": "Havia uma vila no fim do mundo. Não tinha nome nos mapas, só tinha gente: mães, ferreiros, crianças que corriam descalças pelo chão de terra. Numa noite sem estrelas, a lua subiu vermelha, e a vila inteira soube que algo estava errado. Vieram homens de armadura, em silêncio, e carregavam tochas como quem carrega uma sentença. Ninguém gritou ordem alguma. O fogo caiu sobre os telhados como se já estivesse escrito. As pessoas correram, caíram, e as casas viraram brasa. E no meio daquele inferno havia um menino. Um só. Ele caminhou para dentro das chamas, e as chamas se abriram, como quem reconhece alguém. Ele não queimou. Nem uma vez. Quando tudo acabou, as cinzas se ergueram do chão, uma a uma, devagar. Giraram em volta dele. E sussurraram um nome que ele mesmo não lembrava ter. Garrick."}, {"titulo": "Capítulo II · As Marcas", "texto": "Depois da Lua Rubra, o mundo mudou. As cinzas passaram a lembrar. Cada grão guardava um pedaço de quem foi queimado: um riso, um nome, uma promessa. E algumas pessoas começaram a ouvir esses pedaços. Elas chamaram isso de Marca. Um símbolo que surge na pele e dá um poder que ninguém pediu. Doze Marcas, doze pessoas escolhidas, cada uma por uma ferida diferente. Um perdeu o sono para sempre. Outra perdeu a voz, aos poucos, a cada canção. Uma terceira passou a viver mais devagar que o resto do mundo. Alguém deixou de sentir o gosto das coisas. Outro, o calor do próprio corpo. Porque este é o segredo das Marcas: todo poder cobra um preço, e o preço é sempre uma lembrança. Quanto mais forte você fica, menos de você sobra. E as cinzas continuam pedindo mais."}, {"titulo": "Capítulo III · Campo de Cinzas", "texto": "O primeiro lugar onde a guerra começou chama-se Campo de Cinzas. Antes era trigo, rio e crianças. Hoje é só um mar cinza que se mexe sozinho quando ninguém olha. É aqui que caminha Sombras das Cinzas. Dizem que foi ele quem acendeu o primeiro fogo, com uma mão que não tremeu. Ele não lembra por quê. Só sabe que a própria sombra o abandonou naquela noite, e desde então ele queima tudo o que toca para não ficar sozinho. E há Selka. Ela ajudou a queimar vilas, obedecendo ordens que nunca entendeu. Hoje gira lâminas sem parar, porque o ruído do aço é o único som capaz de calar a voz da própria consciência. Mas uma noite, no meio do vento, Selka sentiu algo. Um chamado, vindo de dentro da Floresta Morta. Era fraco, quase uma criança chorando. E ela foi."}, {"titulo": "Capítulo IV · Floresta Morta", "texto": "A Floresta Morta não está morta por falta de chuva. Ela morreu de tristeza. Cada árvore ali guardou um segredo, e o segredo apodreceu. Kaelor foi seu guardião. Jurou, diante de todas as raízes, que nada a feriria. E quando a floresta caiu, ele sobreviveu. Agora seus espinhos brotam da própria carne, e ele perdeu o toque e o cheiro das pessoas, como castigo por ter falhado. E há Orun, o coveiro. Ele enterrou mortos que ninguém reclamou, sem nome e sem pedra. Cada alma que ele liga a si lhe rouba um pouco do rosto dos vivos, até que um dia ele olhou para os próprios filhos e não reconheceu nenhum. Foi Orun quem encontrou, entre as raízes, um túmulo mais novo que os outros. Não havia corpo. Só um nome, gravado fundo na pedra. Garrick."}, {"titulo": "Capítulo V · Catedral em Ruínas", "texto": "A Catedral em Ruínas ainda tem teto, mas não tem mais deus. O que resta é um coro de ecos e uma luz que atravessa vitrais partidos como lâminas. Brann nunca deixou seu posto. Mandaram que ele guardasse aquelas portas, e ele guardou, mesmo quando já não havia nada a proteger. Ele convocou pilares de luz para manter a escuridão longe, e a escuridão foi levando o sono dele, noite após noite. E há Vesper, a cantora. Ela canta a canção do Juramento, a mesma que o exército usou para selar o mundo. A cada estrofe, uma parte da voz dela se apaga. Mas ela canta, porque alguém precisa lembrar. Uma noite, Garrick ouviu Vesper cantar uma estrofe e parou. Ele conhecia aquelas palavras. Conhecia cada nota. E nunca, em toda a sua vida, ninguém lhe havia ensinado."}, {"titulo": "Capítulo VI · Yurinn, a Tecelã", "texto": "No coração da catedral vive Yurinn, a Tecelã. Ela enxerga o que ninguém vê: os fios que ligam cada pessoa a quem ela ama. Passa os dias costurando o que o mundo esquece. Mas um dia ela cortou um fio. Foi por medo. Ela viu algo se aproximando, uma Fome tão grande que não cabia na realidade, e para impedir que ela entrasse, cortou o fio de uma criança que ainda nem tinha nascido. Essa criança é você, Garrick. Seus pais nunca existiram do jeito que você lembra. Sua vila foi só o lugar onde você foi guardado. Você nunca foi aquele menino que sobreviveu ao fogo por sorte. Você é a chave. A única que consegue abrir o selo, ou fechá-lo para sempre. E agora ela sabe que o corte que fez dói em você mais do que em ninguém."}, {"titulo": "Capítulo VII · Pântano de Sangue", "texto": "O Pântano de Sangue não é feito de lama. É feito de erros. Tudo o que uma vez foi uma boa ideia acabou ali, apodrecendo devagar. Mordrek era médico. Criou uma cura para a peste, e a cura foi pior que a doença: matou os que deveria salvar. Agora a peste vive nele, e ele nem sente o gosto do próprio pão. Ainda assim, continua tentando curar o que ninguém mais tenta. E no meio da névoa surge um homem com uma armadura velha e um olhar cansado. Seu nome é Marek. Foi soldado da Colheita, um dos que levaram as tochas naquela noite sem estrelas. Ele nunca se perdoou. Quando Marek viu Garrick, não disse nada por muito tempo. Depois falou baixo, quase sem voz: eu reconheço você. Eu estava lá. E eu sei do que você é feito."}, {"titulo": "Capítulo VIII · Geleira dos Esquecidos", "texto": "A Geleira dos Esquecidos guarda tudo o que o mundo quis apagar. Nomes, rostos, cartas nunca entregues. O frio ali conserva a lembrança melhor que qualquer fogo. Ysolde veio para cá com o irmão doente. Para salvá-lo, congelou o próprio sangue dele e o deixou dormindo sob o gelo. Ela espera o dia em que possa descongelá-lo. Por isso, o tempo dela passa devagar: ela ainda não terminou de cuidar dele. E Lyra, a arqueira. Ela cresceu sob um céu sem lua, e seus olhos foram se apagando para o que está perto. Ela só enxerga o que está longe: estrelas, montanhas, e presságios. Foi Lyra quem viu primeiro. Atrás de uma parede de gelo, no meio da tempestade, havia uma menina feita de luz. Ela olhava para Garrick e sorria como quem espera uma metade de si."}, {"titulo": "Capítulo IX · Abismo de Brasas", "texto": "No fim do caminho há um abismo que respira. Rios de brasa descem por suas paredes, e o calor ali não aquece nada. Só lembra. É aqui que Irmão Brasa chegou. Ele foi sacerdote, até o dia em que sua ordem o traiu. Sem fé, passou a girar em chamas como um fuso, gritando uma oração que ninguém mais ouve. O fogo o fez forte, mas levou o calor do próprio corpo. As criaturas que guardam o abismo se erguem uma a uma. A Fênix Negra, feita das cinzas de quem ardeu ali. O Titã de Magma, que jamais dormiu. Todos servem à mesma coisa. E então, no fundo do abismo, uma voz responde. Não é um rugido. É uma voz pequena, quase de criança. É a Fome. E ela chama Garrick pelo nome."}, {"titulo": "Capítulo X · O Escriba", "texto": "Há um homem que escreveu o Juramento. Seu nome é Dravik. Ele traçou cada palavra com tinta preta, como quem desenha o próprio destino. Mas a tinta é traiçoeira. Ela leva a lembrança do que se escreve. Quanto mais ele escrevia, menos se lembrava de ter escrito. Hoje, Dravik caminha com correntes de tinta e uma chuva sombria, tentando reaprender o que fez. Uma coisa, porém, ele nunca esqueceu. A última linha do Juramento. Aquela que o exército mandou apagar, porque dava ao menino um poder que ninguém deveria ter. A Chave pode escolher."}, {"titulo": "Capítulo XI · Renovar ou Quebrar", "texto": "Chegou o dia. Garrick está diante do círculo, no centro do mundo, e a Fome espera do outro lado. Ele carrega o fogo de uma vila, o nome de um túmulo e a voz de uma estrofe que ninguém lhe ensinou. Se ele se ajoelhar, o selo se renova. A Fome volta a dormir, o mundo respira, e ele esquece quem foi. Uma nova criança atravessará o fogo, em outra vila, e tudo começará de novo. Se ele a tocar, o selo se quebra. As Marcas se apagam, e cada herói recupera o que perdeu. Mas as cinzas voltam a lembrar de tudo, e o mundo terá que aprender a viver com todas as suas memórias. Um caminho é dever. O outro é cura. E nenhum dos dois é fácil. A escolha agora é sua."}],
  personagens: [{"nome": "Garrick", "titulo": "Guardião das Cinzas", "habilidade": "Aura de Brasas", "descricao": "Um círculo de fogo queima quem chega perto e explode de tempos em tempos.", "skins": [{"nome": "Guardião das Cinzas", "img": "assets/p-garrick-padrao.webp"}], "banner": "assets/b-garrick.webp", "habilidades": [{"nome": "Aura de Brasas", "img": "assets/s-garrick-1.webp"}, {"nome": "Corte Ígneo", "img": "assets/s-garrick-2.webp"}, {"nome": "Eclipse de Cinzas", "img": "assets/s-garrick-3.webp"}]}, {"nome": "Yurinn", "titulo": "Tecelã de Brasas", "habilidade": "Fios de Brasa", "descricao": "Tece fios de fogo que perseguem os inimigos mais próximos.", "skins": [{"nome": "Tecelã de Brasas", "img": "assets/p-yurinn-padrao.webp"}], "banner": "assets/b-yurinn.webp", "habilidades": [{"nome": "Fios de Brasa", "img": "assets/s-yurinn-1.webp"}, {"nome": "Casulo", "img": "assets/s-yurinn-2.webp"}, {"nome": "Teia Ardente", "img": "assets/s-yurinn-3.webp"}]}, {"nome": "Brann", "titulo": "Sentinela da Luz Pálida", "habilidade": "Pilares de Luz", "descricao": "Chama colunas de luz sobre os inimigos. Muita vida, passos lentos.", "skins": [{"nome": "Sentinela da Luz Pálida", "img": "assets/p-brann-padrao.webp"}], "banner": "assets/b-brann.webp", "habilidades": [{"nome": "Pilares de Luz", "img": "assets/s-brann-1.webp"}, {"nome": "Selo Sagrado", "img": "assets/s-brann-2.webp"}, {"nome": "Julgamento", "img": "assets/s-brann-3.webp"}]}, {"nome": "Selka", "titulo": "Dançarina das Sombras", "habilidade": "Tempestade de Lâminas", "descricao": "Lâminas giram ao redor dela e cortam tudo no caminho. Rápida e frágil.", "skins": [{"nome": "Dançarina das Sombras", "img": "assets/p-selka-padrao.webp"}], "banner": "assets/b-selka.webp", "habilidades": [{"nome": "Tempestade de Lâminas", "img": "assets/s-selka-1.webp"}, {"nome": "Corrente Voadora", "img": "assets/s-selka-2.webp"}, {"nome": "Ceifa Sombria", "img": "assets/s-selka-3.webp"}]}, {"nome": "Orun", "titulo": "Coveiro das Almas", "habilidade": "Almas Ligadas", "descricao": "Almas libertas caçam os inimigos. Cada abate pode libertar mais uma.", "skins": [{"nome": "Coveiro das Almas", "img": "assets/p-orun-padrao.webp"}], "banner": "assets/b-orun.webp", "habilidades": [{"nome": "Almas Ligadas", "img": "assets/s-orun-1.webp"}, {"nome": "Mão do Coveiro", "img": "assets/s-orun-2.webp"}, {"nome": "Procissão dos Mortos", "img": "assets/s-orun-3.webp"}]}, {"nome": "Sombras das Cinzas", "titulo": "Mago das Sombras", "habilidade": "Bola de Fogo", "descricao": "Herói premium, à venda na loja por R$ 3,99 (às vezes em promoção na roleta). Feito de sombra e cinza, lança bolas de fogo, rajadas de chamas e uma chuva de meteoros.", "skins": [{"nome": "Mago das Sombras", "img": "assets/p-sombras-padrao.webp"}], "banner": "assets/b-sombras.webp", "habilidades": [{"nome": "Bola de Fogo", "img": "assets/s-sombras-1.webp"}, {"nome": "Rajada de Chamas", "img": "assets/s-sombras-2.webp"}, {"nome": "Chuva de Meteoros", "img": "assets/s-sombras-3.webp"}]}, {"nome": "Ysolde", "titulo": "Bruxa da Geleira", "habilidade": "Estilhaços de Gelo", "descricao": "Herói da loja, R$ 6,99 (às vezes em promoção na roleta). Dispara dardos de gelo que atrasam quem acertam, congela o chão em volta dela e termina numa nevasca.", "skins": [{"nome": "Bruxa da Geleira", "img": "assets/p-ysolde-padrao.webp"}], "banner": "assets/b-ysolde.webp", "habilidades": [{"nome": "Estilhaços de Gelo", "img": "assets/s-ysolde-1.webp"}, {"nome": "Zona Congelante", "img": "assets/s-ysolde-2.webp"}, {"nome": "Nevasca", "img": "assets/s-ysolde-3.webp"}]}, {"nome": "Kaelor", "titulo": "Caçador de Espinhos", "habilidade": "Espinhos Brotando", "descricao": "Herói da loja, R$ 6,99 (às vezes em promoção na roleta). Espinhos negros rasgam o chão à frente dele e atordoam quem está no caminho. Cipós prendem os inimigos e uma roseira negra cobre a área.", "skins": [{"nome": "Caçador de Espinhos", "img": "assets/p-kaelor-padrao.webp"}], "banner": "assets/b-kaelor.webp", "habilidades": [{"nome": "Espinhos Brotando", "img": "assets/s-kaelor-1.webp"}, {"nome": "Cipó Prendedor", "img": "assets/s-kaelor-2.webp"}, {"nome": "Roseira Negra", "img": "assets/s-kaelor-3.webp"}]}, {"nome": "Mordrek", "titulo": "Alquimista da Peste", "habilidade": "Frasco Tóxico", "descricao": "Herói da loja, R$ 6,99 (às vezes em promoção na roleta). Arremessa frascos que deixam poças de veneno, solta uma nuvem pútrida e faz brotar uma flor da peste.", "skins": [{"nome": "Alquimista da Peste", "img": "assets/p-mordrek-padrao.webp"}], "banner": "assets/b-mordrek.webp", "habilidades": [{"nome": "Frasco Tóxico", "img": "assets/s-mordrek-1.webp"}, {"nome": "Nuvem Pútrida", "img": "assets/s-mordrek-2.webp"}, {"nome": "Flor da Peste", "img": "assets/s-mordrek-3.webp"}]}, {"nome": "Lyra", "titulo": "Arqueira Lunar", "habilidade": "Flecha Perfurante", "descricao": "Herói da loja, R$ 6,99 (às vezes em promoção na roleta). Uma flecha prateada atravessa a fila inteira de inimigos, chove flechas sobre a horda e a Marca da Lua cai sobre o mais forte.", "skins": [{"nome": "Arqueira Lunar", "img": "assets/p-lyra-padrao.webp"}], "banner": "assets/b-lyra.webp", "habilidades": [{"nome": "Flecha Perfurante", "img": "assets/s-lyra-1.webp"}, {"nome": "Chuva de Flechas", "img": "assets/s-lyra-2.webp"}, {"nome": "Marca da Lua", "img": "assets/s-lyra-3.webp"}]}, {"nome": "Irmão Brasa", "titulo": "Monge do Machado", "habilidade": "Giro Ardente", "descricao": "Exclusivo do Passe Premium, nível 15. Gira o machado e um círculo de brasas queima e atrasa os inimigos em volta.", "skins": [{"nome": "Monge do Machado", "img": "assets/p-monge-padrao.webp"}], "banner": "assets/b-monge.webp", "habilidades": [{"nome": "Giro Ardente", "img": "assets/s-monge-1.webp"}, {"nome": "Machados Voadores", "img": "assets/s-monge-2.webp"}, {"nome": "Golpe do Penitente", "img": "assets/s-monge-3.webp"}]}, {"nome": "Vesper", "titulo": "Cantora do Sino Negro", "habilidade": "Badalada", "descricao": "Exclusiva do Passe Premium, nível 30. O sino rachado ressoa em volta dela e fere quem chega perto.", "skins": [{"nome": "Cantora do Sino Negro", "img": "assets/p-vesper-padrao.webp"}], "banner": "assets/b-vesper.webp", "habilidades": [{"nome": "Badalada", "img": "assets/s-vesper-1.webp"}, {"nome": "Coro Sombrio", "img": "assets/s-vesper-2.webp"}, {"nome": "Réquiem", "img": "assets/s-vesper-3.webp"}]}, {"nome": "Dravik", "titulo": "Penitente da Tinta", "habilidade": "Selo de Tinta", "descricao": "Exclusivo do próximo Passe de Catedral. Tanque veloz que luta com os punhos e tem dano alto. Grava selos de tinta no chão, prende a horda com correntes e faz chover tinta sobre a tela inteira.", "skins": [{"nome": "Penitente da Tinta", "img": "assets/p-dravik-padrao.webp"}], "banner": "assets/b-dravik.webp", "habilidades": [{"nome": "Selo de Tinta", "img": "assets/s-dravik-1.webp"}, {"nome": "Correntes de Tinta", "img": "assets/s-dravik-2.webp"}, {"nome": "Chuva de Tinta", "img": "assets/s-dravik-3.webp"}], "tag": "Em breve · Passe da próxima temporada"}],
  vigiliaHerois: [
    {"nome": "Hálvar", "titulo": "o Lanterneiro", "img": "assets/v-halvar.webp", "arma": "aura", "cor": "#ffb04a", "txt": "A lanterna queima quem chega perto"},
    {"nome": "Nerys", "titulo": "a Caçadora", "img": "assets/v-nerys.webp", "arma": "bolt", "cor": "#dfe8ff", "pierce": 3, "speed": 1.5, "txt": "Flechas que atravessam a fila inteira"},
    {"nome": "Duran", "titulo": "Martelo-Rubro", "img": "assets/v-duran.webp", "arma": "strike", "cor": "#ff6a3a", "hp": 40, "vel": -0.1, "txt": "Marteladas que racham o chão. Muita vida, passos lentos"},
    {"nome": "Ivra", "titulo": "a Dançarina", "img": "assets/v-ivra.webp", "arma": "orbit", "cor": "#e8e0ff", "hp": -20, "vel": 0.15, "txt": "Adagas que giram em volta dela. Rápida e frágil"},
    {"nome": "Morvan", "titulo": "o Boticário", "img": "assets/v-morvan.webp", "arma": "pool", "cor": "#8cff4a", "txt": "Frascos que deixam poças de veneno"},
    {"nome": "Madre Cálix", "titulo": "a Sineira", "img": "assets/v-calix.webp", "arma": "pulse", "cor": "#e0a85a", "txt": "Badaladas que ferem tudo em volta"},
    {"nome": "Tíbor", "titulo": "o Piromante", "img": "assets/v-tibor.webp", "arma": "bolt", "cor": "#ff6a1a", "boom": 60, "txt": "Bolas de fogo que explodem"},
    {"nome": "Sael", "titulo": "o Corvo", "img": "assets/v-sael.webp", "arma": "bolt", "cor": "#b07aff", "homing": 1, "count": 2, "txt": "Corvos que caçam os inimigos"}
  ],
  vigiliaFase: {"fase": "Cemitério da Vigília", "chao": "assets/vg-chao.webp", "criaturas": [
    {"nome": "Carniçal", "img": "assets/vc-carnical.webp"}, {"nome": "Morcego de Cinza", "img": "assets/vc-morcego.webp"}, {"nome": "Esqueleto Maldito", "img": "assets/vc-esqueleto.webp"}, {"nome": "Cão de Brasa", "img": "assets/vc-cao.webp"}, {"nome": "Espectro Rubro", "img": "assets/vc-espectro.webp"},
    {"nome": "O Coveiro", "img": "assets/vc-coveiro.webp", "chefe": true}, {"nome": "Abominação de Ossos", "img": "assets/vc-abominacao.webp", "chefe": true}, {"nome": "Bruxa da Névoa", "img": "assets/vc-bruxa.webp", "chefe": true}
  ]},
  criaturas: [{"fase": "Campo de Cinzas", "criaturas": [{"nome": "Soldado", "img": "assets/c-campo-soldado.webp"}, {"nome": "Husk", "img": "assets/c-campo-husk.webp"}, {"nome": "Besta", "img": "assets/c-campo-besta.webp"}, {"nome": "Corvo", "img": "assets/c-campo-corvo.webp"}, {"nome": "Lâmina", "img": "assets/c-campo-lamina.webp"}, {"nome": "Arqueiro", "img": "assets/c-campo-arqueiro.webp"}, {"nome": "Colosso", "img": "assets/c-campo-colosso.webp"}, {"nome": "Spectro", "img": "assets/c-campo-spectro.webp"}, {"nome": "Serpe", "img": "assets/c-campo-serpe.webp"}, {"nome": "Arauto das Cinzas", "img": "assets/c-campo-demonio.webp", "chefe": true}, {"nome": "Rainha das Brasas", "img": "assets/c-campo-demonio2.webp", "chefe": true}, {"nome": "Colosso Carbonizado", "img": "assets/c-campo-demonio3.webp", "chefe": true}]}, {"fase": "Floresta Morta", "criaturas": [{"nome": "Soldado", "img": "assets/c-floresta-soldado.webp"}, {"nome": "Husk", "img": "assets/c-floresta-husk.webp"}, {"nome": "Besta", "img": "assets/c-floresta-besta.webp"}, {"nome": "Corvo", "img": "assets/c-floresta-corvo.webp"}, {"nome": "Lâmina", "img": "assets/c-floresta-lamina.webp"}, {"nome": "Arqueiro", "img": "assets/c-floresta-arqueiro.webp"}, {"nome": "Colosso", "img": "assets/c-floresta-colosso.webp"}, {"nome": "Spectro", "img": "assets/c-floresta-spectro.webp"}, {"nome": "Serpe", "img": "assets/c-floresta-serpe.webp"}, {"nome": "Senhor da Floresta", "img": "assets/c-floresta-demonio.webp", "chefe": true}, {"nome": "Mãe das Raízes", "img": "assets/c-floresta-demonio2.webp", "chefe": true}, {"nome": "Ceifador de Espinhos", "img": "assets/c-floresta-demonio3.webp", "chefe": true}]}, {"fase": "Catedral em Ruínas", "criaturas": [{"nome": "Soldado", "img": "assets/c-ruinas-soldado.webp"}, {"nome": "Husk", "img": "assets/c-ruinas-husk.webp"}, {"nome": "Besta", "img": "assets/c-ruinas-besta.webp"}, {"nome": "Corvo", "img": "assets/c-ruinas-corvo.webp"}, {"nome": "Lâmina", "img": "assets/c-ruinas-lamina.webp"}, {"nome": "Arqueiro", "img": "assets/c-ruinas-arqueiro.webp"}, {"nome": "Colosso", "img": "assets/c-ruinas-colosso.webp"}, {"nome": "Spectro", "img": "assets/c-ruinas-spectro.webp"}, {"nome": "Serpe", "img": "assets/c-ruinas-serpe.webp"}, {"nome": "Serafim Caído", "img": "assets/c-ruinas-demonio.webp", "chefe": true}, {"nome": "Sino da Perdição", "img": "assets/c-ruinas-demonio2.webp", "chefe": true}, {"nome": "Bispo Sem Rosto", "img": "assets/c-ruinas-demonio3.webp", "chefe": true}]}, {"fase": "Pântano de Sangue", "criaturas": [{"nome": "Soldado", "img": "assets/c-pantano-soldado.webp"}, {"nome": "Husk", "img": "assets/c-pantano-husk.webp"}, {"nome": "Besta", "img": "assets/c-pantano-besta.webp"}, {"nome": "Corvo", "img": "assets/c-pantano-corvo.webp"}, {"nome": "Lâmina", "img": "assets/c-pantano-lamina.webp"}, {"nome": "Arqueiro", "img": "assets/c-pantano-arqueiro.webp"}, {"nome": "Colosso", "img": "assets/c-pantano-colosso.webp"}, {"nome": "Spectro", "img": "assets/c-pantano-spectro.webp"}, {"nome": "Serpe", "img": "assets/c-pantano-serpe.webp"}, {"nome": "Rei do Lodo", "img": "assets/c-pantano-demonio.webp", "chefe": true}, {"nome": "Hidra Podre", "img": "assets/c-pantano-demonio2.webp", "chefe": true}, {"nome": "Mãe das Sanguessugas", "img": "assets/c-pantano-demonio3.webp", "chefe": true}]}, {"fase": "Geleira dos Esquecidos", "criaturas": [{"nome": "Soldado", "img": "assets/c-gelo-soldado.webp"}, {"nome": "Husk", "img": "assets/c-gelo-husk.webp"}, {"nome": "Besta", "img": "assets/c-gelo-besta.webp"}, {"nome": "Corvo", "img": "assets/c-gelo-corvo.webp"}, {"nome": "Lâmina", "img": "assets/c-gelo-lamina.webp"}, {"nome": "Arqueiro", "img": "assets/c-gelo-arqueiro.webp"}, {"nome": "Colosso", "img": "assets/c-gelo-colosso.webp"}, {"nome": "Spectro", "img": "assets/c-gelo-spectro.webp"}, {"nome": "Serpe", "img": "assets/c-gelo-serpe.webp"}, {"nome": "Rei Pálido", "img": "assets/c-gelo-demonio.webp", "chefe": true}, {"nome": "Wyrm da Nevasca", "img": "assets/c-gelo-demonio2.webp", "chefe": true}, {"nome": "Guardião do Gelo Eterno", "img": "assets/c-gelo-demonio3.webp", "chefe": true}]}, {"fase": "Abismo de Brasas", "criaturas": [{"nome": "Soldado", "img": "assets/c-vulcanica-soldado.webp"}, {"nome": "Husk", "img": "assets/c-vulcanica-husk.webp"}, {"nome": "Besta", "img": "assets/c-vulcanica-besta.webp"}, {"nome": "Corvo", "img": "assets/c-vulcanica-corvo.webp"}, {"nome": "Lâmina", "img": "assets/c-vulcanica-lamina.webp"}, {"nome": "Arqueiro", "img": "assets/c-vulcanica-arqueiro.webp"}, {"nome": "Colosso", "img": "assets/c-vulcanica-colosso.webp"}, {"nome": "Spectro", "img": "assets/c-vulcanica-spectro.webp"}, {"nome": "Serpe", "img": "assets/c-vulcanica-serpe.webp"}, {"nome": "O Devorador", "img": "assets/c-vulcanica-demonio.webp", "chefe": true}, {"nome": "Titã de Magma", "img": "assets/c-vulcanica-demonio2.webp", "chefe": true}, {"nome": "Fênix Negra", "img": "assets/c-vulcanica-demonio3.webp", "chefe": true}]}],
  cenarios: [{"fase": "Campo de Cinzas", "chao": "assets/g-campo.webp", "objetos": ["assets/s-campo-0.webp", "assets/s-campo-1.webp", "assets/s-campo-2.webp", "assets/s-campo-3.webp", "assets/s-campo-4.webp", "assets/s-campo-5.webp", "assets/s-campo-6.webp", "assets/s-campo-7.webp"]}, {"fase": "Floresta Morta", "chao": "assets/g-floresta.webp", "objetos": ["assets/s-floresta-0.webp", "assets/s-floresta-1.webp", "assets/s-floresta-2.webp", "assets/s-floresta-3.webp", "assets/s-floresta-4.webp", "assets/s-floresta-5.webp"]}, {"fase": "Catedral em Ruínas", "chao": "assets/g-ruinas.webp", "objetos": ["assets/s-ruinas-0.webp", "assets/s-ruinas-1.webp", "assets/s-ruinas-2.webp", "assets/s-ruinas-3.webp", "assets/s-ruinas-4.webp", "assets/s-ruinas-5.webp"]}, {"fase": "Pântano de Sangue", "chao": "assets/g-pantano.webp", "objetos": ["assets/s-pantano-0.webp", "assets/s-pantano-1.webp", "assets/s-pantano-2.webp", "assets/s-pantano-3.webp", "assets/s-pantano-4.webp"]}, {"fase": "Geleira dos Esquecidos", "chao": "assets/g-gelo.webp", "objetos": ["assets/s-gelo-0.webp", "assets/s-gelo-1.webp", "assets/s-gelo-2.webp", "assets/s-gelo-3.webp", "assets/s-gelo-4.webp"]}, {"fase": "Abismo de Brasas", "chao": "assets/g-vulcanica.webp", "objetos": ["assets/s-vulcanica-0.webp", "assets/s-vulcanica-1.webp", "assets/s-vulcanica-2.webp", "assets/s-vulcanica-3.webp"]}],
  criador: {
    nome: "Teecki",
    bio: "Desenvolvedor independente criando Ashem Vow do zero, sozinho. Cada apoio ajuda a transformar o esqueleto em jogo.",
    email: "ashemvow@gmail.com"
  },
  instagram: "https://www.instagram.com/ashemvow",
  sagaVideo: "https://www.youtube.com/watch?v=7UhEcFNO2N4",
  pix: { chave: "b8cbf0f8-07a7-4ac1-b5cc-1da4d78b6cd6", tipo: "Chave aleatória" },
  /* Anúncios: preencha com os dados do Google AdSense quando aprovado. Vazio = espaço reservado. */
  anuncios: { client: "ca-pub-4655197030235579", slot: "" }
};
