const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require("express");
const { uuid } = require('uuidv4');
const bodyParser = require('body-parser');
const port = 3000;
require('dotenv').config();

// Create the app 
const app = express(); 
app.set("view engine", "ejs");
app.use(bodyParser.json()); 


// Connect to the specific URI 
const uri = process.env.MONGODB_URI; 
console.log(uri);

// Create a new MongoClient
const client = new MongoClient(uri, { 
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

// Connect to the MongoDB server
async function connect() {
    try {
      console.log("Attempting to connect to MongoDB");
      await client.connect();
      console.log("Connected to MongoDB")
      return client.db("savemyinviteDB");
    } catch (err) {
      console.error("Error:", err);
    } 
  };

//Allow MongoDB connection to be used in rest of app.js
app.use(async (req, res, next) => {
  req.db = await connect();
  next();
  });

//Render index.ejs 
app.get("/", async (req, res, next) => {
  res.render("index");
  next();
});

//Ingest invite details to MongoDB when form is submitted
app.post("/", async (req, res) => {
    try {
        const icsData = req.body.icsData;
        const fileId = uuid();
        console.log(fileId, icsData);
        const database = client.db("savemyinviteDB");
        const collection = database.collection("invitedetail");
        await collection.insertOne({ _id: fileId, data: icsData });
        res.json({ fileId });

        console.log("Inserted to mongoDB successfully");

    } finally {
        await client.close();
    }
 });

  
//Start the Express.js server and listen on a specific port:
app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });