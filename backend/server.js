const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config();
const routes = require('./routes')
const PORT = process.env.PORT || 4000


app.use(cors());

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/api', routes)

app.use((req, res) =>{
    return res.status(404).json({
        success: false,
        message: 'Cant found router'
    })
})
app.use((err,req, res) =>{
    console.error(err)
    return res.status(500).json({
        success: false,
        message: 'Server Error'
    })
})

app.listen(PORT, ()=>(
    console.log('API is running')
))

module.exports = app;