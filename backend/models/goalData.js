const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GoalDataSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId, 
        ref: "users",
        required: true
    },
    allMonthsAchieved: {
        type: Object
    },
    monthsInARow: {
        type: Number,
        default: 0
    },
    previousMonth: {
        type: String,
        default: ""
    }
});
module.exports = GoalData = mongoose.model("goaldata", GoalDataSchema);