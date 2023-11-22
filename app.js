const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require("express");
var bodyParser = require('body-parser')
const port = 3000;
require('dotenv').config()

// 2. Create the app 
const app = express(); 
// app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true })); //Add middleware to app's request handling pipeline & parse URL-encoded data like data structures/arrays into requesst body. This allows data sent from HTML forms in Express.js to be accessed as JavaScript objects for further processing. 
app.use(express.static("public")); //This serves static files like HTML, CSS, JS from a directory named "public" to the client-side of a web app, so static files can be accessed by users' web browsers 
app.use(bodyParser.json());

// 3. Connect to the specific URI you copied over just now
const uri = process.env.MONGODB_URI; //Allows the web app to access the environment variable aka the secret URL with your MongoDB username and password via `process.env.MONGODB_URI`. URI basically means URL. 

// 4. Create a new MongoClient i.e. way to facilitate data transmission 
const client = new MongoClient(uri, { //Creates a constant variable named `client` to connect to MongoDB server, taking the `uri` parameter for the MongoDB server 
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

// 5. Connect to the MongoDB server and let you know if you have successfully connected to the server
async function connect() {
    try {
      console.log("Attempting to connect to MongoDB");
      await client.connect();
      console.log("Connected to MongoDB")
      return client.db("savemyinvite");
    } catch (err) {
      console.error("Error:", err);
    } 
  }

// POST ICS file data fields to MongoDB
    app.post('/', async (req, res) => {
        const icsData = req.body;
        const fileId = uuidv4();
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();

        const database = client.db(savemyinvite);
        const collection = database.collection(invitedetail);

        await collection.insertOne({ _id: fileId, data: icsData });

        res.json({ fileId });

        console.log("posted successfully");

    } finally {
        await client.close();
    }
 });

  
// 8. Start the Express.js server and listen on a specific port:
app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });