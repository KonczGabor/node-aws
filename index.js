const express = require('express');
const { Pool } = require('pg');
const AWS = require('aws-sdk');
const crypto = require('crypto');
const { promisify } = require('util');

// Configure the region and credentials
AWS.config.update({ region: 'eu-central-1' });

// Create a KMS client
const kms = new AWS.KMS({ apiVersion: '2014-11-01' });

const app = express();
const PORT = process.env.PORT || 3000;

// Use promisify to use async/await with crypto functions
const randomBytesAsync = promisify(crypto.randomBytes);
const pbkdf2Async = promisify(crypto.pbkdf2);

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 5432,
});

async function encryptData(plaintext) {
    try {
        // Generate a data key
        const dataKey = await kms.generateDataKey({
            KeyId: 'arn:aws:kms:eu-central-1:693208135292:key/17cb2ff1-ea1c-45f4-8204-56fd25ec4983',
            KeySpec: 'AES_256',
        }).promise();

        // Generate a random initialization vector
        const iv = await randomBytesAsync(16);

        // Encrypt the data using the plaintext data key and iv
        const cipher = crypto.createCipheriv('aes-256-cbc', dataKey.Plaintext, iv);
        let encrypted = cipher.update(plaintext, 'utf8', 'base64');
        encrypted += cipher.final('base64');

        // Concatenate the iv and the encrypted data Key
        // You will need to store these along with the encrypted data
        const encryptedBuffer = Buffer.concat([iv, Buffer.from(encrypted, 'base64'), dataKey.CiphertextBlob]);

        return encryptedBuffer.toString('base64');
    } catch (err) {
        console.error('Encryption error:', err);
        throw err;
    }
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

    let encSajt = await encryptData("sajt")

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
