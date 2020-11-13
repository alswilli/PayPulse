var express = require('express');
var goalRouter = express.Router();
const bodyParser = require('body-parser');
var passport = require('passport');
var Goal = require('../models/goals');
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
        message: "Posts fetched successfully!",
        goals: goals
      });
    })
    .catch(error => {
      res.status(500).json({
        message: "Fetching posts failed!"
      });
    });
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, extractFile, (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  console.log(url)
  const goal = new Goal({
    goalName: req.body.name,
    goalDescription: req.body.description,
    imagePath: url + "/images/" + req.file.filename
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

module.exports = goalRouter;