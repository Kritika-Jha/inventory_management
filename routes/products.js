module.exports = (db) => {
    const express = require('express');
    const router = express.Router();

    // Add a new product
    router.post('/add', (req, res) => {
        const { name, category_id, supplier_id, stock_level, price, expiry_date } = req.body;

        if (!name || !category_id || !supplier_id || !stock_level || !price) {
            return res.status(400).send('All fields are required');
        }

        const query = 'INSERT INTO products (name, category_id, supplier_id, stock_level, price, expiry_date) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [name, category_id, supplier_id, stock_level, price, expiry_date];

        db.query(query, values, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error adding product');
            }
            res.status(200).send('Product added successfully');
        });
    });

    return router;
};
