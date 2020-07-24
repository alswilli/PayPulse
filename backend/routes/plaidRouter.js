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
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
  PUBLIC_TOKEN = req.body.token;
  const userId = req.user.id;
  const institution = req.body.metadata.institution;
  const { name, institution_id } = institution;
  if (PUBLIC_TOKEN) {
    client.exchangePublicToken(PUBLIC_TOKEN)
      .then(exchangeResponse => {
        ACCESS_TOKEN = exchangeResponse.access_token;
        ITEM_ID = exchangeResponse.item_id;
        // Check if account already exists for specific user
        Account.findOne({
          userId: req.user.id,
          institutionId: institution_id
        })
        .then(account => {
          if (account) {
            console.log("Account already exists");
          } else {
            console.log(account)
            Account.find({
              userId: req.user.id
            })
            .then(allAccounts => {
              const newAccount = new Account({
                userId: userId,
                accessToken: ACCESS_TOKEN,
                itemId: ITEM_ID,
                institutionId: institution_id,
                institutionName: name
              });
              if (allAccounts.length < 1) {
                newAccount.current = true;
              }
              newAccount.save().then(account => res.json(account));
            })
            .catch(err => console.log(err)); // All Accounts Error
          }
        })
        .catch(err => console.log(err)); // Mongo Error
      })
      .catch(err => console.log(err)); // Plaid Error
    }
  }
);

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
      res.json(account);
  }, (err) => next(err))
  .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Account.findByIdAndRemove(req.params.accountId)
  .then((resp) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(resp);
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
    .then(accounts => res.json(accounts))
    .catch(err => console.log(err));
  }
  else {
    console.log("all");
    Account.find( { userId: req.user.id })
    .then(accounts => res.json({success: true, numAccounts: accounts.length, accountsData: accounts}))
    .catch(err => console.log(err));
  }
});

// // @route POST api/plaid/accounts/transactions
// // @desc Fetch transactions from past 30 days from all linked accounts
// // @access Private
// plaidRouter.route("/accounts/transactions")
// .options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
// .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
//   // Variables from customized requests
//   const pageSize = +req.query.pageSize;
//   const currentPage = +req.query.page;
//   const N = 3;
//   // Variables for Plaid API query
//   const now = moment();
//   const today = now.format("YYYY-MM-DD");
//   const thirtyDaysAgo = now.subtract(30, "days").format("YYYY-MM-DD"); // Change this if you want more transactions
  
//   // Account.find({ accountId: req.body.accountId })
//   Account.findById(req.body.accountId)
//     .then(account => {
//       console.log(account);
//       ACCESS_TOKEN = account.accessToken;
//       const institutionName = account.institutionName;
//       var filteredTransactions = []
//       console.log(ACCESS_TOKEN);
//       console.log(thirtyDaysAgo);
//       console.log(today);
//       client.getTransactions(ACCESS_TOKEN, thirtyDaysAgo, today)
//         .then(response => {
//           // Checks for pagination query params
//           if (pageSize && currentPage) {
//             startIndex = pageSize * (currentPage - 1)
//             endIndex = startIndex + pageSize;   
//             for (startIndex; startIndex < endIndex; startIndex++) {
//               filteredTransactions.push(response[startIndex]);
//             }   
//             res.statusCode = 200;
//             res.setHeader('Content-Type', 'application/json');
//             res.json({
//               transactions: filteredTransactions,
//               maxTransactions: response.length
//             });    
//           }
//           else if (req.query.recentTransactions) {
//             var count = 0;
//             for (let transaction of response) {
//               if (count == N) { // 1.) May not get most recent so will have to sort AND 2.) '==' could be wrong
//                 break;
//               }
//               filteredTransactions.push(transaction);
//               count++;
//             }
//             res.statusCode = 200;
//             res.setHeader('Content-Type', 'application/json');
//             res.json(filteredTransactions);
//           }
//           else if (req.query.topTransactions) {
//             console.log("TO-DO");
//           }
//         }, (err) => next(err))
//         .catch(err => console.log(err));
//     }, (err) => next(err))
//     .catch(err => console.log(err));

//   /*THIS CODE IS FOR WHEN YOU WANT ALL TRANSACTIONS FROM ALL ACCOUNTS*/ 
//   // let transactions = [];
//   // const accounts = req.body;
//   // if (accounts) {
//   //   accounts.forEach(function(account) {
//   //     ACCESS_TOKEN = account.accessToken;
//   //     const institutionName = account.institutionName;
//   //     client.getTransactions(ACCESS_TOKEN, thirtyDaysAgo, today)
//   //       .then(response => {
//   //         transactions.push({
//   //           accountName: institutionName,
//   //           transactions: response.transactions
//   //         });
//   //         // Don't send back response till all transactions have been added
//   //         if (transactions.length === accounts.length) {
//   //           res.json(transactions);
//   //         }
//   //       })
//   //       .catch(err => console.log(err));
//   //   });
//   // }
// });

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
  const N = 3;
  // Variables for Plaid API query
  const now = moment();
  const today = now.format("YYYY-MM-DD");
  const thirtyDaysAgo = now.subtract(30, "days").format("YYYY-MM-DD"); // Change this if you want more transactions
  
  // Account.find({ accountId: req.body.accountId })
  Account.findById(req.params.accountId)
    .then(account => {
      console.log(account);
      ACCESS_TOKEN = account.accessToken;
      const institutionName = account.institutionName;
      var filteredTransactions = []
      console.log(ACCESS_TOKEN);
      console.log(thirtyDaysAgo);
      console.log(today);
      client.getTransactions(ACCESS_TOKEN, thirtyDaysAgo, today, {
        count: 250,
        offset: 0,
      }, function(error, response) {
        if (error != null) {
          // prettyPrintResponse(error);
          return res.json({
            error: error
          });
        } else {
          console.log("here");
          responseLength = response.transactions.length;
          // Checks for pagination query params
          if (pageSize && currentPage) {
            startIndex = pageSize * (currentPage - 1)
            endIndex = Math.min(startIndex + pageSize, responseLength);   
            console.log(responseLength);
            for (startIndex; startIndex < endIndex; startIndex++) {
              currentTransaction = response.transactions[startIndex];
              formattedTransaction = {
                _id: currentTransaction.transaction_id,
                date: currentTransaction.date,
                transactionName: currentTransaction.name,
                amount: currentTransaction.amount,
                category: currentTransaction.category
              }
              filteredTransactions.push(formattedTransaction);
            }   
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({
              transactions: filteredTransactions,
              maxTransactions: response.transactions.length
            });    
          }
          else if (req.query.recentTransactions) {
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
                category: transaction.category
              }
              filteredTransactions.push(formattedTransaction);
              count++;
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(filteredTransactions);
          }
          else if (req.query.topTransactions) {
            console.log("TO-DO");
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


module.exports = plaidRouter;