const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const budgetSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId, 
        ref: "users"
    },
    mainCategory: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    category2: {
        type: String
    },
    category3: {
        type: String
    },
    amount: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

var Budgets = mongoose.model('Budgets', budgetSchema);

module.exports = Budgets;