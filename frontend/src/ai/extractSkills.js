import { API_BASE_URL } from '../api/config';
export async function extractSkillsFromTextClient(text) {
    const resp = await fetch(`${API_BASE_URL}/ai/extract-skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
    });
    if (!resp.ok) throw new Error('Failed to extract skills');
    const data = await resp.json();
    return data.skills || [];
}


