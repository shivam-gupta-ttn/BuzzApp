const mongoose = require("mongoose")

const PostSchema = new mongoose.Schema({

    userId: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        max: 500
    },
    imgId: {
        type: String,
        default: ""
    },
    likes: {
        type: Array,
        default: []
    },
    dislikes: {
        type: Array,
        default: []
    },
    comments: [{
        comment: { type: String, max: 500 },
        commentedBy: { type: String }
    }],
    flagged: {
        type: Array,
        default: []
    }
},
    { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);