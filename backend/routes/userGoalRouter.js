var express = require('express');
var userGoalRouter = express.Router();
const bodyParser = require('body-parser');
var passport = require('passport');
var UserGoal = require('../models/userGoals');
var authenticate = require('../authenticate');
const cors = require('./corsRoutes');

userGoalRouter.use(bodyParser.json());

userGoalRouter.route("/:userId")
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, function(req, res, next) {
    UserGoal.find({userId : req.params.userId})
    // UserGoal.find({ userId : req.params.userId })
    .then(usergoals => {
      console.log('GET USER GOALS: ', usergoals)
      if (usergoals == null) {
        usergoals = []
      }
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
        userId: req.body.userId,
        goalId: req.body.goalId
      });
      usergoal.save()
        .then(createdGoal => {
          res.status(201).json({
            message: "User Goal added successfully",
            usergoals: createdGoal
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
    if (req.body.done === "Done") {
        UserGoal.findByIdAndUpdate(req.params.userGoalId, {
            $set: {
                    goalProgress: 100,
                    numTimesAchieved: req.body.numTimesAchieved,
                    dateFirstAchieved: Date.now(),
                    dateLastAchieved: Date.now()
                  }
            }, { new: true })
            .then((user) => {
              console.log("USER UPDATED DONE: ", user)
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(user);
            })
            .catch((err) => next(err));
    }
    else if (req.body.done === "Not Done") {
        UserGoal.findByIdAndUpdate(req.params.userGoalId, {
            $set: { 
                    goalProgress: req.body.goalProgression,
                  }
            }, { new: true })
            .then((user) => {
              console.log("USER UPDATED NOT DONE: ", user)
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(user);
            })
            .catch((err) => next(err));
    }
    else {
        UserGoal.findByIdAndUpdate(req.params.userGoalId, {
            $set: { 
                    numTimesAchieved: req.body.numTimesAchieved,
                    dateLastAchieved: Date.now()
                  }
            }, { new: true })
            .then((user) => {
              console.log("USER UPDATED OTHER: ", user)
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(user);
            })
            .catch((err) => next(err));
    }
    
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  
});

module.exports = userGoalRouter;