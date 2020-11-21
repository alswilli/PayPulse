const express = require("express");
const plaid = require("plaid");
const plaidRouter = express.Router();
const passport = require("passport");
const moment = require("moment");
const mongoose = require("mongoose");
const authenticate = require('../authenticate');
const cors = require('./corsRoutes');
const bodyParser = require('body-parser');

// Load Account and User models
const Account = require("../models/accounts");
const User = require("../models/users");

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_PUBLIC_KEY = process.env.PLAID_PUBLIC_KEY;

var ACCESS_TOKEN = null;
var PUBLIC_TOKEN = null;
var ITEM_ID = null;

const client = new plaid.Client(
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_PUBLIC_KEY,
  plaid.environments.sandbox,
  { version: "2018-05-22" }
);

plaidRouter.use(bodyParser.json());

// @route POST plaid/accounts/add
// @desc Trades public token for access token and stores credentials in database
// @access Private
plaidRouter.route("/accounts/add")
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  PUBLIC_TOKEN = req.body.token;
  const userId = req.user.id;
  const institution = req.body.metadata.institution;
  // const subAccounts = req.body.metadata.accounts;
  const { name, institution_id } = institution;
  if (PUBLIC_TOKEN) {
    client.exchangePublicToken(PUBLIC_TOKEN)
      .then(exchangeResponse => {
        ACCESS_TOKEN = exchangeResponse.access_token;
        ITEM_ID = exchangeResponse.item_id;
        // Check if account already exists for specific user
        return Account.findOne({
          userId: req.user.id,
          institutionId: institution_id
        })
      })
      .then(account => {
        if (account) {
          console.log("Account already exists");
          var err = new Error("Account already exists");
          err.status = 500;
          throw err;
        } 
        else {
          console.log(account)
          return Account.find({
            userId: req.user.id
          })
        }
      })
      .then(allAccounts => {
        // Pull the accounts associated with the Item
        client.getAccounts(ACCESS_TOKEN, (err, result) => {
          console.log("Made it into the next block")
          // Handle err (TO-DO)
          if (err) {
            var err = new Error("Get Accounts failed");
            err.status = 400;
            throw err;
          }
          else {
            const subAccounts = result.accounts;
            const newAccount = new Account({
              userId: userId,
              accessToken: ACCESS_TOKEN,
              itemId: ITEM_ID,
              institutionId: institution_id,
              institutionName: name,
              subAccounts: subAccounts
            });
            if (allAccounts.length < 1) {
              newAccount.current = true;
            }
            newAccount.save().then(account => {
              // var editedAccount = {
              //   _id: account._id,
              //   userId: account.userId,
              //   institutionId: account.institutionId,
              //   institutionName: account.institutionName,
              //   subAccounts: account.subAccounts
              // };
              // if (allAccounts.length < 1) {
              //   editedAccount.current = true;
              // }
              newAccount.accessToken = null;
              newAccount.itemId = null;
              res.json(account);
            })
          }
        })
      })
      // .then(account => res.json(account))
      .catch(err => {
        if (err.message === 'Account already exists') {
          res.status(400).json({ message: "Account already exists" });
        }
        else if (err.message === 'Get Accounts failed') {
          res.status(500).json({ message: "Get Accounts failed" });
        }
        else {
          console.log(err.message);
          res.status(500).json({ message: "An unknown error occured when adding account! Please try again" });
        }
      }); 
  }
});

// @route DELETE api/plaid/accounts/:id
// @desc Delete account with given id
// @access Private
plaidRouter.route("/accounts/:accountId")
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Account.findByIdAndUpdate(req.params.accountId, {
      $set: req.body
  }, { new: true })
  .then((account) => {
      console.log("    ");
      console.log("WE MADE IT");
      console.log("    ");
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      // var editedAccount = {
      //   _id: account._id,
      //   userId: account.userId,
      //   institutionId: account.institutionId,
      //   institutionName: account.institutionName,
      //   subAccounts: account.subAccounts,
      //   current: account.current
      // };
      // res.json(editedAccount);
      account.accessToken = null;
      account.itemId = null;
      res.json(account);
  }, (err) => next(err))
  .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Account.findByIdAndRemove(req.params.accountId)
  .then((resp) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      // var editedAccount = {
      //   _id: resp._id,
      //   userId: resp.userId,
      //   institutionId: resp.institutionId,
      //   institutionName: resp.institutionName,
      //   subAccounts: resp.subAccounts,
      //   current: resp.current
      // };
      // res.json(editedAccount);
      resp.accessToken = null;
      resp.itemId = null;
      res.json(resp)
  }, (err) => next(err))
  .catch((err) => next(err));
});
// .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
//   Account.findById(req.params.id).then(account => {
//     // Delete account
//     account.remove().then(() => res.json({ success: true }));
//   });
// });

// @route GET api/plaid/accounts
// @desc Get all accounts linked with plaid for a specific user
// @access Private
plaidRouter.route("/accounts")
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
  console.log(req.query);
  if (req.query.current) {
    console.log("curr");
    Account.find({ userId: req.user.id, current: true })
    .then(account => {
      console.log(account)
      // if (account.length > 0) {
      //   var editedAccount = {
      //     _id: account[0]._id,
      //     userId: account[0].userId,
      //     institutionId: account[0].institutionId,
      //     institutionName: account[0].institutionName,
      //     subAccounts: account[0].subAccounts,
      //     current: account[0].current
      //   };
      //   res.json(editedAccount);
      // }
      // else {
      //   res.json(account);
      // }
      // res.json(accounts);
      if (account.length > 0) {
        account[0].accessToken = null;
        account[0].itemId = null;
      }
      res.json(account);
    })
    .catch(err => console.log(err));
  }
  else {
    console.log("all");
    Account.find( { userId: req.user.id })
    .then(accounts => {
      console.log(accounts)
      // var editedAccounts = [];
      // for (let account of accounts) {
      //   var editedAccount = {
      //     _id: account._id,
      //     userId: account.userId,
      //     institutionId: account.institutionId,
      //     institutionName: account.institutionName,
      //     subAccounts: account.subAccounts,
      //     current: account.current
      //   };
      //   editedAccounts.push(editedAccount);
      // }
      // res.json({success: true, numAccounts: accounts.length, accountsData: editedAccounts});
      for (let account of accounts) {
        account.accessToken = null;
        account.itemId = null;
      }
      res.json({success: true, numAccounts: accounts.length, accountsData: accounts});
    })
    .catch(err => console.log(err));
  }
});

plaidRouter.route("/accounts/transactions/webhooks")
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
.post(cors.corsWithOptions, (req, res, next) => {
  console.log("WEBHOOK FIRED");
  console.log(JSON.stringify(req.body));
});

// @route POST api/plaid/accounts/transactions
// @desc Fetch transactions from past 30 days from all linked accounts
// @access Private
plaidRouter.route("/accounts/transactions/:accountId")
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  // Variables from customized requests
  const pageSize = +req.query.pageSize;
  const currentPage = +req.query.page;
  const subAccount = req.query.subAccount;
  const subAccountId = req.query.subAccountId;
  const N = 3;
  // Variables for Plaid API query
  const now = moment();
  var today = "";
  var numDaysAgo = "";
  if (req.query.days != null) {
    today = now.subtract(req.query.subdays, "days").format("YYYY-MM-DD");
    numDaysAgo = now.subtract(req.query.days, "days").format("YYYY-MM-DD");
  }
  else {
    today = now.format("YYYY-MM-DD");
    numDaysAgo = now.subtract(365, "days").format("YYYY-MM-DD"); // Change this if you want more transactions
  }
  // const thirtyDaysAgo = now.subtract(30, "days").format("YYYY-MM-DD"); // Change this if you want more transactions
  // console.log("30 DAY AGO: ", thirtyDaysAgo);
  console.log("START: ", numDaysAgo);
  console.log("END: ", today);
  console.log(req.query.days)
  console.log(req.query.subdays)
  
  // Account.find({ accountId: req.body.accountId })
  Account.findById(req.params.accountId)
    .then(account => {
      console.log("THIS IS THE ACCOUNT: ", account);
      console.log(account.userId)
      ACCESS_TOKEN = account.accessToken;
      const institutionName = account.institutionName;
      var finalTransactions = []
      console.log(ACCESS_TOKEN);
      console.log(account.accessToken)
      // console.log(thirtyDaysAgo);
      console.log(today);
      client.getTransactions(ACCESS_TOKEN, numDaysAgo, today, function(error, response) {
        if (error != null) {
          // prettyPrintResponse(error);
          console.log(error)
          return res.json({
            error: error
          });
        } else {
          console.log("here");
          console.log("First Transaction: ", response.transactions[0])
          // Checks for pagination query params
          if (pageSize && currentPage) {
            // Filter for subAccount
            filteredTransactions = []
            // console.log(response.transactions)
            console.log(subAccount)
            console.log(subAccountId)
            if (subAccount === 'All') {
              console.log('all');
              for (let transaction of response.transactions) {
                  filteredTransactions.push(transaction);
              }
            }
            else {
              for (let transaction of response.transactions) {
                if (transaction.account_id === subAccountId) {
                  filteredTransactions.push(transaction);
                }
              }
            } 
            responseLength = filteredTransactions.length;
            startIndex = pageSize * (currentPage - 1)
            endIndex = Math.min(startIndex + pageSize, responseLength);  
            console.log(startIndex);
            console.log(endIndex); 
            console.log(responseLength);
            for (startIndex; startIndex < endIndex; startIndex++) {
              currentTransaction = filteredTransactions[startIndex];
              formattedTransaction = {
                _id: currentTransaction.transaction_id,
                date: currentTransaction.date,
                transactionName: currentTransaction.name,
                amount: currentTransaction.amount,
                category: currentTransaction.category,
                account_id: currentTransaction.account_id
              }
              finalTransactions.push(formattedTransaction);
            }   
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({
              transactions: finalTransactions,
              maxTransactions: responseLength
            });    
          }
          else if (req.query.recentTransactions) {
            console.log("IN RECENT TRANSACTIONS")
            var count = 0;
            for (let transaction of response.transactions) {
              if (count == N) { // 1.) May not get most recent so will have to sort AND 2.) '==' could be wrong
                break;
              }
              formattedTransaction = {
                _id: transaction.transaction_id,
                date: transaction.date,
                transactionName: transaction.name,
                amount: transaction.amount,
                category: transaction.category,
                account_id: transaction.account_id
              }
              finalTransactions.push(formattedTransaction);
              count++;
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(finalTransactions);
          }
          else if (req.query.topTransactions) {
            console.log("TO-DO");
          }
          else if (req.query.budgetTransactions) {
            console.log("In budget area");
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(response.transactions);    
          }
        }
      });
    }, (err) => next(err))
    .catch(err => console.log(err));

  /*THIS CODE IS FOR WHEN YOU WANT ALL TRANSACTIONS FROM ALL ACCOUNTS*/ 
  // let transactions = [];
  // const accounts = req.body;
  // if (accounts) {
  //   accounts.forEach(function(account) {
  //     ACCESS_TOKEN = account.accessToken;
  //     const institutionName = account.institutionName;
  //     client.getTransactions(ACCESS_TOKEN, thirtyDaysAgo, today)
  //       .then(response => {
  //         transactions.push({
  //           accountName: institutionName,
  //           transactions: response.transactions
  //         });
  //         // Don't send back response till all transactions have been added
  //         if (transactions.length === accounts.length) {
  //           res.json(transactions);
  //         }
  //       })
  //       .catch(err => console.log(err));
  //   });
  // }
});

// @route GET api/plaid/accounts/transactions/categories
// @desc Fetch transaction categories from Plaid API
// @access Public
plaidRouter.route("/accounts/categories")
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, (req, res) => {
  client.getCategories(function(err, response) {
    // Handle err
    if (err != null) {
      // prettyPrintResponse(error);
      return res.json({
        error: err
      });
    }
    // console.log(err)
    // console.log(response)
    var categories = response.categories;
    // console.log(categories);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(categories);
  });
});

module.exports = plaidRouter;