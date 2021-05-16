const router = require("express").Router();
const Post = require("../models/post")
const User = require("../models/user")
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
//like a post
router.put("/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.body.userId)) {
            if(!post.dislikes.includes(req.body.userId)){

                await post.updateOne({ $push: { likes: req.body.userId } });
                res.status(200).json("the post has been liked")
            }else{
                res.status(200).json("the post is disliked by you")
            }
        } else {
            await post.updateOne({ $pull: { likes: req.body.userId } })
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
        if (!post.dislikes.includes(req.body.userId)) {
            if(!post.likes.includes(req.body.userId)){
                await post.updateOne({ $push: { dislikes: req.body.userId } });
                res.status(200).json("the post has been disliked")
            }else{
                res.status(200).json("The post is liked by you")
            }
        } else {
            await post.updateOne({ $pull: { dislikes: req.body.userId } })
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
    try {
        const currentUser = await User.findById(req.body.userId);
        const userPosts = await Post.find({userId: currentUser._id}).sort({createdAt:-1})
        const friendPosts = await Promise.all(
            currentUser.friends.map((id)=>{
            return Post.find({userId:id}).sort({createdAt:-1});
            })
        );
        res.status(200).json(userPosts.concat(...friendPosts))
    } catch (err) {
        res.status(400).json(err)
    }
})
//post a comment
router.post("/:id/comment",async(req,res)=>{
    try{
    const post = await Post.findByIdAndUpdate(req.params.id,{$push:{comments:{comment:req.body.comment,commentedBy:req.body.userId}}})        
    res.status(200).json(post)
    }catch(err){
        res.status(400).json(err)
    }
})
//flag a post
router.put("/:id/flag",async(req,res)=>{
    const post = await Post.findById(req.params.id)
    try{
        if(!post.flagged.includes(req.body.userId)){
            await post.updateOne({$push:{flagged:req.body.userId}})
            res.status(200).json("Post flagged successfully")
        }else{
            res.status(200).json("you already flagged this post")
        }
    }catch(err){
        json.status(400).json(err)
    }
})
// respond to flag post
module.exports = router;