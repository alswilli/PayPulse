// var mongoose = require('mongoose');
// var Schema = mongoose.Schema;
// // var passportLocalMongoose = require('passport-local-mongoose');

// var User = new Schema({
//     firstname: {
//       type: String,
//         default: ''
//     },
//     lastname: {
//       type: String,
//         default: ''
//     },
//     admin:   {
//         type: Boolean,
//         default: false
//     }
// });

// // User.plugin(passportLocalMongoose);
// var Users = mongoose.model('User', User);
// module.exports = Users;

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});
module.exports = User = mongoose.model("users", UserSchema);