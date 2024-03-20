const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        minLength: 1,
        // unique: true
    },
    firstname: {
        type: String,
        required: true,
        minLength: 1
    },
    lastname: {
        type: String,
        required: true,
        minLength: 1
    },
    password: {
        type: String,
        required: true,
        minLength: 4
    },
    member: {
        type: Boolean,
        default: false
    },
    admin: {
        type: Boolean,
        default: false
    },
    messages: [{type: Schema.Types.ObjectId, ref: 'message'}]
})

userSchema.virtual('url').get(function(){
    return `/users/${this._id}`;
})

module.exports = mongoose.model("User", userSchema);