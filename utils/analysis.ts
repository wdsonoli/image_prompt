
import { AnalysisResult } from '../types';

export const analyzeImage = async (file: File): Promise<AnalysisResult> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d', { willReadFrequently: true });
                    if (!ctx) {
                        reject(new Error('Não foi possível obter o contexto do canvas.'));
                        return;
                    }

                    const maxSize = 400;
                    let width = img.width;
                    let height = img.height;

                    if (width === 0 || height === 0) {
                        reject(new Error('Imagem inválida (dimensões zero).'));
                        return;
                    }

                    if (width > height && width > maxSize) {
                        height = Math.round(height * maxSize / width);
                        width = maxSize;
                    } else if (height > maxSize) {
                        width = Math.round(width * maxSize / height);
                        height = maxSize;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    const imageData = ctx.getImageData(0, 0, width, height);
                    if (!imageData) {
                        reject(new Error('Falha ao ler dados da imagem do canvas.'));
                        return;
                    }
                    const data = imageData.data;

                    const colors = analyzeColors(data, width * height);
                    const brightness = analyzeBrightness(data);
                    const saturation = analyzeSaturation(data);
                    const contrast = analyzeContrast(data);
                    const composition = analyzeComposition(img.width, img.height);
                    
                    // New Granular Analysis
                    const sharpness = analyzeSharpness(data, width, height);
                    const depthOfField = analyzeDepthOfField(data, width, height);
                    const contourComplexity = analyzeContours(data, width, height);

                    resolve({
                        colors,
                        brightness,
                        saturation,
                        contrast,
                        composition,
                        sharpness,
                        depthOfField,
                        contourComplexity,
                        stats: {
                            width: img.width,
                            height: img.height,
                            aspectRatio: (img.width / img.height).toFixed(2)
                        },
                        timestamp: Date.now()
                    });
                } catch (error) {
                    reject(error);
                }
            };
            img.onerror = () => reject(new Error('Falha ao carregar a imagem. O arquivo pode estar corrompido.'));
            img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
        reader.readAsDataURL(file);
    });
};

function rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

function groupColor(hex: string): string {
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);

    const groupedR = Math.floor(r / 32) * 32;
    const groupedG = Math.floor(g / 32) * 32;
    const groupedB = Math.floor(b / 32) * 32;

    return rgbToHex(groupedR, groupedG, groupedB);
}

function analyzeColors(data: Uint8ClampedArray, pixelCount: number) {
    const colorMap: Record<string, number> = {};
    const sampleStep = Math.max(1, Math.floor(pixelCount / 10000));

    for (let i = 0; i < data.length; i += 4 * sampleStep) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const hex = rgbToHex(r, g, b);
        const groupedHex = groupColor(hex);
        colorMap[groupedHex] = (colorMap[groupedHex] || 0) + 1;
    }

    const sortedColors = Object.entries(colorMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(entry => entry[0]);

    let warmCount = 0;
    let coolCount = 0;
    let saturatedCount = 0;

    sortedColors.forEach(hex => {
        const r = parseInt(hex.substr(1, 2), 16);
        const g = parseInt(hex.substr(3, 2), 16);
        const b = parseInt(hex.substr(5, 2), 16);

        if (r > g && r > b) warmCount++;
        if (b > r && b > g) coolCount++;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = max === 0 ? 0 : (max - min) / max;
        if (saturation > 0.5) saturatedCount++;
    });

    let paletteType: 'warm' | 'cool' | 'vibrant' | 'dark' | 'balanced' = 'balanced';
    if (warmCount > coolCount && warmCount > 2) paletteType = 'warm';
    else if (coolCount > warmCount && coolCount > 2) paletteType = 'cool';
    else if (saturatedCount > 2) paletteType = 'vibrant';
    else if (sortedColors.length > 0 && sortedColors[0].startsWith("#0")) paletteType = 'dark';

    return { dominantColors: sortedColors, paletteType };
}

function analyzeBrightness(data: Uint8ClampedArray): 'high' | 'medium' | 'low' {
    let totalBrightness = 0;
    const sampleStep = Math.max(1, Math.floor(data.length / 40000));
    let samples = 0;

    for (let i = 0; i < data.length; i += 4 * sampleStep) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        totalBrightness += 0.299 * r + 0.587 * g + 0.114 * b;
        samples++;
    }

    const avgBrightness = samples ? totalBrightness / samples : 0;
    const normalized = avgBrightness / 255;

    if (normalized > 0.7) return 'high';
    if (normalized > 0.4) return 'medium';
    return 'low';
}

function analyzeSaturation(data: Uint8ClampedArray): 'high' | 'medium' | 'low' {
    let totalSaturation = 0;
    const sampleStep = Math.max(1, Math.floor(data.length / 40000));
    let samples = 0;

    for (let i = 0; i < data.length; i += 4 * sampleStep) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = max === 0 ? 0 : (max - min) / max;
        totalSaturation += saturation;
        samples++;
    }

    const avgSaturation = samples ? totalSaturation / samples : 0;
    if (avgSaturation > 0.6) return 'high';
    if (avgSaturation > 0.3) return 'medium';
    return 'low';
}

function analyzeContrast(data: Uint8ClampedArray): 'high' | 'medium' | 'low' {
    let minBrightness = 255;
    let maxBrightness = 0;
    const sampleStep = Math.max(1, Math.floor(data.length / 40000));

    for (let i = 0; i < data.length; i += 4 * sampleStep) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        minBrightness = Math.min(minBrightness, brightness);
        maxBrightness = Math.max(maxBrightness, brightness);
    }

    const contrast = (maxBrightness - minBrightness) / 255;
    if (contrast > 0.7) return 'high';
    if (contrast > 0.4) return 'medium';
    return 'low';
}

function analyzeComposition(width: number, height: number): 'landscape' | 'portrait' | 'square' | 'standard' {
    const ratio = width / height;
    if (ratio > 1.5) return 'landscape';
    if (ratio < 0.7) return 'portrait';
    if (ratio >= 0.9 && ratio <= 1.1) return 'square';
    return 'standard';
}

/** 
 * New Analysis Helpers 
 */

function analyzeSharpness(data: Uint8ClampedArray, width: number, height: number): 'crisp' | 'soft' | 'blurred' {
    let edgeEnergy = 0;
    const samples = 10000;
    const step = Math.max(1, Math.floor((width * height) / samples));

    for (let i = 0; i < data.length - 4; i += 4 * step) {
        const r1 = data[i], g1 = data[i+1], b1 = data[i+2];
        const r2 = data[i+4], g2 = data[i+5], b2 = data[i+6];
        const lum1 = (r1 + g1 + b1) / 3;
        const lum2 = (r2 + g2 + b2) / 3;
        edgeEnergy += Math.abs(lum1 - lum2);
    }

    const avgEnergy = edgeEnergy / samples;
    if (avgEnergy > 25) return 'crisp';
    if (avgEnergy > 10) return 'soft';
    return 'blurred';
}

function analyzeDepthOfField(data: Uint8ClampedArray, width: number, height: number): 'shallow' | 'deep' | 'balanced' {
    const samples = 2000;
    const step = Math.max(1, Math.floor((width * height) / samples));
    
    let centerEnergy = 0;
    let edgeEnergy = 0;
    let centerCount = 0;
    let edgeCount = 0;

    const centerXStart = width * 0.25;
    const centerXEnd = width * 0.75;
    const centerYStart = height * 0.25;
    const centerYEnd = height * 0.75;

    for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
            const idx = (y * width + x) * 4;
            if (idx >= data.length - 4) break;
            
            const r1 = data[idx], g1 = data[idx+1], b1 = data[idx+2];
            const r2 = data[idx+4], g2 = data[idx+5], b2 = data[idx+6];
            const diff = Math.abs((r1+g1+b1)/3 - (r2+g2+b2)/3);

            if (x > centerXStart && x < centerXEnd && y > centerYStart && y < centerYEnd) {
                centerEnergy += diff;
                centerCount++;
            } else {
                edgeEnergy += diff;
                edgeCount++;
            }
        }
    }

    const avgCenter = centerEnergy / (centerCount || 1);
    const avgEdge = edgeEnergy / (edgeCount || 1);

    if (avgCenter > avgEdge * 2.5) return 'shallow';
    if (avgEdge > 15) return 'deep';
    return 'balanced';
}

function analyzeContours(data: Uint8ClampedArray, width: number, height: number): 'high' | 'medium' | 'low' {
    let complexity = 0;
    const step = 4;
    for (let i = 0; i < data.length - (width * step); i += step * 20) {
        const lum1 = (data[i] + data[i+1] + data[i+2]) / 3;
        const lumBelow = (data[i + width * step] + data[i + width * step + 1] + data[i + width * step + 2]) / 3;
        if (Math.abs(lum1 - lumBelow) > 30) complexity++;
    }

    if (complexity > 1500) return 'high';
    if (complexity > 500) return 'medium';
    return 'low';
}
