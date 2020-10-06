const express = require('express');
const cors = require('cors');
const app = express();

const whitelist = ['http://localhost:3000', 'https://localhost:4200', 'http://127.0.0.1:8080/',
'http://paypulse-reall.s3-website.us-east-2.amazonaws.com/', 'http://paypulsereall-env.eba-dfgdnuw7.us-east-2.elasticbeanstalk.com/'];
var corsOptionsDelegate = (req, callback) => {
    var corsOptions = true;
    // console.log(req.header('Origin'));
    // if(whitelist.indexOf(req.header('Origin')) !== -1) {
    //     corsOptions = { origin: true };
    // }
    // else {
    //     corsOptions = { origin: false };
    // }
    callback(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);