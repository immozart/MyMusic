const express = require('express');
const router = express.Router();
const authModel = require("../models/auth");
const fetch = require("node-fetch");
const getUrl = require("../controller/api");


router.get('/', async (req, res, next) => {
  if (req.session.user) {
    res.render('index', { userName: req.session.user.firstName });
  } else {
    res.render('index');
  }
});

router.post('/', (req, res, next) => {
  let artist = req.body.artist.toLowerCase();
  const url = getUrl(artist);
  const regex = new RegExp(`^${artist.toLowerCase()}.*`);
  fetch(url)
    .then(res => res.json())
    .then(json => {
      let artists = [];
      for (let item of json.results) {
        if (item.title.toLowerCase().match(regex) && item.type === 'artist') {
          artists.push(item.title);
        }
      }
      res.render('index', { artists })
    })
})

router.get('/lk', async (req, res) => {
  if (req.session.user) {
    res.render('lk', { userName: req.session.user.firstName })
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

router.get('/login', (req, res, next) => {
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
    res.render('login', { errorMessage: 'Каждое поле должно быть заполнено.' })
  }
  let userInfo = await authModel.find({ login });

  if (userInfo.length === 0) {
    res.render('login', { errorMessage: 'Такого пользователя в системе не существует.' });
  }
  else {
    if (req.session.bid) {
      req.session.user = userInfo[0];
      res.redirect(`/${req.session.bid}`)
    } else if (userInfo[0].password === password) {
      req.session.user = userInfo[0];
      res.redirect('/lk');
    } else {
      res.render('login', { errorMessage: 'Вы ввели неправильный пароль.' });
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
          { errorMessage: "Пользователь с таким логином уже существует в системе." });
      }
      let errorMessages = [];
      const regWords = {
        'login': 'Логин', 'firstName': 'Имя', 'lastName': 'Фамилия',
        'email': 'E-Mail', 'password': 'Пароль'
      }
      if (error.errors) {
        for (let e in error.errors) {
          errorMessages.push(e);
        }
      }
      if (errorMessages.length === 1) {
        res.render('auth', { errorMessage: `Поле ${regWords[errorMessages[0]]} не может быть пустым.` });
      }
      else if (errorMessages.length > 1) {
        res.render('auth', { errorMessage: 'Каждое поле должно быть заполнено.' });
      }
    }
    else {
      req.session.user = newUser;
      res.redirect('/lk');
    }
  });
});

// router.get('/add', (req, res) => {
//   if (req.session.user === undefined) {
//     res.redirect('/')
//   }

//   if (req.session.user !== undefined) {
//     res.render('add', { userName: req.session.user.firstName, page: 'add' });
//   } else {
//     res.render('add');
//   }
// })

// router.post('/add', async (req, res) => {
//   let newItem = new itemModel({
//     login: req.session.user.login,
//     item: req.body.item,
//     condition: req.body.condition,
//     startDate: req.body.startdate,
//     finishDate: req.body.finishdate,
//     description: req.body.description,
//   })
//   await newItem.save();
//   res.redirect('/')
// });

// router.get('/edit/:id', async (req, res) => {
//   if (req.session.user === undefined) {
//     res.redirect('/')
//   }
//   const itemInfo = await itemModel.findOne({ _id: req.params.id });
//   res.render('add', { userName: req.session.user.firstName, itemInfo, page: 'edit' })
// });

// router.post('/edit/:id', async (req, res) => {
//   await itemModel.findOneAndUpdate({ _id: req.params.id },
//     {
//       item: req.body.item,
//       condition: req.body.condition,
//       startDate: req.body.startdate,
//       finishDate: req.body.finishdate,
//       description: req.body.description,
//     });
//   res.redirect('/');
// });

// router.get('/delete/:id', async (req, res) => {
//   if (req.session.user === undefined) {
//     res.redirect('/')
//   }
//   await itemModel.findOneAndDelete({ _id: req.params.id });
//   res.redirect('/');
// });

// router.get('/:id', async (req, res) => {
//   req.session.bid = req.params.id;
//   const itemInfo = await itemModel.findOne({ _id: req.params.id });
//   if (req.session.user === undefined) {
//     res.render('item', { itemInfo });
//   } else {
//     res.render('item', { itemInfo, userName: req.session.user.firstName });
//   }
// });

// router.post('/:id', async (req, res) => {
//   const itemInfo = await itemModel.findOne({ _id: req.params.id });
//   const newBid = new bidModel({
//     login: req.session.user.login,
//     item_id: itemInfo._id,
//     bid: req.body.bid,
//     bidDate: new Date()
//   });
//   await newBid.save((error) => {

//     if (error) {
//       res.render('item', {
//         itemInfo, errorMessage: "Поле не может быть пустым.",
//         userName: req.session.user.login
//       })
//     } else {
//       if (req.body.bid <= 0) {
//         res.render('item', {
//           itemInfo, errorMessage: "Ставка должна быть больше нуля.",
//           userName: req.session.user.login
//         })
//       } else {
//         res.redirect(`/${req.params.id}`);
//       }
//     }
//   });
// })



module.exports = router;
