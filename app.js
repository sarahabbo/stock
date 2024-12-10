
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); 
// Ensure "public/index.html" exists

// MongoDB Connection
mongoose
  .connect('mongodb+srv://sarahabbo:24Sarah26@cluster0.he5rw.mongodb.net/Stock', {
    useNewUrlParser: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define Schema
const companySchema = new mongoose.Schema({
  name: String,
  ticker: String,
  price: Number,
});
const Company = mongoose.model('PublicCompanies', companySchema, 'PublicCompanies');


// Home (form)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html'); // Ensure "public/index.html" exists
});

// Process (handles form submission and database query)
app.get('/process', async (req, res) => {
  const { searchBy, search } = req.query;

  if (!searchBy || !search) {
    res.writeHead(400, { 'Content-Type': 'text/html' });
    res.write("Error: Missing search parameters.");
    return res.end();
  }

  console.log("SearchBy:", searchBy);
  console.log("Search:", search);

  let query = {};
  if (searchBy === 'name') {
    query = { name: { $regex: search, $options: 'i' } }; // Case-insensitive search for name
  } else if (searchBy === 'ticker') {
    query = { ticker: { $regex: search, $options: 'i' } }; // Case-insensitive search for ticker
  }

  console.log("Constructed Query:", query);

  try {
    const companies = await Company.find(query);
    console.log("Query Results:", companies);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write("<h1>Search Results:</h1>");
    if (companies.length > 0) {
      companies.forEach(company => {
        res.write(`<p>Name: ${company.name}, Ticker: ${company.ticker}, Price: $${company.price}</p>`);
      });
    } else {
      res.write("<p>No matching companies found.</p>");
    }
    res.write('<a href="/">Back to Home</a>');
    res.end();
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.write("Internal Server Error");
    res.end();
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
