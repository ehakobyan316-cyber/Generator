const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from current directory
app.use(express.static(__dirname));

const settingsPath = path.join(__dirname, 'settings.json');

// GET settings
app.get('/api/settings', (req, res) => {
    try {
        if (!fs.existsSync(settingsPath)) {
            const defaultSettings = {
                generatorMin: "1",
                generatorMax: "1000",
                targetNumber: null,
                winningNumbers: "",
                clickCount: 0
            };
            fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2));
            res.json(defaultSettings);
            return;
        }
        const data = fs.readFileSync(settingsPath, 'utf8');
        const parsed = JSON.parse(data);
        if (parsed.clickCount === undefined) {
            parsed.clickCount = 0;
            fs.writeFileSync(settingsPath, JSON.stringify(parsed, null, 2));
        }
        res.json(parsed);
    } catch (error) {
        console.error('Error reading settings:', error);
        res.status(500).json({ error: 'Error reading settings' });
    }
});

// POST settings
app.post('/api/settings', (req, res) => {
    try {
        const { generatorMin, generatorMax, targetNumber, winningNumbers, clickCount } = req.body;
        
        const currentData = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        
        if (generatorMin !== undefined) currentData.generatorMin = generatorMin;
        if (generatorMax !== undefined) currentData.generatorMax = generatorMax;
        if (targetNumber !== undefined) currentData.targetNumber = targetNumber;
        if (winningNumbers !== undefined) currentData.winningNumbers = winningNumbers;
        
        if (clickCount !== undefined) {
            if (clickCount === 0) {
                currentData.clickCount = 0;
            } else {
                currentData.clickCount = (currentData.clickCount || 0) + clickCount;
            }
        }
        
        fs.writeFileSync(settingsPath, JSON.stringify(currentData, null, 2));
        res.json({ success: true, data: currentData });
    } catch (error) {
        res.status(500).json({ error: 'Error saving settings' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
