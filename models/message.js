const { DateTime } = require('luxon');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    title: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 20
    },
    text: {
        type: String,
        required: true,
        maxLength: 1024,
    },
    author: {
        type: String,
        required: true,
    },
    time: {
        type: Date,
        default: Date.now(),
    },
})

messageSchema.virtual('time_formatted').get(function(){
    return DateTime.fromJSDate(this.time).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)
})

module.exports = mongoose.model("messages", messageSchema);