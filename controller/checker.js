const artistModel = require("../models/artists");
const sendMail = require('node-email-sender');
const mongoose = require('mongoose');

const fs = require('fs');
const passwords = JSON.parse(fs.readFileSync('config.json', 'utf-8'));


// mongoose.connect('mongodb://localhost:27017/mymusic', {useNewUrlParser: true});

const getCompare = async () => {
  let artists = await artistModel.find({login: 'immozart'});
  artists = artists.map((item) => {
    return {artist: item.artist, artist_id: item.artist_id, albums: item.albums}
  });

  artists.forEach(async (info) => {
    const url = getArtistUrl(info.artist_id);
    const res = await fetch(url);
    const json = await res.json();
    let albums = json.releases.filter((item) => item.artist.toLowerCase() === info.artist.toLowerCase()
      && item.type === 'master');
    albums = albums.map((item) => {
      return {title: item.title, year: item.year}
    });
    if (albums.length > info.albums.length) {
      console.log('У исполнителя вышел новый альбом.')
    } else {
      console.log('У исполнителя нет новых альбомов.')
    }
  });

  await mongoose.connection.close()
};

const sendEmail = () => {
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

  const response = sendMail.sendMail({
    emailConfig: emailConfig,
    to: 'vadimpostoffice@mail.ru',
    subject: 'Sample subject',
    content: 'Sample content',
  });

  console.log(response);
};

// sendEmail();

// setInterval(() => {console.log(1000)}, 5000);