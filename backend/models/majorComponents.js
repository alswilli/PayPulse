const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var cardSchema = new Schema({
    name:  {
        type: String,
        required: true
    },
    data: [{
        type: mongoose.Schema.Types.ObjectId,
    }]
}, {
    timestamps: true
});

const majorComponentSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    cards:[cardSchema]
}, {
    timestamps: true
});

var MajorComponents = mongoose.model('MajorComponent', majorComponentSchema);

module.exports = MajorComponents;