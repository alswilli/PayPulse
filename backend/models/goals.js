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
    imageUrl: {
        type: String,
        required: true
    }
});
module.exports = Goal = mongoose.model("goal", GoalSchema);