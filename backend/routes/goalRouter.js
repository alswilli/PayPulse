var express = require('express');
var goalRouter = express.Router();
const bodyParser = require('body-parser');
var passport = require('passport');
var Goal = require('../models/goals');
var GoalData = require('../models/goalData');
var authenticate = require('../authenticate');
const cors = require('./corsRoutes');
const extractFile = require("../imageFile");

goalRouter.use(bodyParser.json());

goalRouter.route("/")
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, function(req, res, next) {
    Goal.find()
    .then(goals => {
      res.status(200).json({
        message: "Goals fetched successfully!",
        goals: goals
      });
    })
    .catch(error => {
      res.status(500).json({
        message: "Fetching goals failed!"
      });
    });
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, extractFile, (req, res, next) => {
//   const url = req.protocol + "://" + req.get("host");
//   console.log(url)
//   const goal = new Goal({
//     goalName: req.body.name,
//     goalDescription: req.body.description,
//     imagePath: url + "/images/" + req.file.filename
//   });
    console.log("THE FILE: ", req.file)
  const url = req.protocol + "://" + req.get("host");
  console.log(url)
  const goal = new Goal({
    goalName: req.body.name,
    goalDescription: req.body.description,
    imagePath: req.file.location
  });
  goal.save()
    .then(createdGoal => {
      res.status(201).json({
        message: "Goal added successfully",
        goals: [createdGoal]
      });
    })
    .catch(error => {
      res.status(500).json({
        message: "Creating a goal failed!"
      });
    });
});

goalRouter.route("/:goalId")
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  
});

goalRouter.route("/goalData/:userId")
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, function(req, res, next) {
  GoalData.find({userId: req.params.userId})
  .then(goaldata => {
    res.status(200).json({
      message: "Goal data fetched successfully!",
      goaldata: goaldata
    });
  })
  .catch(error => {
    res.status(500).json({
      message: "Fetching goal data failed!"
    });
  });
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  GoalData.find({userId: req.params.userId})
  .then(result => {
    console.log(result)
    if (result.length > 0) {
      res.status(200).json({
        message: "Goal data fetched successfully!",
        goaldata: result
      });
    }
    else {
      const goaldata = new GoalData({
        userId: req.params.userId,
        allMonthsAchieved: {"January" : false,
                            "February" : false,
                            "March" : false,
                            "April" : false,
                            "May" : false,
                            "June" : false,
                            "July" : false,
                            "August" : false,
                            "September" : false,
                            "October" : false,
                            "November" : false,
                            "December" : false 
                          }
      });
      goaldata.save()
        .then(createdGoalData => {
          res.status(201).json({
            message: "Goal data added successfully",
            goaldata: [createdGoalData]
          });
        })
        .catch(error => {
          res.status(500).json({
            message: "Creating a goal data failed!"
          });
        });
    }
  })
})

goalRouter.route("/goalData/:goaldataId")
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    GoalData.findByIdAndUpdate(req.params.goaldataId, {
        $set: {
          userId: req.body.userId,
          allMonthsAchieved: req.body.allMonthsAchieved,
          monthsInARow: req.body.monthsInARow,
          previousMonth: req.body.previousMonth,
          prevBudgetMargin: req.body.prevBudgetMargin
              }
        }, { new: true })
        .then((goaldata) => {
          console.log("GOAL DATA UPDATED DONE: ", goaldata)
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(goaldata);
        })
        .catch((err) => next(err));
})

module.exports = goalRouter;