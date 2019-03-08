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

const getArtistUrl = (artist_id) => {
  const base_url = `https://api.discogs.com/artists/${artist_id}/releases?`;
  const params = {
    key: 'dxgYyWTxQlEXIhnSSKSC',
    secret: 'rbRFjPiStApQayLcCqLMlNEPGVYuVNMc'
  };
  const querystring = queryString.stringify(params);
  const url = base_url + querystring;
  console.log(url);
  return url;

};

const getAlbums = async () => {
  const url = getArtistUrl(1704414);
  const res = await fetch(url);
  const json = await res.json();
  console.log(json);


};

const getArtistId = async (artist) => {
  const url = getIdUrl(artist);
  const regex = new RegExp(`^${artist.toLowerCase()}.*`);
  const res = await fetch(url);
  const json = await res.json();
  let artists = json.results.filter((item) => item.title.toLowerCase().match(regex) && item.type === 'artist');

  artists = artists.map((item) => {
    let newItem = {title: item['title'], id: item['id']}
    return newItem
  });

  console.log(artists)

};

getAlbums()




// module.exports = getUrl;
