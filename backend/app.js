const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const passport = require('passport');
const path = require('path');

const app = express()

dotenv.config();

// Routes
const transactionRouter = require('./routes/transactionRouter');
const plaidRouter = require("./routes/plaidRouter");
const userRouter = require('./routes/userRouter');
const budgetRouter = require('./routes/budgetRouter');

const mongoUsername = process.env.MONGODB_USERNAME;
const mongoUserPassword = process.env.MONGODB_USER_PASSWORD;
const mongoDatabaseName = process.env.MONGODB_DATABASE_NAME;

// const url = "mongodb+srv://" + mongoUsername + ":" + mongoUserPassword + "@cluster0.r11ua.mongodb.net/" + mongoDatabaseName + "?retryWrites=true&w=majority";
const url = "mongodb+srv://" + mongoUsername + ":" + mongoUserPassword + "@cluster0.r11ua.mongodb.net/" + mongoDatabaseName;
const connect = mongoose.connect( process.env.MONGODB_URI || url);

connect.then((db) => {
    console.log("Connected correctly to server");
}, (err) => { console.log(err); });

// // Secure traffic only
// app.all('*', (req, res, next) => {
//   if (req.secure) {
//     return next();
//   }
//   else {
//     res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
//   }
// });

app.use(passport.initialize());

// Connecting middleware
app.use('/transactions', transactionRouter);
app.use('/plaid', plaidRouter);
app.use('/users', userRouter);
app.use('/budgets', budgetRouter);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist/PayPulse'));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'PayPulse', 'index.html'));
  })
}

module.exports = app;

// var createError = require('http-errors');
// var express = require('express');
// var path = require('path');
// var logger = require('morgan');
// var passport = require('passport');
// var authenticate = require('./authenticate');
// var config = require('./config');

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
// var dishRouter = require('./routes/dishRouter');
// var promoRouter = require('./routes/promoRouter');
// var leaderRouter = require('./routes/leaderRouter');
// const uploadRouter = require('./routes/uploadRouter');
// const favoriteRouter = require('./routes/favoriteRouter');

// const mongoose = require('mongoose');

// const Dishes = require('./models/dishes');

// const url = config.mongoUrl;
// const connect = mongoose.connect(url);

// connect.then((db) => {
//     console.log("Connected correctly to server");
// }, (err) => { console.log(err); });

// var app = express();

// // Secure traffic only
// app.all('*', (req, res, next) => {
//   if (req.secure) {
//     return next();
//   }
//   else {
//     res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
//   }
// });

// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// app.use(passport.initialize());

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// app.use(express.static(path.join(__dirname, 'public')));

// app.use('/dishes',dishRouter);
// app.use('/promotions',promoRouter);
// app.use('/leaders',leaderRouter);
// app.use('/imageUpload',uploadRouter);
// app.use('/favorites',favoriteRouter);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

// module.exports = app;