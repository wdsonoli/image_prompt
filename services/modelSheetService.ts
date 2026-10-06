import type { ModelSheetData, CharacterColorSwatch, ModelSectionToggles, ModelGender } from '../types.ts';

export const DEFAULT_SECTION_TOGGLES: ModelSectionToggles = {
    profile: true,
    turnaround: true,
    face: true,
    expressions: true,
    poses: true,
    costume: true,
    palette: true,
    lighting: true,
};

export const SOAIMA_PRESET: ModelSheetData = {
    gender: 'woman',
    characterName: 'Soaima AI',
    role: 'Creator / Model',
    age: '22-26',
    height: "5'10\" (178 cm)",
    bodyType: 'Slim',
    personality: 'Creative, Confident, Kind, Professional, Compassionate',
    distinctiveTraits: 'Beautiful brown eyes, long wavy hair, fair skin, well-defined eyebrows, natural makeup look, elegant posture, warm friendly smile',
    turnaroundViews: ['front', 'three_quarter', 'profile', 'back'],
    activeView: 'all_turnaround',
    facialStructure: 'Oval face shape, high cheekbones, defined jawline, smooth forehead',
    eyes: 'Brown, almond-shaped, natural catchlights, expressive',
    eyebrows: 'Arched, well-defined, natural thickness',
    nose: 'Straight, refined bridge, gentle tip',
    lips: 'Full, natural shape, soft rosy pink tint',
    skinTone: 'Fair porcelain with neutral undertones',
    skinToneHex: '#F8B48E',
    hair: 'Long wavy dark brown hair, soft center part, fluid silk texture',
    hairColorHex: '#3B2A1F',
    makeup: 'Natural foundation, soft peach blush, subtle eye definition, nude pink lip',
    scarsOrMarks: 'None visible',
    activeExpression: 'all_8_emotions',
    expressionDetails: '8 distinct expressions: Neutral, Happy, Angry, Sad, Surprised, Worried, Confident, Determined',
    activePose: 'all_6_poses',
    poseDetails: '6 distinct postures: Neutral Stand, Walking, Sitting, Relaxed, Tense, Action-Ready',
    outfitType: 'One-shoulder asymmetric red ruffle midi dress with elegant side slit',
    topNeckline: 'Asymmetric one-shoulder with cascading sculptural ruffle neckline',
    sleevesOrStraps: 'Single thin strap on left shoulder, ruffle wing on right',
    bottomPiece: 'Midi dress length with high side slit accentuating leg line',
    footwear: 'Red strappy stiletto high-heeled sandals with ankle wrap',
    accessories: 'Delicate gold stud earrings',
    fabricTextures: ['Silk / Satin', 'Chiffon', 'Crepe', 'Lace', 'Leather', 'Suede'],
    colorSwatches: [
        { id: 'c1', label: 'Primary Crimson', hex: '#B31217' },
        { id: 'c2', label: 'Vibrant Scarlet', hex: '#E63946' },
        { id: 'c3', label: 'Coral Accent', hex: '#F08080' },
        { id: 'c4', label: 'Skin Porcelain', hex: '#F8B48E' },
        { id: 'c5', label: 'Deep Burgundy', hex: '#D32F2F' },
        { id: 'c6', label: 'Blush Highlight', hex: '#FFD6D6' }
    ],
    materialReferences: ['Silk / Satin', 'Chiffon', 'Crepe', 'Lace', 'Leather', 'Suede'],
    lighting: 'Natural soft studio lighting with warm diffused rim highlight',
    backgroundSetting: 'Clean minimal textured beige wall and light studio floor',
    renderStyle: 'Photorealistic 8K, Master Studio Character Sheet',
    photographyFraming: 'full_body',
    posePhotoCount: 1,
    outputType: 'full_model_sheet',
    additionalNotes: 'Maintain identical face biometrics, wardrobe continuity, and hair texture across all views and expressions.'
};

export const SOFIA_PRESET: ModelSheetData = {
    gender: 'woman',
    characterName: 'Sofia',
    role: 'Lead Character',
    age: 'Mid 20s',
    height: "5'6\" (168 cm)",
    bodyType: 'Slim / Athletic',
    personality: 'Thoughtful, confident, compassionate, creative, resilient, professional',
    distinctiveTraits: 'Center parted soft waves, signature lock, expressive eyes, elegant red tailored outfit, signature smile',
    turnaroundViews: ['front', 'three_quarter', 'profile', 'back'],
    activeView: 'all_turnaround',
    facialStructure: 'Soft oval contour, gentle feminine jawline, natural brow ridge',
    eyes: 'Light brown expressive eyes (#886F52)',
    eyebrows: 'Defined natural arches',
    nose: 'Delicate straight profile',
    lips: 'Naturally contoured rosy mauve lips (#A67CBB)',
    skinTone: 'Fair complexion with warm undertones (#D6BFAF / #F6CCC8)',
    skinToneHex: '#D6BFAF',
    hair: 'Long, wavy, dark brown (#802A1F), signature face-framing wave',
    hairColorHex: '#802A1F',
    makeup: 'Clean natural makeup look with fresh glow',
    scarsOrMarks: 'None visible',
    activeExpression: 'all_8_emotions',
    expressionDetails: '8 emotions: Neutral, Happy, Angry, Sad, Surprised, Worried, Confident, Determined',
    activePose: 'all_6_poses',
    poseDetails: '6 poses: Neutral Stand, Walking, Sitting, Relaxed, Tense, Action-Ready',
    outfitType: 'Matched vibrant red tailored button-up shirt and straight red trousers',
    topNeckline: 'Spread shirt collar with top button open',
    sleevesOrStraps: 'Long cuffed sleeves slightly gathered at wrists',
    bottomPiece: 'High-waisted tailored straight-leg red trousers with belt loops',
    footwear: 'Crisp white minimalist leather sneakers (for striking visual contrast)',
    accessories: 'Small earrings, delicate flower pendant necklace',
    fabricTextures: ['Cotton Twill', 'Fine Crepe', 'Smooth White Leather', 'Fabric Seam Details'],
    colorSwatches: [
        { id: 'c1', label: 'Red Shirt', hex: '#D32F2F' },
        { id: 'c2', label: 'Red Trouser', hex: '#B71C1C' },
        { id: 'c3', label: 'Vibrant Accent', hex: '#FF0000' },
        { id: 'c4', label: 'Skin Tone', hex: '#D6BFAF' },
        { id: 'c5', label: 'Lip Tone', hex: '#A67CBB' },
        { id: 'c6', label: 'Hair Brown', hex: '#802A1F' },
        { id: 'c7', label: 'Eye Tone', hex: '#886F52' },
        { id: 'c8', label: 'Sneakers White', hex: '#FFFFFF' }
    ],
    materialReferences: ['Crisp Cotton', 'Tailored Crepe', 'White Matte Leather', 'Gold Alloy'],
    lighting: 'Natural, soft, warm sunlight with gentle directional fill',
    backgroundSetting: 'Textured beige wall (neutral background)',
    renderStyle: 'Photorealistic 8K, Production Character Model Sheet',
    outputType: 'full_model_sheet',
    additionalNotes: 'Maintain identity look across all sheets. Exact facial features consistent in all expressions and poses.'
};

export const MALE_MODEL_PRESET: ModelSheetData = {
    gender: 'man',
    characterName: 'Lucas',
    role: 'Creator / Model / Protagonista',
    age: '25-28',
    height: "6'0\" (183 cm)",
    bodyType: 'Athletic / Fit Masculine',
    personality: 'Confiante, carismático, determinado, moderno e sofisticado',
    distinctiveTraits: 'Maxilar bem definido, olhar penetrante, ombros largos e estruturados, postura elegante',
    turnaroundViews: ['front', 'three_quarter', 'profile', 'back'],
    activeView: 'all_turnaround',
    facialStructure: 'Estrutura óssea masculina marcante, mandíbula angular esculpida, maçãs do rosto definidas',
    eyes: 'Olhos castanhos escuros amendoados com olhar focado e confiante',
    eyebrows: 'Sobrancelhas masculinas naturais bem desenhadas',
    nose: 'Nariz reto e estruturado',
    lips: 'Lábios masculinos naturais com formato bem definido',
    skinTone: 'Tom de pele natural bronzeado suave com textura de poros realista',
    skinToneHex: '#E2BA9D',
    hair: 'Cabelo curto texturizado escuro, corte moderno com fade sutil nas têmporas',
    hairColorHex: '#251E1A',
    makeup: 'Pele limpa e natural sem maquiagem',
    facialHair: 'Barba por fazer bem aparada e alinhada (clean masculine stubble)',
    scarsOrMarks: 'Nenhuma marca visível',
    activeExpression: 'all_8_emotions',
    expressionDetails: '8 emoções masculinas: Neutro, Confiante, Focado, Sorriso Leve, Determinado, Sério, etc.',
    activePose: 'all_6_poses',
    poseDetails: '6 posturas masculinas: Postura Firme em Pé, Caminhada Dinâmica, Sentado com Postura, Relaxado, etc.',
    outfitType: 'Jaqueta bomber ou blazer alfaiataria moderno vermelho carmesim sobre camiseta preta e calça chino ajustada',
    topNeckline: 'Gola estruturada de jaqueta/blazer moderno',
    sleevesOrStraps: 'Mangas longas ajustadas com punho bem acabado',
    bottomPiece: 'Calça alfaiataria escura de caimento reto contemporâneo',
    footwear: 'Bota chelsea de couro legítimo ou tênis minimalista premium',
    accessories: 'Relógio analógico minimalista preto e pulseira discreta',
    fabricTextures: ['Lã Fina / Alfaiataria', 'Couro Legítimo', 'Algodão Pima', 'Linho'],
    colorSwatches: [
        { id: 'c1', label: 'Carmesim Traje', hex: '#8B1E1E' },
        { id: 'c2', label: 'Preto Grafite', hex: '#1C1C1E' },
        { id: 'c3', label: 'Tom de Pele', hex: '#E2BA9D' },
        { id: 'c4', label: 'Tom de Cabelo', hex: '#251E1A' }
    ],
    materialReferences: ['Couro', 'Lã Fria', 'Algodão Nobre'],
    lighting: 'Iluminação de estúdio direcional cinematográfica com luz de recorte suave',
    backgroundSetting: 'Fundo neutro cinza ardósia ou estúdio minimalista',
    renderStyle: 'Fotorealista 8K, Master Studio Male Character Sheet',
    outputType: 'full_model_sheet',
    additionalNotes: 'Manter proporções masculinas atléticas, estrutura óssea facial consistente em todas as vistas e poses.'
};

export const MALE_CASUAL_PRESET: ModelSheetData = {
    gender: 'man',
    characterName: 'Alex',
    role: 'Creator / Fotógrafo / Casual',
    age: '24-27',
    height: "6'1\" (185 cm)",
    bodyType: 'Athletic / Lean Masculine',
    personality: 'Espontâneo, criativo, amigável, autêntico e focado',
    distinctiveTraits: 'Corte fade moderno texturizado, olhar expressivo com sobrancelhas marcantes, postura relaxada',
    turnaroundViews: ['front', 'three_quarter', 'profile', 'back'],
    activeView: 'all_turnaround',
    facialStructure: 'Rosto angular com mandíbula esculpida, maçãs do rosto definidas',
    eyes: 'Olhos castanhos profundos amendoados com brilho natural',
    eyebrows: 'Sobrancelhas masculinas densas bem alinhadas',
    nose: 'Nariz reto e estruturado',
    lips: 'Lábios masculinos naturais bem delineados',
    skinTone: 'Tom de pele claro acetinado com subtom neutro e poros reais',
    skinToneHex: '#E8BEA2',
    hair: 'Cabelo curto texturizado castanho escuro com leve volume superior e degradê nas têmporas',
    hairColorHex: '#2C221E',
    makeup: 'Sem maquiagem, pele limpa com textura autêntica',
    facialHair: 'Barba por fazer curta e uniforme (5 o\'clock shadow)',
    scarsOrMarks: 'Pequena sarda sutil na bochecha esquerda',
    activeExpression: 'all_8_emotions',
    expressionDetails: '8 emoções masculinas: Neutro, Sorriso Autêntico, Concentrado, Sério, etc.',
    activePose: 'all_6_poses',
    poseDetails: '6 posturas masculinas: Postura Relaxada, Caminhada Casual, Sentado com Apoio, etc.',
    outfitType: 'Camisa de linho puro desabotoada na gola sobre camiseta básica branca e calça chino bege',
    topNeckline: 'Gola padre ou colarinho de linho aberto casual',
    sleevesOrStraps: 'Mangas longas dobradas casualmente nos antebraços',
    bottomPiece: 'Calça chino slim fit cáqui/bege com barra impecável',
    footwear: 'Tênis de couro branco minimalista com sola plana',
    accessories: 'Relógio analógico de aço com pulseira de couro marrom',
    fabricTextures: ['Linho Puro', 'Algodão Pima', 'Couro Legítimo', 'Sarja Chino'],
    colorSwatches: [
        { id: 'c1', label: 'Bege Linho', hex: '#D8C7B5' },
        { id: 'c2', label: 'Branco Puro', hex: '#FFFFFF' },
        { id: 'c3', label: 'Tom de Pele', hex: '#E8BEA2' },
        { id: 'c4', label: 'Cabelo Castanho', hex: '#2C221E' },
        { id: 'c5', label: 'Chino Cáqui', hex: '#B89B72' }
    ],
    materialReferences: ['Linho Natural', 'Algodão Pima', 'Couro Fosco'],
    lighting: 'Luz natural de janela suave da manhã com preenchimento dourado',
    backgroundSetting: 'Estúdio contemporâneo com piso de madeira clara e parede neutra',
    renderStyle: 'Fotorealista 8K, Master Studio Character Sheet',
    outputType: 'full_model_sheet',
    additionalNotes: 'Manter consistência biométrica masculina e corte de cabelo em todos os ângulos.'
};

export const MALE_BUSINESS_PRESET: ModelSheetData = {
    gender: 'man',
    characterName: 'Gabriel',
    role: 'Executivo / Diretor Criativo / Editorial',
    age: '28-32',
    height: "6'2\" (188 cm)",
    bodyType: 'Tall / Athletic Tailored',
    personality: 'Líder, sofisticado, analítico, imponente e cortês',
    distinctiveTraits: 'Olhar penetrante, queixo imponente e trajes de alfaiataria impecáveis sob medida',
    turnaroundViews: ['front', 'three_quarter', 'profile', 'back'],
    activeView: 'all_turnaround',
    facialStructure: 'Linha de mandíbula quadrada e definida, maçãs do rosto proeminentes',
    eyes: 'Olhos castanhos amendoados com olhar focado e confiante',
    eyebrows: 'Sobrancelhas escuras bem aparadas',
    nose: 'Nariz afilado clássico',
    lips: 'Lábios masculinos naturais bem definidos',
    skinTone: 'Tom de pele moreno claro saudável',
    skinToneHex: '#D5A47C',
    hair: 'Cabelo preto penteado para trás com cera matte (slick back contemporâneo)',
    hairColorHex: '#1A1817',
    makeup: 'Pele impecável com acabamento natural mate',
    facialHair: 'Barba alinhada com linhas de navalha precisas (sharp tailored beard)',
    scarsOrMarks: 'Nenhuma marca visível',
    activeExpression: 'all_8_emotions',
    expressionDetails: '8 emoções: Confiante, Neutro Executivo, Persuasivo, Focado, etc.',
    activePose: 'all_6_poses',
    poseDetails: '6 posturas: Em Pé com Mãos no Bolso, Caminhada Firme, Sentado em Poltrona de Couro, etc.',
    outfitType: 'Costume de alfaiataria slim azul marinho meia-noite sobre camisa branca colarinho italiano',
    topNeckline: 'Colarinho italiano estruturado com gravata de seda fina',
    sleevesOrStraps: 'Mangas de paletó sob medida com 1 cm da camisa aparecendo',
    bottomPiece: 'Calça de alfaiataria azul marinho com vinco perfeito',
    footwear: 'Sapatos Oxford de couro preto polido',
    accessories: 'Relógio cronógrafo suíço e abotoaduras de prata',
    fabricTextures: ['Lã Fria Super 150s', 'Seda Pura', 'Algodão Egípcio', 'Couro Polido'],
    colorSwatches: [
        { id: 'c1', label: 'Azul Meia-Noite', hex: '#1B263B' },
        { id: 'c2', label: 'Camisa Branca', hex: '#F8F9FA' },
        { id: 'c3', label: 'Preto Oxford', hex: '#0D1117' },
        { id: 'c4', label: 'Tom de Pele', hex: '#D5A47C' }
    ],
    materialReferences: ['Lã Fria Nobre', 'Couro Italiano', 'Prata 925'],
    lighting: 'Iluminação editorial dramática de estúdio estilo capa de revista GQ',
    backgroundSetting: 'Fundo estúdio cinza escuro degradê com iluminação pontual',
    renderStyle: 'Fotorealista 8K, Editorial Fashion Model Sheet',
    outputType: 'full_model_sheet',
    additionalNotes: 'Preservar corte de alfaiataria e fidelidade biométrica estrita em todas as vistas.'
};

export const FEMALE_CASUAL_PRESET: ModelSheetData = {
    gender: 'woman',
    characterName: 'Clara',
    role: 'Designer / Fotógrafa / Urbana',
    age: '23-26',
    height: "5'7\" (170 cm)",
    bodyType: 'Slim Natural',
    personality: 'Criativa, moderna, vibrante, autêntica e expressiva',
    distinctiveTraits: 'Cabelo ondulado na altura dos ombros, olhar curioso e estilo urbano refinado',
    turnaroundViews: ['front', 'three_quarter', 'profile', 'back'],
    activeView: 'all_turnaround',
    facialStructure: 'Rosto delicado com maxilar suave e maçãs do rosto destacadas',
    eyes: 'Olhos castanhos mel claros e expressivos',
    eyebrows: 'Sobrancelhas naturais preenchidas suavemente',
    nose: 'Nariz fino e arrebitado',
    lips: 'Lábios médios com hidratante labial rosado sutil',
    skinTone: 'Tom de pele claro acetinado com bochechas levemente coradas',
    skinToneHex: '#F6CCC8',
    hair: 'Cabelo castanho iluminado na altura dos ombros com ondas praianas',
    hairColorHex: '#4A3326',
    makeup: 'Maquiagem clean girl: pele iluminada, máscara de cílios e lábio hidratado',
    facialHair: 'Nenhum',
    scarsOrMarks: 'Sardas discretas sobre o septo nasal',
    activeExpression: 'all_8_emotions',
    expressionDetails: '8 emoções: Neutra, Feliz, Sorridente, Inspirada, Determinada, etc.',
    activePose: 'all_6_poses',
    poseDetails: '6 posturas: Em Pé Casual, Passo Dinâmico, Sentada Confortável, etc.',
    outfitType: 'Blazer oversized bege sobre regata de seda preta e calça jeans reta vintage',
    topNeckline: 'Decote reto minimalista',
    sleevesOrStraps: 'Mangas do blazer puxadas até o antebraço',
    bottomPiece: 'Calça jeans azul clara vintage de cintura alta e caimento reto',
    footwear: 'Mocassim de couro preto ou tênis retrô minimalista',
    accessories: 'Colar de corrente dourada fina e brincos de argola pequenos',
    fabricTextures: ['Linho Encorpado', 'Seda Pura', 'Denim Vintage 100% Algodão', 'Couro'],
    colorSwatches: [
        { id: 'c1', label: 'Bege Blazer', hex: '#D7C4B0' },
        { id: 'c2', label: 'Jeans Azul', hex: '#6C8EA4' },
        { id: 'c3', label: 'Top Preto', hex: '#1A1A1A' },
        { id: 'c4', label: 'Pele Porcelana', hex: '#F6CCC8' }
    ],
    materialReferences: ['Linho', 'Denim Vintage', 'Seda'],
    lighting: 'Luz suave de dia nublado difusa estilo lookbook escandinavo',
    backgroundSetting: 'Estúdio contemporâneo com fundo branco quente texturizado',
    renderStyle: 'Fotorealista 8K, Master Studio Female Character Sheet',
    outputType: 'full_model_sheet',
    additionalNotes: 'Manter naturalidade das texturas de pele e proporções consistentes.'
};

export const DEFAULT_MODEL_SHEET: ModelSheetData = {
    gender: 'woman',
    characterName: 'Aura',
    role: 'Protagonista / Modelo',
    age: '23-25',
    height: "175 cm",
    bodyType: 'Slim / Elegante',
    personality: 'Carismática, confiante, sofisticada e expressiva',
    distinctiveTraits: 'Olhos expressivos, cabelo longo em ondas suaves, traços simétricos e sorriso marcante',
    turnaroundViews: ['front', 'three_quarter', 'profile', 'back'],
    activeView: 'all_turnaround',
    facialStructure: 'Rosto oval simétrico, maçãs do rosto definidas, linha de mandíbula suave',
    eyes: 'Olhos castanhos amendoados com brilho e reflexo de estúdio',
    eyebrows: 'Sobrancelhas arqueadas e bem desenhadas',
    nose: 'Nariz fino e reto',
    lips: 'Lábios desenhados com tom pêssego suave',
    skinTone: 'Pele clara acetinada com subtom neutro',
    skinToneHex: '#F6CCC8',
    hair: 'Cabelo longo ondulado castanho escuro com divisão central fluida',
    hairColorHex: '#3B2A1F',
    makeup: 'Maquiagem natural glow com contorno suave e iluminador discreto',
    facialHair: 'Nenhum',
    scarsOrMarks: 'Nenhuma cicatriz visível',
    activeExpression: 'all_8_emotions',
    expressionDetails: '8 emoções: Neutra, Feliz, Zangada, Triste, Surpresa, Preocupada, Confiante, Determinada',
    activePose: 'all_6_poses',
    poseDetails: '6 poses: Em Pé Neutro, Caminhando, Sentada, Relaxada, Tensa, Pronta para Ação',
    outfitType: 'Vestido vermelho contemporâneo de alta costura com corte fluido',
    topNeckline: 'Decote assimétrico moderno com drapeado',
    sleevesOrStraps: 'Alça fina com detalhe fluido',
    bottomPiece: 'Comprimento midi com fenda lateral sutil',
    footwear: 'Sandália de salto fino delicada',
    accessories: 'Brincos pequenos dourados discretos',
    fabricTextures: ['Seda / Cetim', 'Chiffon', 'Crepe', 'Linho'],
    colorSwatches: [
        { id: 'c1', label: 'Vermelho Principal', hex: '#B31217' },
        { id: 'c2', label: 'Vermelho Destaque', hex: '#E63946' },
        { id: 'c3', label: 'Tom de Pele', hex: '#F6CCC8' },
        { id: 'c4', label: 'Tom de Cabelo', hex: '#3B2A1F' }
    ],
    materialReferences: ['Seda', 'Chiffon', 'Crepe'],
    lighting: 'Iluminação suave de estúdio com preenchimento quente',
    backgroundSetting: 'Fundo neutro bege minimalista de estúdio',
    renderStyle: 'Fotorealista 8K, Master Studio Portrait',
    photographyFraming: 'full_body',
    posePhotoCount: 1,
    outputType: 'full_model_sheet',
    additionalNotes: 'Manter rigorosa consistência de identidade facial, anatômica e de vestuário.',
    sectionToggles: DEFAULT_SECTION_TOGGLES
};

export const KID_BOY_PRESET: ModelSheetData = {
    gender: 'boy',
    ageCategory: 'child',
    characterName: 'Lucas (Criança)',
    role: 'Aventureiro Infantil / Protagonista Kids',
    age: '8 anos (8 years old)',
    height: "4'2\" (128 cm)",
    bodyType: 'Infantil Natural / Criança Saudável',
    personality: 'Curioso, brincalhão, corajoso, enérgico, imaginativo e expressivo',
    distinctiveTraits: 'Olhos grandes castanhos brilhantes, bochechas coradas, cabelo infantil despenteado com mechas suaves, sorriso genuíno',
    turnaroundViews: ['front', 'three_quarter', 'profile', 'back'],
    activeView: 'all_turnaround',
    facialStructure: 'Rosto infantil arredondado com traços suaves, bochechas cheias naturais, queixo delicado de menino de 8 anos',
    eyes: 'Olhos castanhos escuros grandes e expressivos (#3A271D), olhar curioso vívido',
    eyebrows: 'Sobrancelhas infantis finas e suaves em arco natural',
    nose: 'Nariz pequeno e levemente arrebitado característico de criança',
    lips: 'Lábios infantis rosados suaves com formato natural relaxado (#E89B9B)',
    skinTone: 'Tom de pele claro acetinado com bochechas suavemente rosadas e textura pura',
    skinToneHex: '#F6CEB4',
    hair: 'Cabelo curto castanho médio ligeiramente despenteado com franja infantil (#4A3326)',
    hairColorHex: '#4A3326',
    makeup: 'Sem maquiagem, pele infantil limpa e natural',
    facialHair: 'Nenhum (criança)',
    scarsOrMarks: 'Pequeno curativo colorido no cotovelo (detalhe lúdico de infância)',
    activeExpression: 'all_8_emotions',
    expressionDetails: '8 expressões infantis espontâneas: Curioso, Risada Alegre, Beicinho, Olhos Arregalados de Surpresa, Determinado Heróico, etc.',
    activePose: 'all_6_poses',
    poseDetails: '6 posturas infantis dinâmicas: Postura Curiosa, Correndo/Caminhando Alegre, Sentado de Pernas Cruzadas, Pulando de Alegria, etc.',
    outfitType: 'Jaqueta corta-vento infantil azul e amarela com zíper, camiseta de algodão com estampa lúdica e bermuda jeans com elástico',
    topNeckline: 'Gola alta com zíper macio de jaqueta infantil',
    sleevesOrStraps: 'Mangas compridas com punhos de elástico canelado confortável',
    bottomPiece: 'Bermuda jeans infantil confortável com bolsos e costuras reforçadas',
    footwear: 'Tênis infantil esportivo com velcro e solado de borracha flexível',
    accessories: 'Mochilinha infantil de aventuras e pulseirinha de cordão',
    fabricTextures: ['Algodão Pima Suave', 'Nylon Corta-vento Leve', 'Jeans Denim Macio Infantil'],
    colorSwatches: [
        { id: 'c1', label: 'Azul Aventura', hex: '#1E88E5' },
        { id: 'c2', label: 'Amarelo Sol', hex: '#FDD835' },
        { id: 'c3', label: 'Jeans Índigo', hex: '#3949AB' },
        { id: 'c4', label: 'Pele Infantil', hex: '#F6CEB4' }
    ],
    materialReferences: ['Algodão Hipoalergênico', 'Nylon Respirável', 'Borracha Macia'],
    lighting: 'Luz natural diurna suave de estúdio com brilho solar quente e difuso',
    backgroundSetting: 'Fundo neutro minimalista de estúdio fotográfico infantil',
    renderStyle: 'Fotorealista 8K, Master Studio Kid Character Sheet, proporções anatômicas infantis perfeitas',
    outputType: 'full_model_sheet',
    additionalNotes: 'Proporções anatômicas rigorosamente infantis de 8 anos (cabeça proporcionalmente maior em relação ao tronco, membros ágeis). Manter identidade facial idêntica em todas as vistas.',
    sectionToggles: DEFAULT_SECTION_TOGGLES
};

export const KID_GIRL_PRESET: ModelSheetData = {
    gender: 'girl',
    ageCategory: 'child',
    characterName: 'Maya (Criança)',
    role: 'Protagonista Infantil / Exploradora Criativa',
    age: '7 anos (7 years old)',
    height: "3'11\" (120 cm)",
    bodyType: 'Infantil Delicada / Criança Saudável',
    personality: 'Alegre, sonhadora, carinhosa, espontânea, criativa e expressiva',
    distinctiveTraits: 'Olhos castanho-claros luminosos, maria-chiquinha com lacinhos coloridos, sorriso doce com covinhas',
    turnaroundViews: ['front', 'three_quarter', 'profile', 'back'],
    activeView: 'all_turnaround',
    facialStructure: 'Rosto infantil suavemente arredondado, bochechas maçãs rosadas, feições doces e delicadas de menina de 7 anos',
    eyes: 'Olhos amendoados castanho-claros mel (#795548) com brilho cintilante',
    eyebrows: 'Sobrancelhas infantis finas e suaves',
    nose: 'Nariz delicado e pequeno de criança',
    lips: 'Lábios naturalmente rosados (#F48FB1)',
    skinTone: 'Tom de pele acetinado suave com textura aveludada e bochechas coradas',
    skinToneHex: '#FAD4C0',
    hair: 'Cabelo castanho com duas marias-chiquinhas onduladas e lacinhos de fita (#5D4037)',
    hairColorHex: '#5D4037',
    makeup: 'Sem maquiagem, pele de criança 100% natural',
    facialHair: 'Nenhum',
    scarsOrMarks: 'Nenhuma marca visível',
    activeExpression: 'all_8_emotions',
    expressionDetails: '8 emoções infantis doces: Sorriso Radiante, Olhar Curioso, Gargalhada, Beicinho Engraçado, Pensativa, etc.',
    activePose: 'all_6_poses',
    poseDetails: '6 posturas infantis espontâneas: Em Pé Sorrindo, Girando o Vestido, Sentada Abraçando os Joelhos, Dando Passinho Leve, etc.',
    outfitType: 'Vestido infantil evasê de algodão estampado com flores delicadas sobre camiseta básica e meia-calça suave',
    topNeckline: 'Decote redondo infantil suave com acabamento de viés',
    sleevesOrStraps: 'Mangas curtas bufantes delicadas',
    bottomPiece: 'Saia rodada infantil confortável na altura do joelho',
    footwear: 'Sapatilhas infantis vermelhas ou tênis cano médio macio',
    accessories: 'Lacinhos de cabelo de fita de gorgurão e bolsinha tiracolo lúdica',
    fabricTextures: ['Algodão Percal Macio', 'Tule Suave', 'Lona Macia de Calçado'],
    colorSwatches: [
        { id: 'c1', label: 'Rosa Primavera', hex: '#F06292' },
        { id: 'c2', label: 'Vermelho Lacinho', hex: '#E53935' },
        { id: 'c3', label: 'Creme Baunilha', hex: '#FFF9C4' },
        { id: 'c4', label: 'Pele Delicada', hex: '#FAD4C0' }
    ],
    materialReferences: ['Algodão 100% Orgânico', 'Fita de Cetim', 'Couro Macio Infantil'],
    lighting: 'Luz de estúdio quente, difusa e acolhedora com iluminação suave nos olhos',
    backgroundSetting: 'Fundo neutro suave pastel ou cinza claro minimalista',
    renderStyle: 'Fotorealista 8K, Master Studio Child Character Sheet, proporções anatômicas infantis perfeitas',
    outputType: 'full_model_sheet',
    additionalNotes: 'Proporções infantis genuínas de 7 anos. Preservar rigorosamente a inocência, espontaneidade e traços faciais consistentes.',
    sectionToggles: DEFAULT_SECTION_TOGGLES
};

export const TEEN_BOY_PRESET: ModelSheetData = {
    gender: 'teen_boy',
    ageCategory: 'teen',
    characterName: 'Theo (Adolescente)',
    role: 'Estudante / Creator Jovem / Teen Protagonista',
    age: '15 anos (15 years old)',
    height: "5'8\" (173 cm)",
    bodyType: 'Adolescente Longilíneo / Slim Teen',
    personality: 'Esperto, criativo, conectado, descolado, perspicaz e autêntico',
    distinctiveTraits: 'Cabelo moderno texturizado com franja desfiada, postura descontraída de adolescente, olhar confiante e antenado',
    turnaroundViews: ['front', 'three_quarter', 'profile', 'back'],
    activeView: 'all_turnaround',
    facialStructure: 'Rosto jovem em transição para a maturidade, mandíbula levemente definida, maçãs do rosto suaves',
    eyes: 'Olhos castanhos escuros expressivos (#2D1E16) com olhar inteligente',
    eyebrows: 'Sobrancelhas naturais juvenis bem delineadas',
    nose: 'Nariz reto juvenil bem proporcionado',
    lips: 'Lábios naturais juvenis com desenho definido',
    skinTone: 'Tom de pele jovem saudável com textura natural e poros autênticos',
    skinToneHex: '#E5B99A',
    hair: 'Corte moderno juvenil texturizado com camadas e leve franja messy (#221814)',
    hairColorHex: '#221814',
    makeup: 'Sem maquiagem, pele jovem limpa e natural',
    facialHair: 'Nenhum (penugem imperceptível natural de adolescente)',
    scarsOrMarks: 'Nenhuma marca visível',
    activeExpression: 'all_8_emotions',
    expressionDetails: '8 expressões de adolescente: Descolado, Sorriso Espontâneo, Concentrado no Celular/Game, Pensativo, Determinado, etc.',
    activePose: 'all_6_poses',
    poseDetails: '6 posturas de jovem contemporâneo: Postura Relaxada com Mãos nos Bolsos, Caminhada Dinâmica, Sentado com Perfil Casual, etc.',
    outfitType: 'Moletom oversized streetwear com capuz cinza-mescla e jaqueta bomber aberta sobre calça cargo utilitária preta',
    topNeckline: 'Capuz estruturado e gola redonda de camiseta por baixo',
    sleevesOrStraps: 'Mangas compridas com punhos canelados caídos sobre o pulso',
    bottomPiece: 'Calça cargo juvenil preta com bolsos utilitários nas laterais',
    footwear: 'Sneakers modernos de cano alto estilo skate / basquete com cadarços brancos',
    accessories: 'Fones de ouvido bluetooth no pescoço e relógio digital moderno',
    fabricTextures: ['Moletom Algodão Pesado', 'Ripstop Sarja', 'Couro e Borracha Sneaker'],
    colorSwatches: [
        { id: 'c1', label: 'Cinza Mescla Moletom', hex: '#6B7280' },
        { id: 'c2', label: 'Preto Grafite Cargo', hex: '#111827' },
        { id: 'c3', label: 'Branco Sneaker', hex: '#F9FAFB' },
        { id: 'c4', label: 'Pele Jovem', hex: '#E5B99A' }
    ],
    materialReferences: ['French Terry Algodão', 'Nylon Cargo', 'Camurça Sintética'],
    lighting: 'Luz de estúdio contemporânea com leve contraste cinematográfico urbano',
    backgroundSetting: 'Fundo cinza urbano minimalista de estúdio fotográfico',
    renderStyle: 'Fotorealista 8K, Master Studio Teen Character Sheet, estética realista de 15 anos',
    outputType: 'full_model_sheet',
    additionalNotes: 'Proporções corporais autênticas de adolescente de 15 anos (estrutura esguia, mãos e pés ligeiramente maiores, transição juvenil).',
    sectionToggles: DEFAULT_SECTION_TOGGLES
};

export const TEEN_GIRL_PRESET: ModelSheetData = {
    gender: 'teen_girl',
    ageCategory: 'teen',
    characterName: 'Clara (Adolescente)',
    role: 'Estudante de Artes / Influencer Jovem / Teen Heroína',
    age: '16 anos (16 years old)',
    height: "5'5\" (165 cm)",
    bodyType: 'Jovem Delicada / Slim Teen Feminina',
    personality: 'Carismática, artística, antenada, expressiva, empática e estilosa',
    distinctiveTraits: 'Cabelo longo em camadas com franja cortina (curtain bangs), olhar brilhante e expressivo, estilo estético contemporâneo (aesthetic Gen-Z)',
    turnaroundViews: ['front', 'three_quarter', 'profile', 'back'],
    activeView: 'all_turnaround',
    facialStructure: 'Contorno oval suave juvenil, mandíbula delicada, traços harmoniosos e expressivos de adolescente de 16 anos',
    eyes: 'Olhos amendoados castanho-esverdeados ou avelã com brilho cintilante (#5D4037)',
    eyebrows: 'Sobrancelhas naturais bem penteadas e definidas',
    nose: 'Nariz pequeno e proporcional juvenil',
    lips: 'Lábios naturais rosados com leve brilho hidratante (#D8829D)',
    skinTone: 'Tom de pele claro iluminado natural com textura pura de jovem',
    skinToneHex: '#F3C5B0',
    hair: 'Cabelo longo castanho com mechas suaves em corte butterfly/camadas e franja cortina (#3E2723)',
    hairColorHex: '#3E2723',
    makeup: 'Maquiagem juvenil minimalista e natural (lip tint suave e máscara de cílios leve)',
    facialHair: 'Nenhum',
    scarsOrMarks: 'Sardas sutis sobre o dorso do nariz',
    activeExpression: 'all_8_emotions',
    expressionDetails: '8 emoções juvenis autênticas: Sorriso Encantador, Pensativa, Confiante, Gargalhada Espontânea, Determinada, etc.',
    activePose: 'all_6_poses',
    poseDetails: '6 posturas dinâmicas de jovem: Em Pé com Postura Fashion Casual, Caminhada Leve, Sentada com Perna Dobrada, etc.',
    outfitType: 'Cardigan de tricô cropped macio lilás/pastel sobre top básico branco, calça jeans wide-leg de cintura alta e cinto fino',
    topNeckline: 'Decote em V suave com botões vintage no cardigan',
    sleevesOrStraps: 'Mangas longas macias levemente caídas sobre as mãos',
    bottomPiece: 'Calça jeans wide-leg azul clara de corte reto contemporâneo',
    footwear: 'Tênis casual branco estilo retrô com solado plataforma baixo',
    accessories: 'Colarzinho de corrente fina com pingente delicado e anéis finos de prata',
    fabricTextures: ['Tricô de Algodão Macio', 'Denim Jeans Claro Vintage', 'Couro Branco Limpo'],
    colorSwatches: [
        { id: 'c1', label: 'Lilás Pastel Cardigan', hex: '#CE93D8' },
        { id: 'c2', label: 'Jeans Azul Vintage', hex: '#64B5F6' },
        { id: 'c3', label: 'Branco Puro Top', hex: '#FFFFFF' },
        { id: 'c4', label: 'Pele Jovem Clara', hex: '#F3C5B0' }
    ],
    materialReferences: ['Tricô Penteado', 'Jeans 100% Algodão', 'Prata 925'],
    lighting: 'Luz suave de estúdio com golden hour suave e iluminação natural de beleza',
    backgroundSetting: 'Fundo estúdio minimalista em tons neutros claros',
    renderStyle: 'Fotorealista 8K, Master Studio Teen Character Sheet, estética contemporânea realista de 16 anos',
    outputType: 'full_model_sheet',
    additionalNotes: 'Proporções anatômicas exatas de jovem de 16 anos. Manter continuidade perfeita dos traços faciais, cabelo e figurino.',
    sectionToggles: DEFAULT_SECTION_TOGGLES
};

/**
 * Calls server-side Gemini vision to extract structured model sheet data from an uploaded image.
 */
export async function extractModelSheetFromImage(imageBase64: string, mimeType: string = 'image/jpeg'): Promise<Partial<ModelSheetData>> {
    const res = await fetch('/api/gemini/extract-model-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mimeType })
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Falha na análise da ficha de modelo' }));
        throw new Error(err.error || `Erro HTTP ${res.status}`);
    }

    return await res.json();
}

export interface ExtractedWardrobeData {
    outfitType: string;
    topNeckline: string;
    sleevesOrStraps: string;
    bottomPiece: string;
    footwear: string;
    accessories: string;
    fabricTextures: string[];
    colorSwatches: CharacterColorSwatch[];
    materialReferences: string[];
    clothingStyle?: string;
    wardrobeSummary?: string;
}

/**
 * Extrai dados detalhados de vestuário e styling com IA a partir de imagem de referência de roupa.
 */
export async function extractWardrobeFromImage(
    imageBase64: string,
    mimeType: string = 'image/jpeg',
    role: string = 'full_outfit',
    characterGender?: 'woman' | 'man',
    userInstructions?: string
): Promise<ExtractedWardrobeData> {
    const res = await fetch('/api/gemini/extract-wardrobe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            imageBase64,
            mimeType,
            role,
            characterGender,
            userInstructions
        })
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Falha na análise do vestuário' }));
        throw new Error(err.error || `Erro HTTP ${res.status}`);
    }

    return await res.json();
}

/**
 * Análise Combinada: Extrai biometria e traços do Modelo (Imagem 1) e corte/tecidos/cores do Vestuário (Imagem 2)
 */
export async function extractModelWithWardrobe(
    modelImage?: { base64: string; mimeType: string },
    wardrobeImage?: { base64: string; mimeType: string },
    characterGender?: 'woman' | 'man',
    userInstructions?: string
): Promise<Partial<ModelSheetData>> {
    const res = await fetch('/api/gemini/extract-model-with-wardrobe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            modelImage: modelImage ? { data: modelImage.base64, mimeType: modelImage.mimeType } : undefined,
            wardrobeImage: wardrobeImage ? { data: wardrobeImage.base64, mimeType: wardrobeImage.mimeType } : undefined,
            characterGender,
            userInstructions
        })
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Falha ao processar modelo e vestuário' }));
        throw new Error(err.error || `Erro HTTP ${res.status}`);
    }

    return await res.json();
}

export interface WardrobePresetItem {
    id: string;
    name: string;
    genderTarget: 'woman' | 'man' | 'unisex';
    category: string;
    outfitType: string;
    topNeckline: string;
    sleevesOrStraps: string;
    bottomPiece: string;
    footwear: string;
    accessories: string;
    fabricTextures: string[];
    colorSwatches: CharacterColorSwatch[];
    materialReferences: string[];
    description: string;
}

export const WARDROBE_PRESETS: WardrobePresetItem[] = [
    {
        id: 'couture_red_dress',
        name: 'Vestido Vermelho Alta Costura',
        genderTarget: 'woman',
        category: 'Alta Costura / Red Carpet',
        outfitType: 'Vestido midi vermelho assimétrico com drapeado escultural e fenda lateral elegante',
        topNeckline: 'Decote de ombro único com babado escultural fluido',
        sleevesOrStraps: 'Alça fina à esquerda e asa de babado em cascata à direita',
        bottomPiece: 'Saia midi ajustada com fenda lateral sutil e caimento refinado',
        footwear: 'Sandália de salto agulha fina vermelha com tiras no tornozelo',
        accessories: 'Brincos delicados de ouro amarelo e anel solitário',
        fabricTextures: ['Seda Pura / Cetim Duchesse', 'Chiffon Fluido', 'Crepe de Seda'],
        colorSwatches: [
            { id: 'wp1', label: 'Vermelho Carmesim', hex: '#B31217' },
            { id: 'wp2', label: 'Escarlate Vibrante', hex: '#E63946' },
            { id: 'wp3', label: 'Vinho Profundo', hex: '#660708' }
        ],
        materialReferences: ['Seda Acetinada', 'Chiffon Translúcido', 'Ouro Polido'],
        description: 'Look de alta costura com caimento escultural e vermelho vibrante (referência clássica).'
    },
    {
        id: 'red_shirt_tailored',
        name: 'Conjunto Camisa & Calça Alfaiataria',
        genderTarget: 'woman',
        category: 'Editorial / Smart Casual',
        outfitType: 'Camisa de alfaiataria vermelha vibrante e calça reta com tênis branco minimalista',
        topNeckline: 'Colarinho francês estruturado com primeiro botão aberto',
        sleevesOrStraps: 'Mangas compridas com punhos estruturados suavemente puxados',
        bottomPiece: 'Calça de alfaiataria vermelha de cintura alta com vinco frontal',
        footwear: 'Tênis de couro branco minimalista com sola limpa',
        accessories: 'Gargantilha com pingente delicado de flor e brincos ponto de luz',
        fabricTextures: ['Twill de Algodão Nobre', 'Crepe Alfaiataria', 'Couro Fosco Branco'],
        colorSwatches: [
            { id: 'wp4', label: 'Vermelho Camisa', hex: '#D32F2F' },
            { id: 'wp5', label: 'Vermelho Calça', hex: '#B71C1C' },
            { id: 'wp6', label: 'Branco Puro Tênis', hex: '#FFFFFF' }
        ],
        materialReferences: ['Algodão Pima', 'Alfaiataria Crepe', 'Couro Bovino Liso'],
        description: 'Conjunto monocromático contemporâneo com contraste marcante de tênis branco (estilo Sofia).'
    },
    {
        id: 'male_bomber_tailored',
        name: 'Jaqueta Bomber Carmesim & Alfaiataria',
        genderTarget: 'man',
        category: 'Editorial Masculino',
        outfitType: 'Jaqueta bomber carmesim acetinada com camiseta gola redonda preta e calça de alfaiataria grafite',
        topNeckline: 'Gola bomber canelada clássica com fecho de zíper frontal metálico',
        sleevesOrStraps: 'Mangas longas com punhos elásticos canelados',
        bottomPiece: 'Calça slim-fit de alfaiataria cinza-grafite com caimento sob medida',
        footwear: 'Botas Chelsea de couro preto polido',
        accessories: 'Relógio esportivo minimalista com pulseira de aço escovado',
        fabricTextures: ['Cetim Técnico Pesado', 'Algodão Mercerizado', 'Lã Fria Alfaiataria', 'Couro Preto'],
        colorSwatches: [
            { id: 'wp7', label: 'Carmesim Jaqueta', hex: '#8B0000' },
            { id: 'wp8', label: 'Preto Profundo', hex: '#111111' },
            { id: 'wp9', label: 'Cinza Grafite', hex: '#2B2D42' },
            { id: 'wp10', label: 'Aço Escovado', hex: '#D1D5DB' }
        ],
        materialReferences: ['Cetim Fosco', 'Lã Tropical', 'Couro Nappa'],
        description: 'Equilíbrio arrojado entre streetwear refinado e alfaiataria de luxo para homens.'
    },
    {
        id: 'cyberpunk_techwear',
        name: 'Cyberpunk Techwear Tático',
        genderTarget: 'unisex',
        category: 'Sci-Fi / Techwear',
        outfitType: 'Capa / Jaqueta impermeável tática preta com fitas magnéticas, detalhes em néon e calça cargo modular',
        topNeckline: 'Gola alta assimétrica com capuz ergonômico embutido e zíper selado',
        sleevesOrStraps: 'Mangas articuladas com bolsos táticos e costuras reflexivas 3M',
        bottomPiece: 'Calça cargo techwear preta com bolsos utilitários e fitas de ajuste',
        footwear: 'Coturnos táticos futuristas com sola tratorada e amortecimento visível',
        accessories: 'Cinto tático cobra buckle, mosquetões de titânio e luvas sem dedos',
        fabricTextures: ['Cordura Impermeável', 'Gore-Tex', 'Fita de Nylon Balístico', 'Neoprene'],
        colorSwatches: [
            { id: 'wp11', label: 'Preto Carbono', hex: '#0D0D0D' },
            { id: 'wp12', label: 'Cinza Militar', hex: '#374151' },
            { id: 'wp13', label: 'Cyan Cibernético', hex: '#00F5D4' }
        ],
        materialReferences: ['Nylon Balístico', 'Membrana Gore-Tex', 'Fivelas Alumínio Aeronáutico'],
        description: 'Visual techwear de alta densidade técnica com silhueta urbana futurista.'
    },
    {
        id: 'italian_suit_slim',
        name: 'Terno Slim Alfaiataria Italiana',
        genderTarget: 'man',
        category: 'Business Executivo',
        outfitType: 'Terno slim-fit de corte italiano azul marinho acetinado com camisa branca de gola italiana e gravata de seda',
        topNeckline: 'Lapela notch de 7cm com corte sob medida e pesponto impecável',
        sleevesOrStraps: 'Mangas estruturadas com 4 botões de madrepérola funcionais',
        bottomPiece: 'Calça de alfaiataria slim sem pregas com bainha precisa sobre o sapato',
        footwear: 'Sapatos Oxford de couro legítimo marrom conhaque com bico amendoado',
        accessories: 'Lenço de bolso de linho branco dobrado em linha reta e relógio analógico clássico',
        fabricTextures: ['Lã Fria Super 150s Italiana', 'Popeline de Algodão Egípcio', 'Seda Jacquard'],
        colorSwatches: [
            { id: 'wp14', label: 'Azul Marinho Nobre', hex: '#0A192F' },
            { id: 'wp15', label: 'Branco Impecável', hex: '#FFFFFF' },
            { id: 'wp16', label: 'Marrom Conhaque', hex: '#78350F' }
        ],
        materialReferences: ['Lã Fria Super 150s', 'Couro Conhaque Patinado', 'Madrepérola Natural'],
        description: 'Alfaiataria napolitana de extrema precisão e caimento fluido impecável.'
    },
    {
        id: 'linen_summer_chic',
        name: 'Casual Chic Linho & Verão Resort',
        genderTarget: 'unisex',
        category: 'Resort / Verão Minimalista',
        outfitType: 'Camisa fluida de linho cru com mangas dobradas e bermuda de alfaiataria em tom areia',
        topNeckline: 'Gola padre descontraída ou gola aberta resort',
        sleevesOrStraps: 'Mangas 3/4 dobradas com acabamento natural',
        bottomPiece: 'Calça ou bermuda fluida de linho e algodão com cordão embutido',
        footwear: 'Mocassins de camurça bege ou sandálias de couro trançado artesanal',
        accessories: 'Óculos de sol tartaruga estilo retrô e pulseira discreta de couro cru',
        fabricTextures: ['Linho Puro Rústico', 'Algodão Cru Respirável', 'Camurça Macia'],
        colorSwatches: [
            { id: 'wp17', label: 'Linho Cru / Areia', hex: '#E2D4B7' },
            { id: 'wp18', label: 'Off-White', hex: '#FAF9F6' },
            { id: 'wp19', label: 'Bege Amendoado', hex: '#C2B280' }
        ],
        materialReferences: ['Linho Belga', 'Camurça Natural', 'Acetato Tartaruga'],
        description: 'Elegância veranil despretensiosa com texturas táteis de linho e tons terra orgânicos.'
    },
    {
        id: 'streetwear_oversized',
        name: 'Streetwear Tóquio Oversized',
        genderTarget: 'unisex',
        category: 'Streetwear Contemporâneo',
        outfitType: 'Moletom com capuz oversized preto pesado, colete utilitário, bermuda sweatpants ampla e meias altas com sneakers chunky',
        topNeckline: 'Capuz duplo estruturado com cordões grossos de algodão',
        sleevesOrStraps: 'Mangas raglan volumosas caídas nos ombros',
        bottomPiece: 'Bermuda sweatpants ampla de algodão pesado com bolsos profundos',
        footwear: 'Sneakers chunky de design desconstruído preto e off-white',
        accessories: 'Shoulder bag de nylon preta e fones de ouvido circum-aurais',
        fabricTextures: ['Algodão Heavyweight Francês 480 GSM', 'Nylon Ripstop', 'Malha Canelada'],
        colorSwatches: [
            { id: 'wp20', label: 'Preto Asfalto', hex: '#1C1917' },
            { id: 'wp21', label: 'Off-White Creme', hex: '#F5F5F0' },
            { id: 'wp22', label: 'Cinza Mescla', hex: '#9CA3AF' }
        ],
        materialReferences: ['Heavy French Terry', 'Borracha Vulcanizada', 'Nylon Ripstop'],
        description: 'Estética contemporânea das ruas de Shibuya com proporções oversized marcantes.'
    }
];

export interface PoseInfo {
    id: string;
    label: string;
    desc: string;
    enName: string;
    enPrompt: string;
}

export const POSE_DEFINITIONS: Record<string, PoseInfo> = {
    neutral_stand: {
        id: 'neutral_stand',
        label: 'Em Pé Neutro',
        desc: 'Postura ereta natural, braços ao lado do corpo, peso balanceado',
        enName: 'Neutral Standing',
        enPrompt: 'Natural upright standing posture, arms gently at sides, balanced weight, professional full-body stance'
    },
    walking: {
        id: 'walking',
        label: 'Caminhando',
        desc: 'Passo elegante para a frente, movimento fluido do tecido',
        enName: 'Dynamic Walking',
        enPrompt: 'Dynamic elegant walking stride forward, natural mid-motion step, fluid garment movement, graceful forward motion'
    },
    sitting: {
        id: 'sitting',
        label: 'Sentada / Sentado',
        desc: 'Sentado em assento minimalista, pernas elegantes',
        enName: 'Seated Posture',
        enPrompt: 'Poised seated posture on a minimalist studio stool, elegant posture, relaxed crossed or angled legs, sophisticated silhouette'
    },
    relaxed: {
        id: 'relaxed',
        label: 'Relaxada / Relaxado',
        desc: 'Peso apoiado em uma perna (contrapposto), ombros descontraídos',
        enName: 'Relaxed Contrapposto',
        enPrompt: 'Relaxed contrapposto stance, subtle weight shift to one hip, natural shoulders, effortless casual elegance'
    },
    tense: {
        id: 'tense',
        label: 'Tensa / Alerta',
        desc: 'Postura firme, cabeça em leve giro, olhar focado e presencial',
        enName: 'Alert & Focused',
        enPrompt: 'Poised alert stance, subtle head turn with focused intense gaze, sharp silhouette tension, commanding presence'
    },
    action_ready: {
        id: 'action_ready',
        label: 'Pronta / Pronto para Ação',
        desc: 'Base corporal dinâmica, olhar concentrado, energia expressiva',
        enName: 'Action-Ready Dynamic',
        enPrompt: 'Dynamic action-ready stance, athletic grounded footing, expressive body language with potential kinetic motion'
    }
};

/**
 * Returns the resolved list of poses based on selectedPoses, activePose, and posePhotoCount (1 min, 4 max).
 */
export function getResolvedPoses(data: ModelSheetData): { count: number; poses: PoseInfo[] } {
    const rawCount = data.posePhotoCount ?? (data.activePose === 'all_6_poses' ? 4 : 1);
    const count = Math.min(4, Math.max(1, rawCount));

    const defaultSequence = ['neutral_stand', 'walking', 'sitting', 'action_ready', 'relaxed', 'tense'];

    let keys: string[] = [];

    if (data.selectedPoses && data.selectedPoses.length > 0) {
        keys = [...data.selectedPoses.slice(0, count)];
    } else if (data.activePose && data.activePose !== 'all_6_poses' && POSE_DEFINITIONS[data.activePose]) {
        keys = [data.activePose];
        for (const k of defaultSequence) {
            if (keys.length >= count) break;
            if (!keys.includes(k)) keys.push(k);
        }
    } else {
        keys = defaultSequence.slice(0, count);
    }

    // Ensure we have exactly `count` items
    for (const k of defaultSequence) {
        if (keys.length >= count) break;
        if (!keys.includes(k)) keys.push(k);
    }

    const poses = keys.map(k => POSE_DEFINITIONS[k] || {
        id: k,
        label: k.replace(/_/g, ' '),
        desc: k.replace(/_/g, ' '),
        enName: k.replace(/_/g, ' '),
        enPrompt: k.replace(/_/g, ' ')
    });

    return { count, poses };
}

export interface PhotographyFramingOption {
    id: 'waist_up' | 'full_body' | 'chest_up';
    label: string;
    labelShort: string;
    desc: string;
    enPrompt: string;
    cameraInstruction: string;
}

export const PHOTOGRAPHY_FRAMING_OPTIONS: Record<'waist_up' | 'full_body' | 'chest_up', PhotographyFramingOption> = {
    waist_up: {
        id: 'waist_up',
        label: 'Foto até meio da barriga',
        labelShort: 'Meio da barriga',
        desc: 'Plano Médio: enquadramento da cintura / meio da barriga para cima, destacando tronco, braços e expressão facial no cenário',
        enPrompt: 'Waist-up medium shot framing (meio da barriga)',
        cameraInstruction: 'Medium shot framing captured strictly from the waist/midriff up (meio da barriga para cima), centered torso-up composition showing the mid-torso, arms, hands, shoulders, neck, and face in razor-sharp focus against the background environment'
    },
    full_body: {
        id: 'full_body',
        label: 'Foto completa',
        labelShort: 'Foto completa',
        desc: 'Corpo Inteiro: enquadramento total da cabeça aos pés, mostrando calçados, silhueta e proporções completas no cenário',
        enPrompt: 'Full-body complete shot (foto completa)',
        cameraInstruction: 'Full-length complete photographic framing from head to toe (foto completa), full anatomical silhouette, footwear clearly visible on the studio floor, framed perfectly within the scenic background setting'
    },
    chest_up: {
        id: 'chest_up',
        label: 'Foto peito pra cima',
        labelShort: 'Peito pra cima',
        desc: 'Plano Busto (Medium Close-up): do peito para cima, realçando decote, ombros, pescoço e biometria facial detalhada',
        enPrompt: 'Chest-up bust portrait (peito pra cima)',
        cameraInstruction: 'Medium close-up bust shot framing captured from the chest up (peito pra cima), highlighting the collarbone, chest line, neckline, shoulders, neck, and intimate facial biometrics with cinematic shallow depth of field against the backdrop'
    }
};

/**
 * Compiles a master production prompt from the model sheet data respecting section toggles.
 */
export function compileModelSheetPrompt(
    data: ModelSheetData, 
    targetPlatform: string = 'midjourney',
    toggles?: ModelSectionToggles
): string {
    const effectiveToggles: ModelSectionToggles = toggles || data.sectionToggles || DEFAULT_SECTION_TOGGLES;

    const framingKey = (data.photographyFraming as 'waist_up' | 'full_body' | 'chest_up') || 'full_body';
    const framingOption = PHOTOGRAPHY_FRAMING_OPTIONS[framingKey] || PHOTOGRAPHY_FRAMING_OPTIONS.full_body;

    const colorString = data.colorSwatches && data.colorSwatches.length > 0
        ? data.colorSwatches.map(c => `${c.label}: ${c.hex}`).join(', ')
        : '#B31217, #E63946, #F6CCC8, #3B2A1F';

    const materialsString = data.materialReferences && data.materialReferences.length > 0
        ? data.materialReferences.join(', ')
        : 'Silk, Chiffon, Crepe';

    const fabricsString = data.fabricTextures && data.fabricTextures.length > 0
        ? data.fabricTextures.join(', ')
        : 'Silk, Chiffon, Crepe';

    const isBoy = data.gender === 'boy';
    const isGirl = data.gender === 'girl';
    const isTeenBoy = data.gender === 'teen_boy';
    const isTeenGirl = data.gender === 'teen_girl';
    const isChild = isBoy || isGirl;
    const isTeen = isTeenBoy || isTeenGirl;
    const isMale = data.gender === 'man' || isBoy || isTeenBoy;

    const genderRole = isBoy
        ? 'Young Boy Character (Child 7-9y, natural child proportions)'
        : isGirl
        ? 'Young Girl Character (Child 6-8y, natural child proportions)'
        : isTeenBoy
        ? 'Teenage Boy Character (Adolescent 14-16y, authentic teen proportions)'
        : isTeenGirl
        ? 'Teenage Girl Character (Adolescent 15-17y, authentic teen proportions)'
        : isMale
        ? 'Male Model / Character'
        : 'Female Model / Character';

    const facialHairClause = (isMale && !isChild && !isTeen && data.facialHair) ? `, Facial Hair: ${data.facialHair}` : '';

    // Diretivas explícitas de referências de vestuário enviadas pelo usuário
    const hasWardrobeRefs = data.wardrobeReferences && data.wardrobeReferences.length > 0;
    const wardrobeRefSummary = hasWardrobeRefs
        ? data.wardrobeReferences!.map((ref, idx) => `Ref ${idx + 1} (${ref.label || ref.role}): ${ref.description || ref.notes || ref.fileName || 'authentic clothing piece'}`).join(' | ')
        : '';
    const wardrobeRefClause = hasWardrobeRefs
        ? `\n\n[WARDROBE REFERENCE IMAGE INTEGRATION & STRICT CLOTHING REPLICATION]\nCharacter MUST wear the exact apparel from the uploaded wardrobe reference images (${wardrobeRefSummary}). Faithful reproduction of cut, silhouette, neckline (${data.topNeckline}), sleeves (${data.sleevesOrStraps}), bottom piece (${data.bottomPiece}), footwear (${data.footwear}), accessories (${data.accessories}). Fabric weave and authentic drape: ${fabricsString}. Color palette consistency: ${colorString}.`
        : '';

    // 1. Full Production Model Sheet Grid (Matching user references)
    if (data.outputType === 'full_model_sheet') {
        const sections: string[] = [];

        // Intro / Profile
        if (effectiveToggles.profile) {
            sections.push(`Complete ${genderRole.toLowerCase()} turnaround model sheet and identity reference board, photographic ultra-high-definition presentation grid.
Character: ${data.characterName || 'Hero Character'}, Gender: ${genderRole}, Role: ${data.role || 'Protagonist'}, Age: ${data.age || (isChild ? '8 years old' : isTeen ? '15 years old' : 'Mid 20s')}, Height: ${data.height || (isChild ? "4'2\\\"" : isTeen ? "5'8\\\"" : isMale ? "6'0\\\"" : "5'8\\\"")}, Body Type: ${data.bodyType || (isChild ? 'Natural Child' : isTeen ? 'Slim Teen' : isMale ? 'Athletic Masculine' : 'Slim')}.
Distinctive Traits: ${data.distinctiveTraits}. Personality: ${data.personality}.`);
        } else {
            sections.push(`Complete ${genderRole.toLowerCase()} character presentation grid. Character: ${data.characterName || 'Hero Character'}.`);
        }

        // Section 1: Turnaround
        if (effectiveToggles.turnaround) {
            sections.push(`[SECTION: FULL-BODY TURNAROUND (4 VIEWS)]
Four aligned full-body angles side-by-side: Front View, 3/4 View, Side Profile View, and Back View. Wearing identical ${data.outfitType}, ${data.footwear}. Perfect proportional scale, identical head height, seamless visual continuity across all 4 angles.`);
        }

        // Section 2: Face & Identity Biometrics
        if (effectiveToggles.face) {
            sections.push(`[SECTION: FACE AND IDENTITY BIOMETRICS]
Close-up triple view (Front, Profile, 3/4 View). Facial Structure: ${data.facialStructure}. Eyes: ${data.eyes}. Eyebrows: ${data.eyebrows}. Nose: ${data.nose}. Lips: ${data.lips}. Skin: ${data.skinTone} (Hex ${data.skinToneHex || '#F6CCC8'}). Hair: ${data.hair} (Hex ${data.hairColorHex || '#3B2A1F'}). Makeup: ${data.makeup}${facialHairClause}. Marks: ${data.scarsOrMarks}.`);
        }

        // Section 3: 8-Emotion Expression Sheet
        if (effectiveToggles.expressions) {
            sections.push(`[SECTION: 8-EMOTION EXPRESSION SHEET]
Neat 2x4 photographic expression grid of the identical face: 1. Neutral, 2. Happy, 3. Angry, 4. Sad, 5. Surprised, 6. Worried, 7. Confident, 8. Determined. Perfect facial biometric continuity.`);
        }

        // Section 4: Pose Body Language Sheet (Adaptado ao contador de fotos e pose escolhida)
        if (effectiveToggles.poses) {
            const { count, poses } = getResolvedPoses(data);
            if (count === 1) {
                const singlePose = poses[0] || POSE_DEFINITIONS.neutral_stand;
                sections.push(`[SECTION: 1-POSE MASTER BODY LANGUAGE (1 SHOT)]
Character shown in 1 focused full-body posture: ${singlePose.enName} (${singlePose.enPrompt}). Consistent costume, footwear (${data.footwear}), and physique.`);
            } else {
                const poseDescriptions = poses.map((p, idx) => `${idx + 1}. ${p.enName} (${p.enPrompt})`).join(', ');
                sections.push(`[SECTION: ${count}-POSE BODY LANGUAGE SHEET (${count} SHOTS)]
Character shown in ${count} dynamic full-body postures side-by-side: ${poseDescriptions}. Consistent costume, footwear (${data.footwear}), and physique.`);
            }
        }

        // Section 5: Costume & Close-up Swatches
        if (effectiveToggles.costume) {
            sections.push(`[SECTION: COSTUME & CLOSE-UP SWATCHES]
Detailed costume swatches: Neckline (${data.topNeckline}), Sleeves/Straps (${data.sleevesOrStraps}), Silhouette (${data.bottomPiece}), Footwear (${data.footwear}), Accessories (${data.accessories}), Fabrics (${fabricsString}).${wardrobeRefClause}`);
        }

        // Section 6: Color Palette & Material Samples
        if (effectiveToggles.palette) {
            sections.push(`[SECTION: COLOR PALETTE & MATERIAL SAMPLES]
Key color swatches with exact hex codes: ${colorString}. Material finishes: ${materialsString}.`);
        }

        // Section 7: Lighting, Environment & Photography Framing
        if (effectiveToggles.lighting) {
            sections.push(`[SECTION: ENVIRONMENT, LIGHTING & PHOTOGRAPHY FRAMING]
Photography Framing Mode: ${framingOption.cameraInstruction}.
Background / Setting: ${data.backgroundSetting}.
Lighting Scheme: ${data.lighting}.
Directives: ${data.additionalNotes}. Style: ${data.renderStyle}, clean layout, white borders between panels, 8k resolution, photorealistic master character reference sheet.`);
        }

        let prompt = sections.join('\n\n');

        if (targetPlatform === 'midjourney') {
            const ar = framingKey === 'waist_up' || framingKey === 'chest_up' ? '--ar 4:5' : '--ar 2:3';
            prompt += ` ${ar} --v 6.1 --style raw`;
        }
        return prompt;
    }

    // 2. 4-View Turnaround Grid
    if (data.outputType === 'turnaround_4_views') {
        const parts: string[] = [];
        parts.push(`Full-body ${genderRole.toLowerCase()} turnaround sheet, 4 distinct sequential angles side-by-side on a clean line: Front View, 3/4 View, Side Profile View, Back View.`);
        if (effectiveToggles.profile) {
            parts.push(`Subject: ${data.characterName}, ${genderRole}, ${data.age}, ${data.height}, ${data.bodyType} body type.`);
        }
        if (effectiveToggles.face) {
            parts.push(`Facial Identity: ${data.facialStructure}, ${data.eyes}, ${data.hair} (Hex ${data.hairColorHex})${facialHairClause}.`);
        }
        if (effectiveToggles.costume) {
            parts.push(`Costume: Wearing identical ${data.outfitType}, neckline ${data.topNeckline}, ${data.bottomPiece}, footwear ${data.footwear}.${wardrobeRefClause}`);
        }
        if (effectiveToggles.palette) {
            parts.push(`Colors: ${colorString}. Materials: ${materialsString}.`);
        }
        if (effectiveToggles.lighting) {
            parts.push(`Framing Mode: ${framingOption.cameraInstruction}.`);
            parts.push(`Identical anatomical proportions, precise alignment, studio lighting on neutral ${data.backgroundSetting}, 8k photorealistic character turnaround render.`);
        }

        let prompt = parts.join('\n');
        if (targetPlatform === 'midjourney') {
            prompt += ` --ar 16:9 --v 6.1 --style raw`;
        }
        return prompt;
    }

    // 3. 8-Emotion Expression Grid
    if (data.outputType === 'expression_grid') {
        const parts: string[] = [];
        parts.push(`${genderRole} facial expression sheet, 8 emotional expressions in neat 2x4 photographic portrait grid: Neutral, Happy, Angry, Sad, Surprised, Worried, Confident, Determined.`);
        if (effectiveToggles.profile) {
            parts.push(`Subject: ${data.characterName}, ${data.age}, identical facial biometrics across all 8 panels.`);
        }
        if (effectiveToggles.face) {
            parts.push(`Features: ${data.facialStructure}, ${data.eyes}, ${data.lips}, skin ${data.skinTone} (Hex ${data.skinToneHex}), hair ${data.hair}${facialHairClause}.`);
        }
        if (effectiveToggles.lighting) {
            parts.push(`Soft studio portrait lighting, sharp focus on eyes, clean background, consistent identity across all emotional states, 8k master sheet.`);
        }

        let prompt = parts.join('\n');
        if (targetPlatform === 'midjourney') {
            prompt += ` --ar 16:9 --v 6.1 --style raw`;
        }
        return prompt;
    }

    // 4. Pose Mode: Ensaio de Poses (1 a 4 Fotos com a pose ou sequência escolhida)
    if (data.outputType === 'pose_grid') {
        const { count, poses } = getResolvedPoses(data);
        const parts: string[] = [];

        if (count === 1) {
            const singlePose = poses[0] || POSE_DEFINITIONS.neutral_stand;
            parts.push(`[MODE: SINGLE MASTER POSE PHOTOGRAPH - 1 SHOT (${framingOption.labelShort.toUpperCase()})]
1 single high-resolution master photograph of ${data.characterName}, ${genderRole}.
Framing & Scale: ${framingOption.cameraInstruction}.
Focused Stance & Pose: ${singlePose.enName} — ${singlePose.enPrompt}.${data.poseDetails && data.poseDetails !== singlePose.desc ? ` Specific Pose Nuance: ${data.poseDetails}.` : ''}
Background & Environment: ${data.backgroundSetting}.`);
        } else if (count === 2) {
            parts.push(`[MODE: 2-POSE SEQUENTIAL DIPTYCH - 2 SHOTS SIDE-BY-SIDE (${framingOption.labelShort.toUpperCase()})]
Sequential photographic diptych featuring 2 distinct poses side-by-side in a 1x2 panel layout:
Framing per Shot: ${framingOption.cameraInstruction}.
Photo 1 (Left): ${poses[0]?.enName} — ${poses[0]?.enPrompt}.
Photo 2 (Right): ${poses[1]?.enName} — ${poses[1]?.enPrompt}.
Background & Environment: ${data.backgroundSetting}.
Both photos maintain 100% exact facial likeness, costume continuity, and lighting.`);
        } else if (count === 3) {
            parts.push(`[MODE: 3-POSE SEQUENTIAL TRIPTYCH - 3 SHOTS SIDE-BY-SIDE (${framingOption.labelShort.toUpperCase()})]
Sequential photographic triptych featuring 3 distinct poses side-by-side in a 1x3 panel progression:
Framing per Shot: ${framingOption.cameraInstruction}.
Photo 1 (Left): ${poses[0]?.enName} — ${poses[0]?.enPrompt}.
Photo 2 (Center): ${poses[1]?.enName} — ${poses[1]?.enPrompt}.
Photo 3 (Right): ${poses[2]?.enName} — ${poses[2]?.enPrompt}.
Background & Environment: ${data.backgroundSetting}.
Continuous character identity, physique, and styling across all 3 poses.`);
        } else {
            // count === 4
            parts.push(`[MODE: 4-POSE MASTER GRID - 4 SEQUENTIAL SHOTS (${framingOption.labelShort.toUpperCase()})]
Professional 2x2 photographic grid sheet displaying 4 distinct dynamic poses:
Framing per Panel: ${framingOption.cameraInstruction}.
Panel 1 (Top-Left): ${poses[0]?.enName} — ${poses[0]?.enPrompt}.
Panel 2 (Top-Right): ${poses[1]?.enName} — ${poses[1]?.enPrompt}.
Panel 3 (Bottom-Left): ${poses[2]?.enName} — ${poses[2]?.enPrompt}.
Panel 4 (Bottom-Right): ${poses[3]?.enName} — ${poses[3]?.enPrompt}.
Background & Environment: ${data.backgroundSetting}.
Flawless wardrobe, facial identity, and studio backdrop consistency across all 4 panels.`);
        }

        if (effectiveToggles.profile) {
            parts.push(`Subject: ${data.characterName}, ${genderRole}, ${data.age}, ${data.height}, ${data.bodyType}.`);
        }
        if (effectiveToggles.face) {
            parts.push(`Facial Biometrics: ${data.facialStructure}, ${data.eyes}, ${data.hair} (Hex ${data.hairColorHex})${facialHairClause}.`);
        }
        if (effectiveToggles.costume) {
            parts.push(`Costume: Wearing identical ${data.outfitType}, neckline ${data.topNeckline}, ${data.bottomPiece}, footwear ${data.footwear}.${wardrobeRefClause}`);
        }
        if (effectiveToggles.palette) {
            parts.push(`Colors: ${colorString}. Materials: ${materialsString}.`);
        }
        if (effectiveToggles.lighting) {
            parts.push(`Photography Framing Mode: ${framingOption.cameraInstruction}.`);
            parts.push(`Lighting: ${data.lighting}. Setting: ${data.backgroundSetting}. Directives: ${data.additionalNotes}. Hasselblad 100MP RAW, 8k resolution, authentic textures, photorealistic.`);
        }

        let prompt = parts.join('\n');
        if (targetPlatform === 'midjourney') {
            const ar = count === 1 ? (framingKey === 'waist_up' || framingKey === 'chest_up' ? '--ar 4:5' : '--ar 2:3') : count === 4 ? '--ar 1:1' : '--ar 16:9';
            prompt += ` ${ar} --v 6.1 --style raw`;
        }
        return prompt;
    }

    // 5. Single Photographic Master Shot
    const viewLabel = data.activeView === 'all_turnaround' ? 'front 3/4 view' : data.activeView.replace(/_/g, ' ');
    const emotionLabel = data.activeExpression === 'all_8_emotions' ? 'confident with warm gentle smile' : data.activeExpression.replace(/_/g, ' ');
    const { poses } = getResolvedPoses(data);
    const chosenPose = poses[0] || POSE_DEFINITIONS.neutral_stand;
    const poseLabel = `${chosenPose.enName} (${chosenPose.enPrompt})`;

    const parts: string[] = [];
    parts.push(`Master photographic studio portrait of ${data.characterName}, ${genderRole}.`);
    parts.push(`Framing & Shot Scale: ${framingOption.cameraInstruction}.`);
    if (effectiveToggles.profile) {
        parts.push(`Age: ${data.age}, Height: ${data.height}, Body: ${data.bodyType}.`);
    }
    if (effectiveToggles.poses) {
        parts.push(`Pose: ${poseLabel}. ${data.poseDetails && data.poseDetails !== chosenPose.desc ? `Nuance: ${data.poseDetails}.` : ''} Camera Angle: ${viewLabel}.`);
    }
    if (effectiveToggles.expressions) {
        parts.push(`Expression: ${emotionLabel}, ${data.expressionDetails}.`);
    }
    if (effectiveToggles.face) {
        parts.push(`Biometrics: ${data.facialStructure}, expressive ${data.eyes}, natural ${data.lips}, ${data.skinTone} (Hex ${data.skinToneHex}), ${data.hair} (Hex ${data.hairColorHex}), ${data.makeup}${facialHairClause}.`);
    }
    if (effectiveToggles.costume) {
        parts.push(`Costume: Wearing ${data.outfitType}, neckline ${data.topNeckline}, ${data.bottomPiece}, ${data.footwear}, accessories ${data.accessories}.${wardrobeRefClause}`);
    }
    if (effectiveToggles.palette) {
        parts.push(`Color palette: ${colorString}. Materials: ${materialsString}.`);
    }
    if (effectiveToggles.lighting) {
        parts.push(`Lighting: ${data.lighting}. Setting / Environment: ${data.backgroundSetting}. Directives: ${data.additionalNotes}. Style: ${data.renderStyle}, Hasselblad 100MP RAW quality, 8k resolution, authentic skin pore textures, photorealistic.`);
    }

    let prompt = parts.join('\n');
    if (targetPlatform === 'midjourney') {
        const ar = framingKey === 'waist_up' || framingKey === 'chest_up' ? '--ar 4:5' : '--ar 2:3';
        prompt += ` ${ar} --v 6.1 --style raw`;
    }
    return prompt;
}
