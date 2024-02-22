const express = require('express');
const { Pool } = require('pg');


const { encryptData } = require('./encrypt');
const { decryptData } = require('./decrypt');



// Configure the region and credentials

const keyId = 'arn:aws:kms:eu-central-1:693208135292:key/17cb2ff1-ea1c-45f4-8204-56fd25ec4983'; // Replace with your CMK ARN


const app = express();
const PORT = process.env.PORT || 3000;



const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 5432,
});

async function valami(plaintext) {
   return await encryptData(keyId, plaintext);
}

app.use(express.json());

// Routes
app.get('/users', async (req, res) => {
    // try {
    //     const { rows } = await pool.query('SELECT * FROM my_users');
    //     res.json(rows);
    // } catch (err) {
    //     console.error(err);
    //     res.status(500).json({ message: 'Internal Server Error' });
    // }

    let encSajt = await valami("sajt")

    res.json(encSajt)
});

app.post('/users', async (req, res) => {
    const { name, description } = req.body;
    try {
        const { rows } = await pool.query('INSERT INTO my_users (password, created_at) VALUES ($1, $2) RETURNING *', [name, description]);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query('SELECT * FROM my_users WHERE id = $1', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
        const { rows } = await pool.query('UPDATE my_users SET password = $1, created_at = $2 WHERE id = $3 RETURNING *', [name, description, id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query('DELETE FROM my_users WHERE id = $1 RETURNING *', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ message: 'Item deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
