const router = require("express").Router();
const User = require("../models/user");

//udpate a user
router.put("/:id", async (req, res) => {
    console.log(req.body)
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
    console.log("reached")
    if (req.body.userId !== req.params.id) {
        console.log("reached")
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId)
            console.log(user)
            console.log(currentUser)
            console.log("reached")
            if (!user.friends.includes(req.body.userId)) {
                console.log("reached")

                if (!user.friendRequests.incoming.includes(req.body.userId)) {
                    console.log("reached")

                    if (!user.friendRequests.outgoing.includes(req.body.userId)) {
                        console.log("reached")
                        await user.updateOne({ $push: { friendRequests: { incoming: req.body.userId } } })
                        await currentUser.updateOne({ $push: { friendRequests: { outgoing: req.params.id } } })
                        res.status(200).json("Friend request sent")
                    } else {
                        res.status(403).json("User already sent a friend request !!")
                    }
                } else {
                    res.status(403).json("Friend request already sent !!")
                }
            } else {
                res.status(403).json("You are already friends with the user")
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

    try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.body.userId)
        if (currentUser.friendRequests.incoming.includes(req.params.id)) {
            if (user.friendRequests.outgoing.includes(req.body.userId)) {
                await User.findByIdAndUpdate(req.params.id, { $push: { friends: req.body.userId } });
                await User.findByIdAndUpdate(req.params.id, { $pull: { friendRequests: { outgoing: req.body.userId } } });
                await User.findByIdAndUpdate(req.body.userId, { $push: { friends: req.params.id } });
                await User.findByIdAndUpdate(req.body.userId, { $pull: { friendRequests: { incoming: req.params.id } } });
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
        const currentUser = await User.findById(req.body.userId)
        if (currentUser.friendRequests.incoming.includes(req.params.id)) {
            if (user.friendRequests.outgoing.includes(req.body.userId)) {
                await User.findByIdAndUpdate(req.params.id, { $pull: { friendRequests: { outgoing: req.body.userId } } });
                await User.findByIdAndUpdate(req.body.userId, { $pull: { friendRequests: { incoming: req.params.id } } });
                res.status(200).json("friend request rejected!")
            }else{
                res.status(403).json("No friend request from this user")
            }
        }else{
            res.status(403).json("No friend request from this user 1")
        }
    } catch (err) {
        res.status(403).json(err)
    }
})

//remove user as friend / unfollow a user

module.exports = router;