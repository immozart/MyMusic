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
  return base_url + querystring;
};

const getArtistUrl = (artist_id) => {
  const base_url = `https://api.discogs.com/artists/${artist_id}/releases?`;
  const params = {
    key: 'dxgYyWTxQlEXIhnSSKSC',
    secret: 'rbRFjPiStApQayLcCqLMlNEPGVYuVNMc',
    per_page: 100
  };
  const querystring = queryString.stringify(params);
  return base_url + querystring;
};

const getAlbums = async (artist_id) => {
  const url = getArtistUrl(artist_id);
  const res = await fetch(url);
  const json = await res.json();
  console.log(json);
  let albums = json.releases.filter((item) => item.artist.toLowerCase() === 'adele (3)' && item.type === 'master');
  albums = albums.map((item) => {
    return {title: item.title, year: item.year}
  });
  console.log(albums)
};

const getArtistId = async (artist) => {
  const url = getIdUrl(artist);
  const regex = new RegExp(`^${artist.toUpperCase()}.*`);
  const res = await fetch(url);
  const json = await res.json();
  let artists = json.results.filter((item) => item.title.toLowerCase() === artist.toLowerCase()
    || item.title.toLowerCase().match(regex) && item.type === 'artist');
  artists = artists.map((item) => {
    return {title: item['title'], id: item['id']}
  });
};



module.exports = {getIdUrl, getArtistUrl};
