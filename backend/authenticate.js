var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/users');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var FacebookTokenStrategy = require('passport-facebook-token');

const { NotExtended } = require('http-errors');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const tokenSecretKey = process.env.TOKEN_SECRET_KEY;

exports.getToken = function(user) {
    return jwt.sign(user, tokenSecretKey,
        {expiresIn: 3600});
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = tokenSecretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if (err) {
                console.log("error fnding user")
                return done(err, false);
            }
            else if (user) {
                console.log("user found")
                return done(null, user);
            }
            else {
                console.log("no user found")
                return done(null, false);
            }
        });
    }));

// exports.verifyLocal = passport.use(new LocalStrategy(
//     (username, password, done) => {
//       console.log("omg")
//       User.findOne({ username: username }, function(err, user) {
//         if (err) { return done(err); }
//         if (!user) {
//           return done(null, false, { message: 'Incorrect username.' });
//         }
//         if (!user.validPassword(password)) {
//           return done(null, false, { message: 'Incorrect password.' });
//         }
//         return done(null, user);
//       });
//     }
//   ));

// exports.verifyLocal2 = passport.authenticate('local', (err, user, info) => {
//     console.log("here")
//     console.log(err, user, info)
//     if (err) {
//       console.log("aa")
//       return next(err);
//     }

//     if (!user) {
//     //   res.statusCode = 401;
//       console.log("bb")
//       // res.setHeader('Content-Type', 'application/json');
//       return next({success: false, status: 'Login Unsuccessful!', err: info});
//     }
//     req.logIn(user, (err) => {
//       if (err) {
//         // res.statusCode = 401;
//         console.log("cc")
//         // res.setHeader('Content-Type', 'application/json');
//         return next({success: false, status: 'Login Unsuccessful!', err: 'Could not log in user!'});          
//       }

//       var token = authenticate.getToken({_id: req.user._id});
//     //   res.statusCode = 200;
//     //   res.setHeader('Content-Type', 'application/json');
//       return next({success: true, status: 'Login Successful!', admin: user.admin, 
//         token: token, userId: user._id, lastUpdated: user.lastUpdated, exp: 3600});
//     }); 
//   });

exports.verifyUser = passport.authenticate('jwt', {session: false});

exports.verifyAdmin = function(req, res, next) {
    if (req.user.admin === true) {
        return next();
    }
    else {
        err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
    }

};

exports.facebookPassport = passport.use(new FacebookTokenStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET
}, (accessToken, refreshToken, profile, done) => {
    User.findOne({facebookId: profile.id}, (err, user) => {
        if (err) {
            return done(err, false);
        }
        if (!err && user !== null) {
            return done(null, user);
        }
        else {
            console.log(profile.emails);
            user = new User({ username: profile.displayName }); 
            user.facebookId = profile.id;
            user.firstname = profile.name.givenName;
            user.lastname = profile.name.familyName;
            user.email = profile.emails[0].value; //might break with multiple emails
            user.save((err, user) => {
                if (err)
                    return done(err, false);
                else
                    return done(null, user);
            })
        }
    });
}
));