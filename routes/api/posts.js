const express = require('express')
const router = express.Router()

// @route   GET api/posts/test
// @desc    test posts route
// @access  Public
router.get('/test', (req, res) => res.json({
    message: 'Post works'
}))

module.exports = router