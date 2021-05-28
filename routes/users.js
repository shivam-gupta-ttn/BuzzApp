const router = require("express").Router();
const User = require("../models/user");

//udpate a user
router.put("/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.user.isAdmin) {
        try {
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body
            });
            res.status(200).json("Account has been updated")
        } catch (err) {
            return res.status(400).json(err);
        }
    } else {
        return res.status(403).json("You can update only your account!")
    }
})
//get current user
router.get("/currentuser", async (req, res) => {
    try {
        const currentUser = await User.findOne({ email: req.user?._json?.email })
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
        res.status(400).json(err)
    }
})

//send request 
router.put("/:id/addfriend", async (req, res) => {

    const currentUser = await User.findOne({ email: req.user?._json?.email })
    const user = await User.findById(req.params.id);
    if (currentUser._id !== user._id) {
        try {
            if (!user.friends.includes(currentUser?._id)) {
                if (!user.friendRequests.incoming.includes(currentUser._id)) {
                    if (!user.friendRequests.outgoing.includes(currentUser._id)) {
                        await currentUser.updateOne({ $push: { 'friendRequests.outgoing': user._id } })
                        await user.updateOne({ $push: { 'friendRequests.incoming': currentUser?._id } })
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
// accept request
router.put("/:id/accept", async (req, res) => {
    const currentUser = await User.findOne({ email: req.user?._json?.email })
    try {
        const user = await User.findById(req.params.id);
        if (currentUser.friendRequests.incoming.includes(req.params.id)) {
            if (user.friendRequests.outgoing.includes(currentUser._id)) {
                await currentUser.updateOne({ $push: { friends: user._id } })
                await user.updateOne({ $push: { friends: currentUser._id } })
                await currentUser.updateOne({ $pull: { 'friendRequests.incoming': user._id } })
                await user.updateOne({ $pull: { 'friendRequests.outgoing': currentUser._id } })
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
    const currentUser = await User.findOne({ email: req.user?._json?.email })
    const user = await User.findById(req.params.id);
    try {
        if (currentUser.friendRequests.incoming.includes(user._id)) {
            if (user.friendRequests.outgoing.includes(currentUser._id)) {
                await currentUser.updateOne({ $pull: { 'friendRequests.incoming': user._id } })
                await user.updateOne({ $pull: { 'friendRequests.outgoing': currentUser._id } })
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
        const currentUser = await User.findOne({ email: req.user?._json?.email })
        const allUsers = await User.find({}, { _id: 1 })
        let suggestedFriends = allUsers.map((obj) => {
            return obj._id;
        })
        let index = -1;
        suggestedFriends.forEach((val, i) => {
            if (val.toString() == currentUser._id.toString()) {
                index = i;
            }
        })
        suggestedFriends.splice(index, 1)
        suggestedFriends = await Promise.all(
            suggestedFriends.map((id) => {
                return User.find({ _id: id })
            })
        )
        res.status(200).json(suggestedFriends)
    } catch (err) {
        res.status(400).json(err)
    }
})
//friends
router.get("/friends/all", async (req, res) => {
    try {

        const currentUser = await User.findOne({ email: req.user?._json?.email })
        const friends = await Promise.all(
            currentUser.friends.map((id) => {
                return User.find({ _id: id }, { name: 1, fname: 1, lname: 1 })
            })
        )
        res.status(200).json(friends)


    } catch (err) {
        res.status(401).json(err)
    }
})

//remove user as friend 

module.exports = router;