const fetch = require("node-fetch");
const queryString = require("querystring");

const getIdUrl = (artist) => {
  const base_url = 'https://api.discogs.com/database/search?';
  const params = {
    q: artist,
    key: 'dxgYyWTxQlEXIhnSSKSC',
    secret: 'rbRFjPiStApQayLcCqLMlNEPGVYuVNMc'
  };
  const querystring = queryString.stringify(params);
  const url = base_url + querystring;
  return url;
}

const getArtistUrl = (id) => {
  const base_url = 'https://api.discogs.com/{artist_id}/releases';

};

const getAlbums = async (artist) => {


};

const getArtistId = async (artist) => {
  const url = getIdUrl(artist);
  const regex = new RegExp(`^${artist.toLowerCase()}.*`);
  const res = await fetch(url);
  const json = await res.json();
  let artists = [];
  for (let item of json.results) {
    if (item.title.toLowerCase().match(regex) && item.type === 'artist') {
      let artObj = {};
      artObj.title = item.title;
      artObj.id = item.id;
      artists.push(artObj);
    }
  }
  
}

getArtistId('The Jez');

module.exports = getUrl;
