var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
var passport = require('passport');
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
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json(err);
      // res.json({message: "Registering a new user failed! Try a different username"});
    }
    else {
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
          res.json({message: "Saving user credentials failed! Make sure your credentials are valid."});
          return;
        }
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: true, status: 'User Registration Successful!'});
        });
      });
    }
  })
});

router.post('/login', cors.corsWithOptions, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.log("a")
      return next(err);
    }

    if (!user) {
      res.statusCode = 401;
      console.log("b")
      // res.setHeader('Content-Type', 'application/json');
      res.json({success: false, status: 'Login Unsuccessful!', err: info});
    }
    req.logIn(user, (err) => {
      if (err) {
        res.statusCode = 401;
        console.log("c")
        // res.setHeader('Content-Type', 'application/json');
        res.json({success: false, status: 'Login Unsuccessful!', err: 'Could not log in user!'});          
      }

      var token = authenticate.getToken({_id: req.user._id});
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: true, status: 'Login Successful!', admin: user.admin, 
      token: token, userId: user._id, lastUpdated: user.lastUpdated, exp: 75});
    }); 
  }) (req, res, next);
});

router.put('/update', cors.corsWithOptions, (req, res) => {
  User.findByIdAndUpdate(req.body.userId, {
    $set: { lastUpdated: Date.now() }
    })
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
      status: 'You are successfully logged in!', exp: 3600});
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
      status: 'New token gathered!', exp: 3600});
  }
  else {
    // console.log(res)
    console.log(error)
  }
});

module.exports = router;