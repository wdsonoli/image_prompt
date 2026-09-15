/**
 * Utilitário para extrair e carregar imagens a partir de qualquer link/URL
 * Suporta:
 * - URLs diretas (JPG, PNG, WebP, GIF, SVG, AVIF, JFIF, etc.)
 * - URLs com parâmetros de consulta (Unsplash, Pinterest, Imgur, CDN, etc.)
 * - Páginas da web que contêm imagem (extrai og:image, twitter:image, img tag principal)
 * - Data URLs (base64)
 * - Links do Google Imagens (extrai parâmetro imgurl)
 * - Contorno automático de restrições de CORS via proxies resilientes
 */

/**
 * Mapeamento de tipo MIME para extensão de arquivo
 */
const MIME_TO_EXT: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'image/avif': 'avif',
    'image/jfif': 'jfif',
    'image/x-icon': 'ico',
    'image/bmp': 'bmp',
    'image/tiff': 'tiff'
};

/**
 * Limpa e extrai a URL real de uma string informada pelo usuário
 */
export const extractImageUrlFromText = (input: string): string => {
    let clean = input.trim();

    // Remove tags markdown do tipo ![alt](url)
    const markdownMatch = clean.match(/!\[.*?\]\((https?:\/\/[^\s\)]+)\)/i);
    if (markdownMatch && markdownMatch[1]) {
        return markdownMatch[1];
    }

    // Remove tags HTML <img src="...">
    const htmlImgMatch = clean.match(/<img[^>]+src=["'](https?:\/\/[^"']+)["']/i);
    if (htmlImgMatch && htmlImgMatch[1]) {
        return htmlImgMatch[1];
    }

    // Trata links do Google Imagens que contêm ?imgurl= ou &imgurl=
    if (clean.includes('google.') && clean.includes('imgurl=')) {
        try {
            const urlObj = new URL(clean);
            const imgUrlParam = urlObj.searchParams.get('imgurl');
            if (imgUrlParam) {
                return decodeURIComponent(imgUrlParam);
            }
        } catch {
            const match = clean.match(/[?&]imgurl=([^&]+)/i);
            if (match && match[1]) {
                return decodeURIComponent(match[1]);
            }
        }
    }

    // Trata links do Bing imagens com &mediaurl=
    if (clean.includes('bing.') && clean.includes('mediaurl=')) {
        try {
            const urlObj = new URL(clean);
            const mediaUrl = urlObj.searchParams.get('mediaurl');
            if (mediaUrl) return decodeURIComponent(mediaUrl);
        } catch {
            // continua
        }
    }

    // Remove aspas ou parênteses circundantes
    clean = clean.replace(/^["'<(\[]+|["'>)\]]+$/g, '').trim();

    return clean;
};

/**
 * Converte Data URL em File
 */
const dataUrlToFile = async (dataUrl: string): Promise<File> => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const mime = blob.type || 'image/png';
    const ext = MIME_TO_EXT[mime] || 'png';
    return new File([blob], `image-${Date.now()}.${ext}`, { type: mime });
};

/**
 * Tenta buscar com timeout
 */
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs = 9000): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timer);
        return response;
    } catch (err) {
        clearTimeout(timer);
        throw err;
    }
};

/**
 * Extrai URL de imagem embutida em HTML (OpenGraph, Twitter card, link rel, tag img)
 */
const extractImageFromHtml = (html: string, baseUrl: string): string | null => {
    // 1. Prioriza OpenGraph meta og:image
    const ogMatch = html.match(/<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i)
        || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["']/i);
    if (ogMatch && ogMatch[1]) {
        return resolveUrl(ogMatch[1], baseUrl);
    }

    // 2. Twitter image
    const twitterMatch = html.match(/<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i)
        || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["']/i);
    if (twitterMatch && twitterMatch[1]) {
        return resolveUrl(twitterMatch[1], baseUrl);
    }

    // 3. Link rel="image_src"
    const linkMatch = html.match(/<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i);
    if (linkMatch && linkMatch[1]) {
        return resolveUrl(linkMatch[1], baseUrl);
    }

    // 4. Schema.org image
    const itemPropMatch = html.match(/<meta[^>]+itemprop=["']image["'][^>]+content=["']([^"']+)["']/i);
    if (itemPropMatch && itemPropMatch[1]) {
        return resolveUrl(itemPropMatch[1], baseUrl);
    }

    // 5. Procura tags <img> significativas (ignorando trackers de 1px ou svg minúsculos)
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let match: RegExpExecArray | null;
    const candidates: string[] = [];
    while ((match = imgRegex.exec(html)) !== null) {
        const src = match[1];
        if (src && !src.includes('spacer') && !src.includes('tracking') && !src.includes('1x1') && !src.startsWith('data:image/svg')) {
            candidates.push(resolveUrl(src, baseUrl));
        }
    }
    if (candidates.length > 0) {
        return candidates[0];
    }

    return null;
};

/**
 * Resolve URL relativa em absoluta
 */
const resolveUrl = (relativeOrAbsolute: string, baseUrl: string): string => {
    try {
        return new URL(relativeOrAbsolute, baseUrl).href;
    } catch {
        return relativeOrAbsolute;
    }
};

/**
 * Cria um nome de arquivo legível a partir de URL e MIME type
 */
const createFileName = (url: string, mimeType: string): string => {
    try {
        const parsed = new URL(url);
        const pathname = parsed.pathname;
        const lastSegment = pathname.substring(pathname.lastIndexOf('/') + 1).trim();
        const baseExt = MIME_TO_EXT[mimeType] || 'jpg';

        if (lastSegment && /\.(jpe?g|png|webp|gif|svg|avif|jfif|bmp)$/i.test(lastSegment)) {
            // Nome limpo existente
            return lastSegment.replace(/[^a-zA-Z0-9._-]/g, '_');
        }

        if (lastSegment && lastSegment.length > 2) {
            const cleanName = lastSegment.replace(/[^a-zA-Z0-9_-]/g, '_');
            return `${cleanName}.${baseExt}`;
        }
    } catch {
        // segue para o fallback
    }

    const ext = MIME_TO_EXT[mimeType] || 'jpg';
    return `image-${Date.now()}.${ext}`;
};

/**
 * Tenta carregar a imagem através de um elemento Image do navegador (se o canvas conseguir exportar)
 */
const loadImageViaElement = (url: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth || img.width;
                canvas.height = img.naturalHeight || img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context unavailable'));
                    return;
                }
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Canvas toBlob retornou nulo'));
                    }
                }, 'image/jpeg', 0.95);
            } catch (err) {
                reject(err);
            }
        };
        img.onerror = () => reject(new Error('Falha ao renderizar imagem no elemento HTML'));
        img.src = url;
    });
};

/**
 * Função principal: carrega imagem a partir de qualquer link/URL
 * Faz múltiplos fallbacks inteligentes para garantir que links com imagens em sua composição
 * sejam processados com sucesso.
 */
export const loadImageFromAnyUrl = async (rawInput: string): Promise<File> => {
    const cleanedUrl = extractImageUrlFromText(rawInput);

    if (!cleanedUrl) {
        throw new Error('Por favor, informe uma URL válida.');
    }

    // Se for data URL, converte diretamente
    if (cleanedUrl.startsWith('data:image/')) {
        return await dataUrlToFile(cleanedUrl);
    }

    if (!cleanedUrl.startsWith('http://') && !cleanedUrl.startsWith('https://')) {
        throw new Error('A URL deve começar com http:// ou https:// (ou ser um formato data:image)');
    }

    // Lista de estratégias para tentar obter a imagem
    // 1. Fetch direto da URL
    // 2. Weserv image proxy (especializado em imagens públicas do mundo inteiro, com CORS aberto)
    // 3. Corsproxy.io (proxy CORS transparente)
    // 4. AllOrigins proxy raw
    const fetchAttempts: Array<{ name: string; getUrl: (u: string) => string }> = [
        { name: 'Direto', getUrl: (u) => u },
        { name: 'Image Proxy (Weserv)', getUrl: (u) => `https://images.weserv.nl/?url=${encodeURIComponent(u.replace(/^https?:\/\//, ''))}` },
        { name: 'CORS Proxy 1', getUrl: (u) => `https://corsproxy.io/?url=${encodeURIComponent(u)}` },
        { name: 'CORS Proxy 2', getUrl: (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}` }
    ];

    let lastError: any = null;

    for (const attempt of fetchAttempts) {
        try {
            const targetUrl = attempt.getUrl(cleanedUrl);
            const response = await fetchWithTimeout(targetUrl, {
                headers: {
                    'Accept': 'image/*,text/html,application/xhtml+xml,*/*'
                }
            }, 8000);

            if (!response.ok) {
                continue;
            }

            const contentType = (response.headers.get('content-type') || '').toLowerCase();

            // CASO A: O retorno é uma imagem diretamente
            if (contentType.startsWith('image/')) {
                const blob = await response.blob();
                if (blob.size > 0) {
                    const mime = blob.type || contentType.split(';')[0] || 'image/jpeg';
                    const fileName = createFileName(cleanedUrl, mime);
                    return new File([blob], fileName, { type: mime });
                }
            }

            // CASO B: O retorno é uma página HTML (ex: link de artigo, Pinterest, Imgur, etc.)
            if (contentType.includes('text/html') || contentType.includes('application/xhtml')) {
                const htmlText = await response.text();
                const extractedImgUrl = extractImageFromHtml(htmlText, cleanedUrl);

                if (extractedImgUrl && extractedImgUrl !== cleanedUrl) {
                    // Tenta carregar a imagem extraída da página
                    try {
                        return await loadImageFromAnyUrl(extractedImgUrl);
                    } catch (nestedErr) {
                        console.warn('Falha ao carregar imagem extraída de HTML:', nestedErr);
                    }
                }
            }

            // CASO C: Content-type pode ser application/octet-stream ou vazio, mas ser imagem
            const blob = await response.blob();
            if (blob.size > 500) {
                // Checa se tem extensão de imagem conhecida na URL
                const hasImgExt = /\.(jpe?g|png|webp|gif|svg|avif|jfif|bmp)(\?.*)?$/i.test(cleanedUrl);
                if (hasImgExt || blob.type.startsWith('image/')) {
                    const mime = blob.type.startsWith('image/') ? blob.type : 'image/jpeg';
                    const fileName = createFileName(cleanedUrl, mime);
                    return new File([blob], fileName, { type: mime });
                }
            }
        } catch (err: any) {
            lastError = err;
            // Continua para a próxima tentativa
        }
    }

    // Tentativa final de render via elemento <img> se os fetches foram bloqueados
    try {
        const blob = await loadImageViaElement(cleanedUrl);
        const fileName = createFileName(cleanedUrl, 'image/jpeg');
        return new File([blob], fileName, { type: 'image/jpeg' });
    } catch {
        // Tenta também via weserv no elemento <img>
        try {
            const proxiedUrl = `https://images.weserv.nl/?url=${encodeURIComponent(cleanedUrl.replace(/^https?:\/\//, ''))}`;
            const blob = await loadImageViaElement(proxiedUrl);
            const fileName = createFileName(cleanedUrl, 'image/jpeg');
            return new File([blob], fileName, { type: 'image/jpeg' });
        } catch (imgElemErr) {
            console.warn('Tentativa via Image element falhou:', imgElemErr);
        }
    }

    throw new Error(
        'Não foi possível extrair ou baixar a imagem deste link. Verifique se o link está acessível publicamente ou tente copiar o link direto da imagem.'
    );
};
