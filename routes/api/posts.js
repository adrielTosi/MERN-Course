const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Load Models
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");

// Load Validation
const validatePostInput = require("../../validation/post");

// @route   GET api/posts/test
// @desc    test posts route
// @access  Public
router.get("/test", (req, res) =>
  res.json({
    message: "Post works"
  })
);

// @route   POST api/posts
// @desc    Create Post
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // Validate Post
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });
    newPost.save().then(post => res.json(post));
  }
);

// @route   GET api/posts
// @desc    get Posts
// @access  public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json(err));
});

// @route   GET api/posts/:id
// @desc    get Posts
// @access  public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => res.status(404).json(err));
});

// @route   DELETE api/posts/:id
// @desc    Delete Post
// @access  private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id).then(post => {
        // Check for Post owner
        if (post.user.toString() !== req.user.id) {
          return res.status(401).json({ notauthorize: "User not authorize" });
        }

        // Delete
        post
          .remove()
          .then(() => res.json({ success: true }))
          .catch(err =>
            res.status(404).json({ postnotfound: "Post not found" })
          );
      });
    });
  }
);

// @route   POST api/posts/like/:id
// @desc    Like Post
// @access  private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id).then(post => {
        if (
          post.likes.filter(like => like.user.toString() === req.user.id)
            .length > 0
        ) {
          return res
            .status(400)
            .json({ alreadyliked: "User already liked this post" });
        }

        // Add user ID to likes array
        post.likes.unshift({ user: req.user.id });
        post.save().then(post => res.json(post));
      });
    });
  }
);

// @route   POST api/posts/like/:id
// @desc    Unlike Post
// @access  private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id).then(post => {
        if (
          post.likes.filter(like => like.user.toString() === req.user.id)
            .length === 0
        ) {
          return res
            .status(400)
            .json({ notliked: "You have not yet liked this post" });
        }

        // Get the remove index
        const removeIndex = post.likes
          .map(item => item.user.toString())
          .indexOf(req.user.id);

        // Splice out of the array
        post.likes.splice(removeIndex, 1);

        // Save the array again
        post.save().then(post => res.json(post));
      });
    });
  }
);

// @route   POST api/posts/comment/:id
// @desc    Comment in Post
// @access  private
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // Validate Post
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }

    //Find Post that is commented upon
    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        };

        // Add to comments array
        post.comments.unshift(newComment);
        // Save Post
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ nopostfound: "No post found" }));
  }
);

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Remove comment in Post
// @access  private
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //Find Post that is commented upon
    Post.findById(req.params.id)
      .then(post => {
        // Check if the comment exists
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ commentnotexists: "Comment does not exists" });
        }

        // Get Remove Index
        const removeIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        // Splice out of array
        post.comments.splice(removeIndex, 1);

        // Save posts again
        post.save().then(post => res.json(post));
      })
      .catch(err => res.json(err));
  }
);
module.exports = router;
