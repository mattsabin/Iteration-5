const http = require('http');
var express = require('express');
var app = express();
const server = http.createServer(app);

//mongodbSTUFF
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const uri = 'mongodb://127.0.0.1:27017/test';
const client = new MongoClient(uri);
mongoose.connect(uri);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const song_schema = new mongoose.Schema({
  rank: Number,
  title: String,
  artist: String,
  album: String,
  year: String
});
const Song = mongoose.model('Song', song_schema);

async function getUniqueArtists() {
  try {
    const uniqueArtists = await db_db.collection('liked-songs').distinct('artist');
    return uniqueArtists;
  } catch (error) {
    console.error('Error getting unique artists:', error);
    throw error;
  }
}




app.use(express.json());

app.use(express.static('public'));

// set the view engine to ejs
app.set('view engine', 'ejs');




// use res.render to load up an ejs view file

// index page
app.get('/', function(req, res) {
  res.render('pages/index');
});

// about page
app.get('/about', function(req, res) {
  res.render('pages/about');
});

//add songs
app.get('/add-songs', function(req, res) {
  res.render('pages/add-songs');
});

//remove songs
app.get('/remove-songs', function(req, res) {
  res.render('pages/remove-songs');
});

const db_db = client.db('song_db'); 

app.get('/search', (req, res) => {
  const searchTerm = req.query.term.toLowerCase();

  // Perform a search in the MongoDB database
  db_db.collection('song_collection') 
    .find({
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { artist: { $regex: searchTerm, $options: 'i' } },
        { album: { $regex: searchTerm, $options: 'i' } },
      ],
    })
    .toArray()
    .then(results => {
      res.json(results);
    })
    .catch(error => {
      console.error('Error searching in MongoDB:', error);
      res.status(500).send('Internal Server Error');
    });
});

//returns all liked Songs
app.get('/getLikedSongs', (req, res) => {
  // Perform a search in the MongoDB database
  db_db.collection('liked-songs')
    .find({})
    .toArray()
    .then(results => {
      console.log(results);
      res.json(results);
    })
    .catch(error => {
      console.error('Error querying MongoDB:', error);
      res.status(500).send('Internal Server Error');
    });
});

app.get('/addToLikedSongs', (req, res) => {
  const searchTerm = req.query.term.toLowerCase();

  // Perform a search in the MongoDB database
  db_db.collection('song_collection') 
    .find({
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } }
      ]
    })
    .toArray()
    .then(results => {
      // Assuming you want to insert all matching documents into the 'liked-songs' collection
      return db_db.collection('liked-songs').insertMany(results);
    })
    .then(insertResult => {
      console.log(`Inserted ${insertResult.insertedCount} documents into liked-songs collection`);
      res.json({ success: true, message: 'Documents added to liked-songs collection' });
    })
    .catch(error => {
      console.error('Error searching or inserting in MongoDB:', error);
      res.status(500).send('Internal Server Error');
    });
});

app.get('/removeFromLikedSongs', (req, res) => {
  const searchTerm = req.query.term.toLowerCase();
  // Perform a search in the MongoDB database
  db_db.collection('liked-songs') 
    .find({
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } }
      ]
    })
    .toArray()
    .then(results => {
      return db_db.collection('liked-songs').deleteMany({ _id: { $in: results.map(result => result._id) } });
    })
    .then(deleteResult => {
      console.log(`Deleted ${deleteResult.deletedCount} documents from liked-songs collection`);
      res.json({ success: true, message: 'Documents deleted from liked-songs collection' });
    })
    .catch(error => {
      console.error('Error searching or deleting in MongoDB:', error);
      res.status(500).send('Internal Server Error');
    });
});


app.get('/uniqueArtists', async (req, res) => {
  try {
    const uniqueArtists = await getUniqueArtists();
    res.json(uniqueArtists);
  } catch (error) {
    console.error('Error fetching unique artists:', error);
    res.status(500).send('Internal Server Error');
  }
});



app.post('/shutdown', async (req, res) => {
  console.log('Received shutdown request');

  // Close MongoDB connections
  try {
    await client.close();
    await mongoose.disconnect();
    console.log('MongoDB connections closed');
  } catch (error) {
    console.error('Error closing MongoDB connections:', error);
  }

  res.send('Shutting down server...');

  // Close the server after a short delay (allowing response to be sent)
  setTimeout(() => {
    server.close(() => {
      console.log('Server is closed');
      process.exit(0); // Exit the Node.js process
    });
  }, 1000);
});



app.listen(8080);
console.log('Server is listening on port 8080');

