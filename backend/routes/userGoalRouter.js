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
    UserGoal.find()
    .then(usergoals => {
      res.status(200).json({
        message: "User Goals fetched successfully!",
        usergoals: usergoals
      });
    })
    .catch(error => {
      res.status(500).json({
        message: "Fetching user goals failed!"
      });
    });
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    const usergoal = new UserGoal({
        userId: res.body.userId,
        goalId: res.body.goalId
      });
      usergoal.save()
        .then(createdGoal => {
          res.status(201).json({
            message: "User Goal added successfully",
            usergoals: [createdGoal]
          });
        })
        .catch(error => {
          res.status(500).json({
            message: "Creating a user goal failed!"
          });
        });
});

userGoalRouter.route("/:userGoalId")
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  
});

module.exports = userGoalRouter;