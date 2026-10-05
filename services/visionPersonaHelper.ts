/**
 * Helper to call server-side Gemini 3.8 vision persona endpoint.
 */
export async function callVisionPersona(
    systemInstruction: string,
    userPrompt: string,
    base64Image: string,
    mimeType: string
): Promise<string> {
    try {
        const res = await fetch('/api/gemini/vision-persona', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction,
                userPrompt,
                imageBase64: base64Image,
                mimeType
            })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
            throw new Error(err.error || `Erro HTTP ${res.status}`);
        }

        const data = await res.json();
        return data.prompt?.trim() || '';
    } catch (err: any) {
        console.error("Erro na persona de visão:", err);
        throw err;
    }
}
