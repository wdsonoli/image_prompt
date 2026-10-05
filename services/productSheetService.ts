import type { ProductSheetData, ProductRebrandUploadedImages, CharacterColorSwatch } from '../types.ts';

/**
 * Preset: Troca de Marca de Cerveja (Exemplo citado pelo usuário: Garrafa Skol -> Cerveja Artesanal)
 */
export const BEER_REBRAND_PRESET: ProductSheetData = {
    originalBrandName: 'Cerveja Comercial (ex: Skol / Ambev)',
    newBrandName: 'Cerveja Artesanal Imperial Craft',
    productCategory: 'Cerveja Premium / Bebidas',
    productMaterials: 'Garrafa de vidro âmbar escuro (amber glass) com gotas de condensação gelada realistas, tampa coroa metálica dourada',
    productDimensions: 'Garrafa Long Neck 355ml (23 cm de altura x 6 cm de diâmetro)',
    keyFeatures: [
        'Vidro âmbar com reflexos dourados do líquido interno',
        'Gotas de condensação e névoa gelada escorrendo na superfície',
        'Rótulo frontal adesivo texturizado em papel artesanal com relevo e verniz fosco',
        'Selo metálico e colarinho no gargalo da garrafa',
        'Temperatura visualmente trincando de gelada'
    ],
    heroViews: ['front', 'three_quarter', 'side', 'back', 'functional'],
    activeHeroView: 'all_hero_views',
    rebrandMode: 'full_replacement',
    labelPlacement: 'Substituição completa do rótulo original. O novo rótulo da marca enviada é aplicado perfeitamente centralizado no corpo da garrafa, mantendo a curvatura cilíndrica e o relevo do papel.',
    neckLabelOrCap: 'Gargalo com faixa de selo personalizada na cor azul escuro e dourado com logotipo nobre, tampa coroa dourada com gravação',
    surfaceTexture: 'Vidro molhado com centenas de microgotas táteis de água gelada escorrendo realisticamente sem obstruir o logo',
    packagingNutritional: 'Verso da garrafa com especificações artesanais: Teor Alcoólico 5.4% ABV, 28 IBU, ingredientes puros (malte, lúpulo, água e levedura), código de barras nítido',
    specialFeatures: 'Logotipo impresso em alta resolução com acabamento em folha de ouro (gold foil) sutil no contorno',
    props: [
        { id: 'p1', name: 'Copo de Cristal Tulipa', purpose: 'Copo ao lado com cerveja dourada servida e colarinho denso de espuma branca cremosa' },
        { id: 'p2', name: 'Cubos de Gelo Cristalinos', purpose: 'Gelo triturado espalhado na base da garrafa para reforçar temperatura gelada' },
        { id: 'p3', name: 'Ramos de Lúpulo Fresco', purpose: 'Flor de lúpulo verde ao fundo para comunicar pureza e nobreza dos ingredientes' },
        { id: 'p4', name: 'Abridor de Garrafas Vintage', purpose: 'Abridor de metal rústico sobre o balcão' }
    ],
    backgroundEnvironment: 'Balcão de madeira nobre rústica com iluminação quente de bar e bokeh suave ao fundo',
    brandColors: [
        { id: 'c1', label: 'Azul Imperial', hex: '#0B2545' },
        { id: 'c2', label: 'Dourado Foil', hex: '#D4AF37' },
        { id: 'c3', label: 'Âmbar Vidro', hex: '#582F0E' },
        { id: 'c4', label: 'Branco Rótulo', hex: '#FAF9F6' },
        { id: 'c5', label: 'Preto Grafite', hex: '#1C1C1E' }
    ],
    packagingViews: ['front_pack', 'side_pack', 'back_pack', 'top_lid', 'unfolded_label'],
    doNotChange: {
        productShape: true,
        materials: true,
        colorsAndBranding: true,
        typography: true,
        proportions: true,
        photorealism: true
    },
    customConsistencyRules: 'Manter rigorosamente a geometria da garrafa e substituir todo o branding e rótulo anterior pela nova arte/logo enviada.',
    outputLayout: 'full_product_sheet',
    lighting: 'Iluminação de estúdio comercial de bebidas com duas luzes de recorte laterais (rim lights) que iluminam o âmbar do vidro e a transparência do líquido',
    renderQuality: 'Hasselblad H6D-100c RAW, 8k resolution, photorealistic commercial product photography'
};

/**
 * Preset: Ficha de Produto Pote de Sorvete (Fiel 100% à referência visual da imagem Fanice)
 */
export const FANICE_ICE_CREAM_PRESET: ProductSheetData = {
    originalBrandName: 'Fanice Ice Cream Tub',
    newBrandName: 'Fanice Ice Cream (Strawberry & Vanilla)',
    productCategory: 'Sobremesa Congelada / Pote de Sorvete (Ice Cream)',
    productMaterials: 'Pote plástico termoformado de grau alimentício branco com tampa de encaixe hermético, sorvete artesanal bicolores',
    productDimensions: 'Aprox. 18 cm (C) x 12 cm (L) x 6 cm (A) - tamanho familiar standard',
    keyFeatures: [
        'Textura cremosa e suave visível no sorvete com mescla orgânica de morango e baunilha',
        'Pote plástico e tampa termoformada ergonômica com trava lateral',
        'Embalagem familiar de fácil armazenamento em freezer',
        'Design vibrante com arco-íris e tipografia bold em relevo suave no rótulo',
        'Pronto para servir com colheradas generosas visíveis'
    ],
    heroViews: ['front', 'back', 'side', 'three_quarter', 'functional'],
    activeHeroView: 'all_hero_views',
    rebrandMode: 'full_replacement',
    labelPlacement: 'Rótulo frontal e na tampa com o logotipo destacado Fanice, degradê de arco-íris, ilustração de morangos e texto Vanilla Strawberry',
    neckLabelOrCap: 'Tampa plástica branca translúcida com adesivo superior impresso em alta definição resistente à umidade e congelamento',
    surfaceTexture: 'Plástico fosco com leve condensação fria, textura acetinada no sorvete interno com microporos de aeração natural',
    packagingNutritional: 'Painel traseiro com tabela nutricional, código de barras vertical nítido, lista de ingredientes e selos de reciclabilidade',
    specialFeatures: 'Tipografia de sabor destacada e grafismos coloridos de arco-íris estilizado',
    props: [
        { id: 'p1', name: 'Morangos Frescos', purpose: 'Morangos maduros inteiros com folhas verdes ao redor do pote para indicar sabor autêntico' },
        { id: 'p2', name: 'Jarra de Leite', purpose: 'Pequena leiteira de vidro com leite cremoso no plano de fundo' },
        { id: 'p3', name: 'Tigela de Açúcar', purpose: 'Tigela de cerâmica branca com açúcar para contextualizar receita' },
        { id: 'p4', name: 'Colher de Sorvete de Metal', purpose: 'Boleador de sorvete em aço inox polido posicionado para servir' },
        { id: 'p5', name: 'Pano de Prato Xadrez Azul', purpose: 'Guardanapo de tecido xadrez azul dobrado sob os utensílios' }
    ],
    backgroundEnvironment: 'Bancada limpa de estúdio culinário com fundo infinito cinza claro neutro (#F2F2F2)',
    brandColors: [
        { id: 'c1', label: 'Pink Strawberry', hex: '#E91E8A' },
        { id: 'c2', label: 'Light Blue Background', hex: '#4FD3F4' },
        { id: 'c3', label: 'Dark Blue Logo/Text', hex: '#1E4FA8' },
        { id: 'c4', label: 'Yellow Accent', hex: '#FFD600' },
        { id: 'c5', label: 'Green Accent', hex: '#4CAF50' },
        { id: 'c6', label: 'Studio Neutral Gray', hex: '#F2F2F2' }
    ],
    packagingViews: ['front_pack', 'side_pack', 'back_pack', 'top_lid', 'unfolded_label'],
    doNotChange: {
        productShape: true,
        materials: true,
        colorsAndBranding: true,
        typography: true,
        proportions: true,
        photorealism: true
    },
    customConsistencyRules: 'Keep everything exactly as shown. Do not redesign, alter, or create variants of the product, packaging, or branding. Maintain exact colors and proportions.',
    outputLayout: 'full_product_sheet',
    lighting: 'Luz de estúdio comercial difusa com softbox amplo, sem sombras duras, cores saturadas e apetitosas',
    renderQuality: 'Fotorealista 8K, Master Visual Production Reference Sheet, estúdio de embalagem'
};

/**
 * Preset: Cosmético / Frasco de Perfume de Luxo
 */
export const COSMETIC_PERFUME_PRESET: ProductSheetData = {
    originalBrandName: 'Frasco Genérico / Marca Anterior',
    newBrandName: 'Aura Néctar Parfum',
    productCategory: 'Perfumaria Fina / Cosméticos de Luxo',
    productMaterials: 'Frasco de vidro cristalino pesado com base espessa, tampa metálica pesada banhada a ouro, borrifador dourado',
    productDimensions: '100ml Eau de Parfum (12 cm de altura x 7 cm de largura x 4 cm de profundidade)',
    keyFeatures: [
        'Vidro óptico ultra transparente com refração de luz estonteante',
        'Líquido interno âmbar dourado translúcido com reflexos prismáticos',
        'Rótulo adesivo de tecido linho com tipografia serigrafada em relevo',
        'Tampa com encaixe magnético e gravura do novo logotipo no topo'
    ],
    heroViews: ['front', 'three_quarter', 'side', 'back', 'functional'],
    activeHeroView: 'all_hero_views',
    rebrandMode: 'full_replacement',
    labelPlacement: 'Rótulo minimalista posicionado no centro do frasco com bordas refinadas e logotipo em relevo dourado',
    neckLabelOrCap: 'Gargalo dourado polido espelhado com tampa magnética cilíndrica',
    surfaceTexture: 'Vidro impecavelmente polido sem impressões digitais, reflexos nítidos de luz de estúdio',
    packagingNutritional: 'Fundo da embalagem gravado a laser com especificações de 100ml - 3.4 FL.OZ. e código de lote',
    specialFeatures: 'Refração de luz de luxo e névoa ultrafina saindo do borrifador no modo funcional',
    props: [
        { id: 'p1', name: 'Bloco de Mármore Carrara', purpose: 'Pedestal de mármore branco com veios cinza como base do frasco' },
        { id: 'p2', name: 'Flores de Jasmim e Bergamota', purpose: 'Ingredientes olfativos naturais dispostos delicadamente ao lado' },
        { id: 'p3', name: 'Caixa de Embalagem Rígida', purpose: 'Caixa cartonada preta com berço de veludo aberta ao fundo' }
    ],
    backgroundEnvironment: 'Estúdio de alta perfumaria com gradiente suave de luz e sombras projetadas elegantes',
    brandColors: [
        { id: 'c1', label: 'Ouro Champagne', hex: '#D4AF37' },
        { id: 'c2', label: 'Cristal Transparente', hex: '#EAEAEA' },
        { id: 'c3', label: 'Âmbar Perfume', hex: '#E09F3E' },
        { id: 'c4', label: 'Preto Noite', hex: '#111111' }
    ],
    packagingViews: ['front_pack', 'side_pack', 'back_pack', 'top_lid', 'unfolded_label'],
    doNotChange: {
        productShape: true,
        materials: true,
        colorsAndBranding: true,
        typography: true,
        proportions: true,
        photorealism: true
    },
    customConsistencyRules: 'Preservar proporções de luxo, precisão do logo e clareza do vidro.',
    outputLayout: 'full_product_sheet',
    lighting: 'Luz direcional de estúdio cosmético com refletores prateados para destacar facetas do vidro',
    renderQuality: '8K Vogue Beauty & Luxury Editorial, hiper-realismo de materiais'
};

/**
 * Preset Padrão
 */
export const DEFAULT_PRODUCT_SHEET: ProductSheetData = BEER_REBRAND_PRESET;

/**
 * Compila o prompt mestre para geração ou rebranding do produto.
 */
export function compileProductSheetPrompt(
    data: ProductSheetData,
    uploadedImages?: ProductRebrandUploadedImages,
    targetPlatform: string = 'midjourney'
): string {
    const brandColorsString = data.brandColors && data.brandColors.length > 0
        ? data.brandColors.map(c => `${c.label} (${c.hex})`).join(', ')
        : '#0B2545, #D4AF37, #FFFFFF';

    const propsString = data.props && data.props.length > 0
        ? data.props.map(p => `${p.name} (${p.purpose})`).join('; ')
        : 'Complementary contextual props';

    const hasNewLogo = !!uploadedImages?.brandLogoImage;
    const hasNewLabel = !!uploadedImages?.packageLabelImage;
    const hasBaseProduct = !!uploadedImages?.baseProductImage;

    const uploadedDirectives: string[] = [];
    if (hasBaseProduct) {
        uploadedDirectives.push(`REFERENCE BASE PRODUCT: Keep the exact physical packaging silhouette, container materials, and dimensions from the reference image, but REPLACE all branding/labels with the new brand.`);
    }
    if (hasNewLogo) {
        uploadedDirectives.push(`NEW BRAND LOGO: Faithfully replicate and integrate the provided new brand logo onto the product packaging with exact typography and emblem geometry.`);
    }
    if (hasNewLabel) {
        uploadedDirectives.push(`NEW PACKAGE LABEL: Map the full provided label artwork seamlessly around the container cylinder/body, respecting surface curves, seam lines, and texture.`);
    }

    const consistencyClauses: string[] = [];
    if (data.doNotChange.productShape) consistencyClauses.push('Product shape and proportions strictly locked');
    if (data.doNotChange.materials) consistencyClauses.push('Authentic physical materials and tactile textures locked');
    if (data.doNotChange.colorsAndBranding) consistencyClauses.push('Brand color scheme and exact logo locked');
    if (data.doNotChange.typography) consistencyClauses.push('Typography, barcodes, and package text locked');
    if (data.doNotChange.photorealism) consistencyClauses.push('100% photorealistic commercial catalog presentation');

    // MODO 1: Ficha Completa de Produção / Product & Props Sheet (Estilo Fanice Ref)
    if (data.outputLayout === 'full_product_sheet') {
        let prompt = `Complete commercial product sheet and visual production reference presentation board, photographic ultra-high-definition catalog grid layout.
Product Title: "${data.newBrandName}" (${data.productCategory}).
Rebranding Objective: Replace original packaging branding "${data.originalBrandName}" with new custom brand "${data.newBrandName}".

[SECTION 1: PRODUCT OVERVIEW & SPECIFICATIONS]
- Category: ${data.productCategory}
- Materials: ${data.productMaterials}
- Dimensions: ${data.productDimensions}
- Key Features: ${data.keyFeatures.join(', ')}
- Brand Color Scheme: ${brandColorsString}

[SECTION 2: PRODUCT HERO VIEWS (5 VIEWS)]
Five aligned photorealistic angles of the product side-by-side:
1. Front View (Direct hero angle showing the primary new brand label and logo centered)
2. Back View (Rear view showing barcode, nutritional facts, and ingredient text)
3. Side View (Clean profile perspective highlighting container curves and side branding)
4. 3/4 View (Hero dynamic perspective with studio lighting highlights)
5. Functional / In-Use View (Product open, liquid pouring, or serving presentation)

[SECTION 3: PRODUCT CLOSE-UPS (HIGH MAGNIFICATION)]
Macro detail panels:
1. Logo / Label: Razor-sharp closeup of the new brand logo "${data.newBrandName}", crisp typography, and label boundary
2. Texture / Material: Tactile closeup of ${data.surfaceTexture}
3. Key Components: ${data.neckLabelOrCap}
4. Packaging Details: Clean barcode, regulatory stamps, and crisp micro-text
5. Identifying Features: ${data.specialFeatures}

[SECTION 4: PROPS & STYLING REFERENCE]
Contextual lifestyle props neatly arranged: ${propsString}. Clean styling on ${data.backgroundEnvironment}.

[SECTION 5: BRAND COLOR PALETTE]
Exact color swatches with precise hex codes: ${brandColorsString}.

[SECTION 6: PACKAGING / CONSTRUCTION VIEWS]
Technical packaging views: Front packaging, Side packaging, Back packaging, Top view, and Unfolded flat label artwork.

[SECTION 7: DO NOT CHANGE - CONSISTENCY LOCK]
${consistencyClauses.join('. ')}. ${data.customConsistencyRules}.
${uploadedDirectives.length > 0 ? uploadedDirectives.join(' ') + '.' : ''}

Lighting: ${data.lighting}. Render: ${data.renderQuality}, white border separations between sections, master commercial reference sheet.`;

        if (targetPlatform === 'midjourney') {
            prompt += ` --ar 3:4 --v 6.1 --style raw`;
        }
        return prompt;
    }

    // MODO 2: Mockup Comercial Hero Shot 3D / Fotográfico Único
    if (data.outputLayout === 'hero_commercial_shot') {
        let prompt = `Award-winning commercial product photography of "${data.newBrandName}" (${data.productCategory}).
Rebranded from "${data.originalBrandName}" to "${data.newBrandName}".
Container: ${data.productMaterials}, ${data.productDimensions}.
Label & Branding: ${data.labelPlacement}. ${data.neckLabelOrCap}.
Texture & Details: ${data.surfaceTexture}. Authentic physical interaction with light.
Key Accents: ${data.specialFeatures}.
Brand Palette: ${brandColorsString}.
Setting & Props: Styled on ${data.backgroundEnvironment} with subtle accompaniment: ${data.props.map(p => p.name).join(', ')}.
Lighting: ${data.lighting}.
Quality: ${data.renderQuality}, 8K resolution, zero blur on branding, commercial hero centerfold shot.`;

        if (targetPlatform === 'midjourney') {
            prompt += ` --ar 16:9 --v 6.1 --style raw`;
        }
        return prompt;
    }

    // MODO 3: Vistas Técnicas de Embalagem / Packaging Construction
    if (data.outputLayout === 'packaging_construction') {
        let prompt = `Orthographic packaging and industrial design reference sheet for "${data.newBrandName}" (${data.productCategory}).
Replacing original branding "${data.originalBrandName}" with "${data.newBrandName}".
Clean multi-angle alignment: Front View, Side View, Back View, Top Cap View, and Unfolded Flat Graphic Label.
Materials: ${data.productMaterials}, ${data.productDimensions}.
Exact Brand Colors: ${brandColorsString}.
Technical details: Crisp barcode, ingredient matrix, sharp typography, pristine packaging finish on clean neutral background.
Render: High-end industrial CAD render, Hasselblad 100MP clarity, 8K.`;

        if (targetPlatform === 'midjourney') {
            prompt += ` --ar 16:9 --v 6.1 --style raw`;
        }
        return prompt;
    }

    // MODO 4: Lifestyle em Uso / Cena de Consumo
    let prompt = `Editorial lifestyle advertising photograph of "${data.newBrandName}" in authentic consumption context.
Rebranded packaging: ${data.productMaterials}, displaying new brand label "${data.newBrandName}" with pristine clarity.
Catering environment: ${data.backgroundEnvironment}.
Props: ${propsString}.
Lighting: ${data.lighting}.
Commercial advertising master shot, mouth-watering / luxurious presentation, 8K resolution.`;

    if (targetPlatform === 'midjourney') {
        prompt += ` --ar 16:9 --v 6.1 --style raw`;
    }
    return prompt;
}

/**
 * Envia as imagens do produto base + novo logo + novo rótulo para o endpoint multimodal do Gemini
 * para extrair a ficha técnica e analisar o rebranding automaticamente.
 */
export async function extractProductSheetFromImages(
    images: ProductRebrandUploadedImages,
    userInstructions?: string
): Promise<Partial<ProductSheetData>> {
    const res = await fetch('/api/gemini/extract-product-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            baseProductImage: images.baseProductImage ? {
                data: images.baseProductImage.base64,
                mimeType: images.baseProductImage.mimeType,
                name: images.baseProductImage.name
            } : undefined,
            brandLogoImage: images.brandLogoImage ? {
                data: images.brandLogoImage.base64,
                mimeType: images.brandLogoImage.mimeType,
                name: images.brandLogoImage.name
            } : undefined,
            packageLabelImage: images.packageLabelImage ? {
                data: images.packageLabelImage.base64,
                mimeType: images.packageLabelImage.mimeType,
                name: images.packageLabelImage.name
            } : undefined,
            propsOrTextureImage: images.propsOrTextureImage ? {
                data: images.propsOrTextureImage.base64,
                mimeType: images.propsOrTextureImage.mimeType,
                name: images.propsOrTextureImage.name
            } : undefined,
            userInstructions
        })
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Falha na análise multimodal das imagens do produto' }));
        throw new Error(err.error || `Erro HTTP ${res.status}`);
    }

    return await res.json();
}
