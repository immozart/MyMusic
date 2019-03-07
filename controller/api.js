const fetch = require("node-fetch");
const queryString = require("querystring");

const getUrl = (artist) => {
  const base_url = 'https://api.discogs.com/database/search?'
  const params = {
    q: artist,
    key: 'dxgYyWTxQlEXIhnSSKSC',
    secret: 'rbRFjPiStApQayLcCqLMlNEPGVYuVNMc'
  };
  const querystring = queryString.stringify(params);
  const url = base_url + querystring;
  return url;
}

const getArtistId = async (artist) => {
  const url = getUrl(artist);
  const regex = new RegExp(`^${artist.toLowerCase()}.*`);
  const res = await fetch(url);
  const json = await res.json();
  let artists = [];
  for (let item of json.results) {
    if (item.title.toLowerCase().match(regex) && item.type === 'artist') {
      artists.push(item.title);
    }
  }
}

const a = getArtistId('The Jez');
console.log(a)

module.exports = getUrl;
