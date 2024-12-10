const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000; // Heroku assigns a dynamic port via process.env.PORT

// Use environment variable for MongoDB URI
const mongoUri = process.env.MONGO_URI || "mongodb+srv://sarahabbo:24Sarah26@cluster0.he5rw.mongodb.net/Stock";



// MongoDB connection using Mongoose
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000  // Increase timeout to 30 seconds
})
.then(() => console.log("Connected to MongoDB using Mongoose!"))
.catch(err => {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1); // Exit with failure if MongoDB connection fails
});

// Define schema and explicitly set the collection name
const companySchema = new mongoose.Schema({
    name: { type: String, required: true },
    ticker: { type: String, required: true },
    price: { type: Number, required: true },
});

const Company = mongoose.model('Company', companySchema, 'PublicCompanies');

// Home route (form)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html'); // Serve 'index.html' from the root directory
});

// Process route (handles form submission and database query)
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

// Start the server on Heroku's provided port
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


