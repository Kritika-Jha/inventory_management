const mysql = require('mysql');

// Create the database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Kritika@2444',
    database: 'inventory_system',
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
        return;
    }
    console.log('Connected to the database!');
});

module.exports = db;
