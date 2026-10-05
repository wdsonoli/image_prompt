import type { ModelSheetData, CharacterColorSwatch } from '../types.ts';

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
    outputType: 'full_model_sheet',
    additionalNotes: 'Manter rigorosa consistência de identidade facial, anatômica e de vestuário.'
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

/**
 * Compiles a master production prompt from the model sheet data.
 */
export function compileModelSheetPrompt(data: ModelSheetData, targetPlatform: string = 'midjourney'): string {
    const colorString = data.colorSwatches && data.colorSwatches.length > 0
        ? data.colorSwatches.map(c => `${c.label}: ${c.hex}`).join(', ')
        : '#B31217, #E63946, #F6CCC8, #3B2A1F';

    const materialsString = data.materialReferences && data.materialReferences.length > 0
        ? data.materialReferences.join(', ')
        : 'Silk, Chiffon, Crepe';

    const fabricsString = data.fabricTextures && data.fabricTextures.length > 0
        ? data.fabricTextures.join(', ')
        : 'Silk, Chiffon, Crepe';

    const isMale = data.gender === 'man';
    const genderRole = isMale ? 'Male Model / Character' : 'Female Model / Character';
    const facialHairClause = isMale && data.facialHair ? `, Facial Hair: ${data.facialHair}` : '';

    // 1. Full Production Model Sheet Grid (Matching user references)
    if (data.outputType === 'full_model_sheet') {
        let prompt = `Complete ${isMale ? 'male' : 'female'} character turnaround model sheet and identity reference board, photographic ultra-high-definition presentation grid.
Character: ${data.characterName || (isMale ? 'Male Hero' : 'Female Hero')}, Gender: ${genderRole}, Role: ${data.role || 'Creator / Model'}, Age: ${data.age || (isMale ? 'Mid 20s' : 'Mid 20s')}, Height: ${data.height || (isMale ? "6'0\\\"" : "5'8\\\"")}, Body Type: ${data.bodyType || (isMale ? 'Athletic Masculine' : 'Slim')}.
Distinctive Traits: ${data.distinctiveTraits}. Personality: ${data.personality}.

[SECTION 1: FULL-BODY TURNAROUND (4 VIEWS)]
Four aligned full-body angles side-by-side: Front View, 3/4 View, Side Profile View, and Back View. Wearing identical ${data.outfitType}, ${data.footwear}. Perfect proportional scale, identical head height, seamless visual continuity across all 4 angles.

[SECTION 2: FACE AND IDENTITY BIOMETRICS]
Close-up triple view (Front, Profile, 3/4 View). Facial Structure: ${data.facialStructure}. Eyes: ${data.eyes}. Eyebrows: ${data.eyebrows}. Nose: ${data.nose}. Lips: ${data.lips}. Skin: ${data.skinTone} (Hex ${data.skinToneHex || '#F6CCC8'}). Hair: ${data.hair} (Hex ${data.hairColorHex || '#3B2A1F'}). Makeup: ${data.makeup}${facialHairClause}. Marks: ${data.scarsOrMarks}.

[SECTION 3: 8-EMOTION EXPRESSION SHEET]
Neat 2x4 photographic expression grid of the identical face: 1. Neutral, 2. Happy, 3. Angry, 4. Sad, 5. Surprised, 6. Worried, 7. Confident, 8. Determined. Perfect facial biometric continuity.

[SECTION 4: 6-POSE BODY LANGUAGE SHEET]
Character shown in 6 dynamic full-body postures: 1. Neutral Stand, 2. Walking, 3. Sitting, 4. Relaxed, 5. Tense, 6. Action-Ready. Consistent costume, footwear (${data.footwear}), and physique.

[SECTION 5: COSTUME & CLOSE-UP SWATCHES]
Detailed costume swatches: Neckline (${data.topNeckline}), Sleeves/Straps (${data.sleevesOrStraps}), Silhouette (${data.bottomPiece}), Footwear (${data.footwear}), Accessories (${data.accessories}), Fabrics (${fabricsString}).

[SECTION 6: COLOR PALETTE & MATERIAL SAMPLES]
Key color swatches with exact hex codes: ${colorString}. Material finishes: ${materialsString}.

Lighting: ${data.lighting}. Setting: ${data.backgroundSetting}. Directives: ${data.additionalNotes}. Style: ${data.renderStyle}, clean layout, white borders between panels, 8k resolution, photorealistic master character reference sheet.`;

        if (targetPlatform === 'midjourney') {
            prompt += ` --ar 2:3 --v 6.1 --style raw`;
        }
        return prompt;
    }

    // 2. 4-View Turnaround Grid
    if (data.outputType === 'turnaround_4_views') {
        let prompt = `Full-body ${isMale ? 'male' : 'female'} character turnaround sheet, 4 distinct sequential angles side-by-side on a clean line: Front View, 3/4 View, Side Profile View, Back View.
Subject: ${data.characterName}, ${genderRole}, ${data.age}, ${data.height}, ${data.bodyType} body type.
Facial Identity: ${data.facialStructure}, ${data.eyes}, ${data.hair} (Hex ${data.hairColorHex})${facialHairClause}.
Costume: Wearing identical ${data.outfitType}, neckline ${data.topNeckline}, ${data.bottomPiece}, footwear ${data.footwear}.
Colors: ${colorString}. Materials: ${materialsString}.
Identical anatomical proportions, precise alignment, studio lighting on neutral ${data.backgroundSetting}, 8k photorealistic character turnaround render.`;

        if (targetPlatform === 'midjourney') {
            prompt += ` --ar 16:9 --v 6.1 --style raw`;
        }
        return prompt;
    }

    // 3. 8-Emotion Expression Grid
    if (data.outputType === 'expression_grid') {
        let prompt = `${isMale ? 'Male' : 'Female'} character facial expression sheet, 8 emotional expressions in neat 2x4 photographic portrait grid: Neutral, Happy, Angry, Sad, Surprised, Worried, Confident, Determined.
Subject: ${data.characterName}, ${data.age}, identical facial biometrics across all 8 panels.
Features: ${data.facialStructure}, ${data.eyes}, ${data.lips}, skin ${data.skinTone} (Hex ${data.skinToneHex}), hair ${data.hair}${facialHairClause}.
Soft studio portrait lighting, sharp focus on eyes, clean background, consistent identity across all emotional states, 8k master sheet.`;

        if (targetPlatform === 'midjourney') {
            prompt += ` --ar 16:9 --v 6.1 --style raw`;
        }
        return prompt;
    }

    // 4. 6-Pose Turnaround Sheet
    if (data.outputType === 'pose_grid') {
        let prompt = `${isMale ? 'Male' : 'Female'} character pose study and action turnaround grid, 6 sequential full-body poses side-by-side: 1. Neutral Stand, 2. Walking, 3. Sitting, 4. Relaxed, 5. Tense, 6. Action-Ready.
Subject: ${data.characterName}, ${data.age}, ${data.bodyType}, wearing identical ${data.outfitType}, ${data.footwear}.
Flawless costume and physical consistency, dynamic body language, neutral studio backdrop, 8k resolution master render.`;

        if (targetPlatform === 'midjourney') {
            prompt += ` --ar 16:9 --v 6.1 --style raw`;
        }
        return prompt;
    }

    // 5. Single Photographic Master Shot
    const viewLabel = data.activeView === 'all_turnaround' ? 'front 3/4 view' : data.activeView.replace(/_/g, ' ');
    const emotionLabel = data.activeExpression === 'all_8_emotions' ? 'confident with warm gentle smile' : data.activeExpression.replace(/_/g, ' ');
    const poseLabel = data.activePose === 'all_6_poses' ? 'natural standing posture' : data.activePose.replace(/_/g, ' ');

    let prompt = `Master photographic studio portrait of ${data.characterName}, ${genderRole}, ${data.age}, ${data.height}, ${data.bodyType} body.
Pose: Full-body ${poseLabel}, ${data.poseDetails}.
Expression: ${emotionLabel}, ${data.expressionDetails}.
Camera Angle: ${viewLabel}.
Biometrics: ${data.facialStructure}, expressive ${data.eyes}, natural ${data.lips}, ${data.skinTone} (Hex ${data.skinToneHex}), ${data.hair} (Hex ${data.hairColorHex}), ${data.makeup}${facialHairClause}.
Costume: Wearing ${data.outfitType}, neckline ${data.topNeckline}, ${data.bottomPiece}, ${data.footwear}, accessories ${data.accessories}.
Color palette: ${colorString}. Materials: ${materialsString}.
Lighting: ${data.lighting}. Setting: ${data.backgroundSetting}.
Directives: ${data.additionalNotes}. Style: ${data.renderStyle}, Hasselblad 100MP RAW quality, 8k resolution, authentic skin pore textures, photorealistic.`;

    if (targetPlatform === 'midjourney') {
        prompt += ` --ar 2:3 --v 6.1 --style raw`;
    }
    return prompt;
}
