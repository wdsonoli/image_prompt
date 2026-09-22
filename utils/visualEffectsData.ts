export type EffectCategory = 
    | 'perspective'
    | 'angles'
    | 'movement'
    | 'levels'
    | 'reveals'
    | 'focus'
    | 'reflections'
    | 'time'
    | 'lighting'
    | 'analog'
    | 'weather'
    | 'styles'
    | 'scenarios'
    | 'quality'
    | 'portraits'
    | 'lenses';

export interface VisualEffect {
    id: string;
    tag: string; // Ex: "/forcedperspective"
    name: string;
    category: EffectCategory;
    categoryLabel: string;
    description: string;
    promptToken: string; // Texto descritivo para IA
    gradient: string; // Cor do card de prévia
    iconName: string;
}

export const VISUAL_EFFECT_CATEGORIES = [
    { id: 'all', label: 'Todos os Efeitos', icon: 'Sparkles' },
    { id: 'portraits', label: 'Ensaios Fotográficos', icon: 'User' },
    { id: 'lenses', label: 'Lentes / Câmeras', icon: 'Aperture' },
    { id: 'angles', label: 'Comandos de Enquadramento', icon: 'Camera' },
    { id: 'lighting', label: 'Iluminação & Luz', icon: 'Sun' },
    { id: 'perspective', label: 'Perspectiva & Hacks', icon: 'Box' },
    { id: 'movement', label: 'Movimento de Câmera', icon: 'Move' },
    { id: 'levels', label: 'Níveis de Câmera', icon: 'Layers' },
    { id: 'reveals', label: 'Revelações & Mistério', icon: 'Eye' },
    { id: 'focus', label: 'Foco & Óptica', icon: 'Maximize2' },
    { id: 'reflections', label: 'Reflexos & Clones', icon: 'Split' },
    { id: 'time', label: 'Ação & Congelamento', icon: 'Zap' },
    { id: 'analog', label: 'Filme & Analógico', icon: 'Film' },
    { id: 'weather', label: 'Clima & Atmosfera', icon: 'CloudRain' },
    { id: 'styles', label: 'Estilos Artísticos & 3D', icon: 'Palette' },
    { id: 'scenarios', label: 'Cenários & Temas', icon: 'Compass' },
    { id: 'quality', label: 'Resolução & 8K', icon: 'Flame' },
] as const;

export const VISUAL_EFFECTS: VisualEffect[] = [
    // =========================================================================
    // 1. PERSPECTIVA & HACKS (Imagem 1 & Truques Visuais)
    // =========================================================================
    {
        id: 'forcedperspective',
        tag: '/forcedperspective',
        name: 'Forced Perspective (Perspectiva Forçada)',
        category: 'perspective',
        categoryLabel: 'Perspectiva & Hacks',
        description: 'Ilusão óptica de escala onde um objeto pequeno em primeiro plano parece interagir com o fundo em tamanho real.',
        promptToken: 'forced perspective photography, clever optical scale illusion, foreground miniature object interacting with background subject, surreal depth perception, sharp focus',
        gradient: 'from-amber-600/40 to-orange-700/30',
        iconName: 'Box'
    },
    {
        id: 'leadinglines',
        tag: '/leadinglines',
        name: 'Leading Lines (Linhas Guia)',
        category: 'perspective',
        categoryLabel: 'Perspectiva & Hacks',
        description: 'Linhas arquitetônicas, pontes, corrimões ou trilhos que convergem em ponto de fuga, direcionando o olhar ao sujeito.',
        promptToken: 'leading lines composition, architectural vanishing point, perspective converging lines drawing focus directly to subject, symmetrical walkway depth',
        gradient: 'from-blue-600/40 to-indigo-700/30',
        iconName: 'Move'
    },
    {
        id: 'depthshot',
        tag: '/depthshot',
        name: 'Depth Shot (Profundidade em Camadas)',
        category: 'perspective',
        categoryLabel: 'Perspectiva & Hacks',
        description: 'Sujeito enquadrado atrás de vegetação ou elementos desfocados no primeiro plano, criando forte tridimensionalidade.',
        promptToken: 'multi-layered depth shot, shallow depth of field, foreground blurred foliage bokeh, layered visual dimension, cinematic atmosphere',
        gradient: 'from-emerald-600/40 to-teal-700/30',
        iconName: 'Layers'
    },
    {
        id: 'parallaxshot',
        tag: '/parallaxshot',
        name: 'Parallax Shot (Profundidade com Grades/Barras)',
        category: 'perspective',
        categoryLabel: 'Perspectiva & Hacks',
        description: 'Sujeito observado através de barras de corrimão, grades ou pilares com forte separação entre primeiro e segundo plano.',
        promptToken: 'cinematic parallax framing, shot through vertical railing bars, strong foreground-background parallax separation, spatial depth',
        gradient: 'from-slate-600/40 to-zinc-800/40',
        iconName: 'Layers'
    },
    {
        id: 'spiralperspective',
        tag: '/spiralperspective',
        name: 'Spiral Perspective (Perspectiva em Espiral)',
        category: 'perspective',
        categoryLabel: 'Perspectiva & Hacks',
        description: 'Tomada através do centro helicoidal de escadas em espiral, criando um vórtice geométrico perfeito em espiral de Fibonacci.',
        promptToken: 'spiral staircase perspective, golden spiral composition, shot looking down concentric architectural helix framing subject, geometric vortex',
        gradient: 'from-amber-700/40 to-yellow-600/30',
        iconName: 'Maximize2'
    },
    {
        id: 'perspectivehack',
        tag: '/perspectivehack',
        name: 'Perspective Hack (Mão Estendida com Escala)',
        category: 'perspective',
        categoryLabel: 'Perspectiva & Hacks',
        description: 'Mão estendida em primeiro plano extremo gerando distorção angular cinematográfica e sensação ultra-imersiva.',
        promptToken: 'perspective hack, outstretched hand reaching toward camera lens in extreme foreground, dramatic wide-angle scale distortion, immersive interaction',
        gradient: 'from-rose-600/40 to-red-700/30',
        iconName: 'Move'
    },
    {
        id: 'scrollstopper',
        tag: '/scrollstopper',
        name: 'Scroll Stopper (Elemento de Alto Impacto / Luz)',
        category: 'perspective',
        categoryLabel: 'Perspectiva & Hacks',
        description: 'Elemento luminoso de alto contraste segurado bem próximo à câmera (lâmpada acesa, esfera de luz) que prende a atenção.',
        promptToken: 'scroll-stopper high visual hook, glowing illuminated lightbulb held up in foreground, intense warm focal glow, magnetic visual contrast',
        gradient: 'from-yellow-500/40 to-amber-600/30',
        iconName: 'Zap'
    },
    {
        id: 'onepoint',
        tag: '/onepoint',
        name: 'One-Point Perspective (Perspectiva Central)',
        category: 'perspective',
        categoryLabel: 'Perspectiva & Hacks',
        description: 'Composição de ponto de fuga único centralizado com gesto ou linha apontando diretamente para o observador.',
        promptToken: 'one-point central perspective, foreshortened arm pointing directly forward at viewer, commanding focal point, strong convergence',
        gradient: 'from-indigo-600/40 to-blue-700/30',
        iconName: 'Camera'
    },
    {
        id: 'framewithinframe',
        tag: '/framewithinframe',
        name: 'Frame Within Frame (Moldura Interna)',
        category: 'perspective',
        categoryLabel: 'Perspectiva & Hacks',
        description: 'Mãos, portas ou elementos arquitetônicos formando um visor que emoldura com precisão o rosto do sujeito.',
        promptToken: 'frame within a frame composition, hands shaping a viewfinder framing the face, conceptual layered portraiture, sub-framing technique',
        gradient: 'from-cyan-600/40 to-blue-800/30',
        iconName: 'Box'
    },
    {
        id: 'foregroundframe',
        tag: '/foregroundframe',
        name: 'Foreground Frame (Moldura de Folhagem)',
        category: 'perspective',
        categoryLabel: 'Perspectiva & Hacks',
        description: 'Folhas ou plantas orgânicas desfocadas nas bordas emoldurando o sujeito no centro com profundidade natural.',
        promptToken: 'foreground framing, blurred organic green foliage framing the subject, peek-through nature composition, soft vignette depth',
        gradient: 'from-emerald-700/40 to-green-600/30',
        iconName: 'Eye'
    },
    {
        id: 'throughobject',
        tag: '/throughobject',
        name: 'Through Object (Através de Lente / Anel)',
        category: 'perspective',
        categoryLabel: 'Perspectiva & Hacks',
        description: 'Visão capturada através do barril de uma lente de câmera, anel óptico ou abertura circular.',
        promptToken: 'shot through camera lens barrel, circular optical framing, blurred lens ring foreground, unique creative perspective',
        gradient: 'from-violet-600/40 to-purple-800/30',
        iconName: 'Maximize2'
    },
    {
        id: 'circularframe',
        tag: '/circularframe',
        name: 'Circular Frame (Moldura Circular de Espelho)',
        category: 'perspective',
        categoryLabel: 'Perspectiva & Hacks',
        description: 'Rosto ou corpo enquadrado perfeitamente dentro de uma moldura circular de espelho, escotilha ou óculo.',
        promptToken: 'circular frame composition, round porthole mirror frame bordering portrait, architectural circle framing, balanced symmetry',
        gradient: 'from-amber-600/40 to-stone-700/40',
        iconName: 'Eye'
    },
    {
        id: 'tunnelvision',
        tag: '/tunnelvision',
        name: 'Tunnel Vision (Visão em Túnel / Luneta)',
        category: 'perspective',
        categoryLabel: 'Perspectiva & Hacks',
        description: 'Vinheta circular preta de luneta/telescópio com visão teleobjetiva nítida do sujeito no centro do horizonte.',
        promptToken: 'tunnel vision vignette, circular keyhole matte framing, dark outer periphery with bright telephoto center view, spy optic feel',
        gradient: 'from-stone-800/60 to-black/60',
        iconName: 'Maximize2'
    },
    {
        id: 'cornerpov',
        tag: '/cornerpov',
        name: 'Corner POV (Espiando da Esquina)',
        category: 'perspective',
        categoryLabel: 'Perspectiva & Hacks',
        description: 'Câmera espiando sutilmente de trás da quina de uma parede ou coluna com visão diagonal aberta.',
        promptToken: 'corner POV shot, peeking from behind vertical wall corner, architectural framing, cinematic observational feeling',
        gradient: 'from-slate-700/40 to-zinc-700/40',
        iconName: 'Eye'
    },
    {
        id: 'gapview',
        tag: '/gapview',
        name: 'Gap View (Visão por Fresta entre Pilares)',
        category: 'perspective',
        categoryLabel: 'Perspectiva & Hacks',
        description: 'Sujeito observado através de um vão estreito entre dois pilares de concreto maciço.',
        promptToken: 'gap view framing, subject framed through narrow slit between architectural pillars, deep contrast, focused voyeuristic perspective',
        gradient: 'from-zinc-800/40 to-stone-800/40',
        iconName: 'Layers'
    },
    {
        id: 'edgepov',
        tag: '/edgepov',
        name: 'Edge POV (Apoiado na Sacada com Panorama)',
        category: 'perspective',
        categoryLabel: 'Perspectiva & Hacks',
        description: 'Sujeito encostado no parapeito da sacada olhando pensativo para a paisagem montanhosa e urbana.',
        promptToken: 'edge POV composition, leaning on balcony parapet edge, picturesque panorama landscape in background, thoughtful gaze',
        gradient: 'from-sky-700/40 to-blue-800/30',
        iconName: 'Compass'
    },

    // =========================================================================
    // 2. COMANDOS DE ENQUADRAMENTO & ÂNGULOS (Imagem 1 & Ângulos de Câmera)
    // =========================================================================
    {
        id: 'topdown',
        tag: '/topdown',
        name: 'Top-Down (Zenital 90° Vista de Cima)',
        category: 'angles',
        categoryLabel: 'Comandos de Enquadramento',
        description: 'Câmera posicionada diretamente no alto apontada para baixo em 90°, vista zenital aérea completa do sujeito na poltrona.',
        promptToken: 'top-down zenith camera angle, 90-degree overhead shot looking directly down at subject seated in leather armchair, geometric composition, rich red and warm amber lighting',
        gradient: 'from-red-950 via-amber-900 to-stone-900',
        iconName: 'Camera'
    },
    {
        id: 'sideview',
        tag: '/sideview',
        name: 'Side-View (Visão Lateral / Perfil 90°)',
        category: 'angles',
        categoryLabel: 'Comandos de Enquadramento',
        description: 'Câmera em ângulo lateral de 90° capturando a postura meditativa, perfil esculpido e iluminação quente de recorte.',
        promptToken: 'side-view profile angle, 90-degree lateral camera view of subject seated in armchair with hand on chin, dramatic moody red and amber key light',
        gradient: 'from-amber-950 via-rose-950 to-neutral-900',
        iconName: 'Camera'
    },
    {
        id: 'frontview',
        tag: '/frontview',
        name: 'Front View (Visão Frontal Direta)',
        category: 'angles',
        categoryLabel: 'Ângulos & Posições',
        description: 'Ângulo frontal a 0°, alinhamento direto dos olhos com a lente, postura firme e simétrica.',
        promptToken: 'straight front view portrait, eye-level direct camera contact, symmetrical facial framing, clean studio composure',
        gradient: 'from-blue-600/40 to-indigo-600/30',
        iconName: 'Camera'
    },
    {
        id: '45left',
        tag: '/45left',
        name: '45° Esquerda (Três Quartos)',
        category: 'angles',
        categoryLabel: 'Ângulos & Posições',
        description: 'Rosto e olhar voltados em 45 graus para a esquerda, destacando a linha de mandíbula e luz lateral.',
        promptToken: 'three-quarter 45-degree angle turned to the left, defined jawline contour, flattering portrait angle, dynamic head turn',
        gradient: 'from-indigo-600/40 to-violet-600/30',
        iconName: 'Camera'
    },
    {
        id: '45right',
        tag: '/45right',
        name: '45° Direita (Três Quartos)',
        category: 'angles',
        categoryLabel: 'Ângulos & Posições',
        description: 'Rosto e olhar voltados em 45 graus para a direita, iluminação escultural suave.',
        promptToken: 'three-quarter 45-degree angle turned to the right, classic portrait lighting, sculptural facial shadows, stylish poise',
        gradient: 'from-violet-600/40 to-fuchsia-600/30',
        iconName: 'Camera'
    },
    {
        id: 'highangle',
        tag: '/highangle',
        name: 'High Angle (Plongée / De Cima)',
        category: 'angles',
        categoryLabel: 'Ângulos & Posições',
        description: 'Câmera elevada olhando para baixo em direção ao sujeito, ângulo estético e moderno.',
        promptToken: 'high angle shot looking downward at subject, elevated vantage point, foreshortening perspective, expressive upward gaze',
        gradient: 'from-cyan-600/40 to-sky-600/30',
        iconName: 'Camera'
    },
    {
        id: 'lowangle',
        tag: '/lowangle',
        name: 'Low Angle (Contra-Plongée / De Baixo)',
        category: 'angles',
        categoryLabel: 'Ângulos & Posições',
        description: 'Câmera no plano baixo apontando para cima, transmitindo imponência, liderança e escala heroica.',
        promptToken: 'low angle shot looking upward, powerful commanding presence, heroic perspective, towering silhouette against background',
        gradient: 'from-amber-600/40 to-red-600/30',
        iconName: 'Camera'
    },
    {
        id: 'profileleft',
        tag: '/profileleft',
        name: 'Perfil Esquerdo (90° Perfeito)',
        category: 'angles',
        categoryLabel: 'Ângulos & Posições',
        description: 'Visão lateral estrita de 90 graus virada para a esquerda com contorno facial escultural.',
        promptToken: 'strict 90-degree left profile shot, silhouette of facial contours, side profile portrait, sharp rim light on profile line',
        gradient: 'from-slate-700/40 to-blue-800/40',
        iconName: 'Camera'
    },
    {
        id: 'profileright',
        tag: '/profileright',
        name: 'Perfil Direito (90° Perfeito)',
        category: 'angles',
        categoryLabel: 'Ângulos & Posições',
        description: 'Visão lateral estrita de 90 graus virada para a direita com luz de borda definida.',
        promptToken: 'strict 90-degree right profile shot, side profile perspective, clean sculptural facial profile, cinematic side view',
        gradient: 'from-zinc-700/40 to-indigo-800/40',
        iconName: 'Camera'
    },
    {
        id: 'closeup',
        tag: '/closeup',
        name: 'Close-Up (Plano Fechado no Rosto)',
        category: 'angles',
        categoryLabel: 'Ângulos & Posições',
        description: 'Enquadramento fechado capturando microexpressões faciais, olhos, barba e textura autêntica da pele.',
        promptToken: 'intimate tight close-up portrait, focusing on facial expression, high micro-detail in eyes and skin, 85mm lens compression',
        gradient: 'from-rose-600/40 to-pink-600/30',
        iconName: 'Camera'
    },
    {
        id: 'halfbody',
        tag: '/halfbody',
        name: 'Half Body (Meio Corpo / Plano Médio)',
        category: 'angles',
        categoryLabel: 'Ângulos & Posições',
        description: 'Plano médio clássico da cintura para cima, evidenciando vestimenta, postura das mãos e atitude.',
        promptToken: 'half-body medium shot, framed from waist up, natural pose with hands, balanced subject and environment composition',
        gradient: 'from-blue-700/40 to-teal-700/30',
        iconName: 'Camera'
    },
    {
        id: 'overheadpov',
        tag: '/overheadpov',
        name: 'Overhead POV (Plano Zenital Aéreo do Sujeito)',
        category: 'angles',
        categoryLabel: 'Ângulos & Posições',
        description: 'Visão do alto apontando verticalmente para baixo com o sujeito olhando diretamente para a lente.',
        promptToken: 'overhead POV perspective, camera looking down from above, subject looking directly up into lens, steep foreshortened perspective',
        gradient: 'from-indigo-700/40 to-purple-800/30',
        iconName: 'Eye'
    },
    {
        id: 'cornerangle',
        tag: '/cornerangle',
        name: 'Corner Angle (Encostado no Canto da Parede)',
        category: 'angles',
        categoryLabel: 'Ângulos & Posições',
        description: 'Sujeito encostado no vértice de duas paredes criando linhas diagonais e contraste de luz e sombra.',
        promptToken: 'corner wall angle composition, subject leaning against architectural junction, geometric depth, directional shadow cast',
        gradient: 'from-zinc-700/40 to-slate-800/40',
        iconName: 'Box'
    },
    {
        id: 'dutchangle',
        tag: '/dutchangle',
        name: 'Dutch Angle (Ângulo Holandês Inclinado)',
        category: 'angles',
        categoryLabel: 'Ângulos & Posições',
        description: 'Câmera inclinada diagonalmente fora do nível do horizonte, conferindo estilo arrojado e tensão.',
        promptToken: 'Dutch angle shot, canted angle, tilted horizon line, dynamic diagonal composition, psychological cinematic tension',
        gradient: 'from-purple-700/40 to-rose-700/30',
        iconName: 'Sliders'
    },
    {
        id: 'cinematicpov',
        tag: '/cinematicpov',
        name: 'Cinematic POV (Ponto de Vista Noir)',
        category: 'angles',
        categoryLabel: 'Ângulos & Posições',
        description: 'Ângulo de observador de cinema espiando por corrimão de escada com luz dramática recortada.',
        promptToken: 'cinematic POV perspective, moody film lighting, looking over dark architectural staircase railing, atmospheric noir mood',
        gradient: 'from-slate-800/50 to-amber-900/30',
        iconName: 'Camera'
    },

    // =========================================================================
    // ENSAIOS FOTOGRÁFICOS & RETRATOS DE ALTA MODA (Envie seu Rosto)
    // =========================================================================
    {
        id: 'editorialportrait',
        tag: '/editorialportrait',
        name: 'Editorial Portrait (Retrato Editorial de Alta Moda)',
        category: 'portraits',
        categoryLabel: 'Ensaios Fotográficos',
        description: 'Ensaio fotográfico editorial refinado com fundo escuro, blazer preto e iluminação de estúdio de alta moda para capa de revista.',
        promptToken: 'high-end editorial portrait photoshoot, sophisticated tailored black blazer over black mock turtleneck, clean dark minimalist studio backdrop, diffused key light, high fashion aesthetic, natural facial texture',
        gradient: 'from-neutral-900 via-stone-900 to-black',
        iconName: 'User'
    },
    {
        id: 'fashioneditorial',
        tag: '/fashioneditorial',
        name: 'Fashion Editorial (Editorial de Moda Contemporâneo)',
        category: 'portraits',
        categoryLabel: 'Ensaios Fotográficos',
        description: 'Fotografia de alta costura com corte moderno, postura marcante e atmosfera refinada de passarela.',
        promptToken: 'contemporary fashion editorial photography, sleek tailored black jacket, sharp posture, high-fashion magazine styling, polished contrast and rich depth',
        gradient: 'from-stone-900 via-zinc-900 to-neutral-950',
        iconName: 'User'
    },
    {
        id: 'candidportrait',
        tag: '/candidportrait',
        name: 'Candid Portrait (Retrato Cândido & Espontâneo)',
        category: 'portraits',
        categoryLabel: 'Ensaios Fotográficos',
        description: 'Retrato espontâneo com pose orgânica (mão no queixo), olhar reflexivo e natural sem rigidez artificial.',
        promptToken: 'candid portrait, natural spontaneous pose with hand resting gently on chin, authentic thoughtful facial expression, soft directional studio lighting, intimate atmosphere',
        gradient: 'from-zinc-900 via-neutral-900 to-stone-900',
        iconName: 'User'
    },
    {
        id: 'lookbook',
        tag: '/lookbook',
        name: 'Lookbook (Estilo Catálogo / Revista de Moda)',
        category: 'portraits',
        categoryLabel: 'Ensaios Fotográficos',
        description: 'Layout de catálogo de moda "LOOK BOOK TIMELESS STYLE MODERN MINDSET", tipografia editorial e composição de luxo.',
        promptToken: 'luxury fashion lookbook magazine layout, modern catalogue styling with subtle "LOOK BOOK" graphic typography, sleek black suit, confident pose, polished high-fashion finish',
        gradient: 'from-neutral-950 via-zinc-900 to-black',
        iconName: 'User'
    },

    // =========================================================================
    // 3. MOVIMENTO DE CÂMERA (Imagens 4 & 12)
    // =========================================================================
    {
        id: 'cameraarc',
        tag: '/cameraarc',
        name: 'Camera Arc (Giro em Arco 180°)',
        category: 'movement',
        categoryLabel: 'Movimento de Câmera',
        description: 'Movimento de câmera girando em arco semicircular ao redor do sujeito com rastros suaves de rotação.',
        promptToken: 'camera arc movement, dynamic curved orbital sweep around subject, circular tracking trajectory, cinematic motion sense',
        gradient: 'from-cyan-600/40 to-blue-700/30',
        iconName: 'Move'
    },
    {
        id: 'cameradive',
        tag: '/cameradive',
        name: 'Camera Dive (Mergulho Vertical Rápido)',
        category: 'movement',
        categoryLabel: 'Movimento de Câmera',
        description: 'Câmera mergulhando em alta velocidade de cima para baixo na vertical em direção ao sujeito.',
        promptToken: 'camera dive shot, rapid downward swooping plunge angle, vertiginous drop perspective, high-energy dynamic descent',
        gradient: 'from-blue-600/40 to-indigo-800/30',
        iconName: 'Move'
    },
    {
        id: 'camerasweep',
        tag: '/camerasweep',
        name: 'Camera Sweep (Varredura Lateral Contínua)',
        category: 'movement',
        categoryLabel: 'Movimento de Câmera',
        description: 'Deslocamento horizontal contínuo em tracking shot com desfoque de movimento direcional ao fundo.',
        promptToken: 'horizontal camera sweep, smooth lateral panning tracking shot, directional motion blur streaks, cinematic traversal',
        gradient: 'from-indigo-600/40 to-purple-700/30',
        iconName: 'Move'
    },
    {
        id: 'cameracranes',
        tag: '/cameracranes',
        name: 'Camera Cranes (Grua Cinematográfica Aérea)',
        category: 'movement',
        categoryLabel: 'Movimento de Câmera',
        description: 'Tomada elevada de guindaste de cinema (jib/crane) revelando o sujeito e a vista panorâmica monumental abaixo.',
        promptToken: 'cinematic crane shot, elevated jib camera perspective, sweeping high-altitude view showing environment and subject scale',
        gradient: 'from-sky-600/40 to-cyan-700/30',
        iconName: 'Move'
    },
    {
        id: 'cameradrift',
        tag: '/cameradrift',
        name: 'Camera Drift (Deriva Suave em Curva)',
        category: 'movement',
        categoryLabel: 'Movimento de Câmera',
        description: 'Câmera flutuando suavemente em curva lateral com rastro de desfoque sutil no fundo.',
        promptToken: 'camera drift motion, gentle curved gliding motion, cinematic smooth parallax drift, flowing kinetic aesthetic',
        gradient: 'from-teal-600/40 to-emerald-700/30',
        iconName: 'Move'
    },
    {
        id: 'cameraorbitup',
        tag: '/cameraorbitup',
        name: 'Camera Orbit Up (Órbita Ascendente)',
        category: 'movement',
        categoryLabel: 'Movimento de Câmera',
        description: 'Movimento orbital giratório subindo do chão ao céu em espiral ao redor do sujeito.',
        promptToken: 'ascending camera orbit, spiral upward orbital trajectory, rising motion from low to high angle, heroic skyward sweep',
        gradient: 'from-blue-500/40 to-indigo-600/30',
        iconName: 'Move'
    },
    {
        id: 'cameraorbitdown',
        tag: '/cameraorbitdown',
        name: 'Camera Orbit Down (Órbita Descendente)',
        category: 'movement',
        categoryLabel: 'Movimento de Câmera',
        description: 'Movimento orbital giratório descendo do topo em direção ao nível dos olhos.',
        promptToken: 'descending camera orbit, spiral downward circular sweep, winding down from overhead to eye level, immersive rotational movement',
        gradient: 'from-indigo-500/40 to-violet-700/30',
        iconName: 'Move'
    },
    {
        id: 'cameraflythrough',
        tag: '/cameraflythrough',
        name: 'Camera Fly-Through (Voo pelo Corredor)',
        category: 'movement',
        categoryLabel: 'Movimento de Câmera',
        description: 'Câmera voando rapidamente em linha reta através de um corredor com desfoque de velocidade nas paredes.',
        promptToken: 'camera fly-through shot, fast forward tracking through architectural corridor, radial speed blur edges, tunnel rush velocity',
        gradient: 'from-violet-600/40 to-fuchsia-700/30',
        iconName: 'Move'
    },
    {
        id: 'camerapushpast',
        tag: '/camerapushpast',
        name: 'Camera Push Past (Avanço Ultrapassando Obstrução)',
        category: 'movement',
        categoryLabel: 'Movimento de Câmera',
        description: 'Câmera avançando rente ao ombro ou coluna no primeiro plano até focar no sujeito ao fundo.',
        promptToken: 'camera push-past shot, dolly pushing forward past foreground shoulder obstruction, revealing focused subject, cinematic transition',
        gradient: 'from-stone-600/40 to-slate-700/40',
        iconName: 'Move'
    },
    {
        id: 'whipmotion',
        tag: '/whipmotion',
        name: 'Whip Motion (Giro Rápido com Selfie Dinâmica)',
        category: 'movement',
        categoryLabel: 'Movimento de Câmera',
        description: 'Selfie dinâmica com rotação brusca de câmera criando desfoque radial veloz nos cantos e rosto focado.',
        promptToken: 'whip motion rotational camera movement, dizzying rotational motion blur streaks framing tack-sharp intense face, dynamic selfie action',
        gradient: 'from-amber-600/40 to-rose-700/30',
        iconName: 'Zap'
    },
    {
        id: 'whippan',
        tag: '/whippan',
        name: 'Whip Pan (Chicote de Câmera Horizontal)',
        category: 'movement',
        categoryLabel: 'Movimento de Câmera',
        description: 'Transição clássica em chicote horizontal com desfoque de arraste em árvores e edifícios.',
        promptToken: 'cinematic whip pan transition, rapid horizontal swish pan blur, motion smearing across background landscape, energetic transition',
        gradient: 'from-rose-600/40 to-orange-600/30',
        iconName: 'Move'
    },
    {
        id: 'trackingrush',
        tag: '/trackingrush',
        name: 'Tracking Rush (Avanço Acelerado em Corrida)',
        category: 'movement',
        categoryLabel: 'Movimento de Câmera',
        description: 'Câmera recuando em alta velocidade rente ao asfalto enquanto o sujeito corre em sua direção.',
        promptToken: 'tracking rush shot, high-speed backward tracking camera facing runner sprinting forward, low road perspective, adrenaline velocity',
        gradient: 'from-red-600/40 to-amber-700/30',
        iconName: 'Move'
    },
    {
        id: 'handheldrush',
        tag: '/handheldrush',
        name: 'Handheld Rush (Câmera na Mão em Fuga Imersiva)',
        category: 'movement',
        categoryLabel: 'Movimento de Câmera',
        description: 'Shaky-cam na mão em ritmo frenético, transmitindo perseguição em primeira pessoa e adrenalina crua.',
        promptToken: 'handheld camera rush, visceral shaky-cam perspective, immersive first-person pursuit feeling, raw authentic motion energy',
        gradient: 'from-orange-600/40 to-stone-700/40',
        iconName: 'Camera'
    },
    {
        id: 'parallaxrush',
        tag: '/parallaxrush',
        name: 'Parallax Rush (Deslocamento com Paralaxe Rápida)',
        category: 'movement',
        categoryLabel: 'Movimento de Câmera',
        description: 'Vegetação em primeiro plano passando em alta velocidade em relação à paisagem e ao sujeito.',
        promptToken: 'parallax rush camera move, foreground trees whipping past lens in high-speed parallax, panoramic background reveal',
        gradient: 'from-emerald-600/40 to-teal-700/30',
        iconName: 'Move'
    },
    {
        id: 'subjectrush',
        tag: '/subjectrush',
        name: 'Subject Rush (Avanço Rápido ao Sujeito com Mão na Lente)',
        category: 'movement',
        categoryLabel: 'Movimento de Câmera',
        description: 'Aproximação relâmpago com mão estendida quase tocando a lente com estrias de zoom convergentes.',
        promptToken: 'subject rush zoom in, rapid forward charge toward camera, outstretched hand reaching lens, intense kinetic convergence',
        gradient: 'from-fuchsia-600/40 to-pink-700/30',
        iconName: 'Zap'
    },

    // =========================================================================
    // 4. NÍVEIS DE CÂMERA (Imagem 5)
    // =========================================================================
    {
        id: 'overheaddrift',
        tag: '/overheaddrift',
        name: 'Overhead Drift (Deriva Zenital Superior)',
        category: 'levels',
        categoryLabel: 'Níveis de Câmera',
        description: 'Câmera suspensa no ar deslizando sobre o sujeito em plano zenital aberto olhando reto para baixo.',
        promptToken: 'overhead drift shot, straight-down aerial vantage sliding smoothly above subject, high vantage point, graphic ground pattern',
        gradient: 'from-blue-600/40 to-sky-700/30',
        iconName: 'Layers'
    },
    {
        id: 'groundlevel',
        tag: '/groundlevel',
        name: 'Ground Level (Nível do Solo / Rasteiro)',
        category: 'levels',
        categoryLabel: 'Níveis de Câmera',
        description: 'Lente encostada no chão apontando para cima, tênis em primeiro plano e figura imponente contra o céu.',
        promptToken: 'ground level camera angle, camera resting on ground, worms-eye view looking up, subject standing tall against open sky',
        gradient: 'from-amber-600/40 to-orange-700/30',
        iconName: 'Layers'
    },
    {
        id: 'shoulderview',
        tag: '/shoulderview',
        name: 'Shoulder View (Nível dos Ombros)',
        category: 'levels',
        categoryLabel: 'Níveis de Câmera',
        description: 'Enquadramento alinhado na altura dos ombros com horizonte natural e profundidade suave de campo.',
        promptToken: 'shoulder-level camera height, natural portrait perspective, cinematic eyeline, balanced landscape horizon background',
        gradient: 'from-stone-600/40 to-slate-700/30',
        iconName: 'Layers'
    },
    {
        id: 'chestlevel',
        tag: '/chestlevel',
        name: 'Chest Level (Nível do Peito)',
        category: 'levels',
        categoryLabel: 'Níveis de Câmera',
        description: 'Câmera estabilizada na altura do tórax do sujeito, enquadramento balanceado e natural.',
        promptToken: 'chest-level camera height, stable medium close framing, grounded perspective, direct engaging eye contact',
        gradient: 'from-indigo-600/40 to-blue-700/30',
        iconName: 'Layers'
    },
    {
        id: 'kneelevel',
        tag: '/kneelevel',
        name: 'Knee Level (Nível dos Joelhos)',
        category: 'levels',
        categoryLabel: 'Níveis de Câmera',
        description: 'Câmera rebaixada na altura dos joelhos capturando o sujeito agachado ou em postura dinâmica.',
        promptToken: 'knee-level camera height, low slung angle, crouching subject pose, dynamic perspective with strong ground presence',
        gradient: 'from-teal-600/40 to-cyan-700/30',
        iconName: 'Layers'
    },
    {
        id: 'ceilingview',
        tag: '/ceilingview',
        name: 'Ceiling View (Visão do Teto / Topo Extremo)',
        category: 'levels',
        categoryLabel: 'Níveis de Câmera',
        description: 'Perspectiva olhando verticalmente para baixo a partir do topo do teto ou sacada superior.',
        promptToken: 'ceiling-view camera perspective, extreme high angle directly overhead, looking straight down onto subject standing on patio',
        gradient: 'from-cyan-700/40 to-indigo-800/40',
        iconName: 'Layers'
    },

    // =========================================================================
    // 5. REVELAÇÕES & MISTÉRIO (Imagem 6)
    // =========================================================================
    {
        id: 'foregroundreveal',
        tag: '/foregroundreveal',
        name: 'Foreground Reveal (Revelação por Folhagem)',
        category: 'reveals',
        categoryLabel: 'Revelações & Mistério',
        description: 'Sujeito surgindo e sendo revelado entre folhas e vegetação densa no primeiro plano.',
        promptToken: 'foreground reveal composition, subject emerging from behind dense blurred green leaves, mysterious discovery shot',
        gradient: 'from-emerald-700/40 to-green-600/30',
        iconName: 'Eye'
    },
    {
        id: 'shadowreveal',
        tag: '/shadowreveal',
        name: 'Shadow Reveal (Revelação em Meia-Sombra)',
        category: 'reveals',
        categoryLabel: 'Revelações & Mistério',
        description: 'Metade do corpo emergindo de uma sombra arquitetônica dura contra uma parede de concreto ao sol.',
        promptToken: 'shadow reveal, hard architectural shadow dividing the frame, subject stepping out of deep shadow into golden sunlight',
        gradient: 'from-amber-700/40 to-stone-800/40',
        iconName: 'Eye'
    },
    {
        id: 'lightreveal',
        tag: '/lightreveal',
        name: 'Light Reveal (Fenda de Luz em Fundo Escuro)',
        category: 'reveals',
        categoryLabel: 'Revelações & Mistério',
        description: 'Faixa estreita e dramática de luz recortando verticalmente o centro do sujeito em ambiente escuro.',
        promptToken: 'light reveal, narrow beam of bright directional light slicing through total darkness, dramatic chiaroscuro illumination',
        gradient: 'from-yellow-600/40 to-zinc-900/60',
        iconName: 'Eye'
    },
    {
        id: 'blurreveal',
        tag: '/blurreveal',
        name: 'Blur Reveal (Revelação através de Desfoque)',
        category: 'reveals',
        categoryLabel: 'Revelações & Mistério',
        description: 'Elemento em desfoque cremoso cobrindo a lente e abrindo visão nítida para o sujeito ao fundo.',
        promptToken: 'blur reveal shot, heavy foreground optical blur dissolving to reveal sharp centered subject, cinematic focus isolation',
        gradient: 'from-purple-600/40 to-pink-700/30',
        iconName: 'Eye'
    },
    {
        id: 'curtainreveal',
        tag: '/curtainreveal',
        name: 'Curtain Reveal (Abertura de Cortinas Escuras)',
        category: 'reveals',
        categoryLabel: 'Revelações & Mistério',
        description: 'Mãos afastando cortinas pretas pesadas para revelar o olhar penetrante do sujeito no centro.',
        promptToken: 'curtain reveal shot, subject parting heavy dark fabric curtains with hands, theatrical dramatic unveiling, intense gaze',
        gradient: 'from-zinc-900/60 to-stone-800/40',
        iconName: 'Eye'
    },
    {
        id: 'obstructionreveal',
        tag: '/obstructionreveal',
        name: 'Obstruction Reveal (Revelação por Pilar de Concreto)',
        category: 'reveals',
        categoryLabel: 'Revelações & Mistério',
        description: 'Metade do rosto escondida atrás de uma coluna de concreto texturizada, revelando um olho e meio rosto.',
        promptToken: 'obstruction reveal, half face hidden behind rough textured concrete column, split framing, suspenseful cinematic intrigue',
        gradient: 'from-stone-700/40 to-slate-800/40',
        iconName: 'Eye'
    },
    {
        id: 'peekshot',
        tag: '/peekshot',
        name: 'Peek Shot (Espreita por Moldura de Porta)',
        category: 'reveals',
        categoryLabel: 'Revelações & Mistério',
        description: 'Espiando de lado por trás de uma porta de madeira ou batente, olhar curioso e sutil.',
        promptToken: 'peek shot, subject peeking subtly around wooden door frame, candid moment capture, intimate observational angle',
        gradient: 'from-amber-800/40 to-stone-700/30',
        iconName: 'Eye'
    },
    {
        id: 'peekthrough',
        tag: '/peekthrough',
        name: 'Peek Through (Visão por Fresta de Ripas)',
        category: 'reveals',
        categoryLabel: 'Revelações & Mistério',
        description: 'Sujeito visível através de ripas verticais de madeira de uma cerca ou brise-soleil.',
        promptToken: 'peek through wooden slats, vertical louvers framing face, slatted shadow patterns, cinematic voyeuristic mood',
        gradient: 'from-amber-900/40 to-yellow-800/30',
        iconName: 'Eye'
    },
    {
        id: 'hiddenframe',
        tag: '/hiddenframe',
        name: 'Hidden Frame (Moldura de Janela de Pedra Rústica)',
        category: 'reveals',
        categoryLabel: 'Revelações & Mistério',
        description: 'Sujeito visto ao longe perfeitamente emoldurado por uma abertura de janela de pedra antiga.',
        promptToken: 'hidden frame shot, framed through rustic stone window opening, weathered stone texture bordering bright scenic view',
        gradient: 'from-stone-800/50 to-zinc-700/40',
        iconName: 'Eye'
    },

    // =========================================================================
    // 6. FOCO, LENTES & ÓPTICA (Imagens 7 & 8)
    // =========================================================================
    {
        id: 'rackfocus',
        tag: '/rackfocus',
        name: 'Rack Focus (Transição de Foco Mão/Rosto)',
        category: 'focus',
        categoryLabel: 'Foco & Óptica',
        description: 'Efeito cinematográfico com mão desfocada estendida e foco cravado nos olhos com bokeh cremoso.',
        promptToken: 'rack focus effect, blurred reaching hand in foreground, razor-sharp focus on facial features, shallow depth of field',
        gradient: 'from-blue-600/40 to-teal-700/30',
        iconName: 'Maximize2'
    },
    {
        id: 'deepfocus',
        tag: '/deepfocus',
        name: 'Deep Focus (Foco Total em Profundidade f/16)',
        category: 'focus',
        categoryLabel: 'Foco & Óptica',
        description: 'Sujeito, vegetação próxima e a cidade distante nas montanhas todos em nitidez cristalina absoluta.',
        promptToken: 'deep focus photography, f/16 aperture, edge-to-edge sharpness from foreground terrace to distant city panorama, hyper-detailed',
        gradient: 'from-sky-600/40 to-emerald-700/30',
        iconName: 'Maximize2'
    },
    {
        id: 'shallowfocus',
        tag: '/shallowfocus',
        name: 'Shallow Focus (Foco Raso com Bokeh Noturno f/1.2)',
        category: 'focus',
        categoryLabel: 'Foco & Óptica',
        description: 'Abertura ultra-ampla (f/1.2) isolando o rosto com desfoque cremoso e bolhas de luzes da cidade.',
        promptToken: 'shallow focus portrait, f/1.2 wide aperture, creamy background separation, golden city night light circles, soft blur falloff',
        gradient: 'from-amber-600/40 to-purple-700/30',
        iconName: 'Maximize2'
    },
    {
        id: 'focuspull',
        tag: '/focuspull',
        name: 'Focus Pull (Puxada de Foco com Monitor)',
        category: 'focus',
        categoryLabel: 'Foco & Óptica',
        description: 'Cena metalinguística de cinema mostrando a tela do monitor de câmera com foco sendo ajustado.',
        promptToken: 'focus pull scene, cinema camera monitor displaying subject in background, filmmaking behind-the-scenes aesthetic',
        gradient: 'from-stone-700/40 to-indigo-800/40',
        iconName: 'Camera'
    },
    {
        id: 'focusstack',
        tag: '/focusstack',
        name: 'Focus Stack (Empilhamento de Foco Macro ao Infinito)',
        category: 'focus',
        categoryLabel: 'Foco & Óptica',
        description: 'Planta no parapeito em foco nítido simultaneamente com o sujeito ao fundo sem perda de detalhe.',
        promptToken: 'focus stacking technique, hyper-detailed foreground texture and background subject both tack-sharp, macro-to-portrait sharpness',
        gradient: 'from-emerald-600/40 to-cyan-700/30',
        iconName: 'Layers'
    },
    {
        id: 'bokehburst',
        tag: '/bokehburst',
        name: 'Bokeh Burst (Explosão Radial de Bokeh)',
        category: 'focus',
        categoryLabel: 'Foco & Óptica',
        description: 'Explosão estelar de esferas de luz e bokeh circular irradiando em torno da cabeça do sujeito.',
        promptToken: 'bokeh burst, radial explosion of golden bokeh orbs radiating behind subject head, luminous halo, spectacular light spheres',
        gradient: 'from-amber-500/40 to-yellow-600/30',
        iconName: 'Sun'
    },
    {
        id: 'softfocus',
        tag: '/softfocus',
        name: 'Soft Focus (Foco Suave Sonhador Eéreo)',
        category: 'focus',
        categoryLabel: 'Foco & Óptica',
        description: 'Brilho difuso etéreo com névoa luminosa e atmosfera romântica através de vegetação suave.',
        promptToken: 'soft focus dreamscape, ethereal misty glow, diffused highlights, vintage glamour portrait filtration, romantic ambiance',
        gradient: 'from-emerald-500/30 to-amber-500/20',
        iconName: 'Eye'
    },
    {
        id: 'lens35mm',
        tag: '/35mm',
        name: 'Lente 35mm (Perspectiva Documental & Carro)',
        category: 'lenses',
        categoryLabel: 'Lentes / Câmeras',
        description: 'Lente grande-angular clássica 35mm para enquadramento documental: sujeito e cenário ao redor (carro clássico) em proporção equilibrada.',
        promptToken: 'shot on 35mm prime lens, classic environmental documentary portrait, balanced proportion between subject and red vintage sports car in background, natural optical perspective',
        gradient: 'from-red-900/40 via-neutral-900 to-black',
        iconName: 'Aperture'
    },
    {
        id: 'lens50mm',
        tag: '/50mm',
        name: 'Lente 50mm (Perspectiva Natural Olho Humano)',
        category: 'lenses',
        categoryLabel: 'Lentes / Câmeras',
        description: 'Lente normal de 50mm reproduzindo a visão humana real: enquadramento de meio corpo equilibrado com separação suave do fundo.',
        promptToken: 'shot on 50mm prime lens, natural human eye focal length, medium waist-up portrait in front of red classic sports car, organic depth of field, balanced focal length',
        gradient: 'from-red-950/40 via-zinc-900 to-black',
        iconName: 'Aperture'
    },
    {
        id: 'lens85mm',
        tag: '/85mm',
        name: 'Lente 85mm (Teleobjetiva de Retrato & Bokeh Cremoso)',
        category: 'lenses',
        categoryLabel: 'Lentes / Câmeras',
        description: 'Lente 85mm teleobjetiva de retrato: forte compressão de planos que aproxima o fundo com desfoque cremoso e isola o sujeito com nitidez cirúrgica.',
        promptToken: 'shot on 85mm f/1.4 telephoto portrait lens, intense optical compression, creamy smooth background bokeh blur, subject isolation with tack-sharp focus, shallow depth of field',
        gradient: 'from-rose-950/40 via-neutral-900 to-black',
        iconName: 'Aperture'
    },
    {
        id: 'fisheye',
        tag: '/fisheye',
        name: 'Lente Fisheye (Olho de Peixe 180° Curvado)',
        category: 'lenses',
        categoryLabel: 'Lentes / Câmeras',
        description: 'Lente olho de peixe ultra grande-angular com forte distorção esférica hemisférica curva de 180°, sujeito no centro com arquitetura curvada.',
        promptToken: 'shot on 8mm ultra-wide fisheye lens, 180-degree hemispherical curved barrel distortion, dramatic wide-angle perspective with centered subject in front of vintage car',
        gradient: 'from-neutral-900 via-stone-900 to-red-950',
        iconName: 'Aperture'
    },
    {
        id: 'fisheyeorbit',
        tag: '/fisheyeorbit',
        name: 'Fisheye Orbit (Fisheye 180° Curvado)',
        category: 'focus',
        categoryLabel: 'Foco & Óptica',
        description: 'Lente olho de peixe circular extrema curvando o horizonte terrestre em esfera cósmica com selfie do alto.',
        promptToken: 'circular fisheye lens, 180-degree hemispherical ultra-wide distortion, curved earth horizon, extreme convex perspective',
        gradient: 'from-cyan-600/40 to-blue-800/40',
        iconName: 'Maximize2'
    },
    {
        id: 'ultrawideview',
        tag: '/ultrawideview',
        name: 'Ultra-Wide View (Grande Angular Extrema 12mm)',
        category: 'focus',
        categoryLabel: 'Foco & Óptica',
        description: 'Visão ultra-ampla capturando o céu monumental com nuvens e todo o horizonte com escala épica.',
        promptToken: 'ultra-wide angle 12mm lens, sweeping expansive blue sky with clouds, dynamic foreground scale, epic landscape perspective',
        gradient: 'from-sky-600/40 to-blue-700/30',
        iconName: 'Maximize2'
    },
    {
        id: 'panoramicpov',
        tag: '/panoramicpov',
        name: 'Panoramic POV (Visão Panorâmica Ampla)',
        category: 'focus',
        categoryLabel: 'Foco & Óptica',
        description: 'Sujeito contemplando o horizonte dourado em formato panorâmico cinematográfico ultra-largo.',
        promptToken: 'panoramic POV vista, wide aspect scenic overlook, golden sunset horizon, contemplative subject looking over city expanse',
        gradient: 'from-amber-600/40 to-orange-700/30',
        iconName: 'Compass'
    },
    {
        id: 'splitdiopter',
        tag: '/splitdiopter',
        name: 'Split Diopter (Foco Duplo Fracionado)',
        category: 'focus',
        categoryLabel: 'Foco & Óptica',
        description: 'Lente com filtro de meio dioptro: primeiro plano ultra-próximo e fundo distante ambos em foco nítido.',
        promptToken: 'split diopter optical shot, split-field diopter lens, extreme foreground blur-line separation with near and far in simultaneous tack-sharp focus',
        gradient: 'from-stone-700/40 to-teal-700/30',
        iconName: 'Split'
    },
    {
        id: 'tiltedlens',
        tag: '/tiltedlens',
        name: 'Tilted Lens (Lente Inclinada Tilt-Shift)',
        category: 'focus',
        categoryLabel: 'Foco & Óptica',
        description: 'Plano inclinado óptico gerando plano de foco diagonal e arquitetura inclinada cinematográfica.',
        promptToken: 'tilted lens tilt-shift perspective, scheimpflug principle, diagonal plane of sharpness, dramatic canted architecture',
        gradient: 'from-indigo-700/40 to-cyan-700/30',
        iconName: 'Sliders'
    },
    {
        id: 'lenswarp',
        tag: '/lenswarp',
        name: 'Lens Warp (Distorção de Barril em Vidro Curvo)',
        category: 'focus',
        categoryLabel: 'Foco & Óptica',
        description: 'Distorção de curvatura acentuada em lentes ultra-angulares curvando arranha-céus e linhas retas.',
        promptToken: 'lens warp barrel distortion, curved architectural lines bending around subject, dynamic optical aberration, expressive bulge',
        gradient: 'from-blue-700/40 to-indigo-800/40',
        iconName: 'Maximize2'
    },
    {
        id: 'radialview',
        tag: '/radialview',
        name: 'Radial View (Zoom Burst Radial de Velocidade)',
        category: 'focus',
        categoryLabel: 'Foco & Óptica',
        description: 'Efeito de zoom burst ou linhas de velocidade radiais convergindo em direção ao rosto central nítido.',
        promptToken: 'radial zoom burst, explosive radial speed lines streaking outward from sharp centered face, kinetic warp effect',
        gradient: 'from-amber-600/40 to-rose-700/30',
        iconName: 'Zap'
    },

    // =========================================================================
    // 7. REFLEXOS, ESPELHOS & CLONES (Imagem 9)
    // =========================================================================
    {
        id: 'puddleframe',
        tag: '/puddleframe',
        name: 'Puddle Frame (Reflexo em Poça d’Água Invertido)',
        category: 'reflections',
        categoryLabel: 'Reflexos & Clones',
        description: 'Imagem invertida do sujeito refletida na água limpa de uma poça de asfalto com céu e sapatos visíveis.',
        promptToken: 'puddle reflection shot, inverted mirror image in clear rain puddle on pavement, crisp water reflection of subject and clouds',
        gradient: 'from-slate-700/50 to-sky-700/30',
        iconName: 'Split'
    },
    {
        id: 'glassreflection',
        tag: '/glassreflection',
        name: 'Glass Reflection (Reflexo Cristalino em Vidro Moderno)',
        category: 'reflections',
        categoryLabel: 'Reflexos & Clones',
        description: 'Reflexo cristalino na parede de vidro de um edifício moderno, criando dois perfis idênticos.',
        promptToken: 'modern glass wall reflection, crisp architectural glass reflection creating dual transparent portraits, urban architectural sheen',
        gradient: 'from-cyan-600/40 to-blue-800/30',
        iconName: 'Split'
    },
    {
        id: 'chromeview',
        tag: '/chromeview',
        name: 'Chrome View (Reflexo em Lataria de Carro Metálica)',
        category: 'reflections',
        categoryLabel: 'Reflexos & Clones',
        description: 'Reflexo metálico e polido distorcido na porta cromada espelhada de um veículo escuro de luxo.',
        promptToken: 'chrome metal reflection, distorted shiny metallic surface reflection on glossy dark car body, polished luxury automotive shine',
        gradient: 'from-zinc-700/50 to-stone-800/50',
        iconName: 'Split'
    },
    {
        id: 'waterreflection',
        tag: '/waterreflection',
        name: 'Water Reflection (Espelho d’Água Piscina Infinita)',
        category: 'reflections',
        categoryLabel: 'Reflexos & Clones',
        description: 'Reflexo simétrico perfeito em lâmina de água de piscina infinita com horizonte ao fundo.',
        promptToken: 'calm water mirror reflection, infinity pool glass-smooth water reflecting full standing subject, perfect vertical symmetry',
        gradient: 'from-blue-600/40 to-teal-700/30',
        iconName: 'Split'
    },
    {
        id: 'shadowdouble',
        tag: '/shadowdouble',
        name: 'Shadow Double (Sombra Alter-Ego na Parede)',
        category: 'reflections',
        categoryLabel: 'Reflexos & Clones',
        description: 'Sombra projetada na parede ao sol criando uma silhueta secundária estilizada como um alter-ego.',
        promptToken: 'shadow double, sharp sunlight projecting a distinct alter-ego silhouette shadow on textured wall, duality concept',
        gradient: 'from-amber-700/40 to-stone-800/40',
        iconName: 'Layers'
    },
    {
        id: 'reflectionsplit',
        tag: '/reflectionsplit',
        name: 'Reflection Split (Rosto Dividido por Lâmina de Vidro)',
        category: 'reflections',
        categoryLabel: 'Reflexos & Clones',
        description: 'Lâmina de vidro cortando exatamente o meio do rosto, metade real e metade refletida com perspectiva diferente.',
        promptToken: 'split face glass reflection, vertical pane of glass bisecting the face, half direct view and half reflected angle, psychological duality',
        gradient: 'from-stone-700/40 to-indigo-800/30',
        iconName: 'Split'
    },
    {
        id: 'mirrorclone',
        tag: '/mirrorclone',
        name: 'Mirror Clone (Clones Infinitos em Espelhos Paralelos)',
        category: 'reflections',
        categoryLabel: 'Reflexos & Clones',
        description: 'Espelhos paralelos opostos (estilo elevador) criando repetições e múltiplos clones do sujeito até o infinito.',
        promptToken: 'infinity mirror clones, multiple reflections stretching into recursive depth, parallel mirrored walls, surreal cloning matrix',
        gradient: 'from-indigo-700/40 to-purple-800/40',
        iconName: 'Split'
    },
    {
        id: 'reflectionportal',
        tag: '/reflectionportal',
        name: 'Reflection Portal (Portal de Espelho Neon Futurista)',
        category: 'reflections',
        categoryLabel: 'Reflexos & Clones',
        description: 'Espelho emoldurado por fita de LED neon brilhante parecendo um portal dimensional para outro universo.',
        promptToken: 'neon illuminated mirror portal, glowing rectangular LED frame, mystical glowing portal doorway reflection, cyberpunk mirror',
        gradient: 'from-cyan-500/40 to-blue-700/30',
        iconName: 'Zap'
    },
    {
        id: 'distortedreflection',
        tag: '/distortedreflection',
        name: 'Distorted Reflection (Reflexo Líquido Deformado)',
        category: 'reflections',
        categoryLabel: 'Reflexos & Clones',
        description: 'Reflexo ondulado e surreal em escultura de metal fluido ou espelho deformante estilo funhouse.',
        promptToken: 'distorted metallic reflection, liquid mercury warped reflective surface, surrealist funhouse mirror distortion, melting reflections',
        gradient: 'from-slate-600/40 to-stone-700/40',
        iconName: 'Sliders'
    },

    // =========================================================================
    // 8. AÇÃO, TRAÇÃO & CONGELAMENTO TEMPORAL (Imagem 10)
    // =========================================================================
    {
        id: 'bulletfreeze',
        tag: '/bulletfreeze',
        name: 'Bullet Freeze (Congelamento Matrix de Projétil)',
        category: 'time',
        categoryLabel: 'Ação & Congelamento',
        description: 'Detritos, cascalho ou projétil congelados no ar diante da mão espalmada com pose de impacto instantâneo.',
        promptToken: 'bullet-time freeze, suspended flying dust debris and pebble frozen mid-air, outstretched palm, high-speed 1/10000s shutter action',
        gradient: 'from-red-600/40 to-amber-700/30',
        iconName: 'Zap'
    },
    {
        id: 'motiontrail',
        tag: '/motiontrail',
        name: 'Motion Trail (Rastro Estroboscópico de Passos)',
        category: 'time',
        categoryLabel: 'Ação & Congelamento',
        description: 'Sujeito caminhando com múltiplas silhuetas semitransparentes sequenciais mostrando a trajetória do passo.',
        promptToken: 'stroboscopic motion trail, multiple semi-transparent ghost exposures tracing walking path, continuous chrono-photography',
        gradient: 'from-blue-600/40 to-indigo-700/30',
        iconName: 'Move'
    },
    {
        id: 'speedtrail',
        tag: '/speedtrail',
        name: 'Speed Trail (Rastro de Hiper-Velocidade em Corrida)',
        category: 'time',
        categoryLabel: 'Ação & Congelamento',
        description: 'Corrida em alta velocidade com estrias horizontais de desfoque sugerindo aceleração sobre-humana.',
        promptToken: 'speed trail sprint, horizontal velocity motion streaks, hyper-speed blurred running trails, sonic speed visual effect',
        gradient: 'from-orange-600/40 to-red-700/30',
        iconName: 'Zap'
    },
    {
        id: 'actiontrail',
        tag: '/actiontrail',
        name: 'Action Trail (Trajetória de Salto Parkour)',
        category: 'time',
        categoryLabel: 'Ação & Congelamento',
        description: 'Salto de parkour com múltiplos quadros fantasmas congelados demonstrando a parábola completa do pulo.',
        promptToken: 'parkour action trail, sequential composite jump trajectory, airborne ghost figures showing jump arc, dynamic athleticism',
        gradient: 'from-indigo-600/40 to-cyan-700/30',
        iconName: 'Move'
    },
    {
        id: 'multifreeze',
        tag: '/multifreeze',
        name: 'Multi Freeze (Clones de Poses Múltiplas na Mesma Foto)',
        category: 'time',
        categoryLabel: 'Ação & Congelamento',
        description: 'Três cópias nítidas do mesmo indivíduo na mesma foto interagindo em poses diferentes (agachado, em pé, observando).',
        promptToken: 'multi-freeze clone photography, three identical clones of the same person in different sharp poses, seamless composite multiplicity',
        gradient: 'from-teal-600/40 to-blue-700/30',
        iconName: 'Split'
    },
    {
        id: 'ghostmotion',
        tag: '/ghostmotion',
        name: 'Ghost Motion (Rastro Noturno Fantasmagórico)',
        category: 'time',
        categoryLabel: 'Ação & Congelamento',
        description: 'Longa exposição noturna com silhuetas etéreas translúcidas de passos sob a luz de postes urbanos.',
        promptToken: 'ghost motion night trail, ethereal translucent walking figures, street lamp illuminated nocturnal long exposure, spectral presence',
        gradient: 'from-violet-700/40 to-slate-800/40',
        iconName: 'Move'
    },
    {
        id: 'timefreeze',
        tag: '/timefreeze',
        name: 'Time Freeze (Tempo Suspenso no Salto Máximo)',
        category: 'time',
        categoryLabel: 'Ação & Congelamento',
        description: 'Sujeito congelado no ar no ponto mais alto do salto com pedras e poeira levitando ao redor.',
        promptToken: 'time freeze levitation, subject frozen in apex of dynamic jump, floating airborne particles and dust, defying gravity',
        gradient: 'from-amber-600/40 to-yellow-600/30',
        iconName: 'Zap'
    },
    {
        id: 'momentcapture',
        tag: '/momentcapture',
        name: 'Moment Capture (Captura de Pico de Ação Esportiva)',
        category: 'time',
        categoryLabel: 'Ação & Congelamento',
        description: 'Bola de basquete ou objeto a milímetros dos olhos no instante exato de contato, intensidade máxima.',
        promptToken: 'decisive moment capture, basketball inches from face in high-impact sports action, intense focused eyes, micro-second timing',
        gradient: 'from-orange-600/40 to-stone-700/30',
        iconName: 'Zap'
    },
    {
        id: 'strobeaction',
        tag: '/strobeaction',
        name: 'Strobe Action (Ação Estroboscópica Noturna)',
        category: 'time',
        categoryLabel: 'Ação & Congelamento',
        description: 'Disparos estroboscópicos repetidos congelando múltiplas fases de movimento em fundo escuro iluminado por holofote.',
        promptToken: 'stroboscopic multi-flash exposure, repetitive frozen movement phases against dark night backdrop, dramatic studio strobe',
        gradient: 'from-zinc-800/50 to-blue-900/40',
        iconName: 'Zap'
    },
    {
        id: 'motionblur',
        tag: '/motionblur',
        name: 'Motion Blur (Desfoque de Movimento Panning)',
        category: 'time',
        categoryLabel: 'Ação & Congelamento',
        description: 'Desfoque de movimento em panning onde o fundo se move em alta velocidade e o sujeito permanece nítido.',
        promptToken: 'dynamic motion blur background, panning camera speed lines, sharp focused subject against high-speed blurred background, kinetic energy',
        gradient: 'from-amber-600/40 to-stone-800/30',
        iconName: 'Move'
    },
    {
        id: 'freezeaction',
        tag: '/freezeaction',
        name: 'Freeze Action (Congelamento de Objeto Levitação)',
        category: 'time',
        categoryLabel: 'Ação & Congelamento',
        description: 'Lente de câmera ou acessório jogado no ar flutuando com nitidez extrema e zero desfoque.',
        promptToken: 'freeze-action high shutter speed photography, object caught floating mid-air, 1/8000s shutter capture, zero blur, suspended gravity',
        gradient: 'from-blue-600/40 to-cyan-700/30',
        iconName: 'Zap'
    },

    // =========================================================================
    // 9. LUZ, FLARES & FX ÓPTICOS (Imagem 11)
    // =========================================================================
    {
        id: 'lightburst',
        tag: '/lightburst',
        name: 'Light Burst (Explosão de Raios Solares Starburst)',
        category: 'lighting',
        categoryLabel: 'Luz & Flares',
        description: 'Sol explodindo em raios pontiagudos brilhantes atrás da silhueta do sujeito (abertura f/22 starburst).',
        promptToken: 'light burst starburst flare, sun diffracting sharp luminous rays behind silhouette, brilliant solar explosion, radiant rim',
        gradient: 'from-yellow-500/40 to-amber-600/30',
        iconName: 'Sun'
    },
    {
        id: 'prismflare',
        tag: '/prismflare',
        name: 'Prism Flare (Refração Prismática Caleidoscópica)',
        category: 'lighting',
        categoryLabel: 'Luz & Flares',
        description: 'Prisma de vidro colocado rente à lente gerando reflexos triangulares coloridos com espectro de arco-íris.',
        promptToken: 'prism flare refraction, triangular optical glass prism reflections, spectral rainbow light streaks, experimental lens filtration',
        gradient: 'from-rose-500/40 to-amber-500/30',
        iconName: 'Sun'
    },
    {
        id: 'rainbowrefraction',
        tag: '/rainbowrefraction',
        name: 'Rainbow Refraction (Feixe de Arco-Íris Espectral)',
        category: 'lighting',
        categoryLabel: 'Luz & Flares',
        description: 'Faixa horizontal de cores do arco-íris atravessando o rosto e o cenário com beleza óptica.',
        promptToken: 'rainbow refraction light streak, vivid spectral color dispersion beam across face, optical prism flare, ethereal beauty',
        gradient: 'from-pink-500/40 to-cyan-500/30',
        iconName: 'Sun'
    },
    {
        id: 'chromaticshift',
        tag: '/chromaticshift',
        name: 'Chromatic Shift (Aberração Cromática RGB / Glitch 3D)',
        category: 'lighting',
        categoryLabel: 'Luz & Flares',
        description: 'Separação de canais de cor RGB (vermelho e ciano) nas bordas das silhuetas com estética futurista.',
        promptToken: 'chromatic shift aberration, RGB color channel split fringing, 3D anaglyph glitch edges, vibrant optical color fringing',
        gradient: 'from-red-600/40 to-cyan-600/40',
        iconName: 'Sun'
    },
    {
        id: 'lightleak',
        tag: '/lightleak',
        name: 'Light Leak (Vazamento de Luz Analógico Vintage)',
        category: 'lighting',
        categoryLabel: 'Luz & Flares',
        description: 'Vazamento de luz quente avermelhada e alaranjada na lateral do enquadramento, estética nostálgica 35mm.',
        promptToken: 'vintage analog light leak, organic red and orange flare burn on edge of frame, nostalgic 35mm film burn, sun-drenched aesthetic',
        gradient: 'from-orange-500/40 to-rose-600/30',
        iconName: 'Sun'
    },
    {
        id: 'godrays',
        tag: '/godrays',
        name: 'God Rays (Raios Divinos / Feixes Crepusculares)',
        category: 'lighting',
        categoryLabel: 'Luz & Flares',
        description: 'Feixes crepusculares de luz solar atravessando a copa das árvores ou neblina matinal em raios celestiais.',
        promptToken: 'god rays, crepuscular light shafts piercing through dense forest canopy, heavenly atmospheric light beams, misty radiance',
        gradient: 'from-amber-400/40 to-yellow-600/30',
        iconName: 'Sun'
    },
    {
        id: 'volumetriclight',
        tag: '/volumetriclight',
        name: 'Volumetric Light (Luz Volumétrica de Janela Industrial)',
        category: 'lighting',
        categoryLabel: 'Luz & Flares',
        description: 'Feixes espessos e poeirentos de luz solar entrando por janela alta em galpão escuro com fumaça atmosférica.',
        promptToken: 'volumetric lighting haze, thick shafts of sunlight streaming through dusty industrial windows, chiaroscuro atmosphere',
        gradient: 'from-amber-600/40 to-stone-800/40',
        iconName: 'Sun'
    },
    {
        id: 'lasergrid',
        tag: '/lasergrid',
        name: 'Laser Grid (Grade de Lasers Neon Sci-Fi)',
        category: 'lighting',
        categoryLabel: 'Luz & Flares',
        description: 'Malha tridimensional de feixes de laser azul e ciano no escuro, visual synthwave cyberpunk.',
        promptToken: 'neon laser grid background, glowing cyan and blue laser beam lattice, futuristic synthwave cybernetic setting, neon glow',
        gradient: 'from-cyan-600/40 to-blue-700/40',
        iconName: 'Zap'
    },
    {
        id: 'lighttunnel',
        tag: '/lighttunnel',
        name: 'Light Tunnel (Túnel Circular de Luz Neon)',
        category: 'lighting',
        categoryLabel: 'Luz & Flares',
        description: 'Sujeito caminhando por dentro de um túnel futurista cercado por anéis concêntricos de neon brilhante e chão molhado reflexivo.',
        promptToken: 'futuristic circular light tunnel, concentric glowing LED neon rings, reflective wet floor, sci-fi infinite corridor perspective',
        gradient: 'from-amber-500/40 to-cyan-500/40',
        iconName: 'Zap'
    },
    {
        id: 'lensflare',
        tag: '/lensflare',
        name: 'Lens Flare (Flare Óptico de Sol Dourado)',
        category: 'lighting',
        categoryLabel: 'Luz & Flares',
        description: 'Raio de sol dourado vazando na lente gerando anéis de luz coloridos e brilho atmosférico.',
        promptToken: 'golden sun lens flare, warm optical flare crossing frame, soft sunburst artifact, dreamy natural backlight haze',
        gradient: 'from-amber-500/40 to-orange-600/30',
        iconName: 'Sun'
    },
    {
        id: 'anamorphicflare',
        tag: '/anamorphicflare',
        name: 'Anamorphic Flare (Faixa Horizontal Azul Sci-Fi)',
        category: 'lighting',
        categoryLabel: 'Luz & Flares',
        description: 'Faixa horizontal azul e ciano de lente anamórfica de cinema clássico de ficção científica.',
        promptToken: 'horizontal anamorphic streak flare, sci-fi blue lens flare streak, widescreen cinematic optical artifact, premium film look',
        gradient: 'from-blue-600/40 to-cyan-600/30',
        iconName: 'Sun'
    },
    {
        id: 'goldenhour',
        tag: '/goldenhour',
        name: 'Golden Hour (Luz Dourada Pôr do Sol)',
        category: 'lighting',
        categoryLabel: 'Iluminação & Luz',
        description: 'Luz quente, macia e avermelhada do pôr do sol entrando pela janela, criando sombras acolhedoras e brilho suave.',
        promptToken: 'warm golden hour sunlight streaming through window, soft orange sunset glow, gentle warm shadows cast across face and white shirt, cinematic warm atmosphere',
        gradient: 'from-amber-500/40 to-yellow-600/30',
        iconName: 'Sun'
    },
    {
        id: 'softbox',
        tag: '/softbox',
        name: 'Softbox (Iluminação Difusa de Estúdio)',
        category: 'lighting',
        categoryLabel: 'Iluminação & Luz',
        description: 'Luz suave e homogênea emitida por softbox de estúdio, eliminando sombras duras e proporcionando tonalidade limpa.',
        promptToken: 'softbox studio lighting, perfectly diffused even light, soft gradual transition shadows, pristine natural skin tones, crisp white shirt portrait',
        gradient: 'from-slate-700/50 to-amber-100/20',
        iconName: 'Sun'
    },
    {
        id: 'rimlight',
        tag: '/rimlight',
        name: 'Rim Light (Luz de Borda & Halo Traseiro)',
        category: 'lighting',
        categoryLabel: 'Iluminação & Luz',
        description: 'Filete marcante e brilhante de luz de contorno traseira desenhando as bordas dos ombros, pescoço e cabelo em fundo escuro.',
        promptToken: 'dramatic rim light backlight, intense edge illumination tracing shoulders and hair, strong silhouette separation from dark backdrop, glowing warm rim halo',
        gradient: 'from-amber-500/40 via-orange-600/30 to-neutral-900',
        iconName: 'Sun'
    },
    {
        id: 'hardlight',
        tag: '/hardlight',
        name: 'Hard Light (Luz Dura & Sombras Nítidas)',
        category: 'lighting',
        categoryLabel: 'Iluminação & Luz',
        description: 'Luz direta e intensa com sombras duras recortadas e padrões geométricos projetados no rosto e camisa branca.',
        promptToken: 'hard direct sunlight, crisp razor-sharp cast shadows, high contrast illumination, geometric shadow lines across face and white shirt, dramatic chiaroscuro',
        gradient: 'from-amber-600/40 via-yellow-700/30 to-stone-900',
        iconName: 'Sun'
    },
    {
        id: 'studio',
        tag: '/studio',
        name: 'Studio Lighting (Estúdio de Alta Moda)',
        category: 'lighting',
        categoryLabel: 'Luz & Flares',
        description: 'Configuração de três pontos (Key, Fill, Rim) com softboxes grandes para iluminação impecável.',
        promptToken: 'professional studio 3-point lighting setup, large octabox diffusion, gentle wrap-around key light',
        gradient: 'from-slate-600/40 to-stone-700/30',
        iconName: 'Sun'
    },

    // =========================================================================
    // 10. CLIMA & ATMOSFERA
    // =========================================================================
    {
        id: 'rainynight',
        tag: '/rainynight',
        name: 'Rainy Night (Noite Chuvosa)',
        category: 'weather',
        categoryLabel: 'Clima & Atmosfera',
        description: 'Chuva noturna com asfalto molhado, poças d’água reluzentes e reflexos coloridos de postes e luzes.',
        promptToken: 'rainy night atmosphere, glistening wet asphalt puddles, falling rain streaks, glowing reflections',
        gradient: 'from-slate-800/50 to-blue-950/50',
        iconName: 'CloudRain'
    },
    {
        id: 'fog',
        tag: '/fog',
        name: 'Fog & Mist (Neblina Misteriosa)',
        category: 'weather',
        categoryLabel: 'Clima & Atmosfera',
        description: 'Camada densa e envolvente de neblina cinematográfica que suaviza o fundo e traz mistério.',
        promptToken: 'dense cinematic fog, moody mist hovering, diffused atmospheric haze, silent mysterious depth',
        gradient: 'from-zinc-700/40 to-slate-800/40',
        iconName: 'CloudRain'
    },
    {
        id: 'storm',
        tag: '/storm',
        name: 'Storm (Tempestade Épica)',
        category: 'weather',
        categoryLabel: 'Clima & Atmosfera',
        description: 'Nuvens de tempestade carregadas de trovoada, céu escuro dramático e ventos intensos.',
        promptToken: 'epic dramatic storm, dark rolling thunderclouds, turbulent sky, electric atmosphere',
        gradient: 'from-purple-900/40 to-slate-900/50',
        iconName: 'CloudRain'
    },

    // =========================================================================
    // 11. ESTILOS ARTÍSTICOS & 3D
    // =========================================================================
    {
        id: 'cinematic',
        tag: '/cinematic',
        name: 'Cinematic 35mm (Cinema Blockbuster)',
        category: 'styles',
        categoryLabel: 'Estilos Artísticos',
        description: 'Color grading de cinema hollywoodiano, proporção widescreen, profundidade refinada e granulação orgânica.',
        promptToken: 'cinematic movie still, 35mm film stock, Arri Alexa footage, blockbuster color grading, shallow depth of field',
        gradient: 'from-amber-600/40 to-indigo-700/30',
        iconName: 'Film'
    },
    {
        id: 'filmgrain',
        tag: '/filmgrain',
        name: 'Film Grain (Grão Analógico Kodak Portra)',
        category: 'analog',
        categoryLabel: 'Filme & Analógico',
        description: 'Textura granulada de filme analógico Kodak Portra 400 com altas luzes suaves e tons de pele naturais.',
        promptToken: 'authentic 35mm film grain, Kodak Portra 400 aesthetic, organic texture, soft highlight halation',
        gradient: 'from-orange-600/30 to-amber-700/20',
        iconName: 'Film'
    },
    {
        id: 'disposablecamera',
        tag: '/disposablecamera',
        name: 'Disposable Camera (Câmera Descartável 90s)',
        category: 'analog',
        categoryLabel: 'Filme & Analógico',
        description: 'Flash direto dos anos 90, cores saturadas e visual nostálgico de festa e momentos espontâneos.',
        promptToken: 'disposable camera aesthetic, direct harsh flash, 1990s nostalgic party photo, candid authentic snapshot',
        gradient: 'from-pink-600/30 to-amber-600/20',
        iconName: 'Camera'
    },
    {
        id: 'polaroid',
        tag: '/polaroid',
        name: 'Polaroid Instant (Foto Instantânea)',
        category: 'analog',
        categoryLabel: 'Filme & Analógico',
        description: 'Foto instantânea Polaroid com bordas características, contraste vintage e tons quentes ligeiramente desbotados.',
        promptToken: 'vintage Polaroid instant photograph, subtle vignette, creamy faded tones, classic analog color shift',
        gradient: 'from-stone-500/30 to-amber-600/20',
        iconName: 'Film'
    },
    {
        id: 'anime',
        tag: '/anime',
        name: 'Anime & Cel Shading (Estilo Makoto Shinkai)',
        category: 'styles',
        categoryLabel: 'Estilos Artísticos',
        description: 'Ilustração de animação japonesa com céus exuberantes, iluminação mágica e detalhes vibrantes.',
        promptToken: 'anime art style, Makoto Shinkai aesthetic, vibrant cel shading, highly detailed anime illustration',
        gradient: 'from-sky-500/30 to-indigo-600/20',
        iconName: 'Palette'
    },
    {
        id: '3drender',
        tag: '/3drender',
        name: '3D Render Octane / Unreal Engine 5',
        category: 'styles',
        categoryLabel: 'Estilos Artísticos',
        description: 'Renderização 3D hiper-detalhada com iluminação global Lumen, texturas PBR fotorrealistas e traçado de raio.',
        promptToken: '3D render, Octane Render, Unreal Engine 5, ray-traced global illumination, hyper-detailed PBR textures',
        gradient: 'from-cyan-600/30 to-blue-700/20',
        iconName: 'Palette'
    },

    // =========================================================================
    // 12. CENÁRIOS & TEMAS
    // =========================================================================
    {
        id: 'magazinecover',
        tag: '/magazinecover',
        name: 'Magazine Cover (Capa de Revista Vogue)',
        category: 'scenarios',
        categoryLabel: 'Cenários & Temas',
        description: 'Composição editorial de alta costura digna de capa de revista Vogue ou GQ com pose confiante.',
        promptToken: 'high-fashion magazine cover shot, editorial Vogue photography, couture elegance, poised model posture',
        gradient: 'from-slate-700/40 to-amber-600/30',
        iconName: 'Compass'
    },
    {
        id: 'luxury',
        tag: '/luxury',
        name: 'Old Money & Luxury (Luxo e Sofisticação)',
        category: 'scenarios',
        categoryLabel: 'Cenários & Temas',
        description: 'Ambiente nobre e refinado: iate na Riviera, palácio clássico ou cobertura com vista panorâmica.',
        promptToken: 'luxury lifestyle, old money aesthetic, quiet luxury, understated elegance, affluent European villa',
        gradient: 'from-amber-600/40 to-yellow-600/30',
        iconName: 'Compass'
    },
    {
        id: 'nightcity',
        tag: '/nightcity',
        name: 'Night Cityscape (Metrópole Noturna)',
        category: 'scenarios',
        categoryLabel: 'Cenários & Temas',
        description: 'Metrópole iluminada à noite com arranha-céus reluzentes e luzes de tráfego de longa exposição.',
        promptToken: 'sprawling nocturnal cityscape, illuminated modern skyscrapers, bustling metropolis night lights',
        gradient: 'from-blue-900/40 to-purple-900/40',
        iconName: 'Compass'
    },

    // =========================================================================
    // 13. RESOLUÇÃO & QUALIDADE FOTOGRÁFICA
    // =========================================================================
    {
        id: '8k',
        tag: '/8k',
        name: '8K Ultra HD (Máxima Definição)',
        category: 'quality',
        categoryLabel: 'Resolução & Qualidade',
        description: 'Resolução cristalina 8K com detalhes nítidos nos poros da pele, tecidos e reflexos oculares.',
        promptToken: '8k resolution, ultra-detailed, pristine clarity, sharp focus on intricate textures',
        gradient: 'from-blue-600/40 to-cyan-600/30',
        iconName: 'Flame'
    },
    {
        id: 'ultrarealistic',
        tag: '/ultrarealistic',
        name: 'Ultra-Realista Fotográfico',
        category: 'quality',
        categoryLabel: 'Resolução & Qualidade',
        description: 'Microtexturas de pele realistas, poros visíveis, iluminação física precisa e sem artefatos.',
        promptToken: 'ultra-realistic photograph, photorealistic skin pores and natural micro textures, physically accurate optical rendering',
        gradient: 'from-amber-600/40 to-rose-600/30',
        iconName: 'Camera'
    },
    {
        id: 'remaster16k',
        tag: '/remaster16k',
        name: 'Ultra-Premium 16K Remaster & Enhancement',
        category: 'quality',
        categoryLabel: 'Resolução & Qualidade',
        description: 'Preservação fiel do sujeito e fundo original com super-resolução 16K, redução de ruído, nitidez óptica e fidelidade máxima.',
        promptToken: 'Ultra-Premium 16K Professional Remaster & Enhancement. Preserve the image exactly as provided while dramatically improving quality, realism, sharpness, and clarity. Enhance only existing visible details — do not invent, generate, reconstruct, or add facial features, hair, beard strands, pores, wrinkles, clothing details, or textures not present in the source. Maintain the exact face, hairstyle, beard density, expression, skin tone, facial proportions, lighting, colors, clothing, and composition. Improve only through faithful super-resolution, natural sharpening, artifact removal, noise reduction, texture refinement, and realistic detail recovery. Preserve the original background exactly — do not replace, redesign, extend, reimagine, or add elements. Apply subtle improvements to clarity, textures, gradients, edges, lighting fidelity, and resolution while keeping the background visually identical. Professional camera realism, authentic optics, realistic dynamic range, premium color science, clean highlights, rich shadows, natural micro-contrast, crystal-clear focus, luxury commercial photography, medium-format fidelity, magazine-cover finish, production-ready 16K master.',
        gradient: 'from-amber-500/40 via-yellow-600/30 to-neutral-900',
        iconName: 'Sparkles'
    }
];

export const ULTRA_PREMIUM_16K_PROMPT = `Ultra-Premium 16K Professional Remaster & Enhancement. Preserve the image exactly as provided while dramatically improving quality, realism, sharpness, and clarity. Enhance only existing visible details — do not invent, generate, reconstruct, or add facial features, hair, beard strands, pores, wrinkles, clothing details, or textures not present in the source. Maintain the exact face, hairstyle, beard density, expression, skin tone, facial proportions, lighting, colors, clothing, and composition. Improve only through faithful super-resolution, natural sharpening, artifact removal, noise reduction, texture refinement, and realistic detail recovery. Preserve the original background exactly — do not replace, redesign, extend, reimagine, or add elements. Apply subtle improvements to clarity, textures, gradients, edges, lighting fidelity, and resolution while keeping the background visually identical. Professional camera realism, authentic optics, realistic dynamic range, premium color science, clean highlights, rich shadows, natural micro-contrast, crystal-clear focus, luxury commercial photography, medium-format fidelity, magazine-cover finish, production-ready 16K master.`;

export interface EffectPreset {
    id: string;
    title: string;
    description: string;
    effectIds: string[];
    tagDisplay: string;
    gradient: string;
}

export const EFFECT_PRESETS: EffectPreset[] = [
    {
        id: 'ultra_16k_remaster',
        title: 'Ultra-Premium 16K Remaster & Enhancement',
        description: 'Super-resolução 16K com fidelidade absoluta: preserva o rosto, pele, iluminação e fundo original sem alucinações.',
        effectIds: ['remaster16k'],
        tagDisplay: '/remaster16k /8k /ultrarealistic',
        gradient: 'from-amber-500 via-yellow-600 to-stone-900'
    },
    {
        id: 'framing_pack',
        title: 'Comandos de Enquadramento',
        description: 'Enquadramentos precisos na poltrona: /topdown, /lowangle, /closeup e /sideview.',
        effectIds: ['topdown', 'lowangle', 'closeup', 'sideview'],
        tagDisplay: '/topdown /lowangle /closeup /sideview',
        gradient: 'from-red-950 via-amber-900 to-stone-900'
    },
    {
        id: 'portraits_pack',
        title: 'Ensaios Fotográficos (Envie seu Rosto)',
        description: 'Alta costura e capas: /editorialportrait, /fashioneditorial, /candidportrait e /lookbook.',
        effectIds: ['editorialportrait', 'fashioneditorial', 'candidportrait', 'lookbook'],
        tagDisplay: '/editorialportrait /fashioneditorial /candidportrait /lookbook',
        gradient: 'from-neutral-900 via-stone-800 to-black'
    },
    {
        id: 'lighting_pack',
        title: 'Iluminação & Luz da Imagem',
        description: 'Controle de luz profissional: /goldenhour, /softbox, /rimlight e /hardlight.',
        effectIds: ['goldenhour', 'softbox', 'rimlight', 'hardlight'],
        tagDisplay: '/goldenhour /softbox /rimlight /hardlight',
        gradient: 'from-amber-600 via-yellow-600 to-stone-900'
    },
    {
        id: 'lenses_pack',
        title: 'Lentes / Câmera',
        description: 'Perspectivas e distorções ópticas: /35mm, /50mm, /85mm e /fisheye.',
        effectIds: ['lens35mm', 'lens50mm', 'lens85mm', 'fisheye'],
        tagDisplay: '/35mm /50mm /85mm /fisheye',
        gradient: 'from-red-900 via-stone-900 to-black'
    },
    {
        id: 'perspective_hacks_pack',
        title: 'Hacks de Perspectiva & Escala',
        description: 'Perspectiva forçada com objeto miniatura, linhas guia arquitetônicas e profundidade em camadas.',
        effectIds: ['forcedperspective', 'leadinglines', 'depthshot', '8k'],
        tagDisplay: '/forcedperspective /leadinglines /depthshot /8k',
        gradient: 'from-amber-600 to-indigo-700'
    },
    {
        id: 'motion_action_rush',
        title: 'Ação, Corrida & Congelamento',
        description: 'Tracking em alta velocidade com estrias horizontais, freeze de ação e rastro estroboscópico.',
        effectIds: ['trackingrush', 'speedtrail', 'bulletfreeze', '8k'],
        tagDisplay: '/trackingrush /speedtrail /bulletfreeze /8k',
        gradient: 'from-red-600 to-amber-600'
    },
    {
        id: 'camera_movements_cinematic',
        title: 'Movimentos de Câmera 180°',
        description: 'Giro em arco de 180°, mergulho vertical e passagem rente à coluna com bokeh.',
        effectIds: ['cameraarc', 'cameradive', 'camerapushpast', 'cinematic'],
        tagDisplay: '/cameraarc /cameradive /camerapushpast /cinematic',
        gradient: 'from-cyan-600 to-blue-700'
    },
    {
        id: 'reflections_mirror_clones',
        title: 'Reflexos em Poça & Clones',
        description: 'Reflexo invertido em poça d’água, clones em espelhos paralelos e portal de neon.',
        effectIds: ['puddleframe', 'mirrorclone', 'reflectionportal', '8k'],
        tagDisplay: '/puddleframe /mirrorclone /reflectionportal /8k',
        gradient: 'from-purple-600 to-cyan-600'
    },
    {
        id: 'optical_flares_lights',
        title: 'Flares Ópticos & Raios Solares',
        description: 'Refração de prisma com arco-íris, raios divinos god rays e flare de lente quente.',
        effectIds: ['prismflare', 'godrays', 'lightburst', '8k'],
        tagDisplay: '/prismflare /godrays /lightburst /8k',
        gradient: 'from-yellow-600 to-rose-600'
    },
    {
        id: 'reveals_and_mystery',
        title: 'Revelações & Espreita',
        description: 'Sujeito espiando entre folhas, meia-sombra na parede e abertura de cortinas.',
        effectIds: ['foregroundreveal', 'shadowreveal', 'curtainreveal', 'cinematic'],
        tagDisplay: '/foregroundreveal /shadowreveal /curtainreveal /cinematic',
        gradient: 'from-slate-700 to-stone-800'
    },
    {
        id: 'cinema_blockbuster',
        title: 'Cinema Blockbuster 35mm',
        description: 'Estilo cinematográfico 35mm com flares anamórficos e hora dourada.',
        effectIds: ['cinematic', 'anamorphicflare', 'goldenhour', '8k'],
        tagDisplay: '/cinematic /anamorphicflare /goldenhour /8k',
        gradient: 'from-amber-600 to-indigo-700'
    },
    {
        id: 'cyberpunk_night',
        title: 'Cyberpunk Laser Night',
        description: 'Cidade futurista, grade de lasers neon, chuva noturna e túnel de luz.',
        effectIds: ['lasergrid', 'lighttunnel', 'rainynight', 'neonlights', 'ultrarealistic'],
        tagDisplay: '/lasergrid /lighttunnel /rainynight /neonlights',
        gradient: 'from-fuchsia-600 to-cyan-600'
    },
    {
        id: 'fashion_vogue',
        title: 'Editorial Vogue / Luxo',
        description: 'Capa de revista de alta costura com iluminação de estúdio impecável e close-up.',
        effectIds: ['magazinecover', 'luxury', 'studio', 'closeup', 'ultrarealistic'],
        tagDisplay: '/magazinecover /luxury /studio /closeup',
        gradient: 'from-slate-700 to-amber-600'
    }
];
