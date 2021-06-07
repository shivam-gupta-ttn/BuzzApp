const router = require("express").Router();
const Post = require("../models/post")
const User = require("../models/user")
//create a post 

router.post("/post", async (req, res) => {
    if (req.body.desc === "" && req.body.imgId === "") {
        res.status(400).json("Invalid Post or Post cannot be empty String")
    } else {
        try {
            const newPost = new Post({
                userId: req.user._id,
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

//delete a post
router.delete("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId.toString() === req.user._id.toString() || req.user.role === "admin") {
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
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.user._id)) {
            if (!post.dislikes.includes(req.user._id)) {
                await post.updateOne({ $push: { likes: req.user._id } });
                res.status(201).json("the post has been liked")
            } else {
                res.status(403).json("the post is disliked by you")
            }
        } else {
            await post.updateOne({ $pull: { likes: req.user._id } })
            res.status(200).json("the post has been removed from likes")
        }
    } catch (err) {
        res.status(400).json(err)
    }
})
//dislike a post
router.put("/:id/dislike", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post.dislikes.includes(req.user._id)) {
            if (!post.likes.includes(req.user._id)) {
                await post.updateOne({ $push: { dislikes: req.user._id } });
                res.status(201).json("the post has been disliked")
            } else {
                res.status(403).json("The post is liked by you")
            }
        } else {
            await post.updateOne({ $pull: { dislikes: req.user._id } })
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
        const currentUser = await User.findOne({email:req.user.email})
        const idArray = [req.user._id]
        const ids = idArray.concat(currentUser.friends);
        console.log(idArray)
        const allPosts = await Post.find({userId:{$in: ids}}).skip(page * 10 - 10).limit(10).sort({createdAt: -1})
        res.status(200).json(allPosts)

    } catch (err) {
        res.status(400).json(err)
    }
})
//get flagged posts
router.get("/posts/flagged", async (req, res) => {
    let adminPage = req.query.adminPage;
    console.log(adminPage)
    try {
        if (req.user.role === "admin") {
            const posts = await Post.find({ flagged: { $ne: [] } }).skip(adminPage * 10 - 10).limit(10);
            res.status(200).json(posts)
        } else {
            res.status(401).json("you are not admin")
        }
    } catch (err) {
        res.status(400).json(err)
    }
})

//post a comment
router.put("/:id/comment", async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, { $push: { comments: { comment: req.body.value, commentedBy: req.user._id } } })
        res.status(200).json(post)
    } catch (err) {
        res.status(400).json(err)
    }
})
//flag a post
router.put("/:id/flag", async (req, res) => {
    const post = await Post.findById(req.params.id)
    try {
        if (!post.flagged.includes(req.user._id)) {
            await post.updateOne({ $push: { flagged: req.user._id } })
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