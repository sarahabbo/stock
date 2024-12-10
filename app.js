const fs = require('fs');
const mongoose = require('mongoose');


const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// MongoDB connection using Mongoose
const uri = "mongodb+srv://sarahabbo:24Sarah26@cluster0.he5rw.mongodb.net/Stock";

mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
}).then(() => console.log("Connected to MongoDB using Mongoose!"))
.catch(err => {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1); // Exit with failure
});

// Define schema and explicitly set the collection name
const companySchema = new mongoose.Schema({
    name: { type: String, required: true },
    ticker: { type: String, required: true },
    price: { type: Number, required: true },
});

const Company = mongoose.model('Company', companySchema, 'PublicCompanies');

// Function to process and insert data
async function insertCompanies() {
    try {
        const data = fs.readFileSync('companies-1.csv', 'utf8');
        const lines = data.split('\n').filter(line => line.trim());
        const companies = lines.map(line => {
            const [name, ticker, price] = line.split(',').map(item => item.trim());
            return { name, ticker, price: parseFloat(price) };
        }).filter(company => company.name && company.ticker && !isNaN(company.price));

        await Company.insertMany(companies);
        console.log("Data successfully inserted into PublicCompanies.");
    } catch (err) {
        console.error("Error during data insertion:", err.message);
    } finally {
        mongoose.connection.close();
        console.log("MongoDB connection closed.");
    }
}

insertCompanies();
