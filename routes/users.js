const router = require("express").Router();
const User = require("../models/user");

//udpate a user
router.put("/:id", async (req, res) => {
    console.log(req.params.id, req.user._id)
    if (req.user._id.toString() === req.params.id.toString()) {
        try {
            console.log("here")
            const currentUser = await User.findOneAndUpdate({ email: req.user.email }, {
                $set: {
                    name: req.body.fname ? req.body.fname + " " + req.body.lname : "",
                    gender: req.body.gender ? req.body.gender : "",
                    birthday: req.body.birthday ? req.body.birthday : "",
                    website: req.body.website ? req.body.website : "",
                    city: req.body.city ? req.body.city : "",
                    state: req.body.state ? req.body.state : "",
                    pin: req.body.pin ? req.body.pin : "",
                    designation: req.body.designation ? req.body.designation : "",
                    profilePicture: req.body.profilePicture ? req.body.profilePicture : user.profilePicture
                }
            });
            res.status(200).json(currentUser)
        } catch (err) {
            return res.status(400).json(err);
        }
    } else {
        return res.status(403).json("You can update only your account!!")
    }
})
//get current user
router.get("/currentuser", async (req, res) => {
    try {
        currentUser = await User.findOne({ email: req.user.email })
        res.status(200).json(currentUser)
    } catch (err) {
        return res.status(400).json(err)
    }
})

//get a user
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        const { password, updatedAt, ...other } = user._doc;
        res.status(200).json(other)
    } catch (err) {
        res.status(404).json(err)
    }
})
//verify admin
router.put("/verify/user", async (req, res) => {
    try {
        console.log("here")
        if (req.user.role !== "admin") {
            if (req.body.password === "admin@123") {
                await User.updateOne({ email: req.user.email }, { $set: { role: "admin" } })
                res.status(200).json("You are admin now")
            }
        } else {
            res.status(400).json("you are already admin")
        }
    } catch (err) {
        res.status(400).json(err)
    }
})

//send request 
router.put("/:id/addfriend", async (req, res) => {

    if (req.user._id !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            if (!user.friends.includes(req.user?._id)) {
                if (!user.friendRequests.incoming.includes(req.user._id)) {
                    if (!user.friendRequests.outgoing.includes(req.user._id)) {
                        await User.updateOne({ email: req.user.email }, { $push: { 'friendRequests.outgoing': req.params.id } })
                        await user.updateOne({ $push: { 'friendRequests.incoming': req.user?._id } })
                        res.status(201).json("Friend request sent")
                    } else {
                        res.status(200).json("User already sent you a request!!")
                    }
                } else {
                    res.status(200).json("Friend request already sent !!")
                }
            } else {
                res.status(200).json("You are already friends with the user")
            }
        } catch (err) {
            res.status(400).json(err)
        }
    } else {
        res.status(403).json("you cannot add yourself")
    }
})
//remove Friend
router.put("/:id/removefriend", async (req, res) => {
    try {
        const currentUser = await User.findOne({ email: req.user.email })
        const user = await User.findById(req.params.id);
        if (currentUser.friends.includes(req.params.id)) {
            await currentUser.updateOne({ $pull: { friends: req.params.id } })
            await user.updateOne({ $pull: { friends: req.user._id } })
            res.status(200).json("user removed!!")
        } else {
            res.status(401).json("user is not your friend")
        }
    } catch (err) {
        res.status(404).json(err)

    }
})
// accept request
router.put("/:id/accept", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (req.user.friendRequests.incoming.includes(req.params.id)) {
            if (user.friendRequests.outgoing.includes(req.user._id)) {
                await User.updateOne({ email: req.user.email }, { $push: { friends: req.params.id } })
                await user.updateOne({ $push: { friends: req.user._id } })
                await User.updateOne({ email: req.user.email }, { $pull: { 'friendRequests.incoming': req.params.id } })
                await user.updateOne({ $pull: { 'friendRequests.outgoing': req.user._id } })
                res.status(200).json("friend request accepted!")
            } else {
                res.status(403).json("No friend request from this user")
            }
        } else {
            res.status(403).json("No friend request from this user 1")
        }
    } catch (err) {
        res.status(403).json(err)
    }
})
//reject request
router.put("/:id/reject", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (req.user.friendRequests.incoming.includes(req.params.id)) {
            if (user.friendRequests.outgoing.includes(req.user._id)) {
                await User.updateOne({ email: req.user.email }, { $pull: { 'friendRequests.incoming': req.params.id } })
                await user.updateOne({ $pull: { 'friendRequests.outgoing': req.user._id } })
                res.status(200).json("friend request rejected!")
            } else {
                res.status(403).json("No friend request from this user")
            }
        } else {
            res.status(403).json("No friend request from this user 1")
        }
    } catch (err) {
        res.status(403).json(err)
    }
})
//suggestions
router.get("/suggestions/all", async (req, res) => {

    try {
        const currentUser = await User.findOne({ email: req.user.email })
        let fIds = currentUser.friends.slice()
        fIds.push(req.user._id)
        const suggestedFriends = await User.find({ _id: { $nin: fIds } })
        console.log("suggested user", suggestedFriends)
        // const allUsers = await User.find({}, { _id: 1 })
        // let suggestedFriends = []

        // allUsers.forEach((obj) => {
        //     if (req.user.friends.indexOf(obj._id) == -1) {
        //         suggestedFriends.push(obj._id)
        //     }
        // })
        // let index = -1;
        // suggestedFriends.forEach((val, i) => {
        //     if (val.toString() == req.user._id.toString()) {
        //         index = i;
        //     }
        // })
        // suggestedFriends.splice(index, 1)
        // suggestedFriends = await Promise.all(
        //     suggestedFriends.map((id) => {
        //         return User.find({ _id: id })
        //     })
        // )
        res.status(200).json(suggestedFriends)
    } catch (err) {
        res.status(400).json(err)
    }
})
//friends
router.get("/friends/all", async (req, res) => {
    try {
        const currentUser = await User.findOne({ email: req.user.email })
        console.log(currentUser)
        // const friendIds = req.user.friends   
        // console.log("this",req.user.friends)
        console.log(currentUser.friends)
        const friends = await User.find({ _id: { $in: currentUser.friends } })
        console.log("friends", friends)
        res.status(200).json(friends)
    } catch (err) {
        res.status(401).json(err)
    }
})

//remove user as friend 

module.exports = router;