const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    googleId: {
        type: String
    },
    username: {
        type: String,
        min: 3,
        max: 20,
        unique: true
    },
    email: {
        type: String,
        max: 50,
        unique: true
    },
    password: {
        type: String,
        min: 6
    },
    name: {
        type: String,
    },
    age: {
        type: Number,
        default: ""
    },
    gender: {
        type: String,
        default: ""
    },
    designation: {
        type: String,
        default: ""
    },
    profilePicture: {
        type: String,
        default: ""
    },
    coverPicture: {
        type: String,
        default: ""
    },
    friends: {
        type: Array,
        default: []
    },
    friendRequests: {
        outgoing: {
            type:Array,
            default:[]
        },
        incoming:{
            type:Array,
            default:[]
        },
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    city: {
        type: String,
        max: 50
    },
    state: {
        type: String,
        max: 50
    },
    pin: {
        type: Number
    }


},
    { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);