const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const urlParser = require('url');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// Serve homepage (optional)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Simple in-memory "database"
let urlDatabase = {};
let urlCounter = 1;

// POST route to shorten a URL
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // 1. Must start with http:// or https://
  if (!/^https?:\/\/.+/i.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // 2. Extract hostname
  const hostname = urlParser.parse(originalUrl).hostname;

  // 3. Validate the hostname using DNS
  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    } else {
      // Store and return short URL
      const shortUrl = urlCounter++;
      urlDatabase[shortUrl] = originalUrl;

      res.json({
        original_url: originalUrl,
        short_url: shortUrl
      });
    }
  });
});

// GET route to redirect using short URL
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`URL Shortener Microservice running on port ${port}`);
});
