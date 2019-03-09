const express = require('express');
const router = express.Router();
const authModel = require("../models/auth");
const artistModel = require("../models/artists");
const fetch = require("node-fetch");
const Url = require("../controller/url");
const getIdUrl = Url.getIdUrl, getArtistUrl = Url.getArtistUrl;


router.get('/', async (req, res, next) => {
  if (req.session.user) {
    res.render('index', {userName: req.session.user.firstName});
  } else {
    res.render('index');
  }
});

router.post('/', async (req, res) => {
  const userName = req.session.user ? req.session.user.firstName : '';
  let artist = req.body.artist;
  const idUrl = getIdUrl(artist);
  const regex = new RegExp(`^${artist.toLowerCase()}.*`);
  const idResult = await fetch(idUrl);
  const idJson = await idResult.json();

  let artists = idJson.results.filter((item) =>
    (item.title.toLowerCase() === artist.toLowerCase()
      || item.title.toLowerCase().match(regex)) && item.type === 'artist'
  );
  console.log(artists);
  artists = artists.map((item) => {
    return {title: item['title'], id: item['id']}
  });

  if (artists.length === 0) {
    res.render('index', {message: 'Ничего не найдено!', userName})
  } else if (artists.length === 1) {
    const artistId = artists[0].id;
    const artistUrl = getArtistUrl(artistId);
    const albumsResult = await fetch(artistUrl);
    const albumsJson = await albumsResult.json();
    let albums = albumsJson.releases.filter((item) => item.artist.toLowerCase() === artist.toLowerCase()
      && item.type === 'master');
    albums = albums.map((item) => {
      return {title: item.title, year: item.year}
    });
    if (albums.length === 0) {
      res.render('index', {
        artists, albumMessage: 'Альбомы по этому исполнителю не найдены.', userName
      })

    } else {
      req.session.artist = {artist: artist, artist_id: artistId, albums: albums};
      res.render('index', {artists, albums, userName})
    }
  } else {
    res.render('index', {artists, userName})
  }
});

router.get('/add', async (req, res) => {
  if (req.session.user) {
    let newArtist = new artistModel({
      login: req.session.user.login,
      artist: req.session.artist.artist,
      artist_id: req.session.artist.artist_id,
      albums: req.session.artist.albums
    });

    await newArtist.save((error) => {
      console.log(error);
      if (error) {
        res.redirect('/lk')
      } else {
        req.session.artist = undefined;
        res.redirect('/lk')
      }
    });
  } else {
    res.redirect('/login')
  }
});

router.get('/lk', async (req, res) => {
  if (req.session.user) {
    console.log('artist is', req.session.artist);
    if (req.session.artist) {
      let newArtist = new artistModel({
        login: req.session.user.login,
        artist: req.session.artist.artist,
        artist_id: req.session.artist.artist_id,
        albums: req.session.artist.albums
      });

      await newArtist.save(async (error) => {
        const artist = req.session.artist.artist;
        req.session.artist = undefined;
        const artists = await artistModel.find({login: req.session.user.login});
        if (error) {
          res.render('lk', {
            artists, userName: req.session.user.firstName,
            duplicateError: `Исполнитель ${artist} уже добавлен в избранное.`
          });
        } else {
          res.render('lk', {artists, userName: req.session.user.firstName})
        }
      });
    } else {
      const artists = await artistModel.find({login: req.session.user.login});
      res.render('lk', {artists, userName: req.session.user.firstName})
    }
  } else {
    res.redirect('/login')
  }
});

router.get('/logout', (req, res) => {
  if (req.session.user) {
    req.session.destroy();
  }
  res.redirect('/');
});

router.get('/login', async (req, res, next) => {
  if (req.session.user) {
    res.redirect('/lk')
  } else {
    res.render('login');
  }
});

router.get('/registration', (req, res, next) => {
  res.render('auth');
});

router.post('/login', async (req, res, next) => {
  const login = req.body.login, password = req.body.password;
  if (login === '' || password === '') {
    res.render('login', {errorMessage: 'Каждое поле должно быть заполнено.'})
  }
  let userInfo = await authModel.find({login});

  if (userInfo.length === 0) {
    res.render('login', {errorMessage: 'Такого пользователя в системе не существует.'});
  } else {
    if (userInfo[0].password === password) {
      req.session.user = userInfo[0];
      res.redirect('/lk');
    } else {
      res.render('login', {errorMessage: 'Вы ввели неправильный пароль.'});
    }
  }
});

router.post('/registration', async (req, res, next) => {
  let newUser = new authModel({
    login: req.body.login,
    password: req.body.password,
    email: req.body.email,
    firstName: req.body.firstname,
    lastName: req.body.lastname
  });
  await newUser.save((error) => {
    if (error) {
      if (error.code === 11000) {
        res.render('auth',
          {errorMessage: "Пользователь с таким логином уже существует в системе."});
      }
      let errorMessages = [];
      const regWords = {
        'login': 'Логин', 'firstName': 'Имя', 'lastName': 'Фамилия',
        'email': 'E-Mail', 'password': 'Пароль'
      };
      if (error.errors) {
        for (let err in error.errors) {
          errorMessages.push(err);
        }
      }
      if (errorMessages.length === 1) {
        res.render('auth', {errorMessage: `Поле ${regWords[errorMessages[0]]} не может быть пустым.`});
      } else if (errorMessages.length > 1) {
        res.render('auth', {errorMessage: 'Каждое поле должно быть заполнено.'});
      }
    } else {
      req.session.user = newUser;
      res.redirect('/lk');
    }
  });
});

router.get('/:id', async (req, res) => {
  if (req.session.user) {
    const artists = await artistModel.find({artist_id: req.params.id});
    res.render('artist', {artist: artists[0].artist, albums: artists[0].albums, userName: req.session.user.firstName})
  } else {
    res.redirect('/')
  }
});

module.exports = router;
