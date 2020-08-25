var express = require('express');
var budgetRouter = express.Router();
const bodyParser = require('body-parser');
var passport = require('passport');
var Budget = require('../models/budgets');
var authenticate = require('../authenticate');
const cors = require('./corsRoutes');

budgetRouter.use(bodyParser.json());

/* GET budgets listing. */
budgetRouter.route("/")
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, function(req, res, next) {
     Budget.find({ userId: req.user.id })
    .then(budgets => res.json(budgets))
    .catch(err => console.log(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // Check if budget already exists for specific user
    Budget.findOne ({
        userId: req.user.id,
        category: req.body.category
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
                category: req.body.category,
                amount: req.body.amount
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

budgetRouter.route("/:budgetId")
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Budget.findByIdAndRemove(req.params.budgetId)
  .then((resp) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(resp);
  }, (err) => next(err))
  .catch((err) => next(err));
});

module.exports = budgetRouter;