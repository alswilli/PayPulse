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
        required: true
    },
    dateFirstAchieved: { 
        type: Date, 
        default: Date.now
    }
});
module.exports = UserGoal = mongoose.model("usergoal", UserGoalSchema);