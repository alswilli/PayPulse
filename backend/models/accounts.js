const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AccountSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId, 
        ref: "users"
    },
    accessToken: {
        type: String,
        required: true
    },
    itemId: {
        type: String,
        required: true
    },
    institutionId: {
        type: String,
        required: true
    },
    institutionName: {
        type: String
    },
    accountName: {
        type: String
    },
    accountType: {
        type: String
    },
    accountSubtype: {
        type: String
    },
    current: {
        type: Boolean,
        default: true
    },
    subAccounts: {
        type: Object
    },
    itemValid: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
module.exports = Account = mongoose.model("account", AccountSchema);