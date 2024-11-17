const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Database connection

// Route to fetch all categories
router.get('/', (req, res) => {
    const query = 'SELECT * FROM categories';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching categories' });
        }
        res.json(results);
    });
});

module.exports = router;
