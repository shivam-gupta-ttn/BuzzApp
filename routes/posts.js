const router = require("express").Router();
const Post = require("../models/post")
const User = require("../models/user")
//create a post 

router.post("/:id/post", async (req, res) => {
    console.log(req.body)
    if (req.body.desc === "" && req.body.imgId === "") {
        res.status(400).json("Invalid Post or Post cannot be empty String")
    } else {
        try {
            const newPost = new Post({
                userId: req.params.id,
                desc: req.body.desc,
                imgId: req.body.imgId
            })
            const savedPost = await newPost.save();
            res.status(200).json(savedPost)
        } catch (err) {
            res.status(400).json(err)
        }
    }
})
//update a post

router.put("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await post.updateOne({ $set: req.body })
            res.status(200).json("the post has been updated")
        } else {
            res.status(403).json("You can update only your post")
        }
    }
    catch (err) {
        res.status(400).json(err)
    }
})

//delete a post
router.delete("/:id", async (req, res) => {
    const currentUser = await User.findOne({ email: req.user?._json?.email });
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId.toString() === currentUser._id.toString() || currentUser.role === "admin") {
            await post.deleteOne();
            res.status(200).json("the post has been deleted")
        } else {
            res.status(403).json("You can delete only your post")
        }
    }
    catch (err) {
        res.status(400).json(err)
    }
})
//like a post
router.put("/:id/like", async (req, res) => {
    const currentUser = await User.findOne({ email: req.user?._json?.email })
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(currentUser._id)) {
            if (!post.dislikes.includes(currentUser._id)) {
                await post.updateOne({ $push: { likes: currentUser._id } });
                res.status(201).json("the post has been liked")
            } else {
                res.status(403).json("the post is disliked by you")
            }
        } else {
            await post.updateOne({ $pull: { likes: currentUser._id } })
            res.status(200).json("the post has been removed from likes")
        }
    } catch (err) {
        res.status(400).json(err)
    }
})
//dislike a post
router.put("/:id/dislike", async (req, res) => {
    const currentUser = await User.findOne({ email: req.user?._json?.email })
    try {
        const post = await Post.findById(req.params.id);
        if (!post.dislikes.includes(currentUser._id)) {
            if (!post.likes.includes(currentUser._id)) {
                await post.updateOne({ $push: { dislikes: currentUser._id } });
                res.status(201).json("the post has been disliked")
            } else {
                res.status(403).json("The post is liked by you")
            }
        } else {
            await post.updateOne({ $pull: { dislikes: currentUser._id } })
            res.status(200).json("the post has been removed from dislikes")
        }
    } catch (err) {
        res.status(400).json(err)
    }
})
//get a post
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        res.status(200).json(post)
    } catch (err) {
        res.status(400).json(err)
    }
})

//get timeline posts
router.get("/post/all", async (req, res) => {
    console.log(req.query)
    let page = req.query.page;
    try {
        const currentUser = await User.findOne({ email: req.user?._json?.email });

        const userPosts = await Post.find({ userId: currentUser._id }).sort({ createdAt: -1 })

        const friendPosts = await Promise.all(
            currentUser.friends.map((id) => {
                return Post.find({ userId: id }).sort({ createdAt: -1 });
            })
        );
        res.status(200).json(userPosts.concat(...friendPosts).sort((p1, p2) => {
            return new Date(p2.createdAt) - new Date(p1.createdAt)
        }).slice(page * 10 - 10, page * 10))

    } catch (err) {
        res.status(400).json(err)
    }
})
//post a comment
router.put("/:id/comment", async (req, res) => {
    const currentUser = await User.findOne({ email: req.user?._json?.email })
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, { $push: { comments: { comment: req.body.value, commentedBy: currentUser._id } } })
        res.status(200).json(post)
    } catch (err) {
        res.status(400).json(err)
    }
})
//flag a post
router.put("/:id/flag", async (req, res) => {
    const currentUser = await User.findOne({ email: req.user?._json?.email });
    const post = await Post.findById(req.params.id)
    try {
        if (!post.flagged.includes(currentUser._id)) {
            await post.updateOne({ $push: { flagged: currentUser._id } })
            res.status(200).json("Post flagged successfully")
        } else {
            res.status(200).json("you already flagged this post")
        }
    } catch (err) {
        json.status(400).json(err)
    }
})
// respond to flag post
module.exports = router;