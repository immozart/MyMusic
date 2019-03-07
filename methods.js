const fetch = require("node-fetch");
const queryString = require("querystring");

function getAlbums(artist) {
  let params = {
    method: 'artist.gettopalbums',
    artist: artist,
    api_key: '277d2989533b87ee733a8d432737cb61',
    format: 'json'
  };

  let querystring = queryString.stringify(params);
  let url = 'http://ws.audioscrobbler.com/2.0/?' + querystring;

  fetch(url)
    .then(res => res.json())
    .then(json => {
      for (let i = 0; i < json.topalbums.album.length; i++) {
        console.log(json.topalbums.album[i].name);
      }
    });
}

function getAlbumInfo(artist, album) {
  let params = {
    method: 'album.getinfo',
    artist: artist,
    album: album,
    api_key: '277d2989533b87ee733a8d432737cb61',
    format: 'json'
  };

  let querystring = queryString.stringify(params);
  let url = 'http://ws.audioscrobbler.com/2.0/?' + querystring;

  fetch(url)
    .then(res => res.json())
    .then(json => {
      console.log(json.album)
    });
}

// getAlbums('The Jezabels');
getAlbumInfo('The Jezabels', 'Prisoner');

module.exports.getAlbums = getAlbums;
module.exports.getAlbumInfo = getAlbumInfo;