const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',  // Change to your DB host
  user: 'root',       // Change to your DB username
  password: '',       // Change to your DB password
  database: 'pet_management',  // Change to your DB name
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database');
});

// API Endpoint to Fetch Data
app.get('/products', (req, res) => {
  const sql = 'SELECT * FROM products'; // Replace 'products' with your table name
  db.query(sql, (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(result);
    }
  });
});

// API Endpoint to Add Data
app.post('/add-product', (req, res) => {
  const { name, price } = req.body;
  const sql = 'INSERT INTO products (name, price) VALUES (?, ?)';
  db.query(sql, [name, price], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json({ message: 'Product added', result });
    }
  });
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
