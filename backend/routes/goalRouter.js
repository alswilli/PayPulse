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
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // Check if budget already exists for specific user
    Budget.findOne ({
        userId: req.user.id,
        mainCategory: req.body.mainCategory,
        category: req.body.category,
        category2: req.body.category2,
        category3: req.body.category3
    })
    .then(budget => {
        if (budget) {
            console.log("Budget already exists");
            var err = new Error("Budget already exists");
            err.status = 500;
            throw err;
        } 
        else {
            const newBudget = new Budget({
                userId: req.user.id,
                mainCategory: req.body.mainCategory,
                category: req.body.category,
                category2: req.body.category2,
                category3: req.body.category3,
                amount: req.body.amount,
                total: null
            });
            newBudget.save().then(budget => res.json(budget))
        }
    })
    .catch(err => {
        if (err.message === 'Budget already exists') {
            res.status(400).json({ message: "Budget already exists" });
        }
        else {
            console.log(err.message);
            res.status(500).json({ message: "An unknown error occured when adding budget! Please try again" });
        }
    });
});

goalRouter.route("/:budgetId")
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  
});

module.exports = goalRouter;