const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    accountName: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    transactionName: {
        type: String,
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});

var Transactions = mongoose.model('Transaction', transactionSchema);

module.exports = Transactions;