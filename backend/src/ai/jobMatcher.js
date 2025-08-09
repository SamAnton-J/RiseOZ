function computeMatchScore(requiredSkills = [], candidateSkills = []) {
    const setRequired = new Set(requiredSkills.map((s) => s.toLowerCase()));
    const setCandidate = new Set(candidateSkills.map((s) => s.toLowerCase()));
    if (setRequired.size === 0) return 0;
    let overlap = 0;
    for (const skill of setRequired) {
        if (setCandidate.has(skill)) overlap += 1;
    }
    return Math.round((overlap / setRequired.size) * 100);
}

module.exports = {
    computeMatchScore,
};


