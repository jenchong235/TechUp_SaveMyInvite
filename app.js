const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require("express");
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');
require('dotenv').config();

// Create the app 
const app = express(); 
app.set("view engine", "ejs");
app.use(bodyParser.json());

// Connect to the specific URI 
const uri = process.env.MONGODB_URI;

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

// Allow MongoDB connection to be used in other middleware in app.js
app.use(async (req, res, next) => {
  req.db = await connect();
  next();
  });

// Render index.ejs view
app.get("/", async (req, res, next) => {
  var eventurl = "default";
  res.render("index");
  next();
});

// Route to insert new record to MongoDB when form is submitted (POST request) + Generate invite url to send in response
app.post("/submit", async (req, res) => {

  const fileId = uuidv4();
  const icsData = req.body.icsData;
  const icsBlob = btoa(icsData);
  console.log(fileId, icsBlob);
  const database = client.db("savemyinviteDB");
  const collection = database.collection("invitedetail");
  await collection.insertOne({ _id: fileId, data: icsBlob });
  console.log("Inserted to mongoDB successfully");

  var eventurl = "https://savemyinvite.app/newevent/"+fileId ;
  console.log(eventurl);
  res.send(eventurl)
 });


// Route to retrieve ics data from MongoDB when invite URL is queried (GET request) + Generate new blob to download .ics file
app.get('/newevent/:eventId', async (req, res) => {
  const eventId = req.params.eventId;

  const database = client.db('savemyinviteDB');
  const collection = database.collection('invitedetail');
  const event = await collection.findOne(
    { _id: eventId },
    { projection: { _id: 0, data: 1 } }
  );

  if (!event) {
    console.log("EventID not in database");  
    return res.status(404).send('Event not found');
  }
  const extractevent = event.data.replace(/.*'([^']*)'.*/, '$1');
  const eventstring = atob(extractevent);
  
  const match = eventstring.match(/SUMMARY:(.*)/);
  const eventName = match ? match[1].trim() : null;

  const blob = new Blob([eventstring], { type: 'text/calendar;charset=utf-8' });

  res.setHeader('Content-Type', 'text/calendar');
  res.setHeader('Content-Disposition', "attachment; filename="+eventName+".ics");

  const buffer = Buffer.from(await blob.arrayBuffer());
  res.end(buffer);
});


// Set up server 
let port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log(`Server started on port ${port}`);
});