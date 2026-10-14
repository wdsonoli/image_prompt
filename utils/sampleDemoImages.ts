/**
 * Sample demonstration images inspired by remove.photos and removebackgrounds.ai
 * Provides instant 1-click test images for users to benchmark:
 * 1. White sneaker on white background (verifying smart white element protection)
 * 2. Portrait with fine curly hair (verifying hair strand feathering)
 * 3. Cute pet with fur (verifying fur & organic edge isolation)
 * 4. Luxury cosmetics perfume (verifying e-commerce product cutout)
 */

export interface DemoSampleItem {
    id: string;
    title: string;
    category: string;
    badge: string;
    badgeColor: string;
    description: string;
    getDataUrl: () => string;
}

/**
 * Generates an 800x800 high quality test image of a white sneaker on an off-white background
 * Specially designed to test the white-shielding engine!
 */
function createWhiteSneakerSample(): string {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // 1. White / Off-white background (to challenge the background remover)
    const bgGrad = ctx.createLinearGradient(0, 0, 800, 800);
    bgGrad.addColorStop(0, '#f9fafb');
    bgGrad.addColorStop(1, '#f1f5f9');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 800, 800);

    // Subtle soft floor shadow beneath sneaker
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(400, 560, 260, 32, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
    ctx.filter = 'blur(10px)';
    ctx.fill();
    ctx.filter = 'none';
    ctx.restore();

    // 2. Sneaker Sole (White rubber + gum rubber bottom)
    ctx.save();
    // Gum outsole bottom
    ctx.beginPath();
    ctx.moveTo(180, 530);
    ctx.quadraticCurveTo(400, 560, 640, 500);
    ctx.quadraticCurveTo(650, 515, 630, 535);
    ctx.quadraticCurveTo(400, 575, 175, 545);
    ctx.closePath();
    ctx.fillStyle = '#d97706'; // caramel gum sole
    ctx.fill();

    // White Midsole
    ctx.beginPath();
    ctx.moveTo(175, 510);
    ctx.quadraticCurveTo(380, 535, 630, 480);
    ctx.quadraticCurveTo(645, 500, 635, 520);
    ctx.quadraticCurveTo(390, 555, 170, 530);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#e2e8f0';
    ctx.stroke();

    // Sole texture grooves
    for (let x = 220; x < 600; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 522);
        ctx.lineTo(x + 10, 542);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2.5;
        ctx.stroke();
    }

    // 3. Sneaker Upper Body (WHITE leather + white mesh - this is the critical part that must NOT be removed!)
    ctx.beginPath();
    ctx.moveTo(175, 510);
    // Heel counter going up
    ctx.quadraticCurveTo(165, 420, 195, 340);
    // Ankle collar
    ctx.quadraticCurveTo(240, 310, 290, 330);
    // Eyestay / Tongue going down
    ctx.quadraticCurveTo(350, 370, 470, 430);
    // Toe box (front curve)
    ctx.quadraticCurveTo(570, 440, 630, 480);
    // Sole line connection
    ctx.quadraticCurveTo(380, 535, 175, 510);
    ctx.closePath();
    ctx.fillStyle = '#ffffff'; // Pure white upper!
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#e2e8f0';
    ctx.stroke();

    // Inner mesh overlay texture
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(320, 390);
    ctx.quadraticCurveTo(440, 430, 530, 455);
    ctx.quadraticCurveTo(460, 490, 310, 470);
    ctx.closePath();
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.restore();

    // Blue accent stripe / swoosh to give contrast
    ctx.beginPath();
    ctx.moveTo(270, 445);
    ctx.quadraticCurveTo(390, 475, 540, 460);
    ctx.quadraticCurveTo(440, 500, 260, 470);
    ctx.closePath();
    ctx.fillStyle = '#0284c7';
    ctx.fill();

    // White Laces over the tongue
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#ffffff';
    ctx.lineCap = 'round';
    const laceY = [350, 375, 400, 425];
    laceY.forEach((ly, idx) => {
        ctx.beginPath();
        ctx.moveTo(300 + idx * 25, ly);
        ctx.lineTo(345 + idx * 25, ly + 18);
        ctx.stroke();
    });

    // Heel tab in crimson
    ctx.beginPath();
    ctx.arc(205, 325, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#e11d48';
    ctx.fill();

    ctx.restore();
    return canvas.toDataURL('image/png');
}

/**
 * Generates an 800x800 sample of a portrait with curly flyaway hair
 * Ideal for testing the hair-refinement and color-despill engine!
 */
function createCurlyHairSample(): string {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Studio Backdrop (Neutral cyan-grey gradient)
    const bgGrad = ctx.createRadialGradient(400, 380, 50, 400, 400, 500);
    bgGrad.addColorStop(0, '#e0f2fe');
    bgGrad.addColorStop(1, '#bae6fd');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 800, 800);

    // Torso / Shoulders with white-cream shirt
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(150, 800);
    ctx.quadraticCurveTo(240, 620, 340, 600);
    ctx.lineTo(460, 600);
    ctx.quadraticCurveTo(560, 620, 650, 800);
    ctx.closePath();
    ctx.fillStyle = '#ffffff'; // White shirt
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Neck
    ctx.beginPath();
    ctx.rect(360, 510, 80, 110);
    ctx.fillStyle = '#c68662'; // Warm skin tone
    ctx.fill();

    // Face / Head
    ctx.beginPath();
    ctx.ellipse(400, 410, 120, 145, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#d99772';
    ctx.fill();

    // Cheeks & Eyes
    ctx.fillStyle = '#3e2723';
    ctx.beginPath();
    ctx.ellipse(360, 395, 12, 7, 0, 0, Math.PI * 2);
    ctx.ellipse(440, 395, 12, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.beginPath();
    ctx.arc(400, 460, 30, 0.2, Math.PI - 0.2);
    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Curly Hair Volume with fine individual curly strands
    ctx.fillStyle = '#261710';
    for (let angle = 0; angle < Math.PI * 2; angle += 0.08) {
        if (angle > 0.8 && angle < 2.3) continue; // Skip chin/neck area
        const r = 160 + Math.sin(angle * 14) * 28 + Math.cos(angle * 7) * 16;
        const x = 400 + Math.cos(angle) * r;
        const y = 370 + Math.sin(angle) * r;
        ctx.beginPath();
        ctx.arc(x, y, 22 + Math.sin(angle * 5) * 8, 0, Math.PI * 2);
        ctx.fill();
    }

    // Fine hair flyaway curls around edges (tests hair refinement)
    ctx.strokeStyle = '#3e2723';
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 40; i++) {
        const rad = (i / 40) * Math.PI * 1.6 - 0.3;
        const startX = 400 + Math.cos(rad) * 190;
        const startY = 370 + Math.sin(rad) * 190;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(
            startX + Math.sin(i * 3) * 35,
            startY - Math.cos(i * 2) * 25,
            startX + Math.sin(i * 4) * 55,
            startY + Math.cos(i * 3) * 45
        );
        ctx.stroke();
    }

    ctx.restore();
    return canvas.toDataURL('image/png');
}

/**
 * Generates an 800x800 sample of a cute pet with delicate fur
 */
function createPetFurSample(): string {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Warm pastel yellow background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 800);
    bgGrad.addColorStop(0, '#fef9c3');
    bgGrad.addColorStop(1, '#fef08a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 800, 800);

    ctx.save();
    // Pet Body
    ctx.beginPath();
    ctx.ellipse(400, 620, 200, 180, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#d97706'; // Golden fur
    ctx.fill();

    // White fur patch on chest
    ctx.beginPath();
    ctx.ellipse(400, 600, 85, 110, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff'; // White chest fur
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(400, 390, 140, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();

    // Fluffy Ears
    ctx.beginPath();
    ctx.ellipse(280, 340, 48, 85, -0.4, 0, Math.PI * 2);
    ctx.ellipse(520, 340, 48, 85, 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#b45309';
    ctx.fill();

    // Snout
    ctx.beginPath();
    ctx.ellipse(400, 430, 65, 50, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Nose
    ctx.beginPath();
    ctx.arc(400, 410, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();

    // Eyes
    ctx.beginPath();
    ctx.arc(340, 360, 18, 0, Math.PI * 2);
    ctx.arc(460, 360, 18, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    // Eye shine
    ctx.beginPath();
    ctx.arc(345, 355, 6, 0, Math.PI * 2);
    ctx.arc(465, 355, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Fine Fur Strands around ears and cheeks
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    for (let i = 0; i < 60; i++) {
        const ang = (i / 60) * Math.PI * 2;
        const x1 = 400 + Math.cos(ang) * 138;
        const y1 = 390 + Math.sin(ang) * 138;
        const x2 = 400 + Math.cos(ang) * (155 + (i % 3) * 6);
        const y2 = 390 + Math.sin(ang) * (155 + (i % 3) * 6);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    // Whiskers
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(380, 430); ctx.lineTo(260, 410);
    ctx.moveTo(380, 440); ctx.lineTo(250, 445);
    ctx.moveTo(420, 430); ctx.lineTo(540, 410);
    ctx.moveTo(420, 440); ctx.lineTo(550, 445);
    ctx.stroke();

    ctx.restore();
    return canvas.toDataURL('image/png');
}

/**
 * Generates an 800x800 luxury perfume sample on a pedestal
 * Ideal for testing commercial e-commerce cutouts
 */
function createPerfumeSample(): string {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Studio soft grey background
    const bgGrad = ctx.createLinearGradient(0, 0, 800, 800);
    bgGrad.addColorStop(0, '#f1f5f9');
    bgGrad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 800, 800);

    ctx.save();
    // Pedestal
    ctx.beginPath();
    ctx.ellipse(400, 640, 240, 40, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#cbd5e1';
    ctx.fill();
    ctx.beginPath();
    ctx.rect(160, 640, 480, 70);
    ctx.fillStyle = '#94a3b8';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(400, 710, 240, 40, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#64748b';
    ctx.fill();

    // Perfume Glass Bottle Body
    ctx.beginPath();
    ctx.roundRect(280, 320, 240, 310, 28);
    // Amber fragrance inside glass
    const glassGrad = ctx.createLinearGradient(280, 320, 520, 630);
    glassGrad.addColorStop(0, '#fef3c7');
    glassGrad.addColorStop(0.3, '#f59e0b');
    glassGrad.addColorStop(0.8, '#d97706');
    glassGrad.addColorStop(1, '#92400e');
    ctx.fillStyle = glassGrad;
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.stroke();

    // Glass reflection highlights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.roundRect(300, 340, 25, 260, 10);
    ctx.fill();

    // Gold Cap
    ctx.beginPath();
    ctx.roundRect(340, 210, 120, 110, 12);
    const goldGrad = ctx.createLinearGradient(340, 210, 460, 320);
    goldGrad.addColorStop(0, '#fef08a');
    goldGrad.addColorStop(0.5, '#ca8a04');
    goldGrad.addColorStop(1, '#854d0e');
    ctx.fillStyle = goldGrad;
    ctx.fill();
    ctx.strokeStyle = '#fef9c3';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Minimalist Luxury Brand Label
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(330, 430, 140, 80, 6);
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('L’ÉCLAT', 400, 465);
    ctx.font = '10px sans-serif';
    ctx.fillText('EAU DE PARFUM', 400, 485);

    ctx.restore();
    return canvas.toDataURL('image/png');
}

export const SAMPLE_DEMO_IMAGES: DemoSampleItem[] = [
    {
        id: 'white_sneaker',
        title: 'Tênis Branco em Fundo Branco',
        category: 'Blindagem de Branco',
        badge: 'Peças Brancas',
        badgeColor: 'bg-emerald-500 text-slate-950',
        description: 'Demonstra a proteção inteligente: não apaga a parte branca do produto, mantendo o corpo e cadarços brancos intactos!',
        getDataUrl: createWhiteSneakerSample
    },
    {
        id: 'curly_hair',
        title: 'Retrato Feminino & Cabelo Cacheado',
        category: 'Refino de Cabelo',
        badge: 'Cabelos Finos',
        badgeColor: 'bg-cyan-500 text-slate-950',
        description: 'Testa o isolamento de mechas soltas, fios de cabelo e despill de cor nas bordas.',
        getDataUrl: createCurlyHairSample
    },
    {
        id: 'pet_fur',
        title: 'Pet Golden & Pelos Finos',
        category: 'Pelos e Animais',
        badge: 'Pelos de Pet',
        badgeColor: 'bg-amber-500 text-slate-950',
        description: 'Testa a detecção de texturas macias, bigodes e contornos de animais de estimação.',
        getDataUrl: createPetFurSample
    },
    {
        id: 'perfume_luxury',
        title: 'Perfume de Luxo & Frasco de Vidro',
        category: 'E-commerce',
        badge: 'Transparência & Vidro',
        badgeColor: 'bg-purple-500 text-slate-950',
        description: 'Ideal para lojas virtuais e marketplaces: preserva brilhos de vidro e pedestaís.',
        getDataUrl: createPerfumeSample
    }
];
