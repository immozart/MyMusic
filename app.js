const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('hbs');
const session = require('express-session');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

const mongoose = require('mongoose');
mongoose.connect(`mongodb+srv://${process.env.mongo_login}:${process.env.mongo_password}@ismusic-7m8wi.mongodb.net/test?retryWrites=true`, { useNewUrlParser: true });

hbs.registerHelper('formatDate', function (date) {
  try {
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    if (month < 10) {
      month = `0${month}`;
    }
    if (day < 10) {
      day = `0${day}`;
    }
    return `${year}-${month}-${day}`
  } catch (err) {
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(cookieParser());

app.use(session({
  // store: new RedisStore({ 
  //   client,
  //   host: 'localhost', 
  //   port: 6379, 
  //   ttl :  260
  // }),
  key: 'user_sid',
  secret: 'anything here',
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 600000
  }
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
