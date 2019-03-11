const queryString = require("querystring");

process.arg

const fs = require('fs');
const passwords = JSON.parse(fs.readFileSync('config.json', 'utf-8'));

const getIdUrl = (artist) => {
  const base_url = 'https://api.discogs.com/database/search?';
  const params = {
    q: artist,
    key: process.env.key,
    secret: process.env.secret,
    per_page: 100
  };
  const querystring = queryString.stringify(params);
  return base_url + querystring;
};

const getArtistUrl = (artist_id, page) => {
  const base_url = `https://api.discogs.com/artists/${artist_id}/releases?`;
  const params = {
    key: process.env.key,
    secret: process.env.secret,
    page: page,
    per_page: 100
  };
  const querystring = queryString.stringify(params);
  return base_url + querystring;
};

module.exports = {getIdUrl, getArtistUrl};
