const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const budgetSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId, 
        ref: "users"
    },
    category: {
        type: String,
        required: true
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