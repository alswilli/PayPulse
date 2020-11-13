const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GoalSchema = new Schema({
    goalName: {
        type: String,
        required: true
    },
    goalDescription: {
        type: String,
        required: true
    },
    imagePath: {
        type: String,
        required: true
    },
    goalProgress: {
        type: Number,
        default: 0
    }
});
module.exports = Goal = mongoose.model("goal", GoalSchema);