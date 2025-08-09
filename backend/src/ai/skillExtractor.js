// Simple heuristic-based skill extraction. Swap with OpenAI or NLP later.
const DEFAULT_SKILLS = [
    'javascript', 'typescript', 'react', 'node', 'express', 'mongodb', 'sql',
    'python', 'django', 'flask', 'aws', 'docker', 'kubernetes', 'solidity',
    'ethers.js', 'web3.js', 'ui/ux', 'figma', 'next.js'
];

function extractSkillsFromText(text = '') {
    const normalized = text.toLowerCase();
    const found = new Set();
    for (const skill of DEFAULT_SKILLS) {
        const pattern = new RegExp(`(^|[^a-z])${skill.replace('.', '\\.')}([^a-z]|$)`, 'i');
        if (pattern.test(normalized)) found.add(skill);
    }
    return Array.from(found);
}

module.exports = {
    extractSkillsFromText,
};


