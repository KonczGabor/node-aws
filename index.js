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
app.get('/enc', async (req, res) => {
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

app.get('/dec', async (req, res) => {
    // try {
    //     const { rows } = await pool.query('SELECT * FROM my_users');
    //     res.json(rows);
    // } catch (err) {
    //     console.error(err);
    //     res.status(500).json({ message: 'Internal Server Error' });
    // }

    let decSajt = await decryptData("1,2,2,0,120,253,119,238,38,242,195,128,234,108,164,238,119,136,203,50,207,17,34,148,154,82,10,33,137,137,201,141,35,5,60,192,173,1,159,41,43,153,99,205,219,252,57,141,158,161,236,59,20,176,0,0,0,98,48,96,6,9,42,134,72,134,247,13,1,7,6,160,83,48,81,2,1,0,48,76,6,9,42,134,72,134,247,13,1,7,1,48,30,6,9,96,134,72,1,101,3,4,1,46,48,17,4,12,13,44,17,10,73,143,94,89,12,43,8,201,2,1,16,128,31,181,237,63,138,243,7,56,148,99,17,230,148,52,54,111,250,254,245,105,54,86,198,22,205,78,65,213,59,44,142,122")

    res.json(decSajt)
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
