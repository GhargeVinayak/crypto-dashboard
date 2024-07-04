const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');
const cors = require('cors'); // Import cors
const app = express();
const port = 3000;

app.use(cors()); // Use cors middleware

// PostgreSQL configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'crypto',
  password: 'test',
  port: 5432,
});

// Function to create the table if it doesn't exist
const createTable = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS crypto (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50),
        last NUMERIC,
        buy NUMERIC,
        sell NUMERIC,
        volume NUMERIC,
        base_unit VARCHAR(50)
      )
    `);
  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    client.release();
  }
};

// Fetch data from WazirX API and store it in PostgreSQL
const fetchData = async () => {
  try {
    const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
    const data = response.data;
    const top10 = Object.keys(data)
      .map(key => data[key])
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 10);

    const client = await pool.connect();
    await client.query('DELETE FROM crypto'); // Clear previous data

    for (const crypto of top10) {
      const { name, last, buy, sell, volume, base_unit } = crypto;
      await client.query(
        'INSERT INTO crypto (name, last, buy, sell, volume, base_unit) VALUES ($1, $2, $3, $4, $5, $6)',
        [name, last, buy, sell, volume, base_unit]
      );
    }
    console.log("Data fetched and saved successfully.");
    client.release();
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

// API endpoint to get data from PostgreSQL
app.get('/api/cryptos', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM crypto');
    res.json(result.rows);
    client.release();
  } catch (error) {
    console.error('Error fetching data from database:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Periodically fetch new data
setInterval(fetchData, 60000); // Fetch data every minute

app.listen(port, async () => {
  console.log(`Server is running on http://localhost:${port}`);
  await createTable(); // Create table if it doesn't exist
  fetchData(); // Initial fetch
});
