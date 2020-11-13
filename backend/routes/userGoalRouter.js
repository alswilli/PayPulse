var express = require('express');
var userGoalRouter = express.Router();
const bodyParser = require('body-parser');
var passport = require('passport');
var UserGoal = require('../models/userGoals');
var authenticate = require('../authenticate');
const cors = require('./corsRoutes');

userGoalRouter.use(bodyParser.json());

userGoalRouter.route("/")
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, function(req, res, next) {

})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    
});

userGoalRouter.route("/:userGoalId")
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  
});

module.exports = userGoalRouter;