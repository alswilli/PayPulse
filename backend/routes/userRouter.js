var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/users');
var authenticate = require('../authenticate');
const cors = require('./corsRoutes');
const { isError } = require('util');

router.use(bodyParser.json());

/* GET users listing. */
router.options('*', cors.corsWithOptions, (req, res) => { res.sendStatus(200); } )
router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function(req, res, next) {
  User.find({})
    .then((users) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(users);
    })
    .catch((err) => next(err));
});

router.post('/signup', cors.corsWithOptions, (req, res, next) => {
  User.register(new User({username: req.body.username}), 
  req.body.password, (err, user) => {
    if(err) {
      console.log("create account error")
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.json(err);
      // res.json({message: "Registering a new user failed! Try a different username"});
    }
    else {
      console.log("create account successful")
      if (req.body.firstname)
        user.firstname = req.body.firstname;
      if (req.body.lastname)
        user.lastname = req.body.lastname;
      if (req.body.email)
        user.email = req.body.email;
      user.save((err, user) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          // res.json({err: err});
          return res.json({message: "Server Error: Saving user credentials failed!"});
        }
        passport.authenticate('local')(req, res, () => {
          // console.log(req, res)
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: true, status: 'User Registration Successful!'});
        });
      });
    }
  })
});

// router.post('/login', cors.corsWithOptions, authenticate.verifyLocal, (req, res, next) => {
//   console.log("hey")
//   console.log(req, res, next)
//   // User.find({ _id: req.user.id })
//   // .then(budgets => res.json(budgets))
//   // .catch(err => console.log(err));
//   if (req.user) {
//     var token = null
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'application/json');
//     res.json({success: true, username: req.user.username, token: token, 
//       userId: req.user._id, lastUpdated: req.user.lastUpdated, 
//       status: 'New token gathered!', exp: 3600});
//   }
//   else {
//     // console.log(res)
//     console.log(error)
//   }
// });

router.post('/login', cors.corsWithOptions, (req, res, next) => {
  console.log("hey")
  // passport.authenticate('local')(req, res, () => {
  //   console.log(req, res)
  //   res.statusCode = 200;
  //   res.setHeader('Content-Type', 'application/json');
  //   res.json({success: false, status: 'User Registration Successful!'});
  // });


  // passport.use(new LocalStrategy(
  //   (username, password, done) => {
  //     User.findOne({ username: username }, function(err, user) {
  //       if (err) { return done(err); }
  //       if (!user) {
  //         return done(null, false, { message: 'Incorrect username.' });
  //       }
  //       if (!user.validPassword(password)) {
  //         return done(null, false, { message: 'Incorrect password.' });
  //       }
  //       return done(null, user);
  //     });
  //   }
  // )), (req, res, next);


  passport.authenticate('local', (err, user, info) => {
    console.log("here")
    console.log(err, user, info)
    if (err) {
      console.log("aa")
      return next(err); // might need to change later but how to test?
    }

    if (!user) {
      res.statusCode = 400;
      console.log("bb")
      // res.setHeader('Content-Type', 'application/json');
      return res.json({success: false, status: 'Login Unsuccessful!', err: info});
    }
    req.logIn(user, (err) => {
      if (err) {
        res.statusCode = 500;
        console.log("cc")
        // res.setHeader('Content-Type', 'application/json');
        return res.json({success: false, status: 'Login Unsuccessful!', err: 'Server Error: Could not log in user!'});          
      }

      var token = authenticate.getToken({_id: req.user._id});
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.json({success: true, status: 'Login Successful!', admin: user.admin, 
        token: token, userId: user._id, lastUpdated: user.lastUpdated, exp: 80});
    }); 
  }) (req, res, next);
});

router.put('/update', cors.corsWithOptions, (req, res) => {
  User.findByIdAndUpdate(req.body.userId, {
    $set: { lastUpdated: Date.now() }
    }, { new: true })
    .then((user) => {
      console.log(user)
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(user);
    })
    .catch((err) => next(err));
});

router.post('/facebook/token', cors.corsWithOptions, passport.authenticate('facebook-token'), (req, res) => {
  if (req.user) {
    var token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, username: req.user.username, admin: req.user.admin, 
      token: token, userId: req.user._id, lastUpdated: req.user.lastUpdated,
      status: 'You are successfully logged in!', exp: 80});
  }
});

router.get('/checkJWTtoken', cors.corsWithOptions, (req, res) => {
  passport.authenticate('jwt', {session: false}, (err, user, info) => {
    if (err)
      return next(err);
    
    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.json({status: 'JWT invalid!', success: false, err: info});
    }
    else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.json({status: 'JWT valid!', success: true, user: user});

    }
  }) (req, res);
});

router.get('/newJWTtoken', cors.corsWithOptions, authenticate.verifyUser, (req, res) => { 
  console.log("Fetching new token")
  if (req.user) {
    var token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, username: req.user.username, token: token, 
      userId: req.user._id, lastUpdated: req.user.lastUpdated, 
      status: 'New token gathered!', exp: 80});
  }
  else {
    // console.log(res)
    console.log(error)
  }
});

module.exports = router;