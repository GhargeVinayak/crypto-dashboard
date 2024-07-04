// Import required modules
const express = require('express'); // Express framework for building web servers
const axios = require('axios'); // Axios for making HTTP requests
const { Pool } = require('pg'); // PostgreSQL client for Node.js
const cors = require('cors'); // Middleware to enable CORS (Cross-Origin Resource Sharing)

// Create an Express application
const app = express();
const port = 3000; // Define the port the server will run on

app.use(cors()); // Use the CORS middleware to allow cross-origin requests

// PostgreSQL configuration
const pool = new Pool({
  user: 'postgres', // PostgreSQL username
  host: 'localhost', // PostgreSQL server host
  database: 'crypto', // PostgreSQL database name
  password: 'test', // PostgreSQL password
  port: 5432, // PostgreSQL server port
});

// Function to create the table if it doesn't exist
const createTable = async () => {
  const client = await pool.connect(); // Connect to the PostgreSQL database
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS crypto (
        id SERIAL PRIMARY KEY, // Auto-incrementing primary key
        name VARCHAR(50), // Cryptocurrency name
        last NUMERIC, // Last traded price
        buy NUMERIC, // Buy price
        sell NUMERIC, // Sell price
        volume NUMERIC, // Trading volume
        base_unit VARCHAR(50) // Base unit (e.g., BTC, ETH)
      )
    `);
    console.log('Table created successfully or already exists.');
  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    client.release(); // Release the database client
  }
};

// Function to fetch data from the WazirX API and store it in PostgreSQL
const fetchData = async () => {
  try {
    const response = await axios.get('https://api.wazirx.com/api/v2/tickers'); // Fetch data from the WazirX API
    const data = response.data; // Extract the data from the response
    const top10 = Object.keys(data)
      .map(key => data[key]) // Convert data object to an array
      .sort((a, b) => b.volume - a.volume) // Sort by trading volume in descending order
      .slice(0, 10); // Get the top 10 cryptocurrencies

    const client = await pool.connect(); // Connect to the PostgreSQL database
    await client.query('DELETE FROM crypto'); // Clear previous data

    // Insert the top 10 cryptocurrencies into the database
    for (const crypto of top10) {
      const { name, last, buy, sell, volume, base_unit } = crypto;
      await client.query(
        'INSERT INTO crypto (name, last, buy, sell, volume, base_unit) VALUES ($1, $2, $3, $4, $5, $6)',
        [name, last, buy, sell, volume, base_unit]
      );
    }
    console.log("Data fetched and saved successfully.");
    client.release(); // Release the database client
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

// Define an API endpoint to get data from PostgreSQL
app.get('/api/cryptos', async (req, res) => {
  try {
    const client = await pool.connect(); // Connect to the PostgreSQL database
    const result = await client.query('SELECT * FROM crypto'); // Query all data from the crypto table
    res.json(result.rows); // Send the data as a JSON response
    client.release(); // Release the database client
  } catch (error) {
    console.error('Error fetching data from database:', error);
    res.status(500).send('Internal Server Error'); // Send an error response
  }
});

// Periodically fetch new data
setInterval(fetchData, 60000); // Fetch data every minute (60000 milliseconds)

// Start the server and perform initial setup
app.listen(port, async () => {
  console.log(`Server is running on http://localhost:${port}`);
  await createTable(); // Create the table if it doesn't exist
  fetchData(); // Perform an initial data fetch
});
