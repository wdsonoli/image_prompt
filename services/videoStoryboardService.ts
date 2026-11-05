import { VideoAdStoryboard, VideoScene } from "../types";

export interface GenerateStoryboardParams {
    imageBase64?: string;
    mimeType?: string;
    creatorImageBase64?: string;
    creatorMimeType?: string;
    targetDuration: number; // 10 to 30
    adStyle?: string;
    creatorType?: string;
    productName?: string;
    platformTarget?: string;
    customDirectives?: string;
}

/**
 * Invokes the backend endpoint to generate a full Video Ad Storyboard with scene breakdown
 * and a Master 6-panel grid prompt matching the reference advertisement layout.
 */
export async function generateVideoAdStoryboard(params: GenerateStoryboardParams): Promise<VideoAdStoryboard> {
    const res = await fetch('/api/gemini/video-ad-storyboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Falha na comunicação com o servidor' }));
        throw new Error(errorData.error || `Erro HTTP ${res.status}`);
    }

    const data: VideoAdStoryboard = await res.json();
    return data;
}

/**
 * Draws the complete multi-panel storyboard onto an HTML5 Canvas matching the reference image layout!
 * Generates an ultra-crisp high-resolution PNG image suitable for instant download or sharing.
 */
export async function renderStoryboardToCanvas(
    storyboard: VideoAdStoryboard,
    panelImageUrls: (string | null)[],
    referenceProductImage?: string | null
): Promise<string> {
    const canvas = document.createElement('canvas');
    const cols = 3;
    const rows = 2;
    const width = 1800; // Ultra high-res
    const height = 2000;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Não foi possível inicializar o canvas 2D");

    // Clean background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const margin = 24;
    const gap = 20;
    const availableWidth = width - (margin * 2) - (gap * (cols - 1));
    const availableHeight = height - (margin * 2) - (gap * (rows - 1));
    const cellWidth = availableWidth / cols;
    const cellHeight = availableHeight / rows;

    // Load any images provided
    const loadedImages: (HTMLImageElement | null)[] = await Promise.all(
        panelImageUrls.map(url => {
            if (!url) return Promise.resolve(null);
            return new Promise<HTMLImageElement | null>((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => resolve(img);
                img.onerror = () => resolve(null);
                img.src = url;
            });
        })
    );

    let defaultProductImg: HTMLImageElement | null = null;
    if (referenceProductImage) {
        defaultProductImg = await new Promise<HTMLImageElement | null>((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = referenceProductImage;
        });
    }

    const scenes = storyboard.scenes.slice(0, 6);

    for (let i = 0; i < 6; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = margin + col * (cellWidth + gap);
        const y = margin + row * (cellHeight + gap);

        const scene = scenes[i] || {
            sceneNumber: i + 1,
            badgeTitle: `${i + 1} Cena ${i + 1}`,
            voiceoverScript: "Texto da cena...",
            duration: 5
        };

        // Draw rounded rectangle container
        ctx.save();
        ctx.beginPath();
        const r = 24;
        ctx.roundRect(x, y, cellWidth, cellHeight, r);
        ctx.clip();

        // 1. Photo / Background
        const img = loadedImages[i] || defaultProductImg;
        if (img) {
            // Draw image covering the panel
            const imgAspect = img.width / img.height;
            const panelAspect = cellWidth / cellHeight;
            let drawW = cellWidth;
            let drawH = cellHeight;
            let offsetX = x;
            let offsetY = y;

            if (imgAspect > panelAspect) {
                drawW = cellHeight * imgAspect;
                offsetX = x - (drawW - cellWidth) / 2;
            } else {
                drawH = cellWidth / imgAspect;
                offsetY = y - (drawH - cellHeight) / 2;
            }
            ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

            // Subtle dark gradient at bottom for speech bubble legibility
            const grad = ctx.createLinearGradient(x, y + cellHeight * 0.5, x, y + cellHeight);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(1, 'rgba(0,0,0,0.4)');
            ctx.fillStyle = grad;
            ctx.fillRect(x, y, cellWidth, cellHeight);
        } else {
            // Clean gradient placeholder
            const grad = ctx.createLinearGradient(x, y, x + cellWidth, y + cellHeight);
            if (i === 0) { grad.addColorStop(0, '#fef3c7'); grad.addColorStop(1, '#fed7aa'); }
            else if (i === 1) { grad.addColorStop(0, '#e0f2fe'); grad.addColorStop(1, '#bae6fd'); }
            else if (i === 2) { grad.addColorStop(0, '#ffedd5'); grad.addColorStop(1, '#fed7aa'); }
            else if (i === 3) { grad.addColorStop(0, '#fef9c3'); grad.addColorStop(1, '#fde047'); }
            else if (i === 4) { grad.addColorStop(0, '#fce7f3'); grad.addColorStop(1, '#fbcfe8'); }
            else { grad.addColorStop(0, '#ecfdf5'); grad.addColorStop(1, '#a7f3d0'); }

            ctx.fillStyle = grad;
            ctx.fillRect(x, y, cellWidth, cellHeight);

            // Decorative placeholder text
            ctx.fillStyle = '#1e293b';
            ctx.font = 'bold 26px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(scene.badgeTitle || `Cena ${i + 1}`, x + cellWidth / 2, y + cellHeight * 0.45);
            ctx.font = 'normal 18px sans-serif';
            ctx.fillStyle = '#475569';
            ctx.fillText(`Duração: ${scene.duration || 5}s`, x + cellWidth / 2, y + cellHeight * 0.52);
        }

        ctx.restore();

        // Border around panel
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(x, y, cellWidth, cellHeight, r);
        ctx.stroke();

        // 2. Numbered Pill Badge (Top-left, Dark Blue with circular number)
        const badgeText = scene.badgeTitle || `${i + 1} Cena ${i + 1}`;
        const badgeX = x + 16;
        const badgeY = y + 16;
        const badgeH = 40;
        ctx.font = 'bold 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const badgeWidth = Math.max(160, ctx.measureText(badgeText).width + 36);

        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.25)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 2;

        // Dark navy blue pill
        ctx.fillStyle = '#0f3a63';
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeWidth, badgeH, 20);
        ctx.fill();
        ctx.restore();

        // White circular number icon or check
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(badgeX + 20, badgeY + badgeH / 2, 13, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f3a63';
        ctx.font = 'black 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(i + 1), badgeX + 20, badgeY + badgeH / 2);

        // Badge text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        const cleanBadge = badgeText.replace(/^[0-9]+\s*/, '');
        ctx.fillText(cleanBadge, badgeX + 40, badgeY + badgeH / 2);

        // 3. Bottom White Speech Bubble / Caption
        const scriptText = scene.voiceoverScript || '';
        if (scriptText) {
            const bubbleMargin = 16;
            const bubbleW = cellWidth - bubbleMargin * 2;
            const bubbleH = 110;
            const bubbleX = x + bubbleMargin;
            const bubbleY = y + cellHeight - bubbleH - bubbleMargin;

            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 12;
            ctx.shadowOffsetY = 4;

            // White rounded pill
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 26);
            ctx.fill();
            ctx.restore();

            // Wrapped Text inside speech bubble
            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const maxTextWidth = bubbleW - 40;
            const words = scriptText.split(' ');
            const lines: string[] = [];
            let currentLine = words[0] || '';

            for (let w = 1; w < words.length; w++) {
                const word = words[w];
                const widthWithWord = ctx.measureText(currentLine + " " + word).width;
                if (widthWithWord < maxTextWidth) {
                    currentLine += " " + word;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }
            if (currentLine) lines.push(currentLine);

            const limitedLines = lines.slice(0, 3);
            const lineHeight = 26;
            const startY = bubbleY + (bubbleH - limitedLines.length * lineHeight) / 2 + lineHeight / 2;

            limitedLines.forEach((line, lineIndex) => {
                ctx.fillText(line, bubbleX + bubbleW / 2, startY + lineIndex * lineHeight);
            });
        }
    }

    return canvas.toDataURL('image/png');
}
