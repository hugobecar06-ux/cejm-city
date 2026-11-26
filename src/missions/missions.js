// =====================================================================
//  DONNÉES DES MISSIONS — modifiez librement les textes ci-dessous.
//  Types d'étapes : dialog, goto, collect, quiz, yield
//  - target / pos : identifiant d'un lieu (voir src/world/landmarks.js) ou [x, z]
//  - goto : car: true (véhicule requis) | 'rental' (voiture Loc'Auto), npc: {name}, time (s)
//  - collect : items [{pos, label, msg}], time, npc: true, network: true, counter(n, total)
//  - quiz : question, answers (3), correct (index), help (si erreur), explain (si juste)
// =====================================================================

export const DEFINITIONS = [
  {
    term: 'Dématérialisation',
    text: "Remplacement des supports et des échanges physiques (papier, CD, guichet, magasin) par des supports et des échanges numériques. Elle concerne les documents (factures, contrats, bulletins de paie), les produits (musique, films, livres numériques) et les points de contact avec le client (site, appli, borne). Avantages : gain de temps, baisse des coûts et du papier, accès 24 h/24.",
    example: 'Exemples : facture en PDF, billet de train sur smartphone, streaming musical, signature électronique.',
  },
  {
    term: 'Désintermédiation et réintermédiation',
    text: "La désintermédiation est la suppression d'un ou plusieurs intermédiaires (grossiste, distributeur, agence) entre le producteur et le consommateur, grâce au numérique qui permet la vente directe. La réintermédiation est l'apparition de nouveaux intermédiaires, souvent numériques (plateformes, comparateurs, marketplaces), qui se replacent entre l'offre et la demande en apportant visibilité, confiance et services.",
    example: 'Exemples : un producteur qui vend sur son propre site (désintermédiation) ; Booking.com entre les hôtels et les voyageurs (réintermédiation).',
  },
  {
    term: 'Pure players',
    text: "Entreprises qui exercent leur activité commerciale uniquement sur Internet, sans magasin physique. Elles réduisent leurs coûts fixes (loyers, personnel de vente) mais doivent investir dans leur site, le webmarketing et la logistique. On les oppose aux « brick and mortar » (magasins physiques uniquement) et aux « click and mortar » (magasins physiques + Internet).",
    example: 'Exemples : Veepee, Zalando, Cdiscount et Amazon à leurs débuts.',
  },
  {
    term: 'Uberisation',
    text: "Transformation d'un secteur d'activité traditionnel par l'arrivée de plateformes numériques qui mettent directement en relation, en temps réel, des clients et des prestataires souvent indépendants ou particuliers. Elle apporte des prix plus bas, une réservation simple par appli et la notation des prestataires, mais crée une forte concurrence pour les acteurs historiques et pose la question du statut des travailleurs.",
    example: 'Exemples : Uber face aux taxis, Airbnb face aux hôtels, Deliveroo pour la livraison de repas.',
  },
  {
    term: 'Économie collaborative',
    text: "Modèle économique fondé sur le partage, l'échange, la revente, la location ou la mutualisation de biens, de services ou de savoirs, principalement entre particuliers et souvent via des plateformes numériques. Elle privilégie l'usage plutôt que la possession et crée du lien social.",
    example: 'Exemples : BlaBlaCar (covoiturage), Vinted et Leboncoin (revente), prêt d\'outils entre voisins, financement participatif.',
  },
  {
    term: "Conséquences de l'accès à l'information",
    text: "Grâce à Internet (sites, comparateurs, avis clients, réseaux sociaux), le consommateur est mieux informé avant d'acheter. Conséquences : transparence des prix, comparaison facile, pouvoir de négociation accru, client plus exigeant et moins fidèle, nouveaux comportements d'achat (ROPO : se renseigner en ligne puis acheter en magasin ; showrooming : voir le produit en magasin puis l'acheter en ligne). Pour l'entreprise, cela oblige à surveiller son e-réputation et à s'aligner sur les prix ou à apporter une vraie valeur ajoutée (conseil, service, expertise du vendeur).",
    example: 'Exemple : un client compare une TV sur trois sites et lit les avis avant de négocier en magasin.',
  },
  {
    term: 'Marketplace',
    text: "Plateforme de vente en ligne qui met en relation des vendeurs tiers (professionnels ou particuliers) et des acheteurs. L'opérateur gère le site, le trafic, le paiement sécurisé et parfois la logistique. Il se rémunère principalement par une commission sur chaque vente et/ou un abonnement payé par les vendeurs. Les vendeurs gagnent en visibilité sans avoir à créer leur propre site.",
    example: 'Exemples : Amazon Marketplace, Cdiscount, Etsy, ManoMano, Leboncoin.',
  },
  {
    term: 'Externalité de réseau',
    text: "Phénomène par lequel la valeur, ou l'utilité, d'un produit ou d'un service augmente avec le nombre de ses utilisateurs. Plus il y a d'utilisateurs, plus le service en attire de nouveaux (effet boule de neige). L'externalité peut être directe (un réseau social vaut plus si tous vos amis y sont) ou croisée (plus de vendeurs sur une marketplace attirent plus d'acheteurs, et inversement).",
    example: 'Exemples : WhatsApp, Instagram, LinkedIn, une marketplace.',
  },
  {
    term: "Économies de propriété et d'usage",
    text: "Dans l'économie de propriété, le consommateur achète un bien pour le posséder ; il en assume l'entretien et la revente. Dans l'économie d'usage (ou de fonctionnalité), il paie pour utiliser un bien ou un service sans en devenir propriétaire : location, abonnement, partage. La valeur est dans l'usage et non dans la possession.",
    example: "Exemples : acheter une voiture (propriété) ; LLD, autopartage, Vélib', Spotify, Netflix (usage).",
  },
  {
    term: 'Free to play, freemium et yield management',
    text: "• Free to play : jeu ou service gratuit d'accès, financé par des achats intégrés (micro-transactions : skins, bonus) et/ou par la publicité.\n• Freemium : une version de base gratuite pour attirer un maximum d'utilisateurs, et une version premium payante avec des fonctionnalités avancées.\n• Yield management : tarification dynamique où le prix varie en temps réel selon la demande, la date de réservation et le taux de remplissage, afin de maximiser le chiffre d'affaires.",
    example: 'Exemples : Fortnite (free to play), Spotify ou Canva (freemium), SNCF, compagnies aériennes et hôtels (yield management).',
  },
];

export const INTRO = [
  ['Léa', "Salut ! Bienvenue à CEJM City ! Moi, c'est Léa, fondatrice de la start-up CEJM City Corp."],
  ['Léa', "Mon rêve : bâtir un empire du numérique. Et pour ça, j'ai besoin de toi !"],
  ['Léa', "Mission après mission, je vais t'apprendre les règles de la nouvelle économie. Je te guide par téléphone."],
  ['Léa', "Suis la flèche en haut de l'écran et rejoins le marqueur jaune. Tu peux prendre n'importe quelle voiture avec E, et sauter à pied (bouton SAUTER ou Espace) pour les parcours. Le carnet de définitions s'ouvre avec J. À toi de jouer !"],
];

export const FAIL_LINES = [['Léa', "Aïe, trop tard ! Le chrono est écoulé… Pas de panique, on recommence cette étape."]];

const N = (name) => ({ name });

export const MISSIONS = [
  // ---------------------------------------------------------------- 1
  {
    title: 'DÉMATÉRIALISATION', start: 'martin',
    steps: [
      { type: 'dialog', lines: [
        ['M. Martin', 'Regardez-moi ce bazar ! Factures, contrats, fiches clients… Je croule sous le papier !'],
        ['M. Martin', 'Et ce matin, le vent a éparpillé 3 dossiers dans la rue. Vous pouvez les ramasser ?'],
        ['Léa', "Ramasse les 3 dossiers, puis apporte-les au Data Center, à l'autre bout de la ville. Une voiture t'aidera !"],
      ] },
      { type: 'collect', objective: 'Ramasse les 3 dossiers papier', counter: (n, t) => `Dossiers : ${n}/${t}`, items: [
        { pos: [-120, -152], label: 'Dossier papier', msg: 'Factures récupérées' },
        { pos: [-160, -128], label: 'Dossier papier', msg: 'Contrats récupérés' },
        { pos: [-146, -120], label: 'Dossier papier', msg: 'Fiches clients récupérées' },
      ] },
      { type: 'dialog', lines: [
        ['Léa', 'Oups, le contrat Dupuis s\'est envolé en haut des échafaudages du parc ! Grimpe à pied en sautant (bouton SAUTER, ou Espace).'],
      ] },
      { type: 'collect', course: { block: [1, 4], rot: 0, level: 1 }, objective: 'Parcours : grimpe récupérer le contrat Dupuis', counter: () => 'DEATHRUN · ne tombe pas dans la lave !', items: [
        { pos: 'course', label: 'Contrat Dupuis', msg: 'Contrat Dupuis récupéré !' },
      ] },
      { type: 'goto', target: 'datacenter', objective: 'Apporte les dossiers au Data Center', hazards: [{ type: 'travaux', at: [120, 110], dir: 'z' }] },
      { type: 'dialog', lines: [
        ['Technicien', 'Chaque document est scanné en PDF et stocké dans le cloud : consultable 24 h/24, depuis n\'importe où.'],
        ['Technicien', 'Les contrats seront signés par signature électronique, et les factures envoyées en version numérique par e-mail.'],
        ['Léa', 'Plus de papier, plus de place perdue, des recherches en 2 secondes : c\'est la dématérialisation !'],
      ] },
      { type: 'quiz', question: 'Lequel de ces exemples est une dématérialisation ?',
        answers: ['Acheter un CD en magasin', "Recevoir sa facture d'électricité en PDF par e-mail", 'Imprimer un contrat en 3 exemplaires'], correct: 1,
        help: 'Non… Ici, le support reste physique. Cherche l\'exemple où le papier disparaît au profit du numérique.',
        explain: 'Exact ! La facture PDF remplace le papier : le support et l\'échange deviennent numériques.' },
    ],
  },
  // ---------------------------------------------------------------- 2
  {
    title: 'DÉSINTERMÉDIATION ET RÉINTERMÉDIATION', start: 'ferme',
    steps: [
      { type: 'dialog', lines: [
        ['M. Dubois', 'Je vends à un grossiste, qui revend à un supermarché, qui revend au client. Chacun prend sa marge… et moi, il me reste des miettes.'],
        ['Léa', 'Supprimons les intermédiaires ! Avec le numérique, vous pouvez vendre directement à vos clients.'],
        ['Léa', 'Mme Leroy vient de commander un panier sur le site de la ferme. Prends une voiture et livre-le-lui directement !'],
      ] },
      { type: 'goto', target: 'leroy', car: true, objective: 'Livre le panier chez Mme Leroy (en voiture)', hazards: [{ type: 'police', at: [46, 80], dir: 'x' }, { type: 'mamies', at: [74, 80], dir: 'x' }, { type: 'travaux', at: [-20, 120], dir: 'x' }] },
      { type: 'dialog', lines: [
        ['Mme Leroy', "Oh, merci ! Des légumes du jour, directement du producteur. C'est plus frais… et moins cher qu'au supermarché !"],
        ['Léa', "Ça, c'est la désintermédiation : le producteur vend directement au consommateur."],
        ['Léa', "…mais livrer chaque client soi-même, c'est épuisant. Va inscrire la ferme sur la plateforme HubLocal."],
      ] },
      { type: 'goto', target: 'hublocal', objective: 'Inscris la ferme sur la plateforme HubLocal' },
      { type: 'dialog', lines: [
        ['HubLocal', 'Bienvenue chez HubLocal ! Nous relions 200 producteurs et 10 000 clients, contre 15 % de commission.'],
        ['Léa', 'Un nouvel intermédiaire, numérique : c\'est la réintermédiation.'],
      ] },
      { type: 'quiz', question: 'Booking.com qui se place entre les hôtels et les voyageurs, c\'est…',
        answers: ['De la désintermédiation', 'De la réintermédiation', 'De la dématérialisation'], correct: 1,
        help: 'Pas tout à fait : Booking.com ne supprime pas d\'intermédiaire… il en devient un !',
        explain: 'Bravo ! Booking.com est un nouvel intermédiaire numérique : c\'est de la réintermédiation.' },
    ],
  },
  // ---------------------------------------------------------------- 3
  {
    title: 'PURE PLAYERS', start: 'clicshop',
    steps: [
      { type: 'dialog', lines: [
        ['Sam', "ClicShop n'a aucun magasin, tout se vend sur le site et l'appli : on est un pure player ! Ce soir, c'est le rush."],
        ['Sam', '3 colis urgents à livrer dans le quartier. Tu as 4 minutes, prends une voiture !'],
      ] },
      { type: 'collect', time: 240, objective: 'Livre les 3 colis ClicShop', hazards: [{ type: 'mamies', at: [80, -100], dir: 'z' }], counter: (n, t) => `Colis livrés : ${n}/${t}`, items: [
        { pos: [120, -190], label: 'Livraison : Mme Petit', msg: 'Colis livré à Mme Petit !' },
        { pos: [200, -50], label: 'Livraison : M. Nguyen', msg: 'Colis livré à M. Nguyen !' },
        { pos: [80, -80], label: 'Livraison : Léo', msg: 'Colis livré à Léo !' },
      ] },
      { type: 'dialog', lines: [
        ['Sam', 'Aïe… un drone de livraison a lâché un colis sur les plateformes du parc, près de l\'entrepôt !'],
      ] },
      { type: 'collect', course: { block: [8, 1], rot: 1, level: 1 }, objective: 'Parcours : récupère le colis du drone', counter: () => 'DEATHRUN · ne tombe pas dans la lave !', items: [
        { pos: 'course', label: 'Colis du drone', msg: 'Colis du drone récupéré !' },
      ] },
      { type: 'dialog', lines: [
        ['Sam', 'Pas de loyer de boutique… mais une logistique irréprochable et un site ouvert 24 h/24.'],
        ['Léa', 'Un pure player vend uniquement sur Internet : moins de coûts fixes, mais de gros investissements dans le site, le webmarketing et la logistique.'],
      ] },
      { type: 'quiz', question: 'Quelle entreprise est historiquement un pure player ?',
        answers: ['Leclerc', 'Veepee (ex-Vente-privée)', 'Boulanger'], correct: 1,
        help: 'Non : cette enseigne a d\'abord eu des magasins physiques.',
        explain: 'Oui ! Veepee est née sur Internet, sans aucun magasin : c\'est un pure player.' },
    ],
  },
  // ---------------------------------------------------------------- 4
  {
    title: 'UBERISATION', start: 'taxis',
    steps: [
      { type: 'dialog', lines: [
        ['Gérard', 'Grrr… Vous savez ce qui m\'arrive ? Plus personne ne prend mon taxi !'],
        ['Gérard', "Avec l'appli UBIK, des particuliers font chauffeur avec leur propre voiture. C'est moins cher, réservable en 2 clics…"],
        ['Léa', 'Teste l\'appli : deviens chauffeur UBIK ! Ta première cliente, Inès, t\'attend.'],
      ] },
      { type: 'goto', target: [-153.75, 100], car: true, npc: N('Inès'), objective: 'Course UBIK : récupère Inès (en voiture)' },
      { type: 'goto', target: 'hq', car: true, time: 85, hazards: [{ type: 'police', at: [-34, 0], dir: 'x' }, { type: 'mamies', at: [-6, 0], dir: 'x' }, { type: 'huile', at: [-80, 60], dir: 'z' }], objective: 'Dépose Inès au CEJM City HQ', done: 'Inès descend : ★★★★★' },
      { type: 'dialog', lines: [['UBIK', '🔔 Nouvelle course disponible ! Karim t\'attend. Destination : le Café Wifi.']] },
      { type: 'goto', target: [126.25, 160], car: true, npc: N('Karim'), objective: 'Course UBIK : récupère Karim (en voiture)' },
      { type: 'goto', target: 'cafe', car: true, time: 95, hazards: [{ type: 'travaux', at: [114, -80], dir: 'x' }, { type: 'huile', at: [92, -80], dir: 'x' }, { type: 'mamies', at: [120, 30], dir: 'z' }], objective: 'Dépose Karim au Café Wifi', done: 'Karim descend : ★★★★★' },
      { type: 'dialog', lines: [
        ['UBIK', 'Courses terminées ! Ta note de chauffeur : 4,8 ★. Prix calculé dans l\'appli, paiement sans contact.'],
        ['Léa', "Voilà l'uberisation : une plateforme met directement en relation, en temps réel, des clients et des particuliers ou indépendants."],
        ['Léa', 'Prix bas, réservation simple, notation… mais une rude concurrence pour les taxis, et des questions sur le statut des chauffeurs.'],
      ] },
      { type: 'quiz', question: 'Quel secteur a été « uberisé » par Airbnb ?',
        answers: ["L'hôtellerie", 'La banque', "L'automobile"], correct: 0,
        help: 'Réfléchis : que propose-t-on sur Airbnb ? Des logements pour la nuit…',
        explain: 'Exact ! Des particuliers louent leur logement et concurrencent les hôtels.' },
    ],
  },
  // ---------------------------------------------------------------- 5
  {
    title: 'ÉCONOMIE COLLABORATIVE', start: 'partag',
    steps: [
      { type: 'dialog', lines: [
        ['Nadia', 'Pourquoi chacun achèterait une perceuse qui ne sert que quelques minutes dans sa vie ? Ici, on partage !'],
        ['Nadia', 'Des voisins veulent prêter leurs objets. Tu peux aller les chercher ?'],
      ] },
      { type: 'collect', objective: 'Récupère les objets chez les voisins', counter: (n, t) => `Objets : ${n}/${t}`, items: [
        { pos: [40, -60], label: 'Perceuse', msg: 'Perceuse prêtée par Paul' },
        { pos: [80, -140], label: 'Vélo', msg: 'Vélo prêté par Amina' },
        { pos: [120, -90], label: 'Tondeuse', msg: 'Tondeuse prêtée par M. Garcia' },
      ] },
      { type: 'dialog', lines: [
        ['Nadia', 'Dernière chose : Malo veut prêter son cerf-volant… mais il est coincé tout en haut du parcours du parc !'],
      ] },
      { type: 'collect', course: { block: [6, 5], rot: 2, level: 2 }, objective: 'Parcours : décroche le cerf-volant de Malo', counter: () => 'DEATHRUN · ne tombe pas dans la lave !', items: [
        { pos: 'course', label: 'Cerf-volant', msg: 'Cerf-volant prêté par Malo' },
      ] },
      { type: 'goto', target: 'partag', objective: "Rapporte tout au local Partag'Voisins" },
      { type: 'dialog', lines: [
        ['Nadia', 'Prêt, troc, revente et location entre particuliers, covoiturage : comme sur BlaBlaCar, Vinted ou Leboncoin.'],
        ['Léa', "C'est l'économie collaborative : l'usage plutôt que la possession, et du lien social en prime."],
      ] },
      { type: 'quiz', question: "Lequel relève de l'économie collaborative ?",
        answers: ['Acheter une perceuse neuve', 'Un trajet en covoiturage via BlaBlaCar', 'Un abonnement à la salle de sport'], correct: 1,
        help: 'Non : ici, il n\'y a pas de partage entre particuliers.',
        explain: 'Oui ! Des particuliers partagent un trajet et ses frais : c\'est collaboratif.' },
    ],
  },
  // ---------------------------------------------------------------- 6
  {
    title: "CONSÉQUENCES DE L'ACCÈS À L'INFORMATION", start: 'techstore',
    steps: [
      { type: 'dialog', lines: [
        ['M. Dupont', 'Je veux cette TV 4K. Le vendeur me l\'annonce à 899 €…'],
        ['M. Dupont', 'Mais sur mon téléphone, je vois d\'autres prix et plein d\'avis. Tu m\'aides à comparer ?'],
        ['Léa', 'Va vérifier chez Méga Élec, chez Prix+ et sur le comparateur en ligne du Café Wifi, dans l\'ordre que tu veux.'],
      ] },
      { type: 'collect', objective: 'Compare les prix de la TV 4K', counter: (n, t) => `Prix comparés : ${n}/${t}`, items: [
        { pos: 'megaelec', label: 'Méga Élec', msg: 'Méga Élec : 799 €, avis 3,1/5, livraison lente' },
        { pos: 'prixplus', label: 'Prix+', msg: 'Prix+ : 749 €, avis 4,6/5' },
        { pos: 'cafe', label: 'Comparateur (Café Wifi)', msg: 'Comparateur : le prix le plus bas du marché est de 749 €, avec 1 200 avis clients' },
      ] },
      { type: 'dialog', lines: [
        ['Léa', 'Ça ne capte pas ici ! Grimpe en haut du parcours du parc pour lire les avis sur les réseaux sociaux.'],
      ] },
      { type: 'collect', course: { block: [4, 6], rot: 3, level: 2 }, objective: 'Parcours : grimpe capter le réseau', counter: () => 'DEATHRUN · ne tombe pas dans la lave !', items: [
        { pos: 'course', label: 'Réseau 4G', msg: 'Avis sur les réseaux sociaux : 92 % recommandent Prix+' },
      ] },
      { type: 'goto', target: 'techstore', objective: 'Retourne à TechStore avec M. Dupont' },
      { type: 'dialog', lines: [['M. Dupont', '899 € ici, 749 € chez Prix+ avec de meilleurs avis… Le vendeur va devoir faire un effort !']] },
      { type: 'quiz', question: 'Le vendeur de TechStore veut garder ce client. Que doit-il faire ?',
        answers: ['Refuser de baisser le prix et ignorer les avis', "S'aligner sur le prix ou apporter plus de valeur : conseil, installation, garantie", 'Interdire les téléphones dans le magasin'], correct: 1,
        help: 'Non : le client informé partira à la concurrence. Il faut lui apporter quelque chose de plus.',
        explain: 'Exactement : face à un client informé, il faut s\'aligner ou apporter une vraie valeur ajoutée.' },
      { type: 'dialog', lines: [
        ['Vendeur', "D'accord, je m'aligne à 749 €… et je vous installe la TV gratuitement !"],
        ['Léa', 'Le client est informé, il compare, il négocie : le pouvoir a changé de camp.'],
      ] },
    ],
  },
  // ---------------------------------------------------------------- 7
  {
    title: 'MARKETPLACE', start: 'laplace',
    steps: [
      { type: 'dialog', lines: [
        ['Léa', 'Je lance LA PLACE : un site où des vendeurs indépendants vendent leurs produits aux visiteurs de la plateforme.'],
        ['Léa', 'Mais une marketplace sans vendeurs, c\'est une place vide. Va recruter 3 vendeurs en ville !'],
      ] },
      { type: 'collect', npc: true, objective: 'Recrute 3 vendeurs pour LA PLACE', counter: (n, t) => `Vendeurs recrutés : ${n}/${t}`, items: [
        { pos: [-113.75, -60], label: "L'Artisan", msg: "L'Artisan rejoint LA PLACE !" },
        { pos: [6.25, -100], label: 'La Créatrice de bijoux', msg: 'La Créatrice de bijoux rejoint LA PLACE !' },
        { pos: [-86.25, -100], label: 'Le Brocanteur', msg: 'Le Brocanteur rejoint LA PLACE !' },
      ] },
      { type: 'dialog', lines: [
        ['Léa', 'Une photographe veut vendre ses tirages sur LA PLACE… elle fait des photos tout en haut du parcours du parc. Rejoins-la !'],
      ] },
      { type: 'collect', course: { block: [1, 4], rot: 2, level: 3 }, objective: 'Parcours : rejoins la Photographe', counter: () => 'DEATHRUN · ne tombe pas dans la lave !', items: [
        { pos: 'course', label: 'La Photographe', msg: 'La Photographe rejoint LA PLACE !' },
      ] },
      { type: 'goto', target: 'laplace', objective: 'Retourne à La Place', onDone: (ctx) => ctx.spawnStalls() },
      { type: 'dialog', lines: [
        ['Léa', 'Nous ne stockons rien : chaque vendeur gère ses produits, nous gérons le site, le paiement et la visibilité.'],
      ] },
      { type: 'quiz', question: 'Comment se rémunère principalement une marketplace ?',
        answers: ['Une commission sur chaque vente des vendeurs', 'En fabriquant les produits', 'Grâce aux subventions'], correct: 0,
        help: 'Non : la marketplace ne fabrique ni ne stocke rien… elle met en relation.',
        explain: 'Bravo ! La marketplace prélève une commission (et/ou un abonnement) sur les ventes.' },
    ],
  },
  // ---------------------------------------------------------------- 8
  {
    title: 'EXTERNALITÉ DE RÉSEAU', start: 'hq',
    steps: [
      { type: 'dialog', lines: [
        ['Léa', "J'ai lancé LIEN, mon réseau social. Petit problème : il n'a que 2 membres… toi et moi."],
        ['Léa', 'Et personne ne veut d\'un réseau vide ! Inscris 6 personnes autour du HQ en 3 minutes.'],
      ] },
      { type: 'collect', npc: true, network: true, time: 180, objective: 'Inscris 6 personnes sur LIEN',
        counter: (n) => { const m = n + 2; return `Membres : ${m} — Connexions possibles : ${(m * (m - 1)) / 2}`; },
        items: [
          { pos: [-6.25, -30], label: 'Hugo', msg: 'Hugo s\'inscrit sur LIEN !' },
          { pos: [-33.75, -12], label: 'Chloé', msg: 'Chloé s\'inscrit sur LIEN !' },
          { pos: [6.25, -48], label: 'Yanis', msg: 'Yanis s\'inscrit sur LIEN !' },
          { pos: [-46.25, 20], label: 'Manon', msg: 'Manon s\'inscrit sur LIEN !' },
          { pos: [-20, 33.75], label: 'Adam', msg: 'Adam s\'inscrit sur LIEN !' },
          { pos: [33.75, -20], label: 'Sarah', msg: 'Sarah s\'inscrit sur LIEN !' },
        ] },
      { type: 'dialog', lines: [
        ['Léa', "8 membres, c'est déjà 28 connexions possibles ! Avec 2 membres, il n'y en avait qu'une."],
        ['Léa', 'La valeur du réseau grimpe bien plus vite que le nombre de membres, et elle attire encore plus de monde : effet boule de neige !'],
      ] },
      { type: 'quiz', question: 'Pourquoi WhatsApp est-il plus utile si tous vos amis l\'utilisent ?',
        answers: ["Grâce à l'externalité de réseau", "Parce qu'il est payant", 'Grâce au yield management'], correct: 0,
        help: 'Non… Pense au nombre d\'utilisateurs et à la valeur du service.',
        explain: 'Oui ! Plus il y a d\'utilisateurs, plus le service a de valeur : externalité de réseau.' },
    ],
  },
  // ---------------------------------------------------------------- 9
  {
    title: "ÉCONOMIES DE PROPRIÉTÉ ET D'USAGE", start: 'concession',
    steps: [
      { type: 'dialog', lines: [
        ['Vendeur', 'Deux formules : 22 000 € comptant, et elle est à vous…'],
        ['Vendeur', '…ou en LLD (location longue durée) : 289 €/mois, entretien inclus, à rendre au bout de 3 ans.'],
      ] },
      { type: 'quiz', question: "Laquelle de ces offres relève de l'économie d'usage ?",
        answers: ["L'achat comptant", 'La LLD à 289 €/mois', 'Aucune des deux'], correct: 1,
        help: 'Non : quand on achète, on devient propriétaire. Cherche l\'offre où on paie pour utiliser.',
        explain: 'Exact ! Avec la LLD, on paie l\'usage de la voiture sans en devenir propriétaire.' },
      { type: 'dialog', lines: [['Léa', "Et si tu n'as besoin d'une voiture que pour 40 minutes ? Va à la station Loc'Auto."]] },
      { type: 'goto', target: 'locauto', objective: "Va à la station Loc'Auto", onDone: (ctx) => ctx.spawnRental() },
      { type: 'collect', rings: true, ordered: true, car: 'rental', time: 60, objective: "Rallye : passe les 4 anneaux avec la voiture Loc'Auto",
        counter: (n, t) => `Anneaux : ${n}/${t}`, items: [
          { pos: [-80, 100], label: 'Anneau 1', msg: 'Anneau 1 !' },
          { pos: [-40, 80], label: 'Anneau 2', msg: 'Anneau 2 !' },
          { pos: [0, 100], label: 'Anneau 3', msg: 'Anneau 3 !' },
          { pos: [20, 120], label: 'Anneau 4', msg: 'Rallye terminé !' },
        ] },
      { type: 'goto', target: 'locauto', car: 'rental', objective: "Rends la voiture à la station Loc'Auto" },
      { type: 'dialog', lines: [
        ["Loc'Auto", '12 € pour 40 minutes d\'usage, sans assurance ni entretien à gérer.'],
        ['Léa', "Tu as payé l'usage, pas la propriété : c'est l'économie d'usage."],
      ] },
    ],
  },
  // ---------------------------------------------------------------- 10
  {
    title: 'FREE TO PLAY, FREEMIUM ET YIELD MANAGEMENT', start: 'arcade',
    steps: [
      { type: 'dialog', lines: [
        ['Zoé', 'Salut ! Tu connais CityRun ? Le jeu est gratuit… mais j\'y ai déjà dépensé 40 € en skins et en boosts !'],
        ['Léa', 'Gratuit à télécharger, rentable grâce aux achats intégrés. Malin, non ?'],
      ] },
      { type: 'quiz', question: 'Un jeu gratuit financé par les achats intégrés, c\'est…',
        answers: ['Du free to play', 'Du yield management', 'Une marketplace'], correct: 0,
        help: 'Non… Le jeu est gratuit à jouer (« free to play ») !',
        explain: 'Oui ! Free to play : gratuit d\'accès, financé par les micro-transactions et/ou la pub.' },
      { type: 'goto', target: 'cafe', objective: 'Rejoins le Café Wifi' },
      { type: 'dialog', lines: [
        ['MusiCity', 'Avec MusiCity : écoute gratuite avec des pubs… ou Premium à 10,99 €/mois, sans pub et hors ligne !'],
      ] },
      { type: 'quiz', question: 'Ce modèle, gratuit + version payante avancée, s\'appelle…',
        answers: ['Le freemium', 'Le free to play', "L'uberisation"], correct: 0,
        help: 'Non : ici, il existe une version « premium » payante en plus de la version gratuite.',
        explain: 'Bravo ! Free + premium = freemium.' },
      { type: 'goto', target: 'zenith', objective: 'Va à la billetterie du Zénith', hazards: [{ type: 'police', at: [160, 74], dir: 'z' }] },
      { type: 'yield', threshold: 30, objective: 'Achète ton billet quand le prix passe sous 30 €' },
    ],
  },
];

// ---------------------------------------------------------------- MISSION BONUS
// Disponible après la mission 1 (marqueur violet). Pas de définition à la clé : juste pour le fun !
export const BONUS = {
  title: 'LE CASSE DU FOIN',
  startPos: [-80, 128],
  steps: [
    { type: 'dialog', onStart: (ctx) => ctx.resetTrailer(), lines: [
      ['Léa', "Mission spéciale ! Un vendeur de LA PLACE paie une fortune pour du foin bio… et la grange de M. Dubois en déborde."],
      ['Léa', "Le plan : une remorque, une voiture, et on « emprunte » quelques bottes pendant qu'il fait sa sieste. Discrètement !"],
      ['Léa', 'Monte dans une voiture et recule jusqu\'à la remorque, juste ici.'],
    ] },
    { type: 'goto', target: [-80, 134], car: true, objective: 'Viens chercher la remorque en voiture', onDone: (ctx) => ctx.attachTrailer() },
    { type: 'goto', target: 'ferme', car: 'trailer', objective: 'Fonce à la Ferme Dubois avec la remorque',
      hazards: [{ type: 'mamies', at: [-120, 160], dir: 'x' }, { type: 'huile', at: [-160, 140], dir: 'z' }] },
    { type: 'dialog', lines: [['Léa', 'Charge 4 bottes de foin sur la remorque… vite, avant qu\'il se réveille !']] },
    { type: 'collect', bales: true, time: 90, chaser: [-180, 192], objective: 'Charge les bottes de foin sur la remorque',
      counter: (n, t) => `Bottes chargées : ${n}/${t}`, items: [
        { pos: [-186, 170], label: 'Botte de foin', msg: 'Botte chargée !' },
        { pos: [-174, 169], label: 'Botte de foin', msg: 'Botte chargée !' },
        { pos: [-184, 176], label: 'Botte de foin', msg: 'Botte chargée !' },
        { pos: [-176, 177], label: 'Botte de foin', msg: 'Botte chargée !' },
      ] },
    { type: 'goto', target: 'laplace', car: 'trailer', time: 120, objective: 'Livre le foin à LA PLACE (avec la remorque !)',
      hazards: [{ type: 'police', at: [-100, 120], dir: 'z' }, { type: 'travaux', at: [-60, -100], dir: 'z' }, { type: 'mamies', at: [-60, -40], dir: 'z' }, { type: 'huile', at: [-140, 0], dir: 'z' }] },
    { type: 'dialog', lines: [
      ['Vendeur', 'Du foin bio, livré en remorque ? Parfait, je prends tout !'],
      ['Léa', 'Bon… on va quand même payer M. Dubois. Sans confiance, pas de commerce : c\'est la règle n°1 du business !'],
    ] },
  ],
};
