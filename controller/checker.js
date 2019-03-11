const fetch = require("node-fetch");
const artistModel = require("../models/artists");
const sendMail = require('node-email-sender');
const getArtistUrl = require("../controller/url").getArtistUrl;

const fs = require('fs');
const passwords = JSON.parse(fs.readFileSync('config.json', 'utf-8'));

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/mymusic', {useNewUrlParser: true});

const sendEmail = (artist, lastAlbum) => {
  let emailConfig = {
    emailFrom: 'vadimpostoffice@mail.ru',
    transporterConfig: {
      service: 'mail.ru',
      auth: {
        user: 'vadimpostoffice@mail.ru',
        pass: passwords.email
      }
    }
  };

  sendMail.sendMail({
    emailConfig: emailConfig,
    to: 'vadimpostoffice@mail.ru',
    subject: 'Ура! Вышел новый альбом!',
    content: `Отличная новость! ${artist} выпустили новый альбом - ${lastAlbum}!`
  });
};

const checkAll = async () => {
  console.log('WORKS');
  
  let artists = await artistModel.find();
  artists = artists.map(item => {
    return {
      artist: item.artist,
      artistId: item.artistId,
      albumsNumber: item.albums.length,
      email: item.email
    }
  });

  artists.forEach(async (item) => {
    let artist = item.artist;
    let artistId = item.artistId;
    let albumsNumber = item.albumsNumber;
    let email = item.email;

    const artistUrl = getArtistUrl(artistId, 1);
    const albumsResult = await fetch(artistUrl);
    const albumsJson = await albumsResult.json();
    const pagesNumber = albumsJson.pagination["pages"];
    let finalAlbums = albumsJson.releases.filter(
      item => item.artist.toLowerCase() === artist.toLowerCase() && 
      item.type === 'master'
    );
    finalAlbums = finalAlbums.map((item) => {
      return {title: item.title, year: item.year}
    });
    if (pagesNumber > 1) {
      for (let page = 2; page <= pagesNumber; page++) {
        const artistUrl = getArtistUrl(artistId, page);
        const albumsResult = await fetch(artistUrl);
        const albumsJson = await albumsResult.json();
        let albums = albumsJson.releases.filter((item) => item.artist.toLowerCase() === artist.toLowerCase()
          && item.type === 'master');
        albums = albums.map((item) => {
          return {title: item.title, year: item.year}
        });
        if (albums.length === 0) {
          break
        }
        finalAlbums = finalAlbums.concat(albums);
      }
    }

    const lastAlbum = finalAlbums[albumsNumber - 1].title;

    if (finalAlbums.length > albumsNumber) {
      sendEmail(artist, lastAlbum);
      console.log('Вышел новый альбом!')
    } else {
      console.log('Нет нового альбома!')
    }
  });

  // await mongoose.connection.close();
};

const checkOne = async (email) => {
  let artists = await artistModel.find({email: email});
  artists = artists.map(item => {return {artistId: item.artistId, artist: item.artist, albumsNumber: item.albums.length}});

  artists.forEach(async (item) => {
    let artist = item.artist;
    let artistId = item.artistId;
    let albumsNumber = item.albumsNumber;

    const artistUrl = getArtistUrl(artistId, 1);
    const albumsResult = await fetch(artistUrl);
    const albumsJson = await albumsResult.json();
    const pagesNumber = albumsJson.pagination["pages"];
    let finalAlbums = albumsJson.releases.filter((item) => item.artist.toLowerCase() === artist.toLowerCase()
      && item.type === 'master');
    finalAlbums = finalAlbums.map((item) => {
      return {title: item.title, year: item.year}
    });
    if (pagesNumber > 1) {
      for (let page = 2; page <= pagesNumber; page++) {
        const artistUrl = getArtistUrl(artistId, page);
        const albumsResult = await fetch(artistUrl);
        const albumsJson = await albumsResult.json();
        let albums = albumsJson.releases.filter((item) => item.artist.toLowerCase() === artist.toLowerCase()
          && item.type === 'master');
        albums = albums.map((item) => {
          return {title: item.title, year: item.year}
        });
        if (albums.length === 0) {
          break
        }
        finalAlbums = finalAlbums.concat(albums);
      }
    }

    const lastAlbum = finalAlbums[albumsNumber - 1].title;

    if (finalAlbums.length > albumsNumber) {
      console.log(`У ${artist} вышел новый альбом - ${lastAlbum}!`)
    } else {
      console.log('Нет нового альбома!')
    }
  });
  await mongoose.connection.close();
};


setInterval(() => checkAll(), 86400000)

// checkAll()

module.exports = checkAll;