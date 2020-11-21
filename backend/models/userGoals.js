const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserGoalSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId, 
        ref: "users"
    },
    goalId: {
        type: Schema.Types.ObjectId, 
        ref: "goals"
    },
    numTimesAchieved: {
        type: Number,
        default: 0
    },
    dateFirstAchieved: { 
        type: Date, 
        default: null
    },
    goalProgress: {
        type: Number,
        default: 0
    }
});
module.exports = UserGoal = mongoose.model("usergoal", UserGoalSchema);