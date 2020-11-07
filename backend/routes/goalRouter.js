var express = require('express');
var goalRouter = express.Router();
const bodyParser = require('body-parser');
var passport = require('passport');
var Goal = require('../models/goals');
var UserGoal = require('../models/userGoals');
var authenticate = require('../authenticate');
const cors = require('./corsRoutes');

goalRouter.use(bodyParser.json());

goalRouter.route("/")
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, function(req, res, next) {

})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {

});

goalRouter.route("/:budgetId")
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  
});

module.exports = goalRouter;