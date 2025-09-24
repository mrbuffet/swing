const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// Data files
const DATA_DIR = './data';
const CHECKLISTS_FILE = path.join(DATA_DIR, 'checklists.json');
const ALERTS_FILE = path.join(DATA_DIR, 'alerts.json');
const BLOG_FILE = path.join(DATA_DIR, 'blog.json');

// Create data directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Initialize data files if they don't exist
if (!fs.existsSync(CHECKLISTS_FILE)) {
    fs.writeFileSync(CHECKLISTS_FILE, JSON.stringify([]));
}

if (!fs.existsSync(ALERTS_FILE)) {
    fs.writeFileSync(ALERTS_FILE, JSON.stringify([]));
}

if (!fs.existsSync(BLOG_FILE)) {
    fs.writeFileSync(BLOG_FILE, JSON.stringify([]));
}

// Helper functions
function readJSONFile(filename) {
    try {
        const data = fs.readFileSync(filename, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filename}:`, error);
        return [];
    }
}

function writeJSONFile(filename, data) {
    try {
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${filename}:`, error);
        return false;
    }
}

// Routes

// Get all checklists
app.get('/api/checklists', (req, res) => {
    const checklists = readJSONFile(CHECKLISTS_FILE);
    res.json(checklists);
});

// Save new checklist
app.post('/api/checklists', (req, res) => {
    const checklist = {
        id: Date.now(),
        ...req.body,
        createdAt: new Date().toISOString()
    };
    
    const checklists = readJSONFile(CHECKLISTS_FILE);
    checklists.push(checklist);
    
    if (writeJSONFile(CHECKLISTS_FILE, checklists)) {
        res.json({ success: true, message: 'הצ\'ק ליסט נשמר בהצלחה', data: checklist });
    } else {
        res.status(500).json({ success: false, message: 'שגיאה בשמירת הצ\'ק ליסט' });
    }
});

// Update checklist
app.put('/api/checklists/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const checklists = readJSONFile(CHECKLISTS_FILE);
    
    const index = checklists.findIndex(item => item.id === id);
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'צ\'ק ליסט לא נמצא' });
    }
    
    checklists[index] = {
        ...checklists[index],
        ...req.body,
        updatedAt: new Date().toISOString()
    };
    
    if (writeJSONFile(CHECKLISTS_FILE, checklists)) {
        res.json({ success: true, message: 'הצ\'ק ליסט עודכן בהצלחה', data: checklists[index] });
    } else {
        res.status(500).json({ success: false, message: 'שגיאה בעדכון הצ\'ק ליסט' });
    }
});

// Delete checklist
app.delete('/api/checklists/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const checklists = readJSONFile(CHECKLISTS_FILE);
    
    const filteredChecklists = checklists.filter(item => item.id !== id);
    
    if (filteredChecklists.length === checklists.length) {
        return res.status(404).json({ success: false, message: 'צ\'ק ליסט לא נמצא' });
    }
    
    if (writeJSONFile(CHECKLISTS_FILE, filteredChecklists)) {
        res.json({ success: true, message: 'הצ\'ק ליסט נמחק בהצלחה' });
    } else {
        res.status(500).json({ success: false, message: 'שגיאה במחיקת הצ\'ק ליסט' });
    }
});

// Get all alerts
app.get('/api/alerts', (req, res) => {
    const alerts = readJSONFile(ALERTS_FILE);
    res.json(alerts);
});

// Save new alert
app.post('/api/alerts', (req, res) => {
    const alert = {
        id: Date.now(),
        ...req.body,
        status: 'active',
        createdAt: new Date().toISOString()
    };
    
    const alerts = readJSONFile(ALERTS_FILE);
    alerts.push(alert);
    
    if (writeJSONFile(ALERTS_FILE, alerts)) {
        res.json({ success: true, message: 'ההתראה נוצרה בהצלחה', data: alert });
    } else {
        res.status(500).json({ success: false, message: 'שגיאה ביצירת ההתראה' });
    }
});

// Update alert
app.put('/api/alerts/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const alerts = readJSONFile(ALERTS_FILE);
    
    const index = alerts.findIndex(item => item.id === id);
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'התראה לא נמצאה' });
    }
    
    alerts[index] = {
        ...alerts[index],
        ...req.body,
        updatedAt: new Date().toISOString()
    };
    
    if (writeJSONFile(ALERTS_FILE, alerts)) {
        res.json({ success: true, message: 'ההתראה עודכנה בהצלחה', data: alerts[index] });
    } else {
        res.status(500).json({ success: false, message: 'שגיאה בעדכון ההתראה' });
    }
});

// Delete alert
app.delete('/api/alerts/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const alerts = readJSONFile(ALERTS_FILE);
    
    const filteredAlerts = alerts.filter(item => item.id !== id);
    
    if (filteredAlerts.length === alerts.length) {
        return res.status(404).json({ success: false, message: 'התראה לא נמצאה' });
    }
    
    if (writeJSONFile(ALERTS_FILE, filteredAlerts)) {
        res.json({ success: true, message: 'ההתראה נמחקה בהצלחה' });
    } else {
        res.status(500).json({ success: false, message: 'שגיאה במחיקת ההתראה' });
    }
});

// Get stock data (mock API for now)
app.get('/api/stock/:ticker', (req, res) => {
    const ticker = req.params.ticker.toUpperCase();
    
    // Mock data - replace with real stock API
    const mockData = {
        ticker: ticker,
        price: Math.random() * 200 + 50,
        change: (Math.random() - 0.5) * 10,
        volume: Math.floor(Math.random() * 1000000),
        timestamp: new Date().toISOString()
    };
    
    res.json({ success: true, data: mockData });
});

// Blog API Routes

// Get all blog posts
app.get('/api/blog', (req, res) => {
    const posts = readJSONFile(BLOG_FILE);
    // Sort by creation date (newest first)
    const sortedPosts = posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(sortedPosts);
});

// Get single blog post
app.get('/api/blog/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const posts = readJSONFile(BLOG_FILE);
    const post = posts.find(p => p.id === id);
    
    if (post) {
        res.json({ success: true, data: post });
    } else {
        res.status(404).json({ success: false, message: 'פוסט לא נמצא' });
    }
});

// Create new blog post
app.post('/api/blog', (req, res) => {
    const post = {
        id: Date.now(),
        ...req.body,
        author: req.body.author || 'Oleg Kofman',
        readTime: Math.ceil(req.body.content.split(' ').length / 200) || 5, // Estimate reading time
        createdAt: new Date().toISOString()
    };
    
    const posts = readJSONFile(BLOG_FILE);
    posts.push(post);
    
    if (writeJSONFile(BLOG_FILE, posts)) {
        res.json({ success: true, message: 'הפוסט פורסם בהצלחה', data: post });
    } else {
        res.status(500).json({ success: false, message: 'שגיאה בפרסום הפוסט' });
    }
});

// Update blog post
app.put('/api/blog/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const posts = readJSONFile(BLOG_FILE);
    
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'פוסט לא נמצא' });
    }
    
    posts[index] = {
        ...posts[index],
        ...req.body,
        readTime: Math.ceil(req.body.content.split(' ').length / 200) || posts[index].readTime,
        updatedAt: new Date().toISOString()
    };
    
    if (writeJSONFile(BLOG_FILE, posts)) {
        res.json({ success: true, message: 'הפוסט עודכן בהצלחה', data: posts[index] });
    } else {
        res.status(500).json({ success: false, message: 'שגיאה בעדכון הפוסט' });
    }
});

// Delete blog post
app.delete('/api/blog/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const posts = readJSONFile(BLOG_FILE);
    
    const filteredPosts = posts.filter(p => p.id !== id);
    
    if (filteredPosts.length === posts.length) {
        return res.status(404).json({ success: false, message: 'פוסט לא נמצא' });
    }
    
    if (writeJSONFile(BLOG_FILE, filteredPosts)) {
        res.json({ success: true, message: 'הפוסט נמחק בהצלחה' });
    } else {
        res.status(500).json({ success: false, message: 'שגיאה במחיקת הפוסט' });
    }
});

// Serve index.html for all routes (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 השרת רץ על http://localhost:${PORT}`);
    console.log('📊 מערכת ניהול מניות מוכנה לשימוש!');
});
