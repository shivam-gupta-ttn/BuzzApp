const router = require("express").Router();
const Post = require("../models/post")
//create a post 

router.post("/", async (req, res) => {
    const newPost = new Post(req.body)
    try {
        const savedPost = await newPost.save();
        res.status(200).json(savedPost)
    } catch (err) {
        res.status(400).json(err)
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
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
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
//like or dislike a post
router.put("/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({ $push: { likes: req.body.userId } });
            res.status(200).json("the post has been liked")
        } else {
            await post.updateOne({ $pull: { likes: req.body.userId } })
            res.status(200).json("the post has been disliked")
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
router.get("/timeline", async (req, res) => {
    let postArray = [];
    try {
        const currentUser = await User.findById
    } catch (err) {
        res.status(400).json(err)
    }
})
//post a comment
router.post("/:id/comment",async(req,res)=>{
    try{
    const post = await Post.findByIdAndUpdate(req.params.id,{$push:{comments:{commentedBy:req.body.userId}}})        
    res.status(200).json(post)
    }catch(err){
        res.status(400).json(err)
    }
})

module.exports = router;