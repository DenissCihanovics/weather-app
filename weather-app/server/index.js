const express = require('express');
const cors = require('cors');
const axios = require('axios');
const pool = require('./db');
require('dotenv').config({ path: '../.env' }); // Load env from root

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENWEATHER_API_KEY;

app.use(cors());
app.use(express.json());

// Initialize Database
const initDb = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS cities (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                position INTEGER DEFAULT 0
            );
        `);

        try {
            await pool.query('ALTER TABLE cities ADD COLUMN position INTEGER DEFAULT 0');
        } catch (err) {
            // Provide a cleaner ignore for column exists error (Postgres error 42701)
            if (err.code !== '42701') {
                // console.log("Migration note:", err.message);
            }
        }

        const res = await pool.query('SELECT COUNT(*) FROM cities');
        if (parseInt(res.rows[0].count) === 0) {
            const defaultCities = [
                'Moscow', 'New York', 'London', 'Tokyo', 'Paris',
                'Berlin', 'Sydney', 'Dubai', 'Singapore', 'Toronto',
                'Rome', 'Madrid'
            ];
            let pos = 0;
            for (const city of defaultCities) {
                try {
                    await pool.query('INSERT INTO cities (name, position) VALUES ($1, $2)', [city, pos++]);
                } catch (e) { }
            }
            console.log('Default cities initialized');
        }
    } catch (err) {
        console.error('Error initializing DB:', err);
    }
};

// Routes

// Get all cities
app.get('/api/cities', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM cities ORDER BY position ASC, id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add city
app.post('/api/cities', async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'City name required' });
    try {
        // Get next position
        const maxPosRes = await pool.query('SELECT MAX(position) as max_pos FROM cities');
        const nextPos = (maxPosRes.rows[0].max_pos || 0) + 1;

        const result = await pool.query(
            'INSERT INTO cities (name, position) VALUES ($1, $2) RETURNING *',
            [name, nextPos]
        );
        res.json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'City already exists' });
        }
        res.status(500).json({ error: err.message });
    }
});

// Delete city
app.delete('/api/cities/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM cities WHERE id = $1', [id]);
        res.json({ message: 'City deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reorder cities
app.put('/api/cities/reorder', async (req, res) => {
    const { orderedIds } = req.body;
    if (!orderedIds || !Array.isArray(orderedIds)) return res.status(400).json({ error: 'Invalid data' });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        for (let i = 0; i < orderedIds.length; i++) {
            await client.query('UPDATE cities SET position = $1 WHERE id = $2', [i, orderedIds[i]]);
        }
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// Proxy Forecast Request
app.get('/api/forecast', async (req, res) => {
    const { city, units = 'metric' } = req.query;
    if (!city) return res.status(400).json({ error: 'City parameter required' });
    if (!API_KEY) return res.status(500).json({ error: 'Server API Key not configured' });

    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast`, {
            params: {
                q: city,
                units,
                appid: API_KEY,
                lang: 'en'
            }
        });
        res.json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json(err.response?.data || { error: 'Failed to fetch forecast' });
    }
});

// Proxy Weather Request
app.get('/api/weather', async (req, res) => {
    const { city, units = 'metric' } = req.query;
    if (!city) return res.status(400).json({ error: 'City parameter required' });
    if (!API_KEY) return res.status(500).json({ error: 'Server API Key not configured' });

    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: {
                q: city,
                units,
                appid: API_KEY,
                lang: 'en'
            }
        });
        res.json(response.data);
    } catch (err) {
        // console.error("Weather API Error:", err.response?.data || err.message);
        res.status(err.response?.status || 500).json(err.response?.data || { error: 'Failed to fetch weather' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    initDb();
});
