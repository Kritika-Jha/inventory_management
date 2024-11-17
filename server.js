const express = require('express');
const mysql = require('mysql2'); // Use mysql2 for better support with prepared statements and promises
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize express app
const app = express();
app.use(cors({ origin: 'http://yourfrontenddomain.com' })); // Restrict CORS to specific frontend domain
app.use(bodyParser.json()); // Parse incoming JSON requests
app.use(cors());
// Serve static files from the 'public' folder
app.use(express.static('public'));

// MySQL connection pool (recommended for production)
const db = mysql.createPool({
    host: 'localhost',
    user: 'root', // Your MySQL username
    password: 'Kritika@2444', // Your MySQL password
    database: 'inventory_system', // Name of your database
    connectionLimit: 10 // Limit number of simultaneous connections
});

// Fetch categories from the database
app.get('/get-categories', (req, res) => {
    const query = 'SELECT id, name FROM categories';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching categories:', err);
            res.status(500).json({ error: 'Failed to fetch categories' });
            return;
        }
        res.json(results); // Return categories as JSON
    });
});

// Fetch suppliers from the database
app.get('/get-suppliers', (req, res) => {
    const query = 'SELECT id, name FROM suppliers';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching suppliers:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch suppliers.' });
        }
        res.json({ success: true, suppliers: results });
    });
});


// API to fetch products
app.get('/get-products', (req, res) => {
    const query = `
        SELECT products.id, products.name, products.stock_level, products.price, products.expiry_date, 
               categories.name AS category, suppliers.name AS supplier
        FROM products
        JOIN categories ON products.category_id = categories.id
        JOIN suppliers ON products.supplier_id = suppliers.id
    `;
    db.query(query, (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Failed to fetch products' });
        } else {
            res.json(result); // Return products as JSON
        }
    });
});

// API to add new product
app.post('/add-product', (req, res) => {
    const { name, stock_level, price, expiry_date, category_id, supplier_id } = req.body;

    if (!name || !stock_level || !price || !expiry_date || !category_id || !supplier_id) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const query = 'INSERT INTO products (name, stock_level, price, expiry_date, category_id, supplier_id) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [name, stock_level, price, expiry_date, category_id, supplier_id], (err, result) => {
        if (err) {
            console.error('Error inserting product:', err);
            return res.status(500).json({ message: 'Failed to add product' });
        }
        res.status(200).json({ success: true, message: 'Product added successfully' });
    });
});

// API to delete a product
app.delete('/delete-product/:id', (req, res) => {
    const productId = req.params.id;
    const query = 'DELETE FROM products WHERE id = ?';
    db.query(query, [productId], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Failed to delete product' });
        } else {
            res.json({ success: 'Product deleted successfully' });
        }
    });
});

// Add category route
app.post('/add-category', (req, res) => {
    const { name } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const query = 'INSERT INTO categories (name) VALUES (?)';
    db.query(query, [name], (err, result) => {
        if (err) {
            console.error('Error adding category:', err);
            return res.status(500).json({ success: false, message: 'Failed to add category' });
        }
        res.json({ success: true, message: 'Category added successfully' });
    });
});

// Add supplier route
app.post('/add-supplier', (req, res) => {
    const { name } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ success: false, message: 'Supplier name is required' });
    }

    const query = 'INSERT INTO suppliers (name) VALUES (?)';
    db.query(query, [name], (err) => {
        if (err) {
            console.error('Error adding supplier:', err);
            return res.status(500).json({ success: false, message: 'Failed to add supplier' });
        }
        res.json({ success: true, message: 'Supplier added successfully!' });
    });
});

// Delete category route
app.delete('/delete-category/:id', (req, res) => {
    const categoryId = req.params.id;
    const query = 'DELETE FROM categories WHERE id = ?';
    db.query(query, [categoryId], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Failed to delete category' });
        } else {
            res.json({ success: 'Category deleted successfully' });
        }
    });
});

app.delete('/delete-supplier/:id', (req, res) => {
    console.log('Delete request received for supplier ID:', req.params.id);
    const supplierId = req.params.id;
    const query = 'DELETE FROM suppliers WHERE id = ?';
    
    console.log('Deleting supplier with ID:', supplierId); // Debugging line
    
    db.query(query, [supplierId], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, error: 'Failed to delete supplier' });
        }
        console.log('Delete result:', result);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Supplier not found' });
        }
        res.json({ success: true, message: 'Supplier deleted successfully!' });
    });
});


// API endpoint to fetch product inventory
app.get('/api/product-inventory', (req, res) => {
    db.query('SELECT * FROM product_inventory_view', (err, results) => {
        if (err) {
            res.status(500).send('Error retrieving data from database');
            return;
        }
        console.log('SQL Results:', results);
        // Send the data back in a proper format
        res.json({
            success: true,
            suppliers: results // The query result is assumed to be an array of product data
        });
    });
    
});

app.get('/api/supplier-product', (req, res) => {
    db.query('SELECT * FROM supplier_product_view', (err, results) => {
        if (err) {
            res.status(500).send('Error retrieving data from database');
            return;
        }
        
        // Send the results as JSON to the frontend
        res.json({
            success: true,
            data: results
        });
    });
});

// Endpoint to get product stock status
app.get('/api/product-stock-status', (req, res) => {
    const query = 'SELECT * FROM product_stock_status_view';
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
        return;
      }
      res.json(results);
    });
  });
  

// Admin login route
app.post('/admin-login', (req, res) => {
  const { adminId, password } = req.body;

  const query = 'SELECT * FROM admins WHERE username = ?';
  db.query(query, [adminId], (err, results) => {
      if (err) {
          console.error('Database query error:', err);
          res.status(500).json({ message: 'An error occurred' });
          return;
      }

      if (results.length === 0) {
          res.status(401).json({ message: 'Invalid username or password' });
      } else {
          const admin = results[0];

          // Simple plain text password comparison
          if (password === admin.password) {
              res.status(200).json({ message: 'Login successful' });
          } else {
              res.status(401).json({ message: 'Invalid username or password' });
          }
      }
  });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
