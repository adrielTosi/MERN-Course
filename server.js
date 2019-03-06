const express = require('express')
const mongoose = require('mongoose')

const users = require('./routes/api/users')
const profile = require('./routes/api/profile')
const posts = require('./routes/api/posts')

const app = express()

//DB config
const db = require('./config/keys').mongoURI

//Conect to MongoDB
mongoose.connect(db, {
        useNewUrlParser: true
    })
    .then(() => console.log("MongoDB conected"))
    .catch((error) => console.log(error))

app.get('/', (req, res) => res.send("Hello man"))

//Use Routes
app.use('/api/users', users)
app.use('/api/profile', profile)
app.use('/api/posts', posts)

const port = process.env.PORT || 5000

app.listen(port, () => console.log(`Server running on port ${port}`))