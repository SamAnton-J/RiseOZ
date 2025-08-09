const express = require('express');
const router = express.Router();
const { extractSkillsFromText } = require('../ai/skillExtractor');

router.post('/ai/extract-skills', (req, res) => {
    try {
        const { text = '' } = req.body || {};
        const skills = extractSkillsFromText(text);
        res.json({ skills });
    } catch (e) {
        res.status(500).json({ message: 'Skill extraction failed' });
    }
});

module.exports = router;


