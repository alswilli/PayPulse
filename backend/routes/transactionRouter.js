const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./corsRoutes');

const Transactions = require('../models/transactions');

const transactionRouter = express.Router();

transactionRouter.use(bodyParser.json());

transactionRouter.route('/')
    .options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
    .get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
        const pageSize = +req.query.pageSize;
        const currentPage = +req.query.page;
        const transactionQuery = Transactions.find({accountId: req.query.accountId});
        const N = 3;
        let fetchedTransactions;
        // Checks for pagination query params
        if (pageSize && currentPage) {
            transactionQuery
                .skip(pageSize * (currentPage - 1))
                .limit(pageSize);
            // General /get for transactions page w/ pagination
            transactionQuery
            .then(transactions => {
                fetchedTransactions = transactions;
                return Transactions.count();
            })
            .then((count) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({
                    transactions: fetchedTransactions,
                    maxTransactions: count
                });
            }, (err) => next(err))
            .catch((err) => next(err));
        }
        else if (req.query.recentTransactions) {
            Transactions.find({accountId: req.query.accountId}).sort({ $natural: -1 }).limit(N)
            .then(transactions => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(transactions);
            }, (err) => next(err))
            .catch((err) => next(err));
        }
        else if (req.query.topTransactions) {
            console.log("TO-DO");
        }
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Transactions.create(req.body)
        .then((transaction) => {
            console.log('Transaction Created ', transaction);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(transaction);
        }, (err) => next(err))
        .catch((err) => next(err));
    });
// .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
//     res.statusCode = 403;
//     res.end('PUT operation not supported on /leaders');
// })
// .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
//     Leaders.remove({})
//     .then((resp) => {
//         res.statusCode = 200;
//         res.setHeader('Content-Type', 'application/json');
//         res.json(resp);
//     }, (err) => next(err))
//     .catch((err) => next(err));    
// });

// leaderRouter.route('/:leaderId')
// .options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
// .get(cors.cors, (req,res,next) => {
//     Leaders.findById(req.params.leaderId)
//     .then((leader) => {
//         res.statusCode = 200;
//         res.setHeader('Content-Type', 'application/json');
//         res.json(leader);
//     }, (err) => next(err))
//     .catch((err) => next(err));
// })
// .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
//     res.statusCode = 403;
//     res.end('POST operation not supported on /leaders/'+ req.params.leaderId);
// })
// .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
//     Leaders.findByIdAndUpdate(req.params.leaderId, {
//         $set: req.body
//     }, { new: true })
//     .then((leader) => {
//         res.statusCode = 200;
//         res.setHeader('Content-Type', 'application/json');
//         res.json(leader);
//     }, (err) => next(err))
//     .catch((err) => next(err));
// })
// .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
//     Leaders.findByIdAndRemove(req.params.leaderId)
//     .then((resp) => {
//         res.statusCode = 200;
//         res.setHeader('Content-Type', 'application/json');
//         res.json(resp);
//     }, (err) => next(err))
//     .catch((err) => next(err));
// });

module.exports = transactionRouter;