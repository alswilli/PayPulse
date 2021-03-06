var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    firstname: {
      type: String,
        default: ''
    },
    lastname: {
      type: String,
        default: ''
    },
    email: {
        type: String,
          default: ''
      },
    facebookId: String,
    // accounts: {
    //     type: Schema.Types.ObjectId, 
    //     ref: "accounts"
    // },
    admin:   {
        type: Boolean,
        default: false
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
});

User.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', User);
