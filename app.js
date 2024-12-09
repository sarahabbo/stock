const express = require('express');
const mongoose = require('mongoose');
const url = require('url'); // Import url module
const querystring = require('querystring'); // Import querystring module
const app = express();
const PORT = 3000;

// MongoDB setup (replace with your MongoDB URI)
const uri = process.env.MONGODB_URI || 'mongodb+srv://sarahabbo:24Sarah26@cluster0.he5rw.mongodb.net/Stock';


mongoose.connect(uri, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
}).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});

// Example schema for company data
const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  ticker: { type: String, required: true },
  price: { type: Number, required: true },
});

const Company = mongoose.model('Company', companySchema);

// Serve the home page (search form)
app.get('/', (req, res) => {
  res.send(`
    <h1>Search for a Company</h1>
    <form method="GET" action="/process">
      <label>
        <input type="radio" name="searchBy" value="ticker" required>
        Search by Ticker Symbol
      </label>
      <label>
        <input type="radio" name="searchBy" value="name" required>
        Search by Company Name
      </label>
      <br><br>
      <input type="text" name="search" placeholder="Enter search term" required>
      <button type="submit">Search</button>
    </form>
  `);
});

// Handle the GET data and render the search results
app.get('/process', async (req, res) => {
  const queryData = url.parse(req.url, true).query; // Parse query string from URL
  const { searchBy, search } = queryData;

  if (!searchBy || !search) {
    return res.status(400).send("Missing search parameters.");
  }

  try {
    let query;
    if (searchBy === 'name') {
      query = { name: { $regex: `^${search}$`, $options: 'i' } }; // Case-insensitive search by name
    } else if (searchBy === 'ticker') {
      query = { ticker: { $regex: `^${search}$`, $options: 'i' } }; // Case-insensitive search by ticker
    } else {
      return res.status(400).send("Invalid searchBy parameter.");
    }

    const companies = await Company.find(query);

    // Display results as HTML
    if (companies.length > 0) {
      let resultHtml = `<h1>Search Results</h1><ul>`;
      companies.forEach(company => {
        resultHtml += `
          <li>
            <strong>Name:</strong> ${company.name} <br>
            <strong>Ticker:</strong> ${company.ticker} <br>
            <strong>Price:</strong> $${company.price}
          </li>`;
      });
      resultHtml += `</ul><a href="/">Back to Home</a>`;
      res.send(resultHtml);
    } else {
      res.send('<p>No matching companies found.</p><a href="/">Back to Home</a>');
    }
  } catch (err) {
    console.error("Error during database query:", err.message);
    res.status(500).send("An error occurred while processing your request.");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
